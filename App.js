import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'
import { useState, useRef, useEffect } from 'react';
import { 
  ActivityIndicator, 
  Pressable, 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  Image,
  Modal, 
  Platform, 
  Keyboard, 
  KeyboardAvoidingView,
  Animated, 
  PermissionsAndroid
} from 'react-native';
import ChatMessage from './components/ChatMessage';
import ImageHistory from './components/ImageHistory';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faImage, faBars, faTrash, faXmark, faGear, faAngleLeft, faCoins, faMessage, faStar, faDownload, faMicrophone 
} from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core';
import Logo from './components/Logo';
import { LOCAL, RENDER_BACKEND_URL } from '@env'
import { Audio } from "expo-av"

library.add(faImage, faBars, faTrash, faXmark, faGear, faAngleLeft, faCoins, faMessage, faStar, faDownload, faMicrophone)

export default function App() {
  const [input, setInput] = useState('')
  const [chatlog, setChatLog] = useState([])
  const [error, setError] = useState()
  const [prompt, setPrompt] = useState('')
  const [showChatSection, setShowChatSection] = useState(true)
  const [asideVisbility, setAsideIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tokens, setTokens] = useState(0)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [imageGeneration, setImageGeneration] = useState(false)
  const [showImageHistory, setShowImageHistory] = useState(false)
  const [recording, setRecording] = useState(null)

  const scrollRef = useRef()
  const fadeAnim = useRef(new Animated.Value(0)).current

  const fadeIn = () => {
    Animated.timing(fadeAnim, {toValue: 1, duration: 4000, useNativeDriver: true}).start()
  }
  const fadeOut = () => {
    Animated.timing(fadeAnim, {toValue: 0, duration: 1000, useNativeDriver: true}).start()
  }

  if (Platform.OS === 'android') {
    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', e => {
        setKeyboardHeight(e.endCoordinates.height)
        scrollRef.current.scrollToEnd({animated: true})
      })
      const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0))
  
      return () => {
        keyboardDidShowListener.remove()
        keyboardDidHideListener.remove()
      }
    }, [])
  } else {
    useEffect(() => {
      const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', e => {
        setKeyboardHeight(e.endCoordinates.height)
        scrollRef.current.scrollToEnd({animated: true})
      })
      const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0))
  
      return () => {
        keyboardWillShowListener.remove()
        keyboardWillHideListener.remove()
      }
    }, [])
  }

  function handleHelper() {
    if (error !== undefined) setError()
    if (imageGeneration) {
      handleImage()
    } else {
      handleInput()
    }
  }

  async function handleImage() {
    console.log(input)

    try {
      setIsLoading(isLoading => !isLoading)
      const request = await fetch(RENDER_BACKEND_URL + '/api/v1/openai/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: input
      })
      })
      const result = await request.json()

      setChatLog((chatlog) => [
        ...chatlog,
        {
          imagePrompt: input,
          image: `data:image/jpeg;base64,${result.message}`,
          id: result.created,
        }
      ])
      console.log(chatlog)
    } catch (err) {
      console.log('handleImage Error is: ' + err)
      setError('Die Daten konten nicht vom Server geladen werden, bitte versuche es erneut.')
    }
    setInput('')
    setIsLoading(isLoading => !isLoading)
    scrollRef.current.scrollToEnd({animated: true})
    error !== undefined && setError()
  }

  async function handleInput() {
    console.log(input)

    try {
      setIsLoading(isLoading => !isLoading)
      const request = await fetch(RENDER_BACKEND_URL + '/api/v1/openai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'text/event-stream'
      },
      body: JSON.stringify({
        message: input,
        chatHistory: prompt !== '' ? prompt : null
      })
      })
      const result = await request.json()

      // Trim Whitespace in the beginning
      const trimResult = result.message.trimStart()
      const usedTokens = result.tokens

      console.log('question: ' + input, 'answer: ' + trimResult)
      setChatLog((chatlog) => [
        ...chatlog,
        {
          question: input,
          answer: trimResult,
          tokens: usedTokens
        }
      ])
      console.log(chatlog)
      setPrompt(
        prompt => prompt !== '' ?
        [
          ...prompt,
          {
            role: 'user',
            content: input
          },
          {
            role: 'assistant',
            content: trimResult
          }
        ]
        :
        [
          {
            role: 'user',
            content: input
          },
          {
            role: 'assistant',
            content: trimResult
          }
        ]
      )
      setTokens(tokens => tokens += usedTokens)

    } catch (err) {
      console.log(err)
      setError('Die Daten konten nicht vom Server geladen werden, bitte versuche es erneut.')
    }
    setInput('')
    setIsLoading(isLoading => !isLoading)
    scrollRef.current.scrollToEnd({animated: true})
    error !== undefined && setError()
  }

  function handleClearConversation() {
    setChatLog([])
    setPrompt('')
  }

  function handleShowAside() {
    setAsideIsVisible(!asideVisbility)
  }

  function handleSettingProp() {
    console.log('test')
  }
  
  function handleSwitchSection() {
    console.log('swich pages')
    setShowImageHistory(!showImageHistory)
    setShowChatSection(!showChatSection)
    setAsideIsVisible(!asideVisbility)
  }

  function handleImageGeneration() {
    setImageGeneration(!imageGeneration)
  }

  async function getMicrophonePermission() {
    try {
      const { status } = await Audio.requestPermissionsAsync()
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log(status)
      if (status === 'granted') {
        console.log('Microphone permission granted')
      } else {
        console.log('Microphone permission denied')
        alert('Microphone permission denied')
      }
    } catch (error) {
      console.log('Failed to get microphone permission', error)
      alert('Failed to get microphone permission', error)
    }
  }

  async function handleStartRecording() {
    await getMicrophonePermission()
    const recording = new Audio.Recording()
    try {
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
      await recording.startAsync()
      setRecording(recording)
    } catch (error) {
      console.error('Failed to start recording', error)
      alert('Failed to start recording', error)
    }
  }

  async function handleStopRecording() {
    try {
      await recording.stopAndUnloadAsync()
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording.getURI()
      console.log('Recordet audio uri:', uri)
      setRecording(null)
      setIsLoading(!isLoading)

      console.log('Sending URI to backend...')
      const formData = new FormData()
      formData.append('audio', {
        uri: uri,
        name: 'recordingText.mp4',
        type: 'audio/mp4',
      })

      const result = await fetch(LOCAL + '/api/v1/openai/stt', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        body: formData
      })

      const audioText = await result.json()
      console.log('SST AUDIO TEXT IS: ', audioText)
      setInput(audioText.message)
      // setIsLoading(false)
    } catch (error) {
      console.error('Failed to stop recording', error)
      alert('Failed to stop recording', error)
      setIsLoading(false)
    }
    handleInput()
  }

  return (
    <>
      <StatusBar style={asideVisbility ? 'dark' : 'light'} />
      <View style={styles.container}>
        {tokens === 2500 && 
        <View style={styles.modal}>
            <Text style={styles.modalText}>
              You reached your maximal token capacity, wait 24h or buy more tokens/Pro Version.
            </Text>
        </View>}
        {asideVisbility ? 
        <View style={styles.aside}>
          <View style={styles.pages}>
            <Image source={require('./assets/adaptive-icon.png')} style={(Platform.OS === 'ios') ? [styles.logo, styles.logoIOS] : [styles.logo, styles.logoAndroid]} />
            {/* <Logo /> */}
          </View>
          <View style={styles.settingProps}>
            {!showChatSection && <Pressable style={styles.settingsPropBtn} onPress={handleSwitchSection}>
              <FontAwesomeIcon icon='fa-message' color='black' size={30} style={{marginRight: 16,}} /> 
              <Text style={{textAlign: 'center', fontSize: 16,}}>Chat Section</Text>
            </Pressable>}
            {!showImageHistory && <Pressable style={styles.settingsPropBtn} onPress={handleSwitchSection}>
              <FontAwesomeIcon icon={faImage} color='black' size={30} style={{marginRight: 16,}} /> 
              <Text style={{textAlign: 'center', fontSize: 16,}}>Created Images History</Text>
            </Pressable>}
            <Pressable style={styles.settingsPropBtn} onPress={handleSettingProp}>
              <FontAwesomeIcon icon='fa-coins' color='black' size={30} style={{marginRight: 16,}} /> 
              <Text style={{textAlign: 'center', fontSize: 16,}}>Tokens</Text>
            </Pressable>
            <Pressable style={styles.settingsPropBtn} onPress={handleSettingProp}>
              <FontAwesomeIcon icon='fa-star' color='black' size={30} style={{marginRight: 16,}} /> 
              <Text style={{textAlign: 'center', fontSize: 16,}}>Pro Version</Text>
            </Pressable>
            <Pressable style={styles.settingsPropBtn} onPress={handleSettingProp}>
              <FontAwesomeIcon icon='fa-gear' color='black' size={30} style={{marginRight: 16,}} /> 
              <Text style={{textAlign: 'center', fontSize: 16,}}>System Settings</Text>
            </Pressable>
          </View>
          <Pressable style={styles.closeAsideBtn} onPress={handleShowAside}>
            <FontAwesomeIcon icon={ faXmark } style={{color: 'black',}} size={40} />
          </Pressable>
        </View> :
        showImageHistory ?
        <View style={styles.imageHistory}>
          <View style={(Platform.OS === 'ios') ? [styles.topbar, styles.topbarIOS] : styles.topbar}>
            <Pressable onPress={handleShowAside} >
              <FontAwesomeIcon icon={ faBars } style={styles.test} size={24} />
            </Pressable>
          </View>
          <ImageHistory /> 
        </View>
        :
        <View style={styles.chatSection}>
          <View style={(Platform.OS === 'ios') ? [styles.topbar, styles.topbarIOS] : styles.topbar}>
            <Pressable onPress={handleShowAside} >
              <FontAwesomeIcon icon={ faBars } style={styles.test} size={24} />
            </Pressable>
            <Text style={{color: 'white', fontWeight: 'bold'}}>Token used: {tokens}</Text>
            <Pressable onPress={handleClearConversation}>
              <FontAwesomeIcon icon={ faTrash } style={{color: 'white'}} size={20} />
            </Pressable>
          </View>
          {error !== undefined ? <Text style={styles.error}>{error}</Text> :
          <View>
            <KeyboardAwareFlatList 
              data={chatlog} 
              renderItem={itemData => {
                return (
                  <ChatMessage key={itemData.index} message={itemData.item}/>
                )
              }}
              ref={scrollRef}
              style={{height: (Platform.OS === 'ios' ? 760 : 640) - keyboardHeight}}
            />
          </View>
          }
          <View style={styles.inputForm}>
            <Pressable style={!imageGeneration ? styles.imgBtn : styles.imgBtnActive} onPress={handleImageGeneration} >
              <FontAwesomeIcon icon={ faImage } style={{color: 'white'}} size={30} />
            </Pressable>
            <TextInput 
              style={styles.textInput} 
              value={input} 
              placeholder={imageGeneration ? 'Enter image description' : null}
              placeholderTextColor={'#ffffff88'}
              onChangeText={e => setInput(e)}
            />
            {isLoading ? 
              <View style={styles.loading}>
                <ActivityIndicator color={'white'} size={'large'} />
              </View> 
              : input.length > 0 ?
              <Pressable style={styles.button} onPress={handleHelper}>
                <Text style={styles.btnText}>Send</Text>
              </Pressable>
            :
              !recording ?
                <Pressable style={styles.voiceRecorder} onPress={handleStartRecording} >
                  <FontAwesomeIcon icon="fa-microphone" size={30} color={'white'} />
                </Pressable>
                :
                <Pressable style={styles.voiceRecorderStop} onPress={handleStopRecording} >
                  <FontAwesomeIcon icon="fa-microphone" size={30} color={'white'} />
                </Pressable>
            }
          </View>
          {/* <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null}>
          </KeyboardAvoidingView> */}
        </View>}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'row',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  logo: {
    position: 'absolute',
    width: 350, 
    height: 350, 
    // top: '-100%',
    resizeMode: 'stretch',
  },
  logoIOS: {
    marginTop: '-20%',
  },
  logoAndroid: {
    marginTop: '-35%',
  },
  aside: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    // zIndex: 10,
    backgroundColor: 'ghostwhite',
    padding: 40,
    justifyContent: 'space-between'
  },
  chatSection: {
    flex: 1,
    // width: '100%',
    // height: '100%',
    backgroundColor: '#242424',
    // padding: 40,
    position: 'relative',
    // paddingBottom: 40,
    paddingTop: 20,
  },
  chathistory: {
    height: '80%',
    // paddingBottom: 120,
  },
  topbar: {
    // flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: 'white',
  },
  topbarIOS: {
    paddingHorizontal: 16,
    paddingTop: 40,
    // paddingBottom: 16,
  },
  inputForm: {
    // position: 'absolute',
    // top: '95%',
    // width: '100%',
    // flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#242424'
  },
  imgBtn: {
    color: 'white',
    justifyContent: 'center',
    alignItems: 'center', 
    // padding: 4, 
    marginRight: 8,
    flex: 1,
    // width: '20%'
  },
  imgBtnActive: {
    backgroundColor: 'green', 
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 5,
    // padding: 8, 
    marginRight: 8,
    flex: 1
  },
  textInput: {
    backgroundColor: '#505050',
    color: 'white',
    // position: 'absolute',
    // top: '90%',
    // left: '10%',
    borderWidth: 1,
    borderRadius: 5,
    height: 40,
    width: '65%',
    padding: 6,
  },
  button: {
    backgroundColor: 'transparent',
    padding: 6,
    // borderWidth: 1,
    width: '20%',
    justifyContent: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    // height: 30,
    textAlign: 'center',
    fontSize: 16,
    alignItems: 'center',
  },
  settingProps: {
    // height: '50%',
    paddingVertical: 16,
  },
  settingsPropBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 16,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 24,
  },
  closeAsideBtn: {
    alignItems: 'center',
  },
  loading: {
    marginLeft: 16
  },
  test: {
    color: 'white',
    fontSize: 16,
  },
  modal: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: 'white',
    height: '25%',
    width: '50%',
    transform: [
      {translateX: 100},
      {translateY: 300}
    ],
    borderWidth: 1,
    padding: 20
  },
  modalText: {
    fontWeight: 'bold'
  },
  error: {
    color: 'white',
    backgroundColor: '#f54542',
    padding: 16
  },
  imageHistory: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#242424',
    position: 'relative'
  },
  voiceRecorder: {
    width: '20%',
    marginLeft: 6,
    alignItems: 'center',
    borderRadius: 50,
    borderWidth: 1,
    padding: 6,
    backgroundColor: '#24242489'
  },
  voiceRecorderStop: {
    width: '20%',
    marginLeft: 6,
    alignItems: 'center',
    borderRadius: 50,
    borderWidth: 1,
    padding: 6,
    backgroundColor: 'red'
  }
});

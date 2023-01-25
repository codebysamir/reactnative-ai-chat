import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view'
import { useState, useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, Modal } from 'react-native';
import ChatMessage from './components/ChatMessage';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons/faGear'
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'

export default function App() {
  const [input, setInput] = useState('')
  const [chatlog, setChatLog] = useState([])
  const [error, setError] = useState()
  const [prompt, setPrompt] = useState('')
  const [asideVisbility, setAsideIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tokens, setTokens] = useState(0)

  const scrollRef = useRef()

  async function handleInput() {
    console.log(input)

    try {
      setIsLoading(isLoading => !isLoading)
      const request = await fetch('https://openai-api-backend.glitch.me/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'text/event-stream'
      },
      body: JSON.stringify({
        message: prompt !== '' ? `${prompt} Kid: ${input}` : `Kid: ${input}`
      })
      })
      const result = await request.json()

      // Trim Whitespace in the beginning
      const trimResult = result.message.trimStart()

      console.log('question: ' + input, 'answer: ' + trimResult)
      setChatLog((chatlog) => [
        ...chatlog,
        {
          question: input,
          answer: trimResult
        }
      ])
      console.log(chatlog)
      setPrompt(
        prompt => prompt !== '' ?
       `${prompt} Kid: ${input} ${trimResult}` :
        `Kid: ${input} ${trimResult}`
      )
      setTokens(tokens => tokens += result.tokens)

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


  return (
    <>
      <StatusBar style='light' />
      <View style={styles.container}>
        {tokens === 2500 && 
        <View style={styles.modal}>
            <Text style={styles.modalText}>
              You reached your maximal token capacity, wait 24h or buy more tokens/Pro Version.
            </Text>
        </View>}
        {asideVisbility ? 
        <View style={styles.aside}>
          <View style={styles.settingProps}>
            <Pressable style={styles.settingsPropBtn} onPress={handleSettingProp}>
              <Text style={{textAlign: 'center',}}>Tokens</Text>
            </Pressable>
            <Pressable style={styles.settingsPropBtn} onPress={handleSettingProp}>
              <Text style={{textAlign: 'center',}}>Pro Version</Text>
            </Pressable>
            <Pressable style={styles.settingsPropBtn} onPress={handleSettingProp}>
              <Text style={{textAlign: 'center',}}>System Settings</Text>
            </Pressable>
          </View>
          <Pressable style={styles.closeAsideBtn} onPress={handleShowAside}>
            <FontAwesomeIcon icon={ faXmark } style={{color: 'white',}} size={40} />
          </Pressable>
        </View> :
        <View style={styles.chatSection}>
          <View style={styles.topbar}>
            <Pressable onPress={handleShowAside} >
              <FontAwesomeIcon icon={ faGear } style={styles.test} />
            </Pressable>
            <Text style={{color: 'white', fontWeight: 'bold'}}>Token used: {tokens}</Text>
            <Pressable onPress={handleClearConversation}>
              <FontAwesomeIcon icon={ faTrash } style={{color: 'white', fontSize: 16}} />
            </Pressable>
          </View>
          {error !== undefined ? <Text style={styles.error}>{error}</Text> :
          <View style={styles.chathistory}>
            <KeyboardAwareFlatList 
              data={chatlog} 
              renderItem={itemData => {
                return (
                  <ChatMessage key={itemData.index} message={itemData.item}/>
                )
              }}
              ref={scrollRef}
            />
            {/* <ScrollView>
              {chatlog.map((chat, index) => <ChatMessage key={index} message={chat}/>)}
            </ScrollView> */}
          </View>}
          <View style={styles.inputForm}>
            <TextInput 
              style={styles.textInput} 
              value={input} 
              onChangeText={e => setInput(e)}
            />
            {isLoading ? 
            <View style={styles.loading}>
              <ActivityIndicator color={'white'} size={'large'} />
            </View> :
            <Pressable style={styles.button} onPress={handleInput}>
              <Text style={styles.btnText}>Send</Text>
            </Pressable>}
          </View>
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
  aside: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    // zIndex: 10,
    backgroundColor: 'darkgrey',
    padding: 40,
    justifyContent: 'space-between'
  },
  chatSection: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3a65ab',
    // padding: 40,
    position: 'relative',
    // paddingBottom: 40,
    paddingTop: 20,
  },
  chathistory: {
    paddingBottom: 120
  },
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'white',
  },
  inputForm: {
    position: 'absolute',
    top: '95%',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  textInput: {
    backgroundColor: '#242424',
    color: 'white',
    // position: 'absolute',
    // top: '90%',
    // left: '10%',
    borderWidth: 1,
    borderRadius: 5,
    width: '80%',
    padding: 6,
  },
  button: {
    backgroundColor: 'transparent',
    padding: 8,
    // borderWidth: 1,
    width: '15%',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  settingProps: {
    // height: '50%',
    paddingVertical: 16,
  },
  settingsPropBtn: {
    padding: 8,
    borderWidth: 1,
    marginBottom: 16,
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
    color: 'whtie',
    backgroundColor: '#f54542',
    padding: 16
  }
});

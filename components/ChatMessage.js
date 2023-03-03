import { width } from '@fortawesome/free-solid-svg-icons/faGear'
import React, { useState } from 'react'
import { StyleSheet, View, Text, Image, Pressable } from 'react-native'

const LOCAL = 'http://192.168.1.101:3001'
const DEFAULT = 'notPressed'

export default function ChatMessage({message}) {
  const [isPressed, setIsPressed] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setLoading] = useState(false)

  const teacherString = () => {
    if (message.answer.startsWith('Teacher:')) {
      const newAnswer = message.answer.replace('Teacher: ', '')
      return newAnswer
    } else {
      return message.answer
    }
  }

  function handlePressImg() {
    // if (isPressed !== DEFAULT) return setIsPressed(DEFAULT)
    // setIsPressed(message.id)
    console.log('pressed')
    setIsPressed(!isPressed)
  }

  async function handleSaveImg() {
    if (isSaved) return
    setLoading(true)
    try {
      const postImg = await fetch(LOCAL + '/api/v1/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message.imagePrompt,
          photo: message.image
        })
      })
      
      console.log('saved')
      setIsSaved(true)
    } catch (error) {
      console.log('handleSaveImg Error: ' + error)
    } finally {
      setLoading(false)
    }

  }
  
  return (
    <View>
        <Text style={styles.question}>{message.imagePrompt? message.imagePrompt : message.question}</Text>
        {message.image ? 
          <View style={styles.imageContainer} >
            <Image style={styles.image} source={{uri: message.image}} /> 
            <Pressable style={styles.press} onPress={handlePressImg} >
              <View style={[styles.overlay, isPressed && styles.overlay100]}>
                <View style={styles.overlayTextBox}>
                  <Pressable onPress={handleSaveImg}>
                    {
                    !isSaved ?
                      isLoading ?
                      <Text style={{color: 'white', textAlign: 'center'}}>Saving...</Text>
                      : <Text style={{color: 'white', textAlign: 'center'}}>Save in Gallery</Text>
                    : <Text style={{color: 'green', textAlign: 'center'}}>Saved</Text>
                    }
                  </Pressable>
                </View>
              </View>
            </Pressable>
          </View>
          : <Text style={styles.answer}>{teacherString()}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
    question: {
        backgroundColor: 'transparent',
        color: 'white',
        padding: 16,
    },
    answer: {
        backgroundColor: '#caddfc',
        color: 'black',
        padding: 16,
    },
    image: {
        aspectRatio: 1,
        width: '100%',
        resizeMode: 'cover',
    },
    imageContainer: {
        backgroundColor: '#caddfc',
        flex: 1,
        padding: 16,
    },
    overlay: {
      flex: 1,
      width: '100%',
      height: '100%',
      position: 'absolute',
      bottom: 0,
      left: 0,
      padding: 0,
      opacity: 0
    },
    overlay100: {
      opacity: 100
    },
    overlayTextBox: {
      backgroundColor: '#242424e6',
      // width: '100%',
      // height: '20%',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
    },
    press: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      bottom: 16,
      left: 16,
    }
})
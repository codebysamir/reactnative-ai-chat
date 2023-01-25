import React from 'react'
import { StyleSheet, View, Text } from 'react-native'

export default function ChatMessage({message}) {

  const teacherString = () => {
    if (message.answer.startsWith('Teacher:')) {
      const newAnswer = message.answer.replace('Teacher: ', '')
      return newAnswer
    } else {
      return message.answer
    }
  }
  
  return (
    <View>
        <Text style={styles.question}>{message.question}</Text>
        <Text style={styles.answer}>{teacherString()}</Text>
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
    }
})
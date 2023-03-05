import { height } from '@fortawesome/free-solid-svg-icons/faGear'
import React, { useState } from 'react'
import { View, Text, StyleSheet, Image, Pressable } from 'react-native'

export default function ImageCard({post, setFullscreen, setImageDetails}) {

    function handlePressImg() {
        console.log('pressed')
        setFullscreen(true)
        setImageDetails({
            id: post._id,
            photo: post.photo,
            prompt: post.prompt
        })
    }

  return (
    <View style={styles.imageContainer}>
        <Image source={{uri: post.photo}} style={styles.image} />
        <Pressable style={styles.press} onPress={handlePressImg} >
            <View style={styles.overlay}>
            <View style={styles.overlayTextBox}>
                <Text style={{color: 'white'}}>
                    {post.prompt}
                </Text>
            </View>
            </View>
        </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
    image: {
        aspectRatio: 1/1,
        width: '100%',
        resizeMode: 'cover',
    },
    imageContainer: {
        width: '50%',
        // height: '100%',
        // padding: 4,
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
      bottom: 0,
      left: 0,
    }
})
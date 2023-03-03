import React, { useState } from 'react'
import { View, Text, StyleSheet, Image, Pressable } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

const LOCAL = 'http://192.168.1.101:3001'

export default function ImageCardFullscreen({image, setImgFullscreen, handleGetImages}) {
    const [isPressed, setIsPressed] = useState(false)

    console.log(image)

    function handlePressImg() {
        console.log('pressed')
        setIsPressed(!isPressed)
    }

    function handleImgFullscreen() {
      setImgFullscreen(false)
    }

    const photoId = image.photo.slice(61, -4)

    async function handleDeletePost() {
      const deletePost = await fetch(LOCAL + '/api/v1/post/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: image.prompt,
          photo: image.photo,
          photoId
        })
      })

      const result = await deletePost.json()
      console.log( result)

      if (!result.success) return alert('image couldnt be deleted')
      handleImgFullscreen()
      handleGetImages()
      // alert('successful deleted')
    }

  return (
    <>
      <Pressable style={{padding: 16, flexDirection: 'row', alignItems: 'center'}} onPress={handleImgFullscreen} >
        <FontAwesomeIcon icon="fa-angle-left" style={{marginRight: 8}} color="white" />
        <Text style={{color: 'white', fontSize: 24}} >All Images</Text>
      </Pressable>
      <View style={styles.imageContainer}>
          <Image source={{uri: image.photo}} style={styles.image} />
          <View style={styles.overlayTextBox}>
              <Text style={{color: 'white'}}>
                  {image.prompt}
              </Text>
              <View style={styles.iconsBar}>
                <Pressable onPress={handleDeletePost}>
                  <FontAwesomeIcon icon='fa-trash' color='white' />
                </Pressable>
              </View>
              {/* <Pressable onPress={handleSaveImg}>
              {!isDownloaded ?
                  <Text style={{color: 'white', textAlign: 'center'}}>Save in Gallery</Text>
                  : <Text style={{color: 'green', textAlign: 'center'}}>Saved</Text>
              }
              </Pressable> */}
          </View>
          {/* <Pressable style={styles.press} onPress={handlePressImg} >
            <View style={[styles.overlay, isPressed && styles.overlay100]}>
            </View>
          </Pressable> */}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
    image: {
        aspectRatio: 1/1,
        width: '100%',
        resizeMode: 'cover',
    },
    imageContainer: {
        backgroundColor: '#caddfc',
        // flex: 1,
        // padding: 16,
        width: '100%',
        // height: '100%',
        // marginBottom: 16,
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
      width: '100%',
      // height: '20%',
      // position: 'absolute',
      // bottom: 0,
      // left: 0,
      // right: 0,
      padding: 20,
    },
    press: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      bottom: 0,
      left: 0,
    },
    iconsBar: {
      paddingTop: 16,
      alignItems: 'flex-end',
    }
})
import React, { useState } from 'react'
import { View, Text, StyleSheet, Image, Pressable } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as MediaLibrary from 'expo-media-library'
import * as FileSystem from 'expo-file-system'
import { LOCAL, RENDER_BACKEND_URL } from '@env'

export default function ImageCardFullscreen({image, setImgFullscreen, handleGetImages}) {
    const [isPressed, setIsPressed] = useState(false)

    function handlePressImg() {
        console.log('pressed')
        setIsPressed(!isPressed)
    }

    function handleImgFullscreen() {
      setImgFullscreen(false)
    }

    const photoId = image.photo.slice(61, -4)

    async function handleDeletePost() {
      const deletePost = await fetch(RENDER_BACKEND_URL + '/api/v1/post/delete', {
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
      alert('successful deleted')
    }

    async function handleSaveImage() {
      const uri = image.photo
      try {
          const {status} = await MediaLibrary.requestPermissionsAsync()
          if (status !== 'granted') {
            console.log('Permission denied to access media library')
            alert('Permission denied to access media library')
            return
          }
          console.log(FileSystem)
          const localUri = FileSystem.documentDirectory + 'myimage.jpg'
          const downloadResult = await FileSystem.downloadAsync(
            uri,
            localUri
          )

          const asset = await MediaLibrary.createAssetAsync(downloadResult.uri)
          const album = await MediaLibrary.getAlbumAsync('TeachemApp')
          if (album === null) {
              await MediaLibrary.createAlbumAsync('TeachemApp', asset, false)
          } else {
              await MediaLibrary.addAssetsToAlbumAsync([asset], album, false)
          }
          console.log('Image saved successfully')
          alert('Image saved successfully')
      } catch (error) {
          console.log('Error saving image: ', error)
          alert('Error saving image: ', error)
      }
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
              <Text style={{color: 'white', fontSize: 20}}>
                  {image.prompt}
              </Text>
              <View style={styles.iconsBar}>
                <Pressable onPress={handleDeletePost}>
                  <FontAwesomeIcon icon='fa-trash' color='white' />
                </Pressable>
                <Pressable onPress={handleSaveImage}>
                  <FontAwesomeIcon icon={'fa-download'} color='white' />
                </Pressable>
              </View>
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
      padding: 32,
    },
    press: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      bottom: 0,
      left: 0,
    },
    iconsBar: {
      paddingTop: 32,
      justifyContent: 'space-around',
      flexDirection: 'row',
      margin: 'auto'
    }
})
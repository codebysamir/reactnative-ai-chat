import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native'
import ImageCard from './ImageCard'
import ImageCardFullscreen from './ImageCardFullscreen'
import { LOCAL, RENDER_BACKEND_URL } from '@env'

export default function ImageHistory() {
  const [allPosts, setAllPosts] = useState([])
  const [imgFullscreen, setImgFullscreen] = useState(false)
  const [fullscreenDetails, setFullscreenDetails] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    handleGetImages()
  }, [])
  
  async function handleGetImages() {
    console.log(allPosts)
    setIsLoading(true)
    console.log('loading true')
    try {
      const getImage = await fetch(RENDER_BACKEND_URL + '/api/v1/post', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (getImage.ok) {
        const result = await getImage.json()
        setAllPosts(result.data.reverse())
      }
    } catch (err) {
      alert(err)
      console.log('getImage: ' + err)
    }
    setIsLoading(false)
  }

  return (
    <View style={styles.ImageHistorySection}>
      {!imgFullscreen ?
      <>
        <View style={{padding: 16}}>
          <Text style={styles.title} >Image History</Text>
          <Text style={{color: 'white', textAlign: 'center'}} >All saved images</Text>
        </View>
        <View style={styles.imageGallery}>
          {
              (allPosts.length > 0 ? 
                (<FlatList 
                  key={allPosts.map(post => post.index)}
                  numColumns={2}
                  style={styles.flatlist}
                  data={allPosts}
                  renderItem={
                    itemData => {
                    return (
                      <ImageCard post={itemData.item} setFullscreen={setImgFullscreen} setImageDetails={setFullscreenDetails} />
                    )
                  }}
                />)
                : isLoading ?
                (
                  <>
                    <View style={styles.loader} >
                      <ActivityIndicator color={'white'} size={'large'} />
                    </View>
                    <View style={styles.previewBox}>
                      <Image source={require('../assets/preview.png')} style={styles.preview} />
                    </View>
                  </>
                )
                : (<Text>No Images found.</Text>)
              )
          }
        </View>
      </>
      :
        <ImageCardFullscreen image={fullscreenDetails} setImgFullscreen={setImgFullscreen} handleGetImages={handleGetImages} />
      }
    </View>
  )
}

const styles = StyleSheet.create({
  ImageHistorySection: {
    flex: 1,
    // padding: 16,
    backgroundColor: '#242424'
  },
  title: {
    color: 'white', 
    marginBottom: 8, 
    fontWeight: 'bold', 
    fontSize: 32, 
    textAlign: 'center',
  },
  imageGallery: {
    flex: 1,
    // borderTopWidth: 1,
    // borderTopColor: 'white',
    paddingTop: 16,
  },
  flatlist: {
    height: '100%',
    width: '100%'
  },
  previewBox: {
    opacity: 0.1,
    padding: 40,
    zIndex: 0,
    flex: 1,
  },
  preview: {
    width: 300,
    height: 300,
    color: 'white'
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    justifyContent: 'center'
  }
})

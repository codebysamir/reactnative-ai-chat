import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'
import ImageCard from './ImageCard'
import ImageCardFullscreen from './ImageCardFullscreen'
import { LOCAL, RENDER_BACKEND_URL } from '@env'

export default function ImageHistory() {
  const [allPosts, setAllPosts] = useState([])
  const [imgFullscreen, setImgFullscreen] = useState(false)
  const [fullscreenDetails, setFullscreenDetails] = useState({})

  useEffect(() => {
    handleGetImages()
  }, [])
  
  async function handleGetImages() {
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
  }

  return (
    <View style={styles.ImageHistorySection}>
      {!imgFullscreen ?
      <>
        <View style={{padding: 16}}>
          <Text style={{color: 'white', marginBottom: 8, fontWeight: 'bold', fontSize: 32}} >Image History</Text>
          <Text style={{color: 'white',}} >All saved images</Text>
        </View>
        <View style={styles.imageGallery}>
          {allPosts.length > 0 ? 
            <FlatList 
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
            />
          : <Text>No Images found.</Text>}
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
    backgroundColor: '#3a65ab'
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
  }
})

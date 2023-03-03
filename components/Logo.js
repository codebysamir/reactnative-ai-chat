import React from 'react'
import { SvgXml } from 'react-native-svg'
const logoSvg = require('../assets/logo.svg')

export default function Logo() {
    const xmlString = "data:image/svg+xml;base64," + btoa(logoSvg)
  return (
    <SvgXml 
        width='100'
        height='100'
        uri={xmlString}
    />
  )
}

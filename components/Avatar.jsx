import React from 'react'
import styled from 'styled-components/native'
import { hp } from '../helpers/common'
import { theme } from '../constants/theme'
import { Image } from 'expo-image'
import { getUserImageSrc } from '../services/imageService'

// Styled Components
const StyledImage = styled(Image)`
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  border-radius: ${(props) => props.rounded}px;
  border-color: ${theme.colors.darkLight};
  border-width: 1px;
  /* Apply style prop */
  ${(props) => props.style}
`;

const Avatar = ({
  uri,
  size = hp(4.5),
  rounded = theme.radius.md,
  style = {},
}) => {
  return (
    <StyledImage 
      source={getUserImageSrc(uri)}
      transition={100}
      size={size}
      rounded={rounded}
      style={style}
    />
  )
}

export default Avatar

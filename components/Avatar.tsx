import React from 'react'
import styled from 'styled-components/native'
import { hp } from '../helpers/common'
import { theme } from '../constants/theme'
import { Image, ImageStyle } from 'expo-image'
import { getUserImageSrc } from '../services/imageService'
import { ViewStyle } from 'react-native'

interface StyledImageProps {
  $size: number;
  $rounded: number;
}

interface AvatarProps {
  uri?: string | null;  // Aggiunto null come tipo possibile
  size?: number;
  rounded?: number;
  style?: ImageStyle;
}

// Styled Components
const StyledImage = styled(Image)<StyledImageProps>`
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  border-radius: ${(props) => props.$rounded}px;
  border-color: ${theme.colors.darkLight};
  border-width: 1px;
`;

const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = hp(4.5),
  rounded = theme.radius.md,
  style = {},
}) => {
  return (
    <StyledImage 
      source={getUserImageSrc(uri)}
      transition={100}
      $size={size}
      $rounded={rounded}
      style={style}
      contentFit="cover"
    />
  )
}

export default Avatar


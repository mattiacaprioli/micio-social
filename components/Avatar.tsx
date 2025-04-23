import React from 'react'
import styled from 'styled-components/native'
import { hp } from '../helpers/common'
import { Theme } from '../constants/theme'
import { Image, ImageStyle } from 'expo-image'
import { getUserImageSrc } from '../services/imageService'
import { ViewStyle } from 'react-native'
import { useTheme } from '../context/ThemeContext'
import { useTheme as useStyledTheme } from 'styled-components/native'

interface StyledImageProps {
  $size: number;
  $rounded: number;
  $isDarkMode?: boolean;
}

interface AvatarProps {
  uri?: string | null;  // Aggiunto null come tipo possibile
  size?: number;
  rounded?: number;
  style?: ImageStyle;
  isDarkMode?: boolean;
  theme?: Theme;
}

// Styled Components
const StyledImage = styled(Image)<StyledImageProps>`
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  border-radius: ${(props) => props.$rounded}px;
  border-color: ${props => props.theme.colors.darkLight};
  border-width: 1px;
`;

const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = hp(4.5),
  rounded,
  style = {},
  isDarkMode = false
}) => {
  const { isDarkMode: contextDarkMode } = useTheme();
  const theme = useStyledTheme();
  const actualRounded = rounded || theme.radius.md;

  return (
    <StyledImage
      source={getUserImageSrc(uri)}
      transition={100}
      $size={size}
      $rounded={actualRounded}
      style={style}
      contentFit="cover"
    />
  )
}

export default Avatar


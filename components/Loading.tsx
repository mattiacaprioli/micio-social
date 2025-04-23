import { ActivityIndicator, View, ViewStyle } from 'react-native'
import React from 'react'
import styled from 'styled-components/native'
import { useTheme } from '../context/ThemeContext'
import { useTheme as useStyledTheme } from 'styled-components/native'

interface LoadingProps {
  size?: 'small' | 'large'
  color?: string
  containerStyle?: ViewStyle
  fullscreen?: boolean
}

const Container = styled.View<{ $fullscreen?: boolean; $isDarkMode?: boolean }>`
  justify-content: center;
  align-items: center;
  ${({ $fullscreen, $isDarkMode }) => $fullscreen && `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${$isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
    z-index: 999;
  `}
`;

const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color,
  containerStyle,
  fullscreen = false
}) => {
  const { isDarkMode } = useTheme();
  const theme = useStyledTheme();
  const indicatorColor = color || theme.colors.primary;

  return (
    <Container
      style={containerStyle}
      $fullscreen={fullscreen}
      $isDarkMode={isDarkMode}
    >
      <ActivityIndicator
        size={size}
        color={indicatorColor}
      />
    </Container>
  )
}

export default Loading
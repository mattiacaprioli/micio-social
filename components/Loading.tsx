import { ActivityIndicator, View, ViewStyle } from 'react-native'
import React from 'react'
import styled from 'styled-components/native'
import { theme } from '../constants/theme'

interface LoadingProps {
  size?: 'small' | 'large'
  color?: string
  containerStyle?: ViewStyle
  fullscreen?: boolean
}

const Container = styled.View<{ $fullscreen?: boolean }>`
  justify-content: center;
  align-items: center;
  ${({ $fullscreen }) => $fullscreen && `
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 999;
  `}
`;

const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = theme.colors.primary,
  containerStyle,
  fullscreen = false
}) => {
  return (
    <Container 
      style={containerStyle}
      $fullscreen={fullscreen}
    >
      <ActivityIndicator 
        size={size} 
        color={color} 
      />
    </Container>
  )
}

export default Loading
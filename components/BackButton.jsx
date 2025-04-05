import React from 'react'
import styled from 'styled-components/native'
import Icon from '../assets/icons/index'
import { theme } from '../constants/theme'

// Styled Components
const StyledPressable = styled.Pressable`
  align-self: flex-start;
  padding: 5px;
  border-radius: ${theme.radius.sm}px;
  background-color: rgba(0,0,0,0.07);
`;

const BackButton = ({size = 26, router}) => {
  return (
    <StyledPressable onPress={() => router.back()}>
      <Icon name="arrowLeft" size={size} color={theme.colors.text} />
    </StyledPressable>
  )
}

export default BackButton
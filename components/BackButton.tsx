import React from 'react'
import styled from 'styled-components/native'
import { Pressable } from 'react-native'
import Icon from '../assets/icons'
import { hp } from '../helpers/common'
import { theme } from '../constants/theme'
import { Router } from 'expo-router'

const Button = styled.Pressable`
  padding: 5px;
`;

interface BackButtonProps {
  router: Router;
}

const BackButton: React.FC<BackButtonProps> = ({ router }) => {
  return (
    <Button onPress={() => router.back()}>
      <Icon 
        name="arrowLeft" 
        size={hp(2.7)} 
        color={theme.colors.textDark} 
      />
    </Button>
  )
}

export default BackButton
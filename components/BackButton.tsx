import React from 'react'
import styled from 'styled-components/native'
import { Pressable } from 'react-native'
import Icon from '../assets/icons'
import { hp } from '../helpers/common'
import { Theme } from '../constants/theme'
import { useTheme } from '../context/ThemeContext'
import { useTheme as useStyledTheme } from 'styled-components/native'
import { Router } from 'expo-router'

const Button = styled.Pressable`
  padding: 5px;
`;

interface BackButtonProps {
  router: Router;
  theme?: Theme;
}

const BackButton: React.FC<BackButtonProps> = ({ router }) => {
  const { isDarkMode } = useTheme();
  const theme = useStyledTheme();

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
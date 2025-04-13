import React from 'react'
import styled from 'styled-components/native'
import { TextInputProps, ViewStyle } from 'react-native'
import { theme } from '../constants/theme'
import { hp } from '../helpers/common'

interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputRef?: React.RefObject<any>;
}

// Styled Components
const Container = styled.View<{ $containerStyle?: ViewStyle }>`
  flex-direction: row;
  align-items: center;
  height: ${hp(7.2)}px;
  justify-content: center;
  border-width: 0.4px;
  border-color: ${theme.colors.text};
  border-radius: ${theme.radius.xxl}px;
  padding-left: 18px;
  padding-right: 18px;
  gap: 12px;
  ${({ $containerStyle }) => $containerStyle ? Object.entries($containerStyle).map(([key, value]) => `${key}: ${value};`).join(' ') : ''}
`;

const StyledTextInput = styled.TextInput.attrs({
  placeholderTextColor: theme.colors.textLight,
})`
  flex: 1;
  color: ${theme.colors.textDark};
`;

const Input: React.FC<InputProps> = ({
  icon,
  containerStyle,
  inputRef,
  ...props
}) => {
  return (
    <Container $containerStyle={containerStyle}>
      {icon}
      <StyledTextInput
        ref={inputRef}
        {...props}
      />
    </Container>
  )
}

export default Input



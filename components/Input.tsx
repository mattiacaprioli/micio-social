import React from 'react'
import { TextInputProps, ViewStyle } from 'react-native'
import styled from 'styled-components/native'
import { theme } from '../constants/theme'
import { hp } from '../helpers/common'

interface InputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  icon?: React.ReactNode;
  inputRef?: React.RefObject<any>;
}

// Styled Components
const Container = styled.View`
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
`;

const StyledTextInput = styled.TextInput`
  flex: 1;
  color: ${theme.colors.textDark};
`;

const Input: React.FC<InputProps> = ({
  containerStyle,
  icon,
  inputRef,
  ...props
}) => {
  return (
    <Container style={containerStyle}>
      {icon}
      <StyledTextInput
        placeholderTextColor={theme.colors.textLight}
        ref={inputRef}
        {...props}
      />
    </Container>
  )
}

export default Input

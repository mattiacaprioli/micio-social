import React from 'react'
import { TextInputProps, ViewStyle, TextInput } from 'react-native'
import styled from 'styled-components/native'
import { useTheme as useStyledTheme } from 'styled-components/native'
import { hp } from '../helpers/common'

interface InputProps extends Omit<TextInputProps, 'ref'> {
  containerStyle?: ViewStyle;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inputRef?: React.RefObject<TextInput>;
  forceLightMode?: boolean; // Aggiunto per forzare i colori della modalità chiara
}

// Styled Components
const Container = styled.View<{ $forceLightMode?: boolean }>`
  flex-direction: row;
  align-items: center;
  height: ${hp(5)}px;
  justify-content: center;
  border-width: 0.4px;
  border-color: ${props => props.$forceLightMode ? '#333' : props.theme.colors.text};
  border-radius: ${props => props.theme.radius.sm}px;
  padding-left: 18px;
  padding-right: 18px;
  gap: 12px;
  background-color: ${props => props.$forceLightMode ? 'white' : props.theme.colors.background};
`;

const StyledTextInput = styled.TextInput<{ $forceLightMode?: boolean }>`
  flex: 1;
  color: ${props => props.$forceLightMode ? '#333' : props.theme.colors.textDark};
`;

const Input: React.FC<InputProps> = ({
  containerStyle,
  icon,
  rightIcon,
  inputRef,
  forceLightMode = false,
  ...props
}) => {
  const theme = useStyledTheme();

  return (
    <Container style={containerStyle} $forceLightMode={forceLightMode}>
      {icon}
      <StyledTextInput
        placeholderTextColor={forceLightMode ? '#999' : theme.colors.textLight}
        // @ts-ignore
        ref={inputRef}
        $forceLightMode={forceLightMode}
        {...props}
      />
      {rightIcon}
    </Container>
  )
}

export default Input

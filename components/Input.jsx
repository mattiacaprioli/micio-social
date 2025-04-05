import React from 'react'
import styled from 'styled-components/native'
import { theme } from '../constants/theme'
import { hp } from '../helpers/common'

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
  /* Apply containerStyle prop */
  ${(props) => props.containerStyle}
`;

const StyledTextInput = styled.TextInput`
  flex: 1;
  color: ${theme.colors.textDark};
`;

const Input = (props) => {
  return (
    <Container containerStyle={props.containerStyle}>
      {props.icon && props.icon}
      <StyledTextInput
        placeholderTextColor={theme.colors.textLight}
        ref={props.inputRef && props.inputRef}
        {...props}
      />
    </Container>
  )
}

export default Input

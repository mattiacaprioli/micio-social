import React from "react";
import { View } from "react-native";
import styled from "styled-components/native";
import { theme } from "../constants/theme";
import { hp } from "../helpers/common";
import Loading from "./Loading";

// Define styled components
const StyledPressable = styled.Pressable`
  background-color: ${(props) => props.disabled ? theme.colors.disabled : theme.colors.primary};
  height: ${hp(6.6)}px;
  justify-content: center;
  align-items: center;
  border-radius: ${theme.radius.xl}px;
  ${(props) =>
    props.hasShadow &&
    `
    shadow-color: ${theme.colors.dark};
    shadow-offset: 0px 10px;
    shadow-opacity: 0.2;
    shadow-radius: 8px;
    elevation: 4;
  `}
`;

const StyledText = styled.Text`
  color: white;
  font-size: ${hp(2.5)}px;
  font-weight: ${theme.fonts.bold};
`;

// Loading container needs separate styling as it replaces the button
const LoadingContainer = styled.View`
  background-color: white;
  height: ${hp(6.6)}px;
  justify-content: center;
  align-items: center;
  border-radius: ${theme.radius.xl}px;
`;

const Button = ({
  buttonStyle, 
  textStyle,  
  title = "",
  onPress = () => {},
  loading = false,
  hasShadow = true,
  disabled = false, 
}) => {
  if (loading) {
    return (
      <LoadingContainer style={buttonStyle}>
        <Loading />
      </LoadingContainer>
    );
  }

  return (
    <StyledPressable
      onPress={onPress}
      style={buttonStyle} 
      hasShadow={hasShadow && !disabled} 
      disabled={disabled || loading} 
    >
      <StyledText style={textStyle}>{title}</StyledText>
    </StyledPressable>
  );
};

export default Button;

import React from 'react';
import styled from 'styled-components/native';
import { ViewStyle, TextStyle } from 'react-native';
import { theme } from '@/constants/theme';
import { hp } from '../helpers/common'
import Loading from './Loading';

interface ButtonProps {
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  title?: string;
  onPress?: () => void;
  loading?: boolean;
  hasShadow?: boolean;
  disabled?: boolean;
}

const StyledPressable = styled.Pressable<{ hasShadow: boolean }>`
  background-color: ${theme.colors.primary};
  height: ${hp(6.6)}px;
  justify-content: center;
  align-items: center;
  border-radius: ${theme.radius.xl}px;
  opacity: ${props => props.disabled ? 0.7 : 1};
  ${props => props.hasShadow && `
    shadow-color: ${theme.colors.primary};
    shadow-offset: 0px 4px;
    shadow-opacity: 0.25;
    shadow-radius: 8px;
    elevation: 5;
  `}
`;

const StyledText = styled.Text`
  color: white;
  font-size: ${hp(2.5)}px;
  font-weight: ${theme.fonts.bold};
`;

const LoadingContainer = styled.View`
  background-color: white;
  height: ${hp(6.6)}px;
  justify-content: center;
  align-items: center;
  border-radius: ${theme.radius.xl}px;
`;

const Button: React.FC<ButtonProps> = ({
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
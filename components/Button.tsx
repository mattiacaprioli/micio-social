import React from 'react';
import styled from 'styled-components/native';
import { ViewStyle, TextStyle } from 'react-native';
import { Theme } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useTheme as useStyledTheme } from 'styled-components/native';
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
  theme?: Theme;
}

const StyledPressable = styled.Pressable<{ hasShadow: boolean; theme: Theme }>`
  background-color: ${props => props.theme.colors.primary};
  height: ${hp(4.5)}px;
  justify-content: center;
  align-items: center;
  border-radius: ${props => props.theme.radius.sm}px;
  opacity: ${props => props.disabled ? 0.7 : 1};
  ${props => props.hasShadow && `
    shadow-color: ${props.theme.colors.primary};
    shadow-offset: 0px 4px;
    shadow-opacity: 0.25;
    shadow-radius: 8px;
    elevation: 5;
  `}
`;

const StyledText = styled.Text<{ theme: Theme }>`
  color: white;
  font-size: ${hp(2)}px;
  font-weight: ${props => props.theme.fonts.bold};
`;

const LoadingContainer = styled.View<{ theme: Theme }>`
  background-color: ${props => props.theme.colors.background};
  height: ${hp(6.6)}px;
  justify-content: center;
  align-items: center;
  border-radius: ${props => props.theme.radius.xl}px;
`;

const Button: React.FC<ButtonProps> = ({
  buttonStyle,
  textStyle,
  title = "",
  onPress = () => {},
  loading = false,
  hasShadow = true,
  disabled = false
}) => {
  const { isDarkMode } = useTheme();
  const theme = useStyledTheme();

  if (loading) {
    return (
      <LoadingContainer style={buttonStyle}>
        <Loading color={theme.colors.primary} />
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
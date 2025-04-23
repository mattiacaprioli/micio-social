import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../constants/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <StyledThemeProvider theme={theme}>
      {children}
    </StyledThemeProvider>
  );
};

export default ThemeProvider;

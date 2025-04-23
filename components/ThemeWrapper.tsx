import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import ScreenWrapper from './ScreenWrapper';
import { useTheme as useStyledTheme } from 'styled-components/native';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  const { isDarkMode } = useTheme();
  const theme = useStyledTheme();

  // Determina il colore di sfondo in base al tema
  const backgroundColor = theme.colors.background;

  // Determina lo stile della status bar in base al tema
  const statusBarStyle = isDarkMode ? 'light' : 'dark';

  return (
    <>
      <StatusBar style={statusBarStyle} />
      <ScreenWrapper bg={backgroundColor}>
        {children}
      </ScreenWrapper>
    </>
  );
};

export default ThemeWrapper;

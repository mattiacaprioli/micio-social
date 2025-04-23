// Definizione dei tipi per i temi
interface ThemeColors {
  primary: string;
  primaryDark: string;
  background: string;
  card: string;
  cardBorder: string;
  cardShadow: string;
  text: string;
  textLight: string;
  textDark: string;
  dark: string;
  darkLight: string;
  gray: string;
  rose: string;
  roseLight: string;
}

interface ThemeFonts {
  medium: string;
  semibold: string;
  bold: string;
  extraBold: string;
}

interface ThemeRadius {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface Theme {
  colors: ThemeColors;
  fonts: ThemeFonts;
  radius: ThemeRadius;
}

// Tema chiaro (default)
export const lightTheme: Theme = {
  colors: {
    primary: '#FF6F3C',
    primaryDark: '#CC5930',
    background: 'white',
    card: '#E1E1E1',
    cardBorder: '#3E3E3E',
    cardShadow: 'rgba(0, 0, 0, 0.05)',
    text: '#494949',
    textLight: '#7C7C7C',
    textDark: '#1D1D1D',
    dark: '#3E3E3E',
    darkLight: '#E1E1E1',
    gray: '#e3e3e3',
    rose: '#ef4444',
    roseLight: '#f87171',
  },
  fonts: {
    medium: '500',
    semibold: '600',
    bold: '700',
    extraBold: '800',
  },
  radius: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
  },
};

// Tema scuro
export const darkTheme: Theme = {
  colors: {
    primary: '#FF6F3C',
    primaryDark: '#CC5930',
    background: '#1A1A1A',
    card: '#2A2A2A',
    cardBorder: '#3A3A3A',
    cardShadow: 'rgba(0, 0, 0, 0.2)',
    text: '#E0E0E0',
    textLight: '#B0B0B0',
    textDark: '#FFFFFF',
    dark: '#3E3E3E',
    darkLight: '#2A2A2A',
    gray: '#3A3A3A',
    rose: '#ef4444',
    roseLight: '#f87171',
  },
  fonts: {
    medium: '500',
    semibold: '600',
    bold: '700',
    extraBold: '800',
  },
  radius: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
  },
};

// Per retrocompatibilità, esportiamo anche il tema predefinito
export const theme = lightTheme;

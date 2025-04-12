import { ViewStyle, TextStyle } from 'react-native';

export interface StyleProps {
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export interface WithChildren {
  children?: React.ReactNode;
}

export interface WithLoading {
  loading?: boolean;
}

export interface WithDisabled {
  disabled?: boolean;
}

export type CommonProps = StyleProps & WithChildren & WithLoading & WithDisabled;
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

interface AuthWrapperProps {
  children: React.ReactNode;
}

interface ContainerProps {
  $paddingTop: number;
}

const Container = styled.View<ContainerProps>`
  flex: 1;
  padding-top: ${props => props.$paddingTop}px;
  background-color: white;
`;

/**
 * AuthWrapper è un componente che fornisce un wrapper per le schermate di autenticazione.
 * A differenza di ThemeWrapper, mantiene sempre uno sfondo bianco indipendentemente dal tema.
 */
const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { top } = useSafeAreaInsets();
  const paddingTop = top > 0 ? top + 5 : 30;

  return (
    <Container $paddingTop={paddingTop}>
      {children}
    </Container>
  );
};

export default AuthWrapper;

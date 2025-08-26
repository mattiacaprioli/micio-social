import React, { Component, ReactNode } from 'react';
import { View, Text } from 'react-native';
import styled from 'styled-components/native';
import ErrorState from './ErrorState';
import { hp, wp } from '../../helpers/common';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Qui potresti inviare l'errore a un servizio di logging
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container>
          <ErrorState
            type="generic"
            title="Qualcosa è andato storto"
            message="Si è verificato un errore imprevisto nell'applicazione. Riprova o riavvia l'app."
            onRetry={this.handleRetry}
            retryText="Riprova"
          />
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

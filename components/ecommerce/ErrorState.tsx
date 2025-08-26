import React from 'react';
import styled from 'styled-components/native';
import Icon from '../../assets/icons';
import { hp, wp } from '../../helpers/common';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
  icon?: string;
  type?: 'network' | 'empty' | 'generic';
}

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${hp(4)}px;
`;

const IconContainer = styled.View`
  width: ${wp(20)}px;
  height: ${wp(20)}px;
  border-radius: ${wp(10)}px;
  background-color: ${props => props.theme.colors.cardBorder};
  justify-content: center;
  align-items: center;
  margin-bottom: ${hp(2)}px;
`;

const Title = styled.Text`
  font-size: ${hp(2.2)}px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  text-align: center;
  margin-bottom: ${hp(1)}px;
`;

const Message = styled.Text`
  font-size: ${hp(1.8)}px;
  color: ${props => props.theme.colors.textLight};
  text-align: center;
  line-height: ${hp(2.4)}px;
  margin-bottom: ${hp(3)}px;
  max-width: ${wp(80)}px;
`;

const RetryButton = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary};
  padding: ${hp(1.5)}px ${wp(6)}px;
  border-radius: ${props => props.theme.radius.md}px;
  flex-direction: row;
  align-items: center;
`;

const RetryButtonText = styled.Text`
  color: white;
  font-size: ${hp(1.8)}px;
  font-weight: 600;
  margin-left: ${wp(2)}px;
`;

const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  retryText = "Riprova",
  icon,
  type = 'generic'
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'network':
        return {
          title: title || "Connessione assente",
          message: message || "Controlla la tua connessione internet e riprova.",
          icon: icon || "wifiOff"
        };
      case 'empty':
        return {
          title: title || "Nessun prodotto trovato",
          message: message || "Non ci sono prodotti che corrispondono ai tuoi criteri di ricerca.",
          icon: icon || "search"
        };
      default:
        return {
          title: title || "Qualcosa è andato storto",
          message: message || "Si è verificato un errore imprevisto. Riprova più tardi.",
          icon: icon || "alertCircle"
        };
    }
  };

  const content = getDefaultContent();

  return (
    <Container>
      <IconContainer>
        <Icon 
          name={content.icon} 
          size={wp(8)} 
          color="#999" 
        />
      </IconContainer>
      
      <Title>{content.title}</Title>
      <Message>{content.message}</Message>
      
      {onRetry && (
        <RetryButton onPress={onRetry}>
          <Icon name="refreshCw" size={hp(2)} color="white" />
          <RetryButtonText>{retryText}</RetryButtonText>
        </RetryButton>
      )}
    </Container>
  );
};

export default ErrorState;

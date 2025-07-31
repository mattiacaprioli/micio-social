import React, { useState } from 'react';
import { View, TextInput, Pressable, Alert } from 'react-native';
import styled from 'styled-components/native';
import { useTheme as useStyledTheme } from 'styled-components/native';
import { wp, hp } from '@/helpers/common';
import Icon from '@/assets/icons';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const Container = styled.View`
  flex-direction: row;
  align-items: flex-end;
  padding: ${wp(4)}px;
  background-color: ${props => props.theme.colors.background};
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.gray};
`;

const InputContainer = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.card};
  border-radius: ${wp(6)}px;
  margin-right: ${wp(2)}px;
  min-height: ${hp(5)}px;
  max-height: ${hp(12)}px;
  justify-content: center;
`;

const StyledTextInput = styled.TextInput`
  padding-horizontal: ${wp(4)}px;
  padding-vertical: ${hp(1.2)}px;
  font-size: ${hp(2)}px;
  color: ${props => props.theme.colors.textDark};
  line-height: ${hp(2.4)}px;
`;

const SendButton = styled(Pressable)<{ disabled: boolean }>`
  width: ${hp(5)}px;
  height: ${hp(5)}px;
  border-radius: ${hp(2.5)}px;
  background-color: ${props => props.disabled 
    ? props.theme.colors.gray 
    : props.theme.colors.primary};
  justify-content: center;
  align-items: center;
`;

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const theme = useStyledTheme();

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      Alert.alert('Error', 'Please enter a message before sending.');
      return;
    }

    onSendMessage(trimmedMessage);
    setMessage('');
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <Container theme={theme}>
      <InputContainer theme={theme}>
        <StyledTextInput
          theme={theme}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.textLight}
          multiline
          textAlignVertical="center"
          editable={!disabled}
        />
      </InputContainer>
      
      <SendButton 
        disabled={!canSend} 
        onPress={handleSend}
        theme={theme}
      >
        <Icon 
          name="send" 
          size={hp(2.5)} 
          color={canSend ? 'white' : theme.colors.textLight} 
        />
      </SendButton>
    </Container>
  );
};

export default MessageInput;
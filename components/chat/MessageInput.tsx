import React, { useState, useEffect } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import styled from 'styled-components/native';
import { useTheme as useStyledTheme } from 'styled-components/native';
import { wp, hp } from '../../helpers/common';
import Icon from '../../assets/icons';
import PrimaryModal from '../PrimaryModal';
import { useModal } from '../../hooks/useModal';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  editingText?: string;
  isEditing?: boolean;
  onCancelEdit?: () => void;
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

const SendButton = styled(Pressable)<{ disabled: boolean; isEditing?: boolean }>`
  width: ${hp(5)}px;
  height: ${hp(5)}px;
  border-radius: ${hp(2.5)}px;
  background-color: ${props => props.disabled
    ? props.theme.colors.gray
    : props.isEditing
      ? '#FF9500'
      : props.theme.colors.primary};
  justify-content: center;
  align-items: center;
`;

const EditingIndicator = styled.View`
  background-color: ${props => props.theme.colors.card};
  padding: ${wp(2)}px ${wp(4)}px;
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.gray};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const EditingText = styled.Text`
  color: ${props => props.theme.colors.primary};
  font-size: ${hp(1.6)}px;
  font-weight: ${props => props.theme.fonts.medium};
`;

const CancelButton = styled(Pressable)`
  padding: ${wp(1)}px;
`;

const CancelText = styled.Text`
  color: ${props => props.theme.colors.textLight};
  font-size: ${hp(1.6)}px;
`;

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  editingText = '',
  isEditing = false,
  onCancelEdit
}) => {
  const [message, setMessage] = useState('');
  const theme = useStyledTheme();
  const { modalRef, showError } = useModal();

  useEffect(() => {
    if (isEditing && editingText) {
      setMessage(editingText);
    } else if (!isEditing) {
      setMessage('');
    }
  }, [isEditing, editingText]);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      showError('Please enter a message before sending.', 'Error');
      return;
    }

    onSendMessage(trimmedMessage);
    if (!isEditing) {
      setMessage('');
    }
  };

  const handleCancel = () => {
    setMessage('');
    onCancelEdit?.();
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <View>
      {isEditing && (
        <EditingIndicator theme={theme}>
          <EditingText theme={theme}>
            Edit Message
          </EditingText>
          <CancelButton onPress={handleCancel}>
            <CancelText theme={theme}>
              Cancel
            </CancelText>
          </CancelButton>
        </EditingIndicator>
      )}

      <Container theme={theme}>
        <InputContainer theme={theme}>
          <StyledTextInput
            theme={theme}
            value={message}
            onChangeText={setMessage}
            placeholder={isEditing ? "Edit message..." : "Type a message..."}
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
          isEditing={isEditing}
        >
          <Icon
            name={isEditing ? "check" : "send"}
            size={hp(2.5)}
            color={canSend ? 'white' : theme.colors.textLight}
          />
        </SendButton>
      </Container>
      
      <PrimaryModal
        ref={modalRef}
      />
    </View>
  );
};

export default MessageInput;
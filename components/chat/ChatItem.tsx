import React from 'react';
import { Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';
import { useTheme as useStyledTheme } from 'styled-components/native';
import { wp, hp } from '../../helpers/common';
import Avatar from '../Avatar';
import { ConversationWithUser } from '../../services/chatService';
import { formatTime } from '../../helpers/common';

interface ChatItemProps {
  conversation: ConversationWithUser;
  onPress: () => void;
}

const Container = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  padding: ${wp(4)}px;
  background-color: ${props => props.theme.colors.background};
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.gray};
`;

const ContentContainer = styled.View`
  flex: 1;
  margin-left: ${wp(3)}px;
`;

const TopRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${hp(0.5)}px;
`;

const UserName = styled.Text`
  font-size: ${hp(2)}px;
  font-weight: ${props => props.theme.fonts.semibold};
  color: ${props => props.theme.colors.textDark};
  flex: 1;
`;

const TimeText = styled.Text`
  font-size: ${hp(1.6)}px;
  color: ${props => props.theme.colors.textLight};
`;

const LastMessage = styled.Text`
  font-size: ${hp(1.8)}px;
  color: ${props => props.theme.colors.textLight};
  margin-top: ${hp(0.5)}px;
`;

const ChatItem: React.FC<ChatItemProps> = ({ conversation, onPress }) => {
  const theme = useStyledTheme();

  const formatLastMessageTime = (timestamp: string) => {
    return formatTime(timestamp);
  };

  return (
    <Container onPress={onPress} theme={theme}>
      <Avatar
        uri={conversation.otherUser.image}
        size={hp(6)}
      />
      <ContentContainer>
        <TopRow>
          <UserName theme={theme} numberOfLines={1}>
            {conversation.otherUser.name}
          </UserName>
          {conversation.lastMessage && (
            <TimeText theme={theme}>
              {formatLastMessageTime(conversation.lastMessage.created_at)}
            </TimeText>
          )}
        </TopRow>
        {conversation.lastMessage && (
          <LastMessage theme={theme} numberOfLines={1}>
            {conversation.lastMessage.content}
          </LastMessage>
        )}
      </ContentContainer>
    </Container>
  );
};

export default ChatItem;
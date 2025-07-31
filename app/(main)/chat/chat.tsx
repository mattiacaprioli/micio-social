import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, RefreshControl, View, Text, Pressable } from 'react-native';
import styled from 'styled-components/native';
import { useTheme as useStyledTheme } from 'styled-components/native';
import { useFocusEffect, useRouter } from 'expo-router';
import ThemeWrapper from '../../../components/ThemeWrapper';
import { useAuth } from '../../../context/AuthContext';
import { wp, hp } from '../../../helpers/common';
import Icon from '../../../assets/icons';
import Header from '../../../components/Header';
import Loading from '../../../components/Loading';
import ChatItem from '../../../components/chat/ChatItem';
import { getUserConversations, ConversationWithUser } from '../../../services/chatService';
import TabBar from '../../../components/TabBar';
import { usePathname } from 'expo-router';

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${wp(8)}px;
`;

const EmptyText = styled.Text`
  font-size: ${hp(2.2)}px;
  color: ${props => props.theme.colors.textLight};
  text-align: center;
  margin-top: ${hp(2)}px;
`;

const NewChatButton = styled(Pressable)`
  position: absolute;
  bottom: ${hp(10)}px;
  right: ${wp(6)}px;
  width: ${hp(7)}px;
  height: ${hp(7)}px;
  border-radius: ${hp(3.5)}px;
  background-color: ${props => props.theme.colors.primary};
  justify-content: center;
  align-items: center;
  elevation: 5;
  shadow-color: ${props => props.theme.colors.primary};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.3;
  shadow-radius: 4px;
`;

const Chat: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useStyledTheme();
  const pathname = usePathname();
  
  const [conversations, setConversations] = useState<ConversationWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    if (!user?.id) return;
    
    const result = await getUserConversations(user.id);
    if (result.success && result.data) {
      setConversations(result.data);
    }
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [user?.id])
  );

  const handleChatPress = (conversation: ConversationWithUser) => {
    router.push({
      pathname: '/chat/chatDetails',
      params: {
        conversationId: conversation.id,
        otherUserId: conversation.otherUser.id,
        otherUserName: conversation.otherUser.name,
        otherUserImage: conversation.otherUser.image || ''
      }
    });
  };

  const handleNewChat = () => {
    router.push('/chat/newChat');
  };

  const renderChatItem = ({ item }: { item: ConversationWithUser }) => (
    <ChatItem
      conversation={item}
      onPress={() => handleChatPress(item)}
    />
  );

  const renderEmptyState = () => (
    <EmptyContainer>
      <Icon name="comment" size={hp(8)} color={theme.colors.textLight} />
      <EmptyText theme={theme}>
        You don't have any conversations yet.{'\n'}
        Tap the + button to start a new chat!
      </EmptyText>
    </EmptyContainer>
  );

  if (loading) {
    return (
      <ThemeWrapper>
        <Container theme={theme}>
          <Header title="Chat" />
          <Loading />
        </Container>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <Container theme={theme}>
        <Header title="Chat" />
        
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />

        <NewChatButton onPress={handleNewChat} theme={theme}>
          <Icon name="plus" size={hp(3)} color="white" />
        </NewChatButton>
      </Container>
      <TabBar currentRoute={pathname} onRefresh={onRefresh} />
    </ThemeWrapper>
  );
};

export default Chat;
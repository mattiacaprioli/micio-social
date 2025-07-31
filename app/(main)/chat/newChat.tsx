import React, { useState, useCallback } from 'react';
import { FlatList, View, Text, Alert } from 'react-native';
import styled from 'styled-components/native';
import { useTheme as useStyledTheme } from 'styled-components/native';
import { useRouter } from 'expo-router';
import ThemeWrapper from '../../../components/ThemeWrapper';
import { useAuth } from '../../../context/AuthContext';
import { wp, hp } from '../../../helpers/common';
import Header from '../../../components/Header';
import Input from '../../../components/Input';
import Loading from '../../../components/Loading';
import UserCard from '../../../components/UserCard';
import { searchUsers, UserWithBasicInfo } from '../../../services/userService';
import { createOrFindConversation } from '../../../services/chatService';

const Container = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const SearchContainer = styled.View`
  padding: ${wp(4)}px;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.gray};
`;

const ResultsContainer = styled.View`
  flex: 1;
  padding-top: ${hp(2)}px;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${wp(8)}px;
`;

const EmptyText = styled.Text`
  font-size: ${hp(2)}px;
  color: ${props => props.theme.colors.textLight};
  text-align: center;
  margin-top: ${hp(2)}px;
`;

const UserItem = styled.View`
  margin-horizontal: ${wp(4)}px;
  margin-bottom: ${hp(1)}px;
`;

const NewChat: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useStyledTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserWithBasicInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    const result = await searchUsers(query.trim());
    
    if (result.success && result.data) {
      const filteredResults = result.data.filter(u => u.id !== user?.id);
      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
    }
    
    setLoading(false);
  }, [user?.id]);

  const handleUserPress = async (selectedUser: UserWithBasicInfo) => {
    if (!user?.id || creating) return;

    setCreating(true);
    
    try {
      const result = await createOrFindConversation(user.id, selectedUser.id);
      
      if (result.success && result.data) {
        router.replace({
          pathname: '/chat/chatDetails',
          params: {
            conversationId: result.data.id,
            otherUserId: selectedUser.id,
            otherUserName: selectedUser.name,
            otherUserImage: selectedUser.image || ''
          }
        });
      } else {
        Alert.alert('Error', 'Could not create conversation. Please try again.');
      }
    } catch (error) {
      console.log('Error creating conversation:', error);
      Alert.alert('Error', 'Could not create conversation. Please try again.');
    }
    
    setCreating(false);
  };

  const renderUserItem = ({ item }: { item: UserWithBasicInfo }) => (
    <UserItem>
      <UserCard
        user={item}
        onPress={() => handleUserPress(item)}
        disabled={creating}
      />
    </UserItem>
  );

  const renderEmptyState = () => {
    if (loading) return null;
    
    if (searchQuery.length === 0) {
      return (
        <EmptyContainer>
          <EmptyText theme={theme}>
            Search for users to start a new chat
          </EmptyText>
        </EmptyContainer>
      );
    }
    
    if (searchQuery.length < 2) {
      return (
        <EmptyContainer>
          <EmptyText theme={theme}>
            Type at least 2 characters to search
          </EmptyText>
        </EmptyContainer>
      );
    }
    
    return (
      <EmptyContainer>
        <EmptyText theme={theme}>
          No users found for "{searchQuery}"
        </EmptyText>
      </EmptyContainer>
    );
  };

  return (
    <ThemeWrapper>
      <Container theme={theme}>
        <Header 
          title="New Chat" 
          showBackButton 
        />
        
        <SearchContainer theme={theme}>
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
        </SearchContainer>

        <ResultsContainer>
          {loading ? (
            <Loading />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderUserItem}
              ListEmptyComponent={renderEmptyState}
              showsVerticalScrollIndicator={false}
            />
          )}
        </ResultsContainer>
      </Container>
    </ThemeWrapper>
  );
};

export default NewChat;
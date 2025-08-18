import React, { useEffect, useState, useCallback } from "react";
import { FlatList, RefreshControl, Alert, View } from "react-native";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { useFocusEffect, useRouter } from "expo-router";
import ThemeWrapper from "../../../components/ThemeWrapper";
import { useAuth } from "../../../context/AuthContext";
import { wp, hp } from "../../../helpers/common";
import Icon from "../../../assets/icons";
import Header from "../../../components/Header";
import Input from "../../../components/Input";
import Loading from "../../../components/Loading";
import ChatItem from "../../../components/chat/ChatItem";
import UserCard from "../../../components/UserCard";
import {
  getUserConversations,
  ConversationWithUser,
  createOrFindConversation,
  hideConversation,
} from "../../../services/chatService";
import { searchUsers, UserWithBasicInfo } from "../../../services/userService";
import TabBar from "../../../components/TabBar";
import { usePathname } from "expo-router";

const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
  padding-top: ${hp(6)}px;
`;

const SearchContainer = styled.View`
  padding: ${wp(4)}px;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.colors.gray};
`;

const ContentContainer = styled.View`
  flex: 1;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${wp(8)}px;
`;

const EmptyText = styled.Text`
  font-size: ${hp(2.2)}px;
  color: ${(props) => props.theme.colors.textLight};
  text-align: center;
  margin-top: ${hp(2)}px;
`;

const UserItem = styled.View`
  margin-horizontal: ${wp(4)}px;
  margin-bottom: ${hp(1)}px;
`;

const Chat: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useStyledTheme();
  const pathname = usePathname();

  const [conversations, setConversations] = useState<ConversationWithUser[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Stati per la ricerca utenti
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserWithBasicInfo[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [creating, setCreating] = useState(false);

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

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);

      if (query.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      const result = await searchUsers(query.trim());

      if (result.success && result.data) {
        const filteredResults = result.data.filter((u) => u.id !== user?.id);
        setSearchResults(filteredResults);
      } else {
        setSearchResults([]);
      }

      setSearchLoading(false);
    },
    [user?.id]
  );

  const handleUserPress = async (selectedUser: UserWithBasicInfo) => {
    if (!user?.id || creating) return;

    setCreating(true);

    try {
      const result = await createOrFindConversation(user.id, selectedUser.id);

      if (result.success && result.data) {
        router.push({
          pathname: "/chat/chatDetails",
          params: {
            conversationId: result.data.id,
            otherUserId: selectedUser.id,
            otherUserName: selectedUser.name,
            otherUserImage: selectedUser.image || "",
          },
        });
      } else {
        Alert.alert(
          "Error",
          "Could not create conversation. Please try again."
        );
      }
    } catch (error) {
      console.log("Error creating conversation:", error);
      Alert.alert("Error", "Could not create conversation. Please try again.");
    }

    setCreating(false);
  };

  const handleDeleteChat = async (conversationId: string) => {
    if (!user?.id) return;

    const result = await hideConversation(user.id, conversationId);

    if (result.success) {
      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId)
      );
    } else {
      Alert.alert("Errore", "Non è stato possibile eliminare la chat");
    }
  };

  const handleSearchFocus = () => {
    setIsSearchMode(true);
  };

  const handleSearchBlur = () => {
    if (searchQuery.trim() === "") {
      setIsSearchMode(false);
      setSearchResults([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [user?.id])
  );

  const handleChatPress = (conversation: ConversationWithUser) => {
    router.push({
      pathname: "/chat/chatDetails",
      params: {
        conversationId: conversation.id,
        otherUserId: conversation.otherUser.id,
        otherUserName: conversation.otherUser.name,
        otherUserImage: conversation.otherUser.image || "",
      },
    });
  };

  const renderChatItem = ({ item }: { item: ConversationWithUser }) => (
    <ChatItem
      conversation={item}
      onPress={() => handleChatPress(item)}
      onDelete={handleDeleteChat}
    />
  );

  const renderUserItem = ({ item }: { item: UserWithBasicInfo }) => (
    <UserItem>
      <UserCard user={item} onPress={() => handleUserPress(item)} />
    </UserItem>
  );

  const renderEmptyState = () => (
    <EmptyContainer>
      <Icon name="comment" size={hp(8)} color={theme.colors.textLight} />
      <EmptyText theme={theme}>
        You don't have any conversations yet.{"\n"}
        Use the search above to find users and start chatting!
      </EmptyText>
    </EmptyContainer>
  );

  const renderSearchEmptyState = () => {
    if (searchLoading) return null;

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
        <EmptyText theme={theme}>No users found for "{searchQuery}"</EmptyText>
      </EmptyContainer>
    );
  };

  if (loading) {
    return (
      <ThemeWrapper>
        <View style={{ flex: 1 }}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
            <Header title="Chat" />
          </View>

          <Container theme={theme}>
            <Loading />
          </Container>
        </View>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <View style={{ flex: 1 }}>
        {/* Header fisso */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
          <Header title="Chat" />
        </View>

        <Container theme={theme}>
          <SearchContainer theme={theme}>
          <Input
            placeholder="Search users to start a new chat..."
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
        </SearchContainer>

        <ContentContainer>
          {isSearchMode ? (
            // Modalità ricerca utenti
            searchLoading ? (
              <Loading />
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={renderUserItem}
                ListEmptyComponent={renderSearchEmptyState}
                showsVerticalScrollIndicator={false}
              />
            )
          ) : (
            // Modalità lista chat
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
          )}
        </ContentContainer>
        </Container>
      </View>
    </ThemeWrapper>
  );
};

export default Chat;

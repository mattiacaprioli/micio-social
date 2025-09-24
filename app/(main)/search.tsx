import React, { useState, useEffect, useCallback } from "react";
import { FlatList, ActivityIndicator, Keyboard, View } from "react-native";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { useRouter } from "expo-router";
import { hp, wp } from "../../helpers/common";
import { useFocusEffect } from "@react-navigation/native";

import { searchUsers, UserWithBasicInfo } from "../../services/userService";
import UserCard from "../../components/UserCard";
import Header from "../../components/Header";
import Icon from "../../assets/icons";

import ThemeWrapper from "../../components/ThemeWrapper";
import { useAuth } from "../../context/AuthContext";
import {
  loadRecentSearches,
  saveRecentSearch,
  removeRecentSearch,
  clearAllRecentSearches,
  RecentSearch
} from "../../services/recentSearchService";
import PrimaryModal from "../../components/PrimaryModal";
import { useModal } from "../../hooks/useModal";

// Styled Components
const Container = styled.View`
  flex: 1;
  padding-top: ${hp(6)}px;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
`;

const SearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${hp(1)}px;
  margin-bottom: ${hp(1)}px;
  padding-left: ${wp(3)}px;
  padding-right: ${wp(3)}px;
  height: ${hp(5)}px;
  border-radius: ${props => props.theme.radius.lg}px;
  background-color: ${props => props.theme.colors.darkLight};
`;

const SearchInput = styled.TextInput`
  flex: 1;
  height: 100%;
  font-size: ${hp(1.8)}px;
  color: ${props => props.theme.colors.text};
  margin-left: ${wp(2)}px;
`;

const NoResultsContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-top: ${hp(10)}px;
`;

const NoResultsText = styled.Text`
  font-size: ${hp(2)}px;
  color: ${props => props.theme.colors.textLight};
  text-align: center;
  margin-top: ${hp(2)}px;
`;

const RecentSearchesContainer = styled.View`
  flex: 1;
  margin-top: ${hp(2)}px;
`;

const SectionHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${hp(1.5)}px;
  padding-horizontal: ${wp(1)}px;
`;

const SectionTitle = styled.Text`
  font-size: ${hp(2)}px;
  font-weight: ${props => props.theme.fonts.bold};
  color: ${props => props.theme.colors.text};
`;

const ClearAllButton = styled.TouchableOpacity`
  padding: ${hp(0.5)}px ${wp(2)}px;
`;

const ClearAllText = styled.Text`
  font-size: ${hp(1.6)}px;
  color: ${props => props.theme.colors.primary};
  font-weight: ${props => props.theme.fonts.medium};
`;

const RecentUserCard = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${props => props.theme.colors.background};
`;

const RemoveButton = styled.TouchableOpacity`
  padding: ${hp(0.5)}px;
  margin-left: ${wp(2)}px;
`;

// Rimosso LoadingContainer non utilizzato

const Search: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { modalRef, showError, showConfirm } = useModal();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const theme = useStyledTheme();

  const [users, setUsers] = useState<UserWithBasicInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  const loadRecentSearchesData = useCallback(async () => {
    try {
      const recent = await loadRecentSearches();
      setRecentSearches(recent);
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecentSearchesData();
    }, [loadRecentSearchesData])
  );

  const searchForUsers = useCallback(async (): Promise<void> => {

    setLoading(true);
    Keyboard.dismiss();

    try {
      const res = await searchUsers(searchQuery);
      if (res.success && res.data) {
        setUsers(res.data);
      } else {
        setUsers([]);
        if (res.error) {
          console.error("Error from API:", res.error);
        }
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setUsers([]);
      // Mostra un messaggio di errore solo se non è il primo caricamento
      if (!initialLoading) {
        showError("Si è verificato un errore durante la ricerca degli utenti. Riprova più tardi.");
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [ searchQuery, initialLoading]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setUsers([]);
      setInitialLoading(false);
      return;
    }

    const delaySearch = setTimeout(() => {
      searchForUsers();
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, searchForUsers]);

  // Gestisce la navigazione al profilo utente
  const navigateToUserProfile = async (userId: string, userData?: UserWithBasicInfo) => {
    if (userId !== user?.id && userData) {
      await saveRecentSearch(userData);
      loadRecentSearchesData();
    }

    if (userId === user?.id) {
      router.push("/(tabs)/profile");
    } else {
      router.push({
        pathname: "/userProfile",
        params: { userId }
      });
    }
  };

  const handleRemoveRecentSearch = async (userId: string) => {
    await removeRecentSearch(userId);
    loadRecentSearchesData();
  };

  const handleClearAllRecentSearches = () => {
    showConfirm(
      "Are you sure you want to clear all recent searches?",
      async () => {
        await clearAllRecentSearches();
        loadRecentSearchesData();
      },
      () => {},
      "Clear Recent Searches"
    );
  };

  const renderUser = useCallback(
    ({ item }: { item: UserWithBasicInfo }): React.ReactElement => (
      <UserCard
        user={item}
        onPress={(userId) => navigateToUserProfile(userId, item)}
        currentUserId={user?.id}
      />
    ),
    [user?.id, navigateToUserProfile]
  );

  const renderRecentUser = useCallback(
    ({ item }: { item: RecentSearch }): React.ReactElement => (
      <RecentUserCard>
        <View style={{ flex: 1 }}>
          <UserCard
            user={item}
            onPress={(userId) => navigateToUserProfile(userId, item)}
            currentUserId={user?.id}
          />
        </View>
        <RemoveButton onPress={() => handleRemoveRecentSearch(item.id)}>
          <Icon name="x" size={hp(2)} color={theme.colors.textLight} />
        </RemoveButton>
      </RecentUserCard>
    ),
    [user?.id, navigateToUserProfile, handleRemoveRecentSearch, theme.colors.textLight]
  );

  return (
    <ThemeWrapper>
      <View style={{ flex: 1 }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
          <Header title="Search" />
        </View>

        <Container>
          {/* Barra di ricerca */}
          <SearchContainer>
          <Icon name="search" size={hp(2.5)} color={theme.colors.textLight} />
          <SearchInput
            placeholder="Search users..."
            placeholderTextColor={theme.colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <Icon
              name="x"
              size={hp(2.5)}
              color={theme.colors.textLight}
              onPress={() => setSearchQuery("")}
            />
          )}
        </SearchContainer>

        {/* Risultati della ricerca */}
        {initialLoading ? (
          <FlatList
            data={Array(5).fill(0)}
            renderItem={() => <></>}
            keyExtractor={(_, index) => `shimmer-${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: hp(20) }}
          />
        ) : searchQuery.trim() === "" ? (
          recentSearches.length > 0 ? (
            <RecentSearchesContainer>
              <SectionHeader>
                <SectionTitle>Recent</SectionTitle>
                <ClearAllButton onPress={handleClearAllRecentSearches}>
                  <ClearAllText>Clear All</ClearAllText>
                </ClearAllButton>
              </SectionHeader>
              <FlatList
                data={recentSearches}
                renderItem={renderRecentUser}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: hp(20) }}
              />
            </RecentSearchesContainer>
          ) : (
            <NoResultsContainer>
              <Icon name="search" size={hp(10)} color={theme.colors.darkLight} />
              <NoResultsText>Search for users to see them here.</NoResultsText>
            </NoResultsContainer>
          )
        ) : (
          // Risultati di ricerca per gli utenti
          users.length > 0 ? (
            <FlatList
              data={users}
              renderItem={renderUser}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: hp(20) }}
              ListFooterComponent={
                loading ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                    style={{ marginVertical: hp(2) }}
                  />
                ) : null
              }
            />
          ) : (
            <NoResultsContainer>
              <Icon name="search" size={hp(10)} color={theme.colors.darkLight} />
              <NoResultsText>No users found. Try a different search term.</NoResultsText>
            </NoResultsContainer>
          )
        )}
        </Container>
      </View>
      <PrimaryModal ref={modalRef} />
    </ThemeWrapper>
  );
};

export default Search;

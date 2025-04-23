import React, { useState, useEffect, useCallback } from "react";
import { FlatList, ActivityIndicator, Keyboard, Alert } from "react-native";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { useRouter } from "expo-router";
import { hp, wp } from "../../helpers/common";

import { searchUsers, UserWithBasicInfo } from "../../services/userService";
import UserCard from "../../components/UserCard";
import Header from "../../components/Header";
import Icon from "../../assets/icons";
import { useTranslation } from "react-i18next";
import ThemeWrapper from "../../components/ThemeWrapper";
import { useAuth } from "../../context/AuthContext";

// Styled Components
const Container = styled.View`
  flex: 1;
  padding-top: ${wp(2)}px;
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
  height: ${hp(6)}px;
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

// Rimosso LoadingContainer non utilizzato

const Search: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const theme = useStyledTheme();

  const [users, setUsers] = useState<UserWithBasicInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  // Funzione per cercare gli utenti
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
        Alert.alert(
          t("error"),
          t("errorSearchingUsers"),
          [{ text: t("ok"), onPress: () => {} }]
        );
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [ searchQuery, initialLoading, t]);

  // Effettua la ricerca quando cambia la categoria, il tipo di ricerca o la query di ricerca
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      searchForUsers();
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, searchForUsers]);

  // Gestisce la navigazione al profilo utente
  const navigateToUserProfile = (userId: string) => {
    if (userId === user?.id) {
      router.push("/profile");
    } else {
      router.push({
        pathname: "/userProfile",
        params: { userId }
      });
    }
  };

  // Renderizza un utente
  const renderUser = useCallback(
    ({ item }: { item: UserWithBasicInfo }): React.ReactElement => (
      <UserCard user={item} onPress={navigateToUserProfile} currentUserId={user?.id} />
    ),
    [user?.id, navigateToUserProfile]
  );

  return (
    <ThemeWrapper>
      <Container>
        <Header title={t("search")} />

        {/* Barra di ricerca */}
        <SearchContainer>
          <Icon name="search" size={hp(2.5)} color={theme.colors.textLight} />
          <SearchInput
            placeholder={t("searchUsersPlaceholder")}
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
              <NoResultsText>{t("noUsersFound")}</NoResultsText>
            </NoResultsContainer>
          )
        )}
      </Container>
    </ThemeWrapper>
  );
};

export default Search;

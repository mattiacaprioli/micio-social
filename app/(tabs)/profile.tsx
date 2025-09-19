import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  RefreshControl,
  View,
  ListRenderItem,
  Linking,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import ThemeWrapper from "../../components/ThemeWrapper";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import { wp, hp } from "../../helpers/common";
import Icon from "../../assets/icons";
import { useTheme } from "../../context/ThemeContext";
import Avatar from "../../components/Avatar";
import { fetchPost, getUserPostsCount } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";
import {
  getFollowersCount,
  getFollowingCount,
} from "../../services/followsService";
import { User } from "../../src/types";
import type { PostWithRelations } from "../../services/postService";

// Styled Components

const HeaderContainer = styled.View`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

const AvatarContainer = styled.View`
  height: ${hp(12)}px;
  width: ${hp(12)}px;
  align-self: center;
`;

const EditIcon = styled.Pressable`
  position: absolute;
  bottom: 0;
  right: -12px;
  padding: 7px;
  border-radius: 50px;
  background-color: ${props => props.theme.colors.background};
  /* Ombra per iOS e Android */
  box-shadow: 0px 4px 5px rgba(0, 0, 0, 0.2);
`;

const UserName = styled.Text`
  font-size: ${hp(3)}px;
  font-weight: 500;
  color: ${props => props.theme.colors.textDark};
`;

const InfoContainer = styled.View`
  gap: 10px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const InfoText = styled.Text`
  font-size: ${hp(1.6)}px;
  font-weight: 500;
  color: ${props => props.theme.colors.textLight};
`;

const SettingsButton = styled.Pressable`
  padding: 5px;
  border-radius: ${props => props.theme.radius.sm}px;
  background-color: ${props => props.theme.colors.darkLight};
`;

const ListStyle = {
  paddingBottom: 30,
};

const NoPostText = styled.Text`
  font-size: ${hp(2)}px;
  text-align: center;
  color: ${props => props.theme.colors.text};
`;

const FollowContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: 40px;
  margin-top: 10px;
`;

const FollowItem = styled.View`
  align-items: center;
`;

const FollowCount = styled.Text`
  font-size: ${hp(2.5)}px;
  font-weight: bold;
  color: ${props => props.theme.colors.textDark};
`;

const FollowLabel = styled.Text`
  font-size: ${hp(1.6)}px;
  color: ${props => props.theme.colors.textLight};
`;

// Nuovi styled components per il design moderno
const ModernProfileSection = styled.View`
  align-items: center;
  padding: ${hp(2)}px;
  background-color: ${props => props.theme.colors.background};
`;

const ModernAvatarContainer = styled.View`
  position: relative;
  margin-bottom: ${hp(2)}px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 12px;
  elevation: 8;
`;

const UserInfoSection = styled.View`
  align-items: center;
  gap: ${hp(0.8)}px;
`;

const ModernStatsContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  background-color: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radius.xl}px;
  padding: ${hp(0.5)}px ${wp(2.5)}px;
  margin: ${hp(1)}px ${wp(4)}px;
  border: 1px solid ${props => props.theme.colors.gray}15;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 3;
`;

const ModernStatItem = styled.TouchableOpacity`
  align-items: center;
  flex: 1;
  padding: ${hp(0.5)}px;
`;

const ModernStatItemNonClickable = styled.View`
  align-items: center;
  flex: 1;
  padding: ${hp(0.5)}px;
`;

const ModernStatNumber = styled.Text`
  font-size: ${hp(2.2)}px;
  font-weight: 700;
  color: ${props => props.theme.colors.textDark};
  margin-bottom: ${hp(0.2)}px;
`;

const ModernStatLabel = styled.Text`
  font-size: ${hp(1.2)}px;
  color: ${props => props.theme.colors.textLight};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const ModernSettingsButton = styled.TouchableOpacity`
  position: absolute;
  top: ${hp(1)}px;
  right: ${wp(4)}px;
  padding: ${hp(1)}px;
  border-radius: ${props => props.theme.radius.lg}px;
  background-color: ${props => props.theme.colors.background};
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
  border: 1px solid ${props => props.theme.colors.gray}20;
`;

interface UserHeaderProps {
  user: User;
  router: ReturnType<typeof useRouter>;
}

let limit = 0;

const Profile: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const theme = useStyledTheme();

  const getPosts = async (isRefreshing = false): Promise<void> => {
    if (!hasMore && !isRefreshing) return;

    if (isRefreshing) {
      limit = 10;
    } else {
      limit += 10;
    }

    if (!user?.id) return;

    const res = await fetchPost(limit, user.id);
    if (res.success && res.data) {
      if (posts.length === res.data.length) {
        setHasMore(false);
      }
      setPosts(res.data);
    }
    if (isRefreshing) {
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback((): void => {
    setRefreshing(true);
    getPosts(true);
  }, []);

  const renderItem: ListRenderItem<PostWithRelations> = ({ item }) => (
    <PostCard
      item={item}
      currentUser={user as User | null}
      router={router}
      isUserProfile={true}
    />
  );

  const renderFooter = (): React.ReactElement => (
    hasMore ? (
      <View style={{ marginVertical: posts.length === 0 ? 100 : 30 }}>
        <Loading />
      </View>
    ) : (
      <View style={{ marginVertical: 30 }}>
        <NoPostText>No more posts</NoPostText>
      </View>
    )
  );

  const settingsButton = (
    <SettingsButton
      onPress={() => router.push("/settings/settings")}
    >
      <Icon
        name="settings"
        size={hp(2.5)}
        color={theme.colors.textDark}
      />
    </SettingsButton>
  );

  return (
    <ThemeWrapper>
      <View style={{ flex: 1 }}>
        {/* Header fisso */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
          <Header title={user?.name || "profile"} mb={30} showBackButton={false} rightButton={settingsButton} />
        </View>

        {/* Contenuto scrollabile */}
        <FlatList
          data={posts}
          ListHeaderComponent={user && 'name' in user ? <UserHeader user={user} router={router} /> : null}
          ListHeaderComponentStyle={{ marginBottom: 30 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[ListStyle, { paddingTop: hp(8) }]}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          onEndReached={() => getPosts()}
          onEndReachedThreshold={0}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListFooterComponent={renderFooter}
        />
      </View>
    </ThemeWrapper>
  );
};

const UserHeader: React.FC<UserHeaderProps> = ({ user, router }) => {
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [postsCount, setPostsCount] = useState<number>(0);
  const { isDarkMode } = useTheme();
  const theme = useStyledTheme();

  useEffect(() => {
    const fetchCounts = async (): Promise<void> => {
      if (user?.id) {
        const followers = await getFollowersCount(user.id);
        const following = await getFollowingCount(user.id);
        const posts = await getUserPostsCount(user.id);
        setFollowersCount(followers);
        setFollowingCount(following);
        setPostsCount(posts);
      }
    };

    fetchCounts();
  }, [user]);

  const openWebsite = async (url: string): Promise<void> => {
    try {
      const formattedUrl = url.startsWith('http://') || url.startsWith('https://')
        ? url
        : `https://${url}`;

      const supported = await Linking.canOpenURL(formattedUrl);
      if (supported) {
        await Linking.openURL(formattedUrl);
      } else {
        Alert.alert("Error", "Cannot open this URL");
      }
    } catch (error) {
      Alert.alert("Error", "Cannot open this URL");
    }
  };

  const settingsButton = (
    <ModernSettingsButton
      onPress={() => router.push("/settings/settings")}
    >
      <Icon
        name="settings"
        size={hp(2.5)}
        color={theme.colors.textDark}
      />
    </ModernSettingsButton>
  );

  return (
    <HeaderContainer>
      {/* Bottone settings posizionato in alto a destra */}
      {settingsButton}

      <ModernProfileSection>
        {/* Avatar con ombra migliorata e icona edit */}
        <ModernAvatarContainer>
          <Avatar
            size={hp(14)}
            uri={user?.image}
            rounded={theme.radius.xxl}
            isDarkMode={isDarkMode}
          />
          <EditIcon onPress={() => router.push("/editProfile")}>
            <Icon
              name="edit"
              size={hp(2.2)}
              color={theme.colors.primary}
            />
          </EditIcon>
        </ModernAvatarContainer>

        {/* Informazioni utente */}
        <UserInfoSection>

          {user?.bio && (
            <InfoText style={{
              textAlign: 'center',
              lineHeight: hp(2.2),
              paddingHorizontal: wp(4)
            }}>
              {user.bio}
            </InfoText>
          )}

          {user?.website && (
            <TouchableOpacity onPress={() => openWebsite(user.website!)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(2) }}>
                <Icon
                  name="link"
                  size={hp(1.8)}
                  color={theme.colors.primary}
                />
                <InfoText style={{
                  color: theme.colors.primary,
                  textDecorationLine: 'underline',
                  fontSize: hp(1.7)
                }}>
                  {user.website}
                </InfoText>
              </View>
            </TouchableOpacity>
          )}
        </UserInfoSection>
      </ModernProfileSection>

      <ModernStatsContainer>
        <ModernStatItemNonClickable>
          <ModernStatNumber>{postsCount}</ModernStatNumber>
          <ModernStatLabel>Posts</ModernStatLabel>
        </ModernStatItemNonClickable>

        <ModernStatItem onPress={() => router.push({ pathname: "/followers", params: { userId: user?.id } })}>
          <ModernStatNumber>{followersCount}</ModernStatNumber>
          <ModernStatLabel>Followers</ModernStatLabel>
        </ModernStatItem>

        <ModernStatItem onPress={() => router.push({ pathname: "/followings", params: { userId: user?.id } })}>
          <ModernStatNumber>{followingCount}</ModernStatNumber>
          <ModernStatLabel>Following</ModernStatLabel>
        </ModernStatItem>
      </ModernStatsContainer>
    </HeaderContainer>
  );
};

export default Profile;


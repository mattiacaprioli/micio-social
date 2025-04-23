import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  RefreshControl,
  View,
  ListRenderItem,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { useTranslation } from 'react-i18next';
import ThemeWrapper from "../../components/ThemeWrapper";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import { wp, hp } from "../../helpers/common";
import Icon from "../../assets/icons";
import { useTheme } from "../../context/ThemeContext";
import Avatar from "../../components/Avatar";
import { fetchPost } from "../../services/postService";
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
  position: absolute;
  right: 0;
  padding: 5px;
  border-radius: ${props => props.theme.radius.sm}px;
  background-color: ${props => props.theme.colors.darkLight};
`;

const ListStyle = {
  paddingHorizontal: wp(4),
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

interface UserHeaderProps {
  user: User;
  router: ReturnType<typeof useRouter>;
}

let limit = 0;

const Profile: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
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
        <NoPostText>{t('noMorePosts')}</NoPostText>
      </View>
    )
  );

  return (
    <ThemeWrapper>
      <FlatList
        data={posts}
        ListHeaderComponent={user && 'name' in user ? <UserHeader user={user} router={router} /> : null}
        ListHeaderComponentStyle={{ marginBottom: 30 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={ListStyle}
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
    </ThemeWrapper>
  );
};

const UserHeader: React.FC<UserHeaderProps> = ({ user, router }) => {
  const { t } = useTranslation();
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const { isDarkMode } = useTheme();
  const theme = useStyledTheme();

  useEffect(() => {
    const fetchCounts = async (): Promise<void> => {
      if (user?.id) {
        const followers = await getFollowersCount(user.id);
        const following = await getFollowingCount(user.id);
        setFollowersCount(followers);
        setFollowingCount(following);
      }
    };

    fetchCounts();
  }, [user]);

  return (
    <HeaderContainer>
      <View>
        <Header title={t('profile')} mb={30} />
        <SettingsButton
          onPress={() => router.push("/settings/settings")}
        >
          <Icon
            name="settings"
            size={hp(2.5)}
            color={theme.colors.textDark}
          />
        </SettingsButton>

        <AvatarContainer>
          <Avatar
            size={hp(12)}
            uri={user?.image}
            rounded={theme.radius.xl}
            isDarkMode={isDarkMode}
          />
          <EditIcon onPress={() => router.push("/editProfile")}>
            <Icon
              name="edit"
              size={hp(2.2)}
              color={theme.colors.primary}
            />
          </EditIcon>
        </AvatarContainer>

        <View style={{ alignItems: "center", marginTop: 15, gap: 15 }}>
          <UserName>{user?.name}</UserName>
          {user?.bio && (
            <InfoText>{user.bio}</InfoText>
          )}

          <InfoContainer>
            {user?.address && (
              <InfoRow>
                <Icon
                  name="location"
                  size={hp(2)}
                  color={theme.colors.textLight}
                />
                <InfoText>{user.address}</InfoText>
              </InfoRow>
            )}
          </InfoContainer>

          <FollowContainer>
            <TouchableOpacity onPress={() => router.push({ pathname: "/followers", params: { userId: user?.id } })}>
              <FollowItem>
                <FollowCount>{followersCount}</FollowCount>
                <FollowLabel>{t('followers')}</FollowLabel>
              </FollowItem>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push({ pathname: "/followings", params: { userId: user?.id } })}>
              <FollowItem>
                <FollowCount>{followingCount}</FollowCount>
                <FollowLabel>{t('following')}</FollowLabel>
              </FollowItem>
            </TouchableOpacity>
          </FollowContainer>
        </View>
      </View>
    </HeaderContainer>
  );
};

export default Profile;


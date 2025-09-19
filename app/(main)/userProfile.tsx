import {
  Alert,
  FlatList,
  Pressable,
  Text,
  RefreshControl,
  TouchableOpacity,
  View,
  ListRenderItem,
  Linking,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import ThemeWrapper from "../../components/ThemeWrapper";
import { getUserData } from "../../services/userService";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "../../components/Header";
import { wp, hp } from "../../helpers/common";
import Avatar from "../../components/Avatar";
import { fetchPost, getUserPostsCount } from "../../services/postService";
import PostCard from "../../components/PostCard";
import PostGridItem from "../../components/PostGridItem";
import Loading from "../../components/Loading";
import {
  followUser,
  unfollowUser,
  isUserFollowing,
  getFollowersCount,
  getFollowingCount,
} from "../../services/followsService";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { createNotification } from "../../services/notificationService";
import { User } from "../../src/types";
import type { PostWithRelations } from "../../services/postService";
import { createOrFindConversation } from "../../services/chatService";
import { UserWithBasicInfo } from "../../services/userService";
import Icon from "../../assets/icons";

// Styled Components
const Container = styled.View`
  flex: 1;
`;

const HeaderContainer = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
`;

const AvatarContainer = styled.View`
  height: ${hp(12)}px;
  width: ${hp(12)}px;
  align-self: center;
`;

const UserName = styled.Text`
  font-size: ${hp(3)}px;
  font-weight: 500;
  color: ${(props) => props.theme.colors.textDark};
`;

const InfoText = styled.Text`
  font-size: ${hp(1.6)}px;
  font-weight: 500;
  color: ${(props) => props.theme.colors.textLight};
`;

const ListStyle = {
  paddingBottom: 30,
};

const NoPostText = styled.Text`
  font-size: ${hp(2)}px;
  text-align: center;
  color: ${(props) => props.theme.colors.text};
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
  color: ${(props) => props.theme.colors.textDark};
`;

const FollowLabel = styled.Text`
  font-size: ${hp(1.6)}px;
  color: ${(props) => props.theme.colors.textLight};
`;

const FollowButton = styled.Pressable`
  background-color: ${(props) => props.theme.colors.primary};
  align-self: center;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 20px;
  margin-top: 10px;
`;

const FollowButtonText = styled.Text`
  color: #fff;
  font-size: ${hp(2)}px;
  font-weight: 500;
`;

const RowContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: 16px;
  margin-top: 10px;
`;

// Nuovi styled components per il design migliorato
const ModernProfileSection = styled.View`
  align-items: center;
  padding: ${hp(2)}px;
  background-color: ${(props) => props.theme.colors.background};
`;

const ModernAvatarContainer = styled.View`
  margin-bottom: ${hp(2)}px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.15;
  shadow-radius: 12px;
  elevation: 8;
`;

const UserInfoSection = styled.View`
  align-items: center;
  margin-bottom: ${hp(2.5)}px;
  gap: ${hp(0.8)}px;
`;

const ModernStatsContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  background-color: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.radius.xl}px;
  padding: ${hp(0.5)}px ${wp(2.5)}px;
  margin: ${hp(1)}px ${wp(4)}px;
  border: 1px solid ${(props) => props.theme.colors.gray}15;
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
  color: ${(props) => props.theme.colors.textDark};
  margin-bottom: ${hp(0.2)}px;
`;

const ModernStatLabel = styled.Text`
  font-size: ${hp(1.2)}px;
  color: ${(props) => props.theme.colors.textLight};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const ModernButtonsContainer = styled.View`
  flex-direction: row;
  gap: ${wp(3)}px;
  padding: 0 ${wp(4)}px;
  margin-top: ${hp(1)}px;
`;

const ModernPrimaryButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.colors.primary};
  padding: ${hp(1.4)}px ${wp(6)}px;
  border-radius: ${(props) => props.theme.radius.xl}px;
  align-items: center;
  justify-content: center;
  flex: 1;
  shadow-color: ${(props) => props.theme.colors.primary};
  shadow-offset: 0px 3px;
  shadow-opacity: 0.25;
  shadow-radius: 6px;
  elevation: 4;
`;

const ModernSecondaryButton = styled.TouchableOpacity`
  background-color: transparent;
  border: 2px solid ${(props) => props.theme.colors.primary};
  padding: ${hp(1.2)}px ${wp(6)}px;
  border-radius: ${(props) => props.theme.radius.xl}px;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const ModernButtonText = styled.Text`
  font-weight: 600;
  font-size: ${hp(1.6)}px;
`;

const ModernPrimaryButtonText = styled(ModernButtonText)`
  color: white;
`;

const ModernSecondaryButtonText = styled(ModernButtonText)`
  color: ${(props) => props.theme.colors.primary};
`;

const ViewToggleContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  margin: ${hp(2)}px ${wp(4)}px ${hp(1)}px ${wp(4)}px;
  background-color: ${props => props.theme.colors.darkLight};
  border-radius: ${props => props.theme.radius.lg}px;
  padding: ${wp(1)}px;
`;

const ViewToggleButton = styled.TouchableOpacity<{ isActive: boolean }>`
  flex: 1;
  padding: ${hp(1)}px;
  border-radius: ${props => props.theme.radius.md}px;
  background-color: ${props => props.isActive ? props.theme.colors.background : 'transparent'};
  align-items: center;
  justify-content: center;
`;

const ViewToggleText = styled.Text<{ isActive: boolean }>`
  font-size: ${hp(1.6)}px;
  font-weight: ${props => props.theme.fonts.medium};
  color: ${props => props.isActive ? props.theme.colors.text : props.theme.colors.textLight};
`;

interface UserHeaderProps {
  user: User | null;
  router: ReturnType<typeof useRouter>;
}

let limit = 0;

const UserProfile: React.FC = () => {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [userData, setUserData] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const theme = useStyledTheme();

  const getPosts = async (isRefreshing = false): Promise<void> => {
    if (!hasMore && !isRefreshing) return;

    if (isRefreshing) {
      limit = 10;
    } else {
      limit += 10;
    }

    if (!userId) return;

    const res = await fetchPost(limit, userId as string);
    if (res.success) {
      if (posts.length === (res.data?.length ?? 0)) {
        setHasMore(false);
      }
      setPosts(res.data ? res.data : []);
    }
    if (isRefreshing) {
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback((): void => {
    setRefreshing(true);
    getPosts(true);
  }, []);

  useEffect(() => {
    if (userId) {
      getUserData(userId as string).then((res) => {
        if (res.success) {
          setUserData(res.data ? res.data : null);
        }
      });
    }
  }, [userId]);

  const handlePostPress = (post: PostWithRelations) => {
    router.push({ pathname: "/postDetails", params: { postId: post.id } });
  };

  const renderItem: ListRenderItem<PostWithRelations> = ({ item }) => (
    <PostCard
      item={item}
      currentUser={userData}
      router={router}
      isUserProfile={true}
    />
  );

  const renderGridItem = ({ item }: { item: PostWithRelations }) => (
    <PostGridItem
      item={item}
      onPress={() => handlePostPress(item)}
      size={wp(100) / 3 - 1}
    />
  );

   const renderFooter = (): React.ReactElement | null => {
    if (hasMore) {
      return (
        <View style={{ marginVertical: posts.length === 0 ? 100 : 30 }}>
          <Loading />
        </View>
      );
    }
    
    if (posts.length === 0) {
      return (
        <View style={{ marginVertical: 80 }}>
          <NoPostText>No posts yet</NoPostText>
        </View>
      );
    }
    
    return (<></>);
  };

  return (
    <ThemeWrapper>
      <View style={{ flex: 1 }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
          <Header title={userData?.name || "profile"} mb={30} />
        </View>

        <FlatList
          data={posts}
          ListHeaderComponent={
            <>
              <UserHeader user={userData} router={router} />

              {/* Toggle per cambiare vista */}
              <ViewToggleContainer>
                <ViewToggleButton
                  isActive={viewMode === 'grid'}
                  onPress={() => setViewMode('grid')}
                >
                  <Icon
                    name="grid"
                    size={hp(2)}
                    color={viewMode === 'grid' ? theme.colors.text : theme.colors.textLight}
                  />
                </ViewToggleButton>
                <ViewToggleButton
                  isActive={viewMode === 'list'}
                  onPress={() => setViewMode('list')}
                >
                  <Icon
                    name="list"
                    size={hp(2)}
                    color={viewMode === 'list' ? theme.colors.text : theme.colors.textLight}
                  />
                </ViewToggleButton>
              </ViewToggleContainer>
            </>
          }
          ListHeaderComponentStyle={{ marginBottom: 30 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            ListStyle,
            {
              paddingTop: hp(8),
              paddingHorizontal: 0
            }
          ]}
          keyExtractor={(item) => item.id.toString()}
          renderItem={viewMode === 'grid' ? renderGridItem : renderItem}
          numColumns={viewMode === 'grid' ? 3 : 1}
          key={viewMode} // Forza il re-render quando cambia la modalità
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
  const { user: currentUser } = useAuth();
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [postsCount, setPostsCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [creating, setCreating] = useState(false);
  const { isDarkMode } = useTheme();
  const theme = useStyledTheme();

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

    const checkFollowingStatus = async (): Promise<void> => {
      if (currentUser?.id && user?.id && currentUser.id !== user.id) {
        const followingStatus = await isUserFollowing(currentUser.id, user.id);
        setIsFollowing(followingStatus);
      }
    };

    fetchCounts();
    checkFollowingStatus();
  }, [user, currentUser]);

  const handleFollowToggle = async (): Promise<void> => {
    if (!currentUser?.id || !user?.id) return;

    if (isFollowing) {
      await unfollowUser(currentUser.id, user.id);
    } else {
      const res = await followUser(currentUser.id, user.id);
      if (res.success) {
        if (currentUser.id !== user.id) {
          const notify = {
            senderId: currentUser.id,
            receiverId: user.id,
            title: "Ha iniziato a seguirti",
            data: JSON.stringify({ userId: currentUser.id }),
          };
          await createNotification(notify);
        }
      }
    }

    const followingStatus = await isUserFollowing(currentUser.id, user.id);
    setIsFollowing(followingStatus);

    const followers = await getFollowersCount(user.id);
    setFollowersCount(followers);
  };

  const handleChatPress = async (selectedUser: User) => {
    if (!currentUser?.id || creating) return;

    setCreating(true);

    try {
      const result = await createOrFindConversation(
        currentUser.id,
        selectedUser.id
      );

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
  return (
    <HeaderContainer>
      <ModernProfileSection>
        {/* Avatar con ombra migliorata */}
        <ModernAvatarContainer>
          <Avatar
            uri={user?.image}
            size={hp(14)}
            rounded={theme.radius.xxl}
            isDarkMode={isDarkMode}
          />
        </ModernAvatarContainer>

        {/* Informazioni utente */}
        <UserInfoSection>
          {user?.website && (
            <TouchableOpacity onPress={() => openWebsite(user.website!)}>
              <InfoText style={{
                color: theme.colors.primary,
                textDecorationLine: 'underline',
                fontSize: hp(1.7)
              }}>
                {user.website}
              </InfoText>
            </TouchableOpacity>
          )}
          {user?.bio && (
            <InfoText style={{
              textAlign: 'center',
              lineHeight: hp(2.2),
              paddingHorizontal: wp(4)
            }}>
              {user.bio}
            </InfoText>
          )}
        </UserInfoSection>
      </ModernProfileSection>

      {/* Statistiche in card moderna */}
      <ModernStatsContainer>
        <ModernStatItemNonClickable>
          <ModernStatNumber>{postsCount}</ModernStatNumber>
          <ModernStatLabel>Posts</ModernStatLabel>
        </ModernStatItemNonClickable>

        <ModernStatItem
          onPress={() =>
            router.push({
              pathname: "/followers",
              params: { userId: user?.id },
            })
          }
        >
          <ModernStatNumber>{followersCount}</ModernStatNumber>
          <ModernStatLabel>Followers</ModernStatLabel>
        </ModernStatItem>

        <ModernStatItem
          onPress={() =>
            router.push({
              pathname: "/followings",
              params: { userId: user?.id },
            })
          }
        >
          <ModernStatNumber>{followingCount}</ModernStatNumber>
          <ModernStatLabel>Following</ModernStatLabel>
        </ModernStatItem>
      </ModernStatsContainer>

      {/* Bottoni di azione moderni */}
      {currentUser?.id !== user?.id && (
        <ModernButtonsContainer>
          <ModernPrimaryButton onPress={handleFollowToggle}>
            <ModernPrimaryButtonText>
              {isFollowing ? "Non seguire più" : "Segui"}
            </ModernPrimaryButtonText>
          </ModernPrimaryButton>

          <ModernSecondaryButton
            onPress={() => handleChatPress(user)}
            disabled={creating}
            style={{ opacity: creating ? 0.6 : 1 }}
          >
            <ModernSecondaryButtonText>
              {creating ? "Caricamento..." : "Chat"}
            </ModernSecondaryButtonText>
          </ModernSecondaryButton>
        </ModernButtonsContainer>
      )}
    </HeaderContainer>
  );
};

export default UserProfile;

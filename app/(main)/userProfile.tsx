import {
  Alert,
  FlatList,
  Pressable,
  Text,
  RefreshControl,
  TouchableOpacity,
  View,
  ListRenderItem,
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
import { fetchPost } from "../../services/postService";
import PostCard from "../../components/PostCard";
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

  const renderItem: ListRenderItem<PostWithRelations> = ({ item }) => (
    <PostCard
      item={item}
      currentUser={userData}
      router={router}
      isUserProfile={true}
    />
  );

  return (
    <ThemeWrapper>
      <FlatList
        data={posts}
        ListHeaderComponent={<UserHeader user={userData} router={router} />}
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
        ListFooterComponent={
          hasMore ? (
            <View style={{ marginVertical: posts.length === 0 ? 100 : 30 }}>
              <Loading />
            </View>
          ) : (
            <View style={{ marginVertical: 30 }}>
              <NoPostText>Non ci sono altri post</NoPostText>
            </View>
          )
        }
      />
    </ThemeWrapper>
  );
};

const UserHeader: React.FC<UserHeaderProps> = ({ user, router }) => {
  const { user: currentUser } = useAuth();
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [creating, setCreating] = useState(false);
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
      <View>
        <Header title="Profilo" mb={30} />
      </View>

      <Container>
        <View style={{ gap: 15 }}>
          <AvatarContainer>
            <Avatar
              uri={user?.image}
              size={hp(12)}
              rounded={theme.radius.xxl}
              isDarkMode={isDarkMode}
            />
          </AvatarContainer>

          <View style={{ alignItems: "center", gap: 4 }}>
            <UserName>{user?.name}</UserName>
            <InfoText>{user?.address}</InfoText>
            {user?.bio && <InfoText>{user.bio}</InfoText>}
          </View>

          <FollowContainer>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/followers",
                  params: { userId: user?.id },
                })
              }
            >
              <FollowItem>
                <FollowCount>{followersCount}</FollowCount>
                <FollowLabel>Follower</FollowLabel>
              </FollowItem>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/followings",
                  params: { userId: user?.id },
                })
              }
            >
              <FollowItem>
                <FollowCount>{followingCount}</FollowCount>
                <FollowLabel>Seguiti</FollowLabel>
              </FollowItem>
            </TouchableOpacity>
          </FollowContainer>
          
          <RowContainer>
          {currentUser?.id !== user?.id && (
            <FollowButton onPress={handleFollowToggle}>
              <FollowButtonText>
                {isFollowing ? "Non seguire più" : "Segui"}
              </FollowButtonText>
            </FollowButton>
          )}
          {currentUser?.id !== user?.id && (
            <FollowButton
              onPress={() => handleChatPress(user)}
              disabled={creating}
            >
              <FollowButtonText>
                {creating ? "Caricamento..." : "Chat"}
              </FollowButtonText>
            </FollowButton>
          )}
          </RowContainer>
        </View>
      </Container>
    </HeaderContainer>
  );
};

export default UserProfile;

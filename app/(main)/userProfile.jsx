import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  RefreshControl,
  View,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { getUserData } from "../../services/userService";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "../../components/Header";
import { wp, hp } from "../../helpers/common";
import Icon from "../../assets/icons";
import { theme } from "../../constants/theme";
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

var limit = 0;
const userProfile = () => {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getPosts = async (isRefreshing = false) => {
    // call the api here

    if (!hasMore && !isRefreshing) return null;

    if (isRefreshing) {
      limit = 10; // Resetta il limite durante il refresh
    } else {
      limit += 10;
    }

    console.log("fetching post: ", limit);
    let res = await fetchPost(limit, userId);
    if (res.success) {
      if (posts.length == res.data.length) {
        setHasMore(false);
      }
      setPosts(res.data);
    }
    if (isRefreshing) {
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getPosts(true);
  }, []);

  useEffect(() => {
    getUserData(userId).then((res) => {
      if (res.success) {
        setUserData(res.data);
      }
    });
  }, []);

  return (
    <ScreenWrapper bg="white">
      <FlatList
        data={posts}
        ListHeaderComponent={<UserHeader user={userData} router={router} />}
        ListHeaderComponentStyle={{ marginBottom: 30 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            currentUser={userData}
            router={router}
            isUserProfile={true}
          />
        )}
        onEndReached={() => {
          getPosts();
          console.log("got to the end");
        }}
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
            <View style={{ marginVertical: posts.length == 0 ? 100 : 30 }}>
              <Loading />
            </View>
          ) : (
            <View style={{ marginVertical: 30 }}>
              <Text style={styles.noPost}>No more posts</Text>
            </View>
          )
        }
      />
    </ScreenWrapper>
  );
};

const UserHeader = ({ user, router }) => {
  const { user: currentUser } = useAuth(); 
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    // 1. Aggiorniamo il conteggio dei follower/following
    const fetchCounts = async () => {
      if (user?.id) {
        const followers = await getFollowersCount(user.id);
        const following = await getFollowingCount(user.id);
        setFollowersCount(followers);
        setFollowingCount(following);
      }
    };

    // 2. Controlliamo se l'utente corrente segue già l'utente del profilo
    const checkFollowingStatus = async () => {
      if (currentUser?.id && user?.id && currentUser.id !== user.id) {
        const followingStatus = await isUserFollowing(currentUser.id, user.id);
        setIsFollowing(followingStatus);
      }
    };

    fetchCounts();
    checkFollowingStatus();
  }, [user, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser?.id || !user?.id) return;

    // Se stiamo già seguendo, smettiamo di seguire
    if (isFollowing) {
      await unfollowUser(currentUser.id, user.id);
    } else {
      await followUser(currentUser.id, user.id);
    }

    // Ricalcoliamo lo stato di follow e i conteggi
    const followingStatus = await isUserFollowing(currentUser.id, user.id);
    setIsFollowing(followingStatus);

    const followers = await getFollowersCount(user.id);
    setFollowersCount(followers);
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "white", paddingHorizontal: wp(4) }}
    >
      <View>
        <Header title="Profile" mb={30} />
      </View>

      <View style={styles.container}>
        <View style={{ gap: 15 }}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={user?.image}
              size={hp(12)}
              rounded={theme.radius.xxl}
            />
          </View>

          {/* username and address */}
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={styles.userName}>{user && user.name}</Text>
            <Text style={styles.infoText}>{user && user.address}</Text>
            {user && user.bio && (
              <Text style={styles.infoText}>{user.bio}</Text>
            )}
          </View>

          {/* follower / following section */}
          <View style={styles.followContainer}>
            <View style={styles.followItem}>
              <Text style={styles.followCount}>{followersCount}</Text>
              <Text style={styles.followLabel}>Followers</Text>
            </View>
            <View style={styles.followItem}>
              <Text style={styles.followCount}>{followingCount}</Text>
              <Text style={styles.followLabel}>Following</Text>
            </View>
          </View>

           {/* Bottone Follow/Unfollow se NON è il profilo dell’utente loggato */}
           {currentUser?.id !== user?.id && (
            <Pressable style={styles.followButton} onPress={handleFollowToggle}>
              <Text style={styles.followButtonText}>
                {isFollowing ? "Unfollow" : "Follow"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

export default userProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  userName: {
    fontSize: hp(3),
    fontWeight: "500",
    color: theme.colors.textDark,
  },
  infoText: {
    fontSize: hp(1.6),
    fontWeight: "500",
    color: theme.colors.textLight,
  },
  listStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: 30,
  },
  noPost: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
  followContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    marginTop: 10,
  },
  followItem: {
    alignItems: "center",
  },
  followCount: {
    fontSize: hp(2.5),
    fontWeight: "bold",
    color: theme.colors.textDark,
  },
  followLabel: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  followButton: {
    backgroundColor: theme.colors.primary,
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  followButtonText: {
    color: "#fff",
    fontSize: hp(2),
    fontWeight: "500",
  },
  
});

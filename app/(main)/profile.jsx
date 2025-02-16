import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  View,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import { wp, hp } from "../../helpers/common";
import Icon from "../../assets/icons";
import { theme } from "../../constants/theme";
import Avatar from "../../components/Avatar";
import { fetchPost } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";
import { getFollowersCount, getFollowingCount } from "../../services/followsService";

var limit = 0;
const Profile = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();
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
    let res = await fetchPost(limit, user.id);
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

  return (
    <ScreenWrapper bg="white">
      <FlatList
        data={posts}
        ListHeaderComponent={
          <UserHeader user={user} router={router} />
        }
        ListHeaderComponentStyle={{ marginBottom: 30 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            currentUser={user}
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
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
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
    <View style={{ flex: 1, backgroundColor: "white", paddingHorizontal: wp(4) }}>
      <View>
        <Header title="Profile" mb={30} />
        <Pressable onPress={() => router.push("settings/settings")} style={styles.settingsButton}>
          <Icon name="settings" color={theme.colors.text} />
        </Pressable>
      </View>

      <View style={styles.container}>
        <View style={{ gap: 15 }}>
          <View style={styles.avatarContainer}>
            <Avatar uri={user?.image} size={hp(12)} rounded={theme.radius.xxl} />
            <Pressable style={styles.editIcon} onPress={() => router.push("editProfile")}>
              <Icon name="edit" size={20} />
            </Pressable>
          </View>

          {/* username and address */}
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={styles.userName}>{user && user.name}</Text>
            <Text style={styles.infoText}>{user && user.address}</Text>
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

          {/* email, phone, bio */}
          <View style={{ gap: 10 }}>
            <View style={styles.info}>
              <Icon name="mail" size={20} color={theme.colors.textLight} />
              <Text style={styles.infoText}>{user && user.email}</Text>
            </View>
            {user && user.phoneNumber && (
              <View style={styles.info}>
                <Icon name="call" size={20} color={theme.colors.textLight} />
                <Text style={styles.infoText}>{user.phoneNumber}</Text>
              </View>
            )}
            {user && user.bio && <Text style={styles.infoText}>{user.bio}</Text>}
          </View>
        </View>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginHorizontal: wp(4),
    marginBottom: 20,
  },
  headerShape: {
    width: wp(100),
    height: hp(20),
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
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: hp(1.6),
    fontWeight: "500",
    color: theme.colors.textLight,
  },
  settingsButton: {
    position: "absolute",
    right: 0,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: 'rgba(0,0,0,0.07)',
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
});

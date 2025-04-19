import {
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components/native";
import { useFocusEffect } from '@react-navigation/native';
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { wp, hp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Icon from "../../assets/icons";
import { useRouter } from "expo-router";
import Avatar from "../../components/Avatar";
import { fetchPost, PostWithRelations } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";
import { getUserData } from "../../services/userService";
// Importiamo solo i tipi che utilizziamo effettivamente

// Interfacce per i payload degli eventi Supabase
interface PostEventPayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: PostWithRelations;
  old?: {
    id: string;
    [key: string]: any;
  };
}

interface CommentEventPayload {
  eventType: "INSERT";
  new: {
    id: string;
    post_id: string;
    user_id: string;
    postId?: string; // Per compatibilità con il codice esistente
    userId?: string; // Per compatibilità con il codice esistente
    [key: string]: any;
  };
}

interface NotificationEventPayload {
  eventType: "INSERT";
  new: {
    id: string;
    [key: string]: any;
  };
}

// Styled Components
const Container = styled.View`
  flex: 1;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  margin-left: ${wp(4)}px;
  margin-right: ${wp(4)}px;
`;

const Title = styled.Text`
  color: ${theme.colors.text};
  font-size: ${hp(3.2)}px;
  font-weight: ${theme.fonts.bold};
`;

const IconsContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 18px;
`;

const ListStyle = {
  paddingTop: 20,
  paddingHorizontal: wp(4),
};

const NoPostText = styled.Text`
  font-size: ${hp(2)}px;
  text-align: center;
  color: ${theme.colors.text};
`;

const Pill = styled.View`
  position: absolute;
  right: -10px;
  top: -4px;
  height: ${hp(2.2)}px;
  width: ${hp(2.2)}px;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  background-color: ${theme.colors.roseLight};
`;

const PillText = styled.Text`
  color: white;
  font-size: ${hp(1.2)}px;
  font-weight: ${theme.fonts.bold};
`;

var limit = 0;

const Home: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handlePostEvent = async (payload: PostEventPayload): Promise<void> => {
    // console.log('payload: ', payload);
    if (payload.eventType === "INSERT" && payload?.new?.id) {
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.user_id);
      newPost.postLikes = [];
      newPost.comments = [{ count: 0 }];
      // Convertiamo il tipo per evitare errori di tipo
      newPost.user = res.success && res.data ? {
        id: res.data.id,
        name: res.data.name,
        image: res.data.image || null
      } : undefined;
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    }
    if (payload.eventType === "DELETE" && payload?.old?.id) {
      setPosts((prevPosts) => {
        let updatedPosts = prevPosts.filter(
          (post) => post.id !== payload.old?.id
        );
        return updatedPosts;
      });
    }
    if (payload.eventType === "UPDATE" && payload?.new?.id) {
      setPosts((prevPosts) => {
        let updatedPosts = prevPosts.map((post) => {
          if (post.id === payload.new?.id) {
            post.body = payload.new.body;
            post.file = payload.new.file;
          }
          return post;
        });
        return updatedPosts;
      });
    }
  };

  const handleNewComment = async (payload: CommentEventPayload): Promise<void> => {
    if (payload.eventType === "INSERT" && payload.new.id) {
      let newComment = { ...payload.new };
      // Usa user_id se disponibile, altrimenti fallback su userId per compatibilità
      const userId = newComment.user_id || newComment.userId;
      if (!userId) return;
      let res = await getUserData(userId);
      // Convertiamo il tipo per evitare errori di tipo
      newComment.user = res.success && res.data ? {
        id: res.data.id,
        name: res.data.name,
        image: res.data.image || null
      } : undefined;

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          // Usa post_id se disponibile, altrimenti fallback su postId per compatibilità
          const postId = newComment.post_id || newComment.postId;
          if (post.id === postId) {
            return {
              ...post,
              comments: Array.isArray(post.comments)
                ? [newComment, ...post.comments]
                : [newComment, { count: post.comments.count }], // Gestisce sia array che oggetto count
            };
          }
          return post;
        })
      );
    }
  };

  const handleNewNotification = async (payload: NotificationEventPayload): Promise<void> => {
    if(payload.eventType === "INSERT" && payload.new.id){
      setNotificationCount((prevCount) => prevCount + 1);
    }
  }

  useEffect(() => {
    if (!user) return;

    // Utilizziamo any per evitare errori di tipo con l'API di Supabase
    let postChannel = supabase
      .channel("posts")
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "posts" },
        handlePostEvent as any
      )
      .subscribe();

    // getPosts();

    let commentChannel = supabase
      .channel("*")
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=in.${posts.map((post) => post.id).join(",")}`,
        },
        handleNewComment as any
      )
      .subscribe();

    let notificationChannel = supabase
      .channel("notifications")
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiverId=eq.${user?.id}`,
        },
        handleNewNotification as any
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(commentChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, [user, posts]);

  const getPosts = async (isRefreshing = false): Promise<void> => {
    // call the api here
    if (!hasMore && !isRefreshing) return;

    if (isRefreshing) {
      limit = 10; // Resetta il limite durante il refresh
    } else {
      limit += 10;
    }

    console.log("fetching post: ", limit);
    let res = await fetchPost(limit);
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

  useFocusEffect(
    useCallback(() => {
      getPosts(true);
    }, [])
  );

  const onRefresh = useCallback((): void => {
    setRefreshing(true);
    getPosts(true);
  }, []);

  // console.log('user: ', user);

  // const onLogout = async () => {
  //   // setAuth(null);
  //   const {error} = await supabase.auth.signOut();
  //   if(error){
  //     Alert.alert("Logout", "error signing out!");
  //   }
  // }

  return (
    <ScreenWrapper bg="white">
      <Container>
        {/* header */}
        <Header>
          <Title>Micio Social</Title>
          <IconsContainer>
            <Pressable
              onPress={() => {
                setNotificationCount(0);
                router.push("/notifications")}
              }>
              <Icon name="heart" size={hp(3.2)} color={theme.colors.text} />
              {
                notificationCount > 0 && (
                  <Pill>
                    <PillText>{notificationCount}</PillText>
                  </Pill>
                )
              }
            </Pressable>
            <Pressable onPress={() => router.push("/newPost")}>
              <Icon name="plus" size={hp(3.2)} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={() => router.push("/profile")}>
              <Avatar
                uri={user?.image}
                size={hp(4.3)}
                rounded={theme.radius.sm}
                style={{ borderWidth: 2 }}
              />
            </Pressable>
          </IconsContainer>
        </Header>

        {/* posts */}
        <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={ListStyle}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PostCard item={item} currentUser={user} router={router} />
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
              <View style={{ marginVertical: posts.length === 0 ? 200 : 30 }}>
                <Loading />
              </View>
            ) : (
              <View style={{ marginVertical: 30 }}>
                <NoPostText>No more posts</NoPostText>
              </View>
            )
          }
        />
      </Container>
      {/* <Button title="Logout" onPress={onLogout} /> */}
    </ScreenWrapper>
  );
};

export default Home;

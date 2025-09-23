import {
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { useFocusEffect } from "@react-navigation/native";
import ThemeWrapper from "../../components/ThemeWrapper";
import { useAuth } from "../../context/AuthContext";
import { useRefresh } from "../../context/RefreshContext";
import { supabase } from "../../lib/supabase";
import { wp, hp } from "../../helpers/common";
import Icon from "../../assets/icons";
import { useRouter } from "expo-router";
import { fetchPost, PostWithRelations } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";

import { getUserData } from "../../services/userService";
import { User } from "../../src/types";
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

const Container = styled.View`
  flex: 1;
  padding-bottom: ${hp(5)}px;
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
  color: ${(props) => props.theme.colors.text};
  font-size: ${hp(3)}px;
  font-weight: ${(props) => props.theme.fonts.bold};
`;

const IconsContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

const ListStyle = {
  paddingTop: 20,
  paddingHorizontal: 0,
};

const NoPostText = styled.Text`
  font-size: ${hp(2)}px;
  text-align: center;
  color: ${(props) => props.theme.colors.text};
`;

const EmptyStateContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${wp(8)}px;
  margin-top: ${hp(10)}px;
`;

const EmptyStateTitle = styled.Text`
  font-size: ${hp(2.5)}px;
  font-weight: ${(props) => props.theme.fonts.bold};
  color: ${(props) => props.theme.colors.text};
  text-align: center;
  margin-bottom: ${hp(1)}px;
`;

const EmptyStateSubtitle = styled.Text`
  font-size: ${hp(1.8)}px;
  color: ${(props) => props.theme.colors.textLight};
  text-align: center;
  line-height: ${hp(2.5)}px;
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
  background-color: ${(props) => props.theme.colors.roseLight};
`;

const PillText = styled.Text`
  color: white;
  font-size: ${hp(1.2)}px;
  font-weight: ${(props) => props.theme.fonts.bold};
`;



const Home: React.FC = () => {
  const { user } = useAuth();
  const { homeRefreshRef } = useRefresh();
  const router = useRouter();
  const theme = useStyledTheme();

  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [limit, setLimit] = useState<number>(0);

  const handlePostEvent = async (payload: PostEventPayload): Promise<void> => {
    // console.log('payload: ', payload);
    if (payload.eventType === "INSERT" && payload?.new?.id) {
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.user_id);
      newPost.postLikes = [];
      newPost.comments = [{ count: 0 }];
      // Convertiamo il tipo per evitare errori di tipo
      newPost.user =
        res.success && res.data
          ? {
              id: res.data.id,
              name: res.data.name,
              image: res.data.image || null,
            }
          : undefined;
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

  const handleNewComment = async (
    payload: CommentEventPayload
  ): Promise<void> => {
    if (payload.eventType === "INSERT" && payload.new.id) {
      let newComment = { ...payload.new };
      // Usa user_id se disponibile, altrimenti fallback su userId per compatibilità
      const userId = newComment.user_id || newComment.userId;
      if (!userId) return;
      let res = await getUserData(userId);
      // Convertiamo il tipo per evitare errori di tipo
      newComment.user =
        res.success && res.data
          ? {
              id: res.data.id,
              name: res.data.name,
              image: res.data.image || null,
            }
          : undefined;

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

  const handleNewNotification = async (
    payload: NotificationEventPayload
  ): Promise<void> => {
    if (payload.eventType === "INSERT" && payload.new.id) {
      setNotificationCount((prevCount) => prevCount + 1);
    }
  };

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
    // Altrimenti, carica i dati dall'API
    if (!hasMore && !isRefreshing) return;

    let currentLimit = limit;
    if (isRefreshing) {
      currentLimit = 10; // Resetta il limite durante il refresh
    } else {
      currentLimit += 10;
    }

    let res = await fetchPost(currentLimit, undefined, undefined, undefined, true, user?.id);
    if (res.success && res.data) {
      // Se è un refresh e non ci sono post
      if (isRefreshing && res.data.length === 0) {
        setHasMore(false);
        setPosts([]);
      } else if (posts.length === res.data.length && !isRefreshing) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (res.data.length > 0) {
        setPosts(res.data);
        setLimit(currentLimit);
      } else if (isRefreshing) {
        setPosts([]);
      }
    }
    if (isRefreshing) {
      setRefreshing(false);
    }
  };

  // Effetto per il focus della schermata (caricamento iniziale e ritorno da altre schermate)
  useFocusEffect(
    useCallback(() => {
      console.log("Loading posts on focus");
      getPosts(true);
    }, [])
  );

  const onRefresh = useCallback((): void => {
    setRefreshing(true);
    getPosts(true);
  }, []);

  useEffect(() => {
    homeRefreshRef.current = onRefresh;
  }, [onRefresh]);

  return (
    <ThemeWrapper>
      <Container>
        {/* header */}
        <Header>
          <Title>Micio Social</Title>
          <IconsContainer>
            <Pressable
              onPress={() => router.push("/(main)/chat/chat" as any)}
              style={{ marginRight: 15 }}
            >
              <Icon name="messageCircle" size={hp(2.5)} color={theme.colors.text} />
            </Pressable>
           {/*  <Pressable
              onPress={() => router.push("/(main)/search" as any)}
              style={{ marginRight: 15 }}
            >
              <Icon name="search" size={hp(2.5)} color={theme.colors.text} />
            </Pressable> */}
            <Pressable
              onPress={() => {
                setNotificationCount(0);
                router.push("/(main)/notifications");
              }}
            >
              <Icon name="heart" size={hp(2.5)} color={theme.colors.text} />
              {notificationCount > 0 && (
                <Pill>
                  <PillText>{notificationCount}</PillText>
                </Pill>
              )}
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
            <PostCard
              item={item}
              currentUser={user as User | null}
              router={router}
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
              <View
                style={{ marginVertical: posts.length === 0 ? 200 : 30 }}
              >
                <Loading />
              </View>
            ) : posts.length === 0 ? (
              <EmptyStateContainer>
                <Icon
                  name="plus"
                  size={hp(6)}
                  color={theme.colors.textLight}
                  style={{ marginBottom: hp(2), opacity: 0.5 }}
                />
                <EmptyStateTitle>
                  No posts yet
                </EmptyStateTitle>
                <EmptyStateSubtitle>
                  Follow some users to see their posts in your feed!
                </EmptyStateSubtitle>
              </EmptyStateContainer>
            ) : (
              <View style={{ marginVertical: 30 }}>
                <NoPostText>No more posts</NoPostText>
              </View>
            )
          }
        />
      </Container>
    </ThemeWrapper>
  );
};

export default Home;

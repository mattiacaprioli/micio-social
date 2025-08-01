import {
  FlatList,
  Pressable,
  RefreshControl,
  View,
  Animated,
} from "react-native";
import React, { useEffect, useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { useFocusEffect } from '@react-navigation/native';
import ThemeWrapper from "../../components/ThemeWrapper";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { wp, hp } from "../../helpers/common";
import Icon from "../../assets/icons";
import { useRouter, usePathname } from "expo-router";
import { fetchPost, PostWithRelations } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";
import TabBar from "../../components/TabBar";
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
  color: ${props => props.theme.colors.text};
  font-size: ${hp(3.2)}px;
  font-weight: ${props => props.theme.fonts.bold};
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
  color: ${props => props.theme.colors.text};
`;

const CategoriesContainer = styled.View`
  flex-direction: row;
  margin-left: ${wp(4)}px;
  margin-right: ${wp(4)}px;
  margin-bottom: 15px;
  align-items: center;
`;

const CategoryLabel = styled.Text`
  font-size: ${hp(1.8)}px;
  font-weight: ${props => props.theme.fonts.bold};
  color: ${props => props.theme.colors.textLight};
  margin-right: 10px;
`;

const CategoryScroll = styled.ScrollView`
  flex-grow: 0;
`;

const CategoryButton = styled.TouchableOpacity<{ isActive?: boolean }>`
  padding-left: ${wp(3)}px;
  padding-right: ${wp(3)}px;
  padding-top: ${hp(1)}px;
  padding-bottom: ${hp(1)}px;
  border-radius: ${props => props.theme.radius.md}px;
  margin-right: 8px;
  background-color: ${props => props.isActive ? props.theme.colors.primary : props.theme.colors.darkLight};
`;

const CategoryText = styled.Text<{ isActive?: boolean }>`
  font-size: ${hp(1.6)}px;
  font-weight: ${props => props.theme.fonts.medium};
  color: ${props => props.isActive ? 'white' : props.theme.colors.text};
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
  background-color: ${props => props.theme.colors.roseLight};
`;

const PillText = styled.Text`
  color: white;
  font-size: ${hp(1.2)}px;
  font-weight: ${props => props.theme.fonts.bold};
`;

var limit = 0;

const Home: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useStyledTheme();

  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [categoryLoading, setCategoryLoading] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(1)).current; // Valore iniziale per l'opacità: 1

  // Carica la categoria selezionata da AsyncStorage all'avvio
  useEffect(() => {
    const loadSelectedCategory = async () => {
      try {
        const savedCategory = await AsyncStorage.getItem('selectedCategory');
        if (savedCategory !== null) {
          setSelectedCategory(savedCategory === 'undefined' ? undefined : savedCategory);
        }
      } catch (error) {
        console.error('Error loading selected category:', error);
      }
    };

    loadSelectedCategory();
  }, []);

  // Categorie disponibili
  const categories = [
    { id: 'funny', label: 'Funny' },
    { id: 'cute', label: 'Cute' },
    { id: 'amazing', label: 'Amazing' },
    { id: 'pets', label: 'Pets' },
    { id: 'nature', label: 'Nature' },
  ];

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

  // Funzione per animare il cambio di categoria
  const animateCategoryChange = async (isRefreshing = false): Promise<void> => {
    // Imposta lo stato di caricamento
    setCategoryLoading(true);

    // Animazione di dissolvenza in uscita
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      // Carica i nuovi post mentre l'animazione è completata
      await getPosts(isRefreshing);

      // Rimuovi lo stato di caricamento
      setCategoryLoading(false);

      // Animazione di dissolvenza in entrata
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const getPosts = async (isRefreshing = false): Promise<void> => {
    // call the api here
    if (!hasMore && !isRefreshing) return;

    if (isRefreshing) {
      limit = 10; // Resetta il limite durante il refresh
      // Svuota i post durante il caricamento di una nuova categoria
      if (categoryLoading) {
        setPosts([]);
      }
    } else {
      limit += 10;
    }

    console.log("fetching post: ", limit, "category:", selectedCategory);
    let res = await fetchPost(limit, undefined, selectedCategory);
    if (res.success && res.data) {
      if (posts.length === res.data.length && !isRefreshing) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setPosts(res.data);
    }
    if (isRefreshing) {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      animateCategoryChange(true);
    }, [selectedCategory])
  );

  const onRefresh = useCallback((): void => {
    setRefreshing(true);
    animateCategoryChange(true);
  }, [selectedCategory]); // Aggiungiamo selectedCategory come dipendenza

  // console.log('user: ', user);

  // const onLogout = async () => {
  //   // setAuth(null);
  //   const {error} = await supabase.auth.signOut();
  //   if(error){
  //     Alert.alert("Logout", "error signing out!");
  //   }
  // }

  return (
    <ThemeWrapper>
      <Container>
        {/* header */}
        <Header>
          <Title>Micio Social</Title>
          <IconsContainer>
            <Pressable
              onPress={() => router.push("/search" as any)}
              style={{ marginRight: 15 }}
            >
              <Icon name="search" size={hp(3.2)} color={theme.colors.text} />
            </Pressable>
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

          </IconsContainer>
        </Header>

        {/* Categorie */}
        <CategoriesContainer>
          <CategoryLabel>categories</CategoryLabel>
          {/* Messaggio rimosso perché la colonna 'category' ora esiste nel database */}
          <CategoryScroll horizontal showsHorizontalScrollIndicator={false}>
            <CategoryButton
              isActive={selectedCategory === undefined}
              disabled={categoryLoading}
              style={{ opacity: categoryLoading ? 0.6 : 1 }}
              onPress={() => {
                if (selectedCategory !== undefined && !categoryLoading) {
                  setSelectedCategory(undefined);
                  // Salva la categoria selezionata in AsyncStorage
                  AsyncStorage.setItem('selectedCategory', 'undefined');
                  setRefreshing(true);
                  // Svuota immediatamente i post per evitare di vedere i post vecchi
                  setPosts([]);
                  animateCategoryChange(true);
                }
              }}
            >
              <CategoryText isActive={selectedCategory === undefined}>all</CategoryText>
            </CategoryButton>
            {categories.map(category => (
              <CategoryButton
                key={category.id}
                isActive={selectedCategory === category.id}
                disabled={categoryLoading}
                style={{ opacity: categoryLoading ? 0.6 : 1 }}
                onPress={() => {
                  if (selectedCategory !== category.id && !categoryLoading) {
                    setSelectedCategory(category.id);
                    // Salva la categoria selezionata in AsyncStorage
                    AsyncStorage.setItem('selectedCategory', category.id);
                    setRefreshing(true);
                    // Svuota immediatamente i post per evitare di vedere i post vecchi
                    setPosts([]);
                    animateCategoryChange(true);
                  }
                }}
              >
                <CategoryText isActive={selectedCategory === category.id}>{category.label}</CategoryText>
              </CategoryButton>
            ))}
          </CategoryScroll>
        </CategoriesContainer>

        {/* posts */}
        {categoryLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
            <Loading />
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
            <FlatList
            data={posts}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={ListStyle}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <PostCard item={item} currentUser={user as User | null} router={router} />
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
          </Animated.View>
        )}
      </Container>
      {/* <Button title="Logout" onPress={onLogout} /> */}
      <TabBar currentRoute={pathname} onRefresh={onRefresh} />
    </ThemeWrapper>
  );
};

export default Home;

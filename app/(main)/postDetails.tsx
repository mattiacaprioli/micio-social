import { ScrollView, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  createComment,
  fetchPostDetails,
  removeComment,
  removePost,
} from "../../services/postService";
import { hp, wp } from "../../helpers/common";
import PostCard from "../../components/PostCard";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";
import Input from "../../components/Input";
import Icon from "../../assets/icons";
import CommentItem from "../../components/CommentItem";
import { supabase } from "../../lib/supabase";
import { getUserData } from "../../services/userService";
import { createNotification } from "../../services/notificationService";
import { TextInput } from "react-native";
import { Post, Comment, User } from "../../src/types";
import ThemeWrapper from "../../components/ThemeWrapper";
import PrimaryModal from "../../components/PrimaryModal";
import { useModal } from "../../hooks/useModal";

// Styled Components
const Container = styled.View`
  flex: 1;
  padding-top: ${wp(7)}px;
`;

const Center = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const NotFoundText = styled.Text`
  font-size: ${hp(2)}px;
  color: ${(props) => props.theme.colors.textDark};
`;

const BeFirstText = styled.Text`
  text-align: center;
  color: ${(props) => props.theme.colors.textLight};
  font-size: ${hp(1.8)}px;
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
  gap: 10px;
`;

const SendIcon = styled.TouchableOpacity`
  padding: 8px;
`;

const LoadingContainer = styled.View`
  padding: 8px;
`;

const CategoryContainer = styled.View`
  margin-top: 10px;
  margin-bottom: 15px;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
  flex-direction: row;
  align-items: center;
`;

const CategoryLabel = styled.Text`
  font-size: ${hp(1.8)}px;
  color: ${(props) => props.theme.colors.textLight};
  margin-right: 10px;
`;

const CategoryBadge = styled.View`
  background-color: ${(props) => props.theme.colors.primary};
  padding-left: 12px;
  padding-right: 12px;
  padding-top: 6px;
  padding-bottom: 6px;
  border-radius: ${(props) => props.theme.radius.md}px;
`;

const CategoryText = styled.Text`
  color: white;
  font-size: ${hp(1.6)}px;
  font-weight: ${(props) => props.theme.fonts.medium};
`;

// Utilizziamo l'interfaccia Post originale
interface PostWithComments extends Omit<Post, "createdAt"> {
  created_at: string; // dal backend arriva come created_at invece di createdAt
  user_id: string; // dal backend arriva come user_id invece di userId
  comments: Comment[];
  category?: string; // categoria del post
  pet_ids?: string[]; // array di ID dei gatti taggati
  pets?: Array<{
    // dati dei gatti taggati
    id: string;
    name: string;
    image?: string;
  }>;
}

const PostDetails: React.FC = () => {
  const params = useLocalSearchParams<{ postId: string; commentId: string }>();
  const { user } = useAuth();
  const { modalRef, showError } = useModal();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const commentRef = useRef<string>("");
  const theme = useStyledTheme();

  const [startLoading, setStartLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [post, setPost] = useState<PostWithComments | null>(null);

  const handleNewComment = async (payload: { new: Comment }) => {
    if (payload.new) {
      // Verifichiamo se il commento è già presente nei nostri commenti
      // per evitare duplicati quando aggiungiamo commenti localmente
      const commentExists = post?.comments.some(
        (comment) => comment.id === payload.new.id
      );
      if (commentExists) return;

      let newComment = { ...payload.new };
      const res = await getUserData(newComment.userId);

      // Verifica che res.data sia di tipo UserRow prima di assegnarlo
      newComment.user =
        res.success && res.data
          ? {
              id: res.data.id,
              name: res.data.name,
              email: res.data.email,
              image: res.data.image,
              bio: res.data.bio,
              website: res.data.website,
              birthday: res.data.birthday,
              gender: res.data.gender,
              phoneNumber: res.data.phoneNumber,
            }
          : undefined;

      setPost((prevPost) => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          comments: [newComment, ...prevPost.comments],
        };
      });
    }
  };

  useEffect(() => {
    const commentChannel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `postId=eq.${params.postId}`,
        },
        handleNewComment
      )
      .subscribe();

    getPostDetails();

    return () => {
      supabase.removeChannel(commentChannel);
    };
  }, []);

  const getPostDetails = async () => {
    const res = await fetchPostDetails(params.postId);
    if (res.success && res.data) {
      // Ordiniamo i commenti per data di creazione (dal più recente al più vecchio)
      const sortedComments = [...res.data.comments].sort((a: any, b: any) => {
        // Utilizziamo any per evitare problemi di tipo
        const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
        const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
        return dateB - dateA; // Ordine decrescente (più recente prima)
      });

      // Aggiorniamo il post con i commenti ordinati
      setPost({
        ...res.data,
        comments: sortedComments,
      } as PostWithComments);
    } else {
      setPost(null);
    }
    setStartLoading(false);
  };

  const onNewComment = async () => {
    if (!commentRef.current || !user || !post) return null;

    const data = {
      userId: user.id,
      postId: post.id,
      text: commentRef.current,
    };

    setLoading(true);
    const res = await createComment(data);
    setLoading(false);

    if (res.success) {
      // Dopo aver creato il commento, ricarichiamo i dettagli del post
      // per ottenere tutti i commenti aggiornati dal server
      getPostDetails();

      // Puliamo l'input
      inputRef?.current?.clear();
      commentRef.current = "";

      // Invia notifica se necessario
      if (user.id !== post.user_id) {
        const notify = {
          senderId: user.id,
          receiverId: post.user_id,
          title: "Ha commentato il tuo post",
          data: JSON.stringify({ postId: post.id, commentId: res?.data?.id }),
        };
        createNotification(notify);
      }
    } else {
      showError(res.msg || "Error adding comment", "Comment");
    }
  };

  const onDeleteComment = async (comment: Comment) => {
    const res = await removeComment(comment?.id);
    if (res.success) {
      setPost((prevPost) => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          comments: prevPost.comments.filter((c) => c.id !== comment.id),
        };
      });
    } else {
      showError(res.msg || "Error deleting comment", "Comment");
    }
  };

  const onDeletePost = async () => {
    if (!post) return;
    const res = await removePost(post.id);
    if (res.success) {
      router.back();
    } else {
      showError(res.msg || "Error deleting post", "Post");
    }
  };

  const onEditPost = async (item: Post) => {
    router.back();
    router.push({
      pathname: "/newPost",
      params: {
        ...item,
        file: typeof item.file === "string" ? item.file : undefined,
        user: item.user ? JSON.stringify(item.user) : undefined,
        petIds: post?.pet_ids ? JSON.stringify(post.pet_ids) : undefined,
      },
    });
  };

  if (startLoading) {
    return (
      <ThemeWrapper>
        <Center>
          <Loading />
        </Center>
      </ThemeWrapper>
    );
  }

  if (!post) {
    return (
      <ThemeWrapper>
        <Center>
          <NotFoundText>Post not found!</NotFoundText>
        </Center>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <Container>
        <ScrollView showsVerticalScrollIndicator={false}>
          <PostCard
            item={
              {
                id: post.id,
                userId: post.user_id,
                user_id: post.user_id, // Aggiungiamo anche user_id per compatibilità
                body: post.body,
                // Assicuriamoci che file sia una stringa o undefined
                file: typeof post.file === "string" ? post.file : undefined,
                created_at: post.created_at,
                comments: [{ count: post?.comments?.length }],
                // Assicuriamoci che user abbia la struttura corretta per PostCard
                user: post.user
                  ? {
                      id: post.user.id,
                      name: post.user.name,
                      image: post.user.image || null,
                    }
                  : undefined,
                postLikes: post.postLikes || [],
                category: post.category,
                pets: post.pets || [],
              } as any
            }
            currentUser={user as User | null}
            router={router}
            hasShadow={false}
            showMoreIcon={false}
            showDelete={true}
            onDelete={onDeletePost}
            onEdit={() => onEditPost({ ...post, createdAt: post.created_at })}
          />

          {post.category && (
            <CategoryContainer>
              <CategoryLabel>Category:</CategoryLabel>
              <CategoryBadge>
                <CategoryText>{post.category}</CategoryText>
              </CategoryBadge>
            </CategoryContainer>
          )}
          <InputContainer>
            <Input
              inputRef={inputRef}
              placeholder="Add a comment..."
              onChangeText={(value) => (commentRef.current = value)}
              placeholderTextColor={theme.colors.textLight}
              containerStyle={{
                flex: 1,
                height: hp(6.2),
                borderRadius: theme.radius.xl,
              }}
            />
            {loading ? (
              <LoadingContainer>
                <Loading size="small" />
              </LoadingContainer>
            ) : (
              <SendIcon onPress={onNewComment}>
                <Icon
                  name="send"
                  size={hp(2.5)}
                  color={theme.colors.primaryDark}
                />
              </SendIcon>
            )}
          </InputContainer>

          <View
            style={{
              marginVertical: 15,
              gap: 17,
              paddingLeft: wp(4),
              paddingRight: wp(4),
            }}
          >
            {post?.comments?.map((comment, index) => (
              <CommentItem
                key={`${comment?.id?.toString()}-${index}`}
                item={comment}
                onDelete={onDeleteComment}
                highlight={params.commentId === comment.id}
                canDelete={
                  user?.id === comment.userId || user?.id === post.userId
                }
              />
            ))}

            {post?.comments?.length === 0 && (
              <BeFirstText>Be the first to comment!</BeFirstText>
            )}
          </View>
        </ScrollView>
      </Container>
      <PrimaryModal ref={modalRef} />
    </ThemeWrapper>
  );
};

export default PostDetails;

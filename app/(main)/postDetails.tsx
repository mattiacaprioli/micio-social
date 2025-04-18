import {
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  createComment,
  fetchPostDetails,
  removeComment,
  removePost,
} from "../../services/postService";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import PostCard from "../../components/PostCard";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";
import Input from "../../components/Input";
import Icon from "../../assets/icons";
import CommentItem from "../../components/CommentItem";
import { supabase } from "../../lib/supabase";
import { getUserData } from "../../services/userService";
import { createNotification } from "../../services/notificationService";
import { useTranslation } from 'react-i18next';
import { TextInput } from "react-native";
import { Post, Comment, User } from "../../src/types";

// Styled Components
const Container = styled.View`
  flex: 1;
  background-color: white;
  padding-top: ${wp(7)}px;
  padding-bottom: ${wp(7)}px;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
`;

const Center = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const NotFoundText = styled.Text`
  font-size: ${hp(2)}px;
  color: ${theme.colors.textDark};
`;

const BeFirstText = styled.Text`
  text-align: center;
  color: ${theme.colors.textLight};
  font-size: ${hp(1.8)}px;
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const SendIcon = styled.TouchableOpacity`
  padding: 8px;
`;

const LoadingContainer = styled.View`
  padding: 8px;
`;

interface PostWithComments extends Omit<Post, 'createdAt'> {
  created_at: string;  // dal backend arriva come created_at invece di createdAt
  user_id: string;     // dal backend arriva come user_id invece di userId
  comments: Comment[];
}

const PostDetails: React.FC = () => {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ postId: string; commentId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const commentRef = useRef<string>("");

  const [startLoading, setStartLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [post, setPost] = useState<PostWithComments | null>(null);

  const handleNewComment = async (payload: { new: Comment }) => {
    if (payload.new) {
      let newComment = { ...payload.new };
      const res = await getUserData(newComment.user_id);
      
      // Verifica che res.data sia di tipo UserRow prima di assegnarlo
      newComment.user = res.success && res.data ? {
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        image: res.data.image,
        bio: res.data.bio,
        address: res.data.address,
        birthday: res.data.birthday,
        gender: res.data.gender,
        phoneNumber: res.data.phone_number
      } : undefined;

      setPost(prevPost => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          comments: [newComment, ...prevPost.comments]
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
      setPost(res.data);
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
      if (user.id !== post.userId) {
        const notify = {
          senderId: user.id,
          receiverId: post.userId,
          title: t('commentedOnYourPost'),
          data: JSON.stringify({ postId: post.id, commentId: res?.data?.id }),
        };
        createNotification(notify);
      }
      inputRef?.current?.clear();
      commentRef.current = "";
    } else {
      Alert.alert("Comment", res.msg);
    }
  };

  const onDeleteComment = async (comment: Comment) => {
    const res = await removeComment(comment?.id);
    if (res.success) {
      setPost((prevPost) => {
        if (!prevPost) return null;
        return {
          ...prevPost,
          comments: prevPost.comments.filter(
            (c) => c.id !== comment.id
          )
        };
      });
    } else {
      Alert.alert("Comment", res.msg);
    }
  };

  const onDeletePost = async () => {
    if (!post) return;
    const res = await removePost(post.id);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Post", res.msg);
    }
  };

  const onEditPost = async (item: Post) => {
    router.back();
    router.push({ 
      pathname: "/newPost", 
      params: { 
        ...item, 
        file: typeof item.file === "string" ? item.file : undefined,
        user: item.user ? JSON.stringify(item.user) : undefined
      } 
    });
  };

  if (startLoading) {
    return (
      <Center>
        <Loading />
      </Center>
    );
  }

  if (!post) {
    return (
      <Center>
        <NotFoundText>Post not found!</NotFoundText>
      </Center>
    );
  }

  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PostCard
          item={{ ...post, comments: [{ count: post?.comments?.length }] }}
          currentUser={user}
          router={router}
          hasShadow={false}
          showMoreIcon={false}
          showDelete={true}
          onDelete={onDeletePost}
          onEdit={() => onEditPost({ ...post, createdAt: post.created_at })}
        />

        <InputContainer>
          <Input
            inputRef={inputRef}
            placeholder={t('addAComment')}
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

        <View style={{ marginVertical: 15, gap: 17 }}>
          {post?.comments?.map((comment) => (
            <CommentItem
              key={comment?.id?.toString()}
              item={comment}
              onDelete={onDeleteComment}
              highlight={params.commentId === comment.id}
              canDelete={user?.id === comment.user_id || user?.id === post.userId}
            />
          ))}

          {post?.comments?.length === 0 && (
            <BeFirstText>
              {t('beFirstToComment')}
            </BeFirstText>
          )}
        </View>
      </ScrollView>
    </Container>
  );
};

export default PostDetails;






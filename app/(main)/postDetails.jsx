import {
  Alert,
  ScrollView,
  Text,
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

// Styled Components
const Container = styled.View`
  flex: 1;
  background-color: white;
  padding-top: ${wp(7)}px;
  padding-bottom: ${wp(7)}px;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
`;

const List = styled.ScrollView`
  padding-horizontal: ${wp(4)}px;
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const SendIcon = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
  border-width: 0.8px;
  border-color: ${theme.colors.primary};
  border-radius: ${theme.radius.lg}px;
  height: ${hp(5.8)}px;
  width: ${hp(5.8)}px;
`;

const Center = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const NotFoundText = styled.Text`
  font-size: ${hp(2.5)}px;
  color: ${theme.colors.text};
  font-weight: ${theme.fonts.medium};
`;

const LoadingContainer = styled.View`
  height: ${hp(5.8)}px;
  width: ${hp(5.8)}px;
  justify-content: center;
  align-items: center;
  transform: scale(1.3);
`;

const BeFirstText = styled.Text`
  color: ${theme.colors.text};
  margin-left: 5px;
`;

const PostDetails = () => {
  const { t } = useTranslation();
  const { postId, commentId } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const inputRef = useRef(null);
  const commentRef = useRef("");

  const [startLoading, setStartLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState(null);
  console.log("post detail", post);

  const handleNewComment = async (payload) => {
    console.log("new comment: ", payload.new);
    if(payload.new){
      let newComment = {...payload.new};
      let res = await getUserData(newComment.userId);
      newComment.user = res.success ? res.data : {};
      setPost(prevPost => {
        return {
          ...prevPost,
          comments: [newComment, ...prevPost.comments]
        }
      });
    }
  };

  useEffect(() => {
    let commentChannel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `postId=eq.${postId}`,
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
    // fetch post details here
    let res = await fetchPostDetails(postId);
    if (res.success) setPost(res.data);
    setStartLoading(false);
  };

  const onNewComment = async () => {
    if (!commentRef.current) return null;
    let data = {
      userId: user?.id,
      postId: post?.id,
      text: commentRef.current,
    };
    // create comment
    setLoading(true);
    let res = await createComment(data);
    setLoading(false);
    if (res.success) {
      // send notification
      if(user.id != post.userId){
        // send notification
        let notify = {
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

  const onDeleteComment = async (comment) => {
    // delete comment
    console.log("delete comment: ", comment);
    let res = await removeComment(comment?.id);
    if (res.success) {
      setPost((prevPost) => {
        let updatedPost = { ...prevPost };
        updatedPost.comments = updatedPost.comments.filter(
          (c) => c.id != comment.id
        );
        return updatedPost;
      });
    } else {
      Alert.alert("Comment", res.msg);
    }
  };

  const onDeletePost = async (item) => {
    // delete post
    let res = await removePost(post.id);
    if(res.success){
      router.back();
    }else{
      Alert.alert("Post", res.msg);
    }
  };

  const onEditPost = async (item) => {
    // edit post
    router.back();
    router.push({ pathname: "newPost", params: {...item} });
  };

  if (startLoading)
    return (
      <Center>
        <Loading />
      </Center>
    );

  if (!post)
    return (
      <Center>
        <NotFoundText>Post not found!</NotFoundText>
      </Center>
    );

  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <PostCard
          item={{ ...post, comments: [{ count: post?.comments?.length }] }}
          currentUser={user}
          router={router}
          hasShadow={false}
          showMoreIcon={false}
          showDelete={true}
          onDelete={onDeletePost}
          onEdit={onEditPost}
        />

        {/* Comment input */}
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
              <Loading />
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

        {/* Comment list */}
        <View style={{ marginVertical: 15, gap: 17 }}>
          {post?.comments?.map((comment) => (
            <CommentItem
              key={comment?.id?.toString()}
              item={comment}
              onDelete={onDeleteComment}
              highlight={commentId == comment.id}
              canDelete={user.id == comment.userId || user.id == post.userId}
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


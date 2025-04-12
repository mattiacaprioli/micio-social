import {
  Text,
  TouchableOpacity,
  View,
  Alert,
  Share,
} from "react-native"; 
import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components/native";
import { theme } from "../constants/theme";
import { hp, stripHtmlTags, wp } from "../helpers/common";
import Avatar from "./Avatar";
import moment from "moment";
import Icon from "../assets/icons";
import RenderHtml from "react-native-render-html";
import { Image } from "expo-image";
import { downloadFile, getSupabaseFileUrl } from "../services/imageService";
import { Video } from "expo-av";
import { createPostLike, removePostLike } from "../services/postService";
import Loading from "./Loading";
import { createNotification } from "../services/notificationService";
import { useTranslation } from 'react-i18next';

// Styled Components
const Container = styled.View`
  gap: 10px;
  margin-bottom: 15px;
  border-radius: ${theme.radius.xxl * 1.1}px;
  padding: 10px;
  padding-top: 12px;
  padding-bottom: 12px;
  background-color: white;
  border-width: 0.5px;
  border-color: ${theme.colors.gray};
  shadow-color: #000;
  ${(props) =>
    props.hasShadow &&
    css`
      shadow-offset: 0px 2px;
      shadow-opacity: 0.05;
      shadow-radius: 6px;
      elevation: 1;
    `}
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const UserInfo = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const UserName = styled.Text`
  font-size: ${hp(1.7)}px;
  color: ${theme.colors.textDark};
  font-weight: ${theme.fonts.medium};
`;

const PostTime = styled.Text`
  font-size: ${hp(1.4)}px;
  color: ${theme.colors.textLight};
  font-weight: ${theme.fonts.medium};
`;

const Content = styled.View`
  gap: 10px;
`;

const PostMedia = styled(Image)`
  height: ${hp(40)}px;
  width: 100%;
  border-radius: ${theme.radius.xl}px;
`;

const PostVideo = styled(Video)`
  height: ${hp(30)}px;
  width: 100%;
  border-radius: ${theme.radius.xl}px;
`;

const PostBody = styled.View`
  margin-left: 5px;
`;

const Footer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 15px;
`;

const FooterButton = styled.View`
  margin-left: 5px;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const Actions = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 18px;
`;

const Count = styled.Text`
  color: ${theme.colors.text};
  font-size: ${hp(1.8)}px;
`;

const textStyles = {
  color: theme.colors.dark,
  fontSize: hp(1.75),
};

const tagsStyles = {
  div: textStyles,
  p: textStyles,
  ol: textStyles,
  h1: {
    color: theme.colors.dark,
  },
  h4: {
    color: theme.colors.dark,
  },
};

const PostCard = ({
  item,
  currentUser,
  router,
  isUserProfile = false,
  hasShadow = true,
  showMoreIcon = true,
  showDelete = false,
  onDelete = () => {},
  onEdit = () => {},
}) => {
  const { t } = useTranslation();
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLikes(item?.postLikes);
  }, []);

  const openPostDetails = () => {
    if (!showMoreIcon) return null;
    router.push({ pathname: "postDetails", params: { postId: item?.id } });
  };

  const openUserProfile = () => {
    if (item?.user?.id === currentUser?.id) {
      router.push("profile");
    } else {
      router.push({
        pathname: "userProfile",
        params: { userId: item?.user?.id },
      });
    }
  };

  const onLike = async () => {
    if (liked) {
      // remove like
      let updatedLikes = likes.filter((like) => like.userId != currentUser?.id);
      setLikes([...updatedLikes]);
      let res = await removePostLike(item?.id, currentUser?.id);

      console.log("removed like: ", res);
      if (!res.success) {
        Alert.alert("Post", "Something went wrong!");
      }
    } else {
      // create like
      let data = {
        userId: currentUser?.id,
        postId: item?.id,
      };
      setLikes([...likes, data]);
      let res = await createPostLike(data);
      if (res.success) {
        if (currentUser.id !== item.user.id) {
          let notify = {
            senderId: currentUser.id,
            receiverId: item.user.id,
            title: t('likedYourPost'),
            data: JSON.stringify({ postId: item.id }),
          };
          createNotification(notify);
        }
      }
  
      console.log("added like: ", res);
      if (!res.success) {
        Alert.alert("Post", "Something went wrong!");
      }
    }
  };

  const onShare = async () => {
    let content = { message: stripHtmlTags(item?.body) };
    if (item?.file) {
      // download the file then share the local uri
      setLoading(true);
      let url = await downloadFile(getSupabaseFileUrl(item?.file).uri);
      console.log("downloaded file: ", url);
      setLoading(false);
      content.url = url;
    }
    Share.share(content);
  };

  const handlePostDelete = () => {
    Alert.alert("Confirm", "Are you sure you want to do this?", [
      {
        text: "Cancel",
        onPress: () => console.log("Modal cancelled"),
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => onDelete(item),
        style: "destructive",
      },
    ]);
  };

  const createdAt = moment(item?.created_at).format("MMM D");
  const liked = likes.filter((like) => like.userId == currentUser?.id)[0]
    ? true
    : false;

  return (
    <Container hasShadow={hasShadow}>
      <Header>
        <UserInfo
          onPress={!isUserProfile ? openUserProfile : null}
          disabled={isUserProfile} 
        >
          <Avatar
            size={hp(4.5)}
            uri={item?.user?.image}
            rounded={theme.radius.xl}
          />
          <View style={{ gap: 2 }}>
            <UserName>{item?.user?.name}</UserName>
            <PostTime>{createdAt}</PostTime>
          </View>
        </UserInfo>

        {showMoreIcon && (
          <TouchableOpacity onPress={openPostDetails}>
            <Icon
              name="threeDotsHorizontal"
              size={hp(3.4)}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        )}

        {showDelete && currentUser.id == item?.userId && (
          <Actions>
            <TouchableOpacity onPress={() => onEdit(item)}>
              <Icon name="edit" size={hp(2.4)} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePostDelete}>
              <Icon name="delete" size={hp(2.4)} color={theme.colors.rose} />
            </TouchableOpacity>
          </Actions>
        )}
      </Header>

      {/* post body & video */}
      <Content>
        <PostBody>
          {item?.body && (
            <RenderHtml
              source={{ html: item?.body }}
              contentWidth={wp(100)}
              tagsStyles={tagsStyles}
            />
          )}
        </PostBody>

        {/* post image */}
        {item?.file && item?.file?.includes("postImages") && (
          <PostMedia
            source={getSupabaseFileUrl(item?.file)}
            transitionDuration={100}
            contentFit="cover"
          />
        )}

        {/* post video */}
        {item?.file && item?.file?.includes("postVideos") && (
          <PostVideo
            source={getSupabaseFileUrl(item?.file)}
            transitionDuration={100}
            useNativeControls
            resizeMode="cover"
            isLooping
          />
        )}

        {/* like, comment & share */}
        <Footer>
          <FooterButton>
            <TouchableOpacity onPress={onLike}>
              {liked ? (
                <Icon name="heartFill" size={24} color={theme.colors.rose} />
              ) : (
                <Icon name="heart" size={24} color={theme.colors.textLight} />
              )}
            </TouchableOpacity>
            <Count>{likes?.length}</Count>
          </FooterButton>
          <FooterButton>
            <TouchableOpacity onPress={openPostDetails}>
              <Icon name="comment" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
            <Count>{item?.comments[0]?.count}</Count>
          </FooterButton>
          <FooterButton>
            {loading ? (
              <Loading size="small" />
            ) : (
              <TouchableOpacity onPress={onShare}>
                <Icon name="share" size={24} color={theme.colors.textLight} />
              </TouchableOpacity>
            )}
          </FooterButton>
        </Footer>
      </Content>
    </Container>
  );
};

export default PostCard;


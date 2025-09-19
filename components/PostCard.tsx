import {
  Text,
  TouchableOpacity,
  View,
  Alert,
  Share,
  TouchableWithoutFeedback,
  Animated,
  FlatList,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import styled, { css } from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { hp, stripHtmlTags, wp } from "../helpers/common";
import Avatar from "./Avatar";
import moment from "moment";
import Icon from "../assets/icons";
import RenderHtml from "react-native-render-html";
import { Image } from "expo-image";
import { downloadFile, getSupabaseFileUrl } from "../services/imageService";
import { Video, ResizeMode } from "expo-av";
import { createPostLike, removePostLike, PostWithRelations, getPostLikeUsers } from "../services/postService";
import Loading from "./Loading";
import { createNotification } from "../services/notificationService";
import { useTheme } from "../context/ThemeContext";
import { User } from "../src/types";
import { Router } from "expo-router";
import RBSheet from "react-native-raw-bottom-sheet";
import TaggedPets from "./TaggedPets";

interface PostLike {
  userId: string;
  postId?: string;
}

interface PostCardProps {
  item: PostWithRelations;
  currentUser: User | null;
  router: Router;
  isUserProfile?: boolean;
  hasShadow?: boolean;
  showMoreIcon?: boolean;
  showDelete?: boolean;
  onDelete?: (item: PostWithRelations) => void;
  onEdit?: (item: PostWithRelations) => void;
  variant?: 'classic' | 'edgeToEdge';
}

const Container = styled.View<{ hasShadow?: boolean; variant?: string }>`
  gap: 10px;
  margin-bottom: 15px;
  border-radius: ${props => props.theme.radius.xxl * 1.1}px;
  padding-top: 12px;
  padding-bottom: 12px;
  background-color: ${props => props.theme.colors.background};
  border-width: ${props => props.variant === 'edgeToEdge' ? '0px' : '0.5px'};
  border-color: ${props => props.theme.colors.gray};
  ${(props) =>
    props.hasShadow &&
    css`
      box-shadow: 0px ${props.variant === 'edgeToEdge' ? '1px 3px' : '2px 6px'} rgba(0, 0, 0, ${props.variant === 'edgeToEdge' ? '0.03' : '0.05'});
      elevation: ${props.variant === 'edgeToEdge' ? '0.5' : '1'};
    `}
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
`;

const UserInfo = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const CategoryBadge = styled.View`
  background-color: ${props => props.theme.colors.primary};
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 4px;
  padding-bottom: 4px;
  border-radius: ${props => props.theme.radius.md}px;
  margin-left: 5px;
  align-self: flex-start;
`;

const CategoryText = styled.Text`
  color: white;
  font-size: ${hp(1.3)}px;
  font-weight: ${props => props.theme.fonts.medium};
`;

const UserName = styled.Text`
  font-size: ${hp(1.7)}px;
  color: ${props => props.theme.colors.textDark};
  font-weight: ${props => props.theme.fonts.medium};
`;

const PostTime = styled.Text`
  font-size: ${hp(1.4)}px;
  color: ${props => props.theme.colors.textLight};
  font-weight: ${props => props.theme.fonts.medium};
`;

const Content = styled.View`
  gap: 10px;
`;

const MediaContainer = styled.View`
  position: relative;
  overflow: hidden;
`;

const PostMedia = styled(Image)`
  height: ${hp(40)}px;
  width: 100%;
`;

const PostVideo = styled(Video)`
  height: ${hp(30)}px;
  width: 100%;
`;

const AnimatedHeart = styled(Animated.View)`
  position: absolute;
  top: 40%;
  left: 45%;
  z-index: 10;
`;

const PostBody = styled.View`
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
`;

const Footer = styled.View`
  flex-direction: row;
  align-items: center;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
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
  color: ${props => props.theme.colors.text};
  font-size: ${hp(1.8)}px;
  padding: ${hp(0.3)}px;
`;

const ModalContent = styled.View`
  padding: ${wp(4)}px;
  max-height: ${hp(60)}px;
`;

const ModalTitle = styled.Text`
  font-size: ${hp(2.2)}px;
  font-weight: ${props => props.theme.fonts.bold};
  color: ${props => props.theme.colors.textDark};
  text-align: center;
  margin-bottom: ${hp(2)}px;
`;

const UserItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: ${hp(1.5)}px 0;
  gap: ${wp(3)}px;
`;

const UserItemName = styled.Text`
  font-size: ${hp(1.8)}px;
  color: ${props => props.theme.colors.textDark};
  font-weight: ${props => props.theme.fonts.medium};
`;

const PostCard: React.FC<PostCardProps> = ({
  item,
  currentUser,
  router,
  isUserProfile = false,
  hasShadow = true,
  showMoreIcon = true,
  showDelete = false,
  onDelete = () => {},
  onEdit = () => {},
  variant = 'edgeToEdge',
}) => {
  const [likes, setLikes] = useState<PostLike[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showHeart, setShowHeart] = useState<boolean>(false);
  const [likeUsers, setLikeUsers] = useState<any[]>([]);
  const [loadingLikeUsers, setLoadingLikeUsers] = useState<boolean>(false);
  const { isDarkMode } = useTheme();
  const theme = useStyledTheme();

  const heartScale = useRef(new Animated.Value(0)).current;
  const lastTap = useRef<number>(0);
  const likesModalRef = useRef<any>(null);

  const handleDoubleTap = () => {
    if (!liked) {
      setShowHeart(true);
      Animated.sequence([
        Animated.spring(heartScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 3
        }),
        Animated.timing(heartScale, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
      ]).start(() => setShowHeart(false));
      onLike();
    }
  };

  const handleSingleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (lastTap.current && (now - lastTap.current) < DOUBLE_PRESS_DELAY) {
      handleDoubleTap();
    }
    lastTap.current = now;
  };

  const textStyles = {
    color: theme.colors.text,
    fontSize: hp(1.75),
  };

  const tagsStyles = {
    div: textStyles,
    p: textStyles,
    ol: textStyles,
    h1: {
      color: theme.colors.textDark,
    },
    h4: {
      color: theme.colors.textDark,
    },
  };

  useEffect(() => {
    setLikes(item?.postLikes || []);
  }, []);

  const openPostDetails = () => {
    if (!showMoreIcon) return null;
    router.push({ pathname: "/postDetails", params: { postId: item?.id } });
  };

  const openUserProfile = () => {
    if (item?.user?.id === currentUser?.id) {
      router.push("/(tabs)/profile");
    } else {
      router.push({
        pathname: "/userProfile",
        params: { userId: item?.user?.id },
      });
    }
  };

  const onLike = async () => {
    if (!currentUser?.id) return;

    if (liked) {
      // remove like
      let updatedLikes = likes.filter((like) => like.userId !== currentUser.id);
      setLikes([...updatedLikes]);
      let res = await removePostLike(item?.id, currentUser.id);

      console.log("removed like: ", res);
      if (!res.success) {
        Alert.alert("Post", "Something went wrong!");
      }
    } else {
      // create like
      let data = {
        userId: currentUser.id,
        postId: item?.id,
      };
      setLikes([...likes, data]);
      let res = await createPostLike(data);
      if (res.success) {
        if (item.user && currentUser.id !== item.user.id) {
          let notify = {
            senderId: currentUser.id,
            receiverId: item.user.id,
            title: 'likedYourPost',
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
    let content: { message: string; url?: string } = { message: stripHtmlTags(item?.body || '') };
    if (item?.file) {
      // download the file then share the local uri
      setLoading(true);
      let url = await downloadFile(getSupabaseFileUrl(item?.file).uri);
      console.log("downloaded file: ", url);
      setLoading(false);
      if (url) {
        content.url = url;
      }
    }
    Share.share(content);
  };

  const openLikesModal = async () => {
    if (likes.length === 0) return;

    setLoadingLikeUsers(true);
    const res = await getPostLikeUsers(item?.id);
    setLoadingLikeUsers(false);

    if (res.success) {
      setLikeUsers(res.data || []);
      likesModalRef.current?.open();
    } else {
      Alert.alert("Error", "Could not load users who liked this post");
    }
  };

  const navigateToUserProfile = (userId: string) => {
    likesModalRef.current?.close();
    if (userId === currentUser?.id) {
      router.push("/(tabs)/profile");
    } else {
      router.push({
        pathname: "/userProfile",
        params: { userId }
      });
    }
  };

  const renderLikeUser = ({ item: likeItem }: { item: any }) => (
    <UserItem onPress={() => navigateToUserProfile(likeItem.users?.id)}>
      <Avatar
        uri={likeItem.users?.image}
        size={hp(5)}
        rounded={theme.radius.md}
        isDarkMode={isDarkMode}
      />
      <UserItemName>{likeItem.users?.name}</UserItemName>
    </UserItem>
  );

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
  const liked = likes.filter((like) => like.userId === currentUser?.id).length > 0;

  return (
    <Container hasShadow={hasShadow} variant={variant}>
      <Header>
        <UserInfo
          onPress={!isUserProfile ? openUserProfile : undefined}
          disabled={isUserProfile}
        >
          <Avatar
            size={hp(4.5)}
            uri={item?.user?.image}
            rounded={theme.radius.xl}
            isDarkMode={isDarkMode}
          />
          <View style={{ gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <UserName>{item?.user?.name}</UserName>
              {item?.category && (
                <CategoryBadge>
                  <CategoryText>{item.category}</CategoryText>
                </CategoryBadge>
              )}
            </View>
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

        {showDelete && currentUser?.id === item?.user?.id && (
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
          <MediaContainer>
            <TouchableWithoutFeedback onPress={handleSingleTap}>
              <PostMedia
                source={getSupabaseFileUrl(item?.file)}
                contentFit="cover"
              />
            </TouchableWithoutFeedback>
            {showHeart && (
              <AnimatedHeart style={{ transform: [{ scale: heartScale }] }}>
                <Icon name="heartFill" size={72} color={theme.colors.rose} />
              </AnimatedHeart>
            )}
          </MediaContainer>
        )}

        {/* post video */}
        {item?.file && item?.file?.includes("postVideos") && (
          <MediaContainer>
            <TouchableWithoutFeedback onPress={handleSingleTap}>
              <PostVideo
                source={getSupabaseFileUrl(item?.file)}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
              />
            </TouchableWithoutFeedback>
            {showHeart && (
              <AnimatedHeart style={{ transform: [{ scale: heartScale }] }}>
                <Icon name="heartFill" size={72} color={theme.colors.rose} />
              </AnimatedHeart>
            )}
          </MediaContainer>
        )}

        {/* Tagged pets */}
        {item?.pets && item.pets.length > 0 && (
          <TaggedPets pets={item.pets} maxVisible={4} />
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
            <TouchableOpacity disabled={likes.length === 0} onPress={openLikesModal}>
              <Count>{likes?.length}</Count>
            </TouchableOpacity>
          </FooterButton>
          <FooterButton>
            <TouchableOpacity onPress={openPostDetails}>
              <Icon name="comment" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
            <Count>
              {Array.isArray(item?.comments) ? item?.comments[0]?.count : item?.comments?.count}
            </Count>
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

      <RBSheet
        ref={likesModalRef}
        height={hp(60)}
        openDuration={250}
        customStyles={{
          container: {
            borderTopLeftRadius: wp(4),
            borderTopRightRadius: wp(4),
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <ModalContent>
          <ModalTitle>Liked by</ModalTitle>
          {loadingLikeUsers ? (
            <Loading />
          ) : (
            <FlatList
              data={likeUsers}
              keyExtractor={(item) => item.userId}
              renderItem={renderLikeUser}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={{
                  textAlign: 'center',
                  color: theme.colors.textLight,
                  marginTop: hp(2)
                }}>
                  No likes yet
                </Text>
              }
            />
          )}
        </ModalContent>
      </RBSheet>
    </Container>
  );
};

export default PostCard;

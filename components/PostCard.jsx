import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Share,
} from "react-native";
import React, { useEffect, useState } from "react";
import { theme } from "../constants/theme";
import { hp, stripHtmlTags, wp } from "../helpers/common";
import Avatar from "./Avatar";
import moment from "moment";
import Icon from "../assets/icons";
import RenderHtml from "react-native-render-html";
import { color } from "@rneui/themed/dist/config";
import { Image } from "expo-image";
import { downloadFile, getSupabaseFileUrl } from "../services/imageService";
import { Video } from "expo-av";
import { createPostLike, removePostLike } from "../services/postService";
import Loading from "./Loading";

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
  const shadowStyle = {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  };

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
    <View style={[styles.container, hasShadow && shadowStyle]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={!isUserProfile ? openUserProfile : null}
          disabled={isUserProfile} 
        >
          <Avatar
            size={hp(4.5)}
            uri={item?.user?.image}
            rounded={theme.radius.xl}
          />
          <View style={{ gap: 2 }}>
            <Text style={styles.username}>{item?.user?.name}</Text>
            <Text style={styles.postTime}>{createdAt}</Text>
          </View>
        </TouchableOpacity>

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
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onEdit(item)}>
              <Icon name="edit" size={hp(2.4)} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePostDelete}>
              <Icon name="delete" size={hp(2.4)} color={theme.colors.rose} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* post body & video */}
      <View style={styles.content}>
        <View style={styles.postBody}>
          {item?.body && (
            <RenderHtml
              source={{ html: item?.body }}
              contentWidth={wp(100)}
              tagsStyles={tagsStyles}
            />
          )}
        </View>

        {/* post image */}
        {item?.file && item?.file?.includes("postImages") && (
          <Image
            source={getSupabaseFileUrl(item?.file)}
            transitionDuration={100}
            style={styles.postMedia}
            contentFit="cover"
          />
        )}

        {/* post image */}
        {item?.file && item?.file?.includes("postVideos") && (
          <Video
            source={getSupabaseFileUrl(item?.file)}
            transitionDuration={100}
            style={[styles.postMedia, { height: hp(30) }]}
            useNativeControls
            resizeMode="cover"
            isLooping
          />
        )}

        {/* like, comment & share */}
        <View style={styles.footer}>
          <View style={styles.footerButton}>
            <TouchableOpacity onPress={onLike}>
              {liked ? (
                <Icon name="heartFill" size={24} color={theme.colors.rose} />
              ) : (
                <Icon name="heart" size={24} color={theme.colors.textLight} />
              )}
            </TouchableOpacity>
            <Text style={styles.count}>{likes?.length}</Text>
          </View>
          <View style={styles.footerButton}>
            <TouchableOpacity onPress={openPostDetails}>
              <Icon name="comment" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
            <Text style={styles.count}>{item?.comments[0]?.count}</Text>
          </View>
          <View style={styles.footerButton}>
            {loading ? (
              <Loading size="small" />
            ) : (
              <TouchableOpacity onPress={onShare}>
                <Icon name="share" size={24} color={theme.colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 15,
    borderRadius: theme.radius.xxl * 1.1,
    borderCurve: "continuous",
    padding: 10,
    paddingVertical: 12,
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
    shadowColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  username: {
    fontSize: hp(1.7),
    color: theme.colors.textDark,
    fontWeight: theme.fonts.medium,
  },
  postTime: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  content: {
    gap: 10,
    // marginBottom: 10,
  },
  postMedia: {
    height: hp(40),
    width: "100%",
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
  },
  postBody: {
    marginLeft: 5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  footerButton: {
    marginLeft: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  count: {
    color: theme.colors.text,
    fontSize: hp(1.8),
  },
});

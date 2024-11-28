import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import Avatar from './Avatar';
import moment from 'moment';
import Icon from '../assets/icons';
import RenderHtml from 'react-native-render-html';
import { color } from '@rneui/themed/dist/config';
import { Image } from "expo-image";
import { getSupabaseFileUrl } from '../services/imageService';
import { Video } from 'expo-av';

const textStyles = {
  color: theme.colors.dark,
  fontSize: hp(1.75),
}


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
}

const PostCard = ({
  item,
  currentUser,
  router,
  hasShadow = true,
}) => {
  const shadowStyle = {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  }

  const openPostDetails = () => {
    // later
  }

  const createdAt = moment(item?.created_at).format('MMM D');
  const likes = [];
  const liked = false;

  return (
    <View style={[styles.container, hasShadow && shadowStyle]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar
            size={hp(4.5)}
            uri={item?.user?.image}
            rounded={theme.radius.xl}
          />
          <View style={{gap: 2}}>
            <Text style={styles.username}>{item?.user?.name}</Text>
            <Text style={styles.postTime}>{createdAt}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={openPostDetails}>
          <Icon name="threeDotsHorizontal" size={hp(3.4)} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* post body & video */}
      <View style={styles.content}>
        <View style={styles.postBody}>
          {
            item?.body && (
              <RenderHtml
                source={{html: item?.body}}
                contentWidth={wp(100)}
                tagsStyles={tagsStyles}
              />
            )
          }
        </View>

        {/* post image */}
        {
          item?.file && item?.file?.includes('postImages') && (
            <Image
              source={getSupabaseFileUrl(item?.file)}
              transitionDuration={100}
              style={styles.postMedia}
              contentFit='cover'
            />
          )
        }

        {/* post image */}
        {
          item?.file && item?.file?.includes('postVideos') && (
            <Video
              source={getSupabaseFileUrl(item?.file)}
              transitionDuration={100}
              style={[styles.postMedia, {height: hp(30)}]}
              useNativeControls
              resizeMode='cover'
              isLooping
            />
          )
        }

        
        {/* like, comment & share */}
        <View style={styles.footer}>
          <View style={styles.footerButton}>
            <TouchableOpacity>
              {
                liked ? (
                  <Icon name="heartFill" size={24} color={theme.colors.rose} />
                ) : (
                  <Icon name="heart" size={24} color={theme.colors.textLight} />
                )
              }
            </TouchableOpacity>
            <Text style={styles.count}>
              {
                likes?.length
              }
            </Text>
          </View>
          <View style={styles.footerButton}>
            <TouchableOpacity>
              <Icon name="comment" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
            <Text style={styles.count}>
              {
                0
              }
            </Text>
          </View>
          <View style={styles.footerButton}>
            <TouchableOpacity>
              <Icon name="share" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

export default PostCard

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 15,
    borderRadius: theme.radius.xxl*1.1,
    borderCurve: 'continuous',
    padding: 10,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
    shadowColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    width: '100%',
    borderRadius: theme.radius.xl,
    borderCurve: 'continuous',
  },
  postBody: {
    marginLeft: 5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  footerButton: {
    marginLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionw: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  count: {
    color: theme.colors.text,
    fontSize: hp(1.8),
  }
})
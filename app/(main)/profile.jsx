import {
  Alert,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  RefreshControl,
  View,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components/native";
import { useTranslation } from 'react-i18next';
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import { wp, hp } from "../../helpers/common";
import Icon from "../../assets/icons";
import { theme } from "../../constants/theme";
import Avatar from "../../components/Avatar";
import { fetchPost } from "../../services/postService";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";
import {
  getFollowersCount,
  getFollowingCount,
} from "../../services/followsService";

// Styled Components
const Container = styled.View`
  flex: 1;
`;

const HeaderContainer = styled.View`
  flex: 1;
  background-color: white;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
`;

const AvatarContainer = styled.View`
  height: ${hp(12)}px;
  width: ${hp(12)}px;
  align-self: center;
`;

const EditIcon = styled.Pressable`
  position: absolute;
  bottom: 0;
  right: -12px;
  padding: 7px;
  border-radius: 50px;
  background-color: white;
  shadow-color: ${theme.colors.textLight};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.4;
  shadow-radius: 5px;
  elevation: 7;
`;

const UserName = styled.Text`
  font-size: ${hp(3)}px;
  font-weight: 500;
  color: ${theme.colors.textDark};
`;

const InfoContainer = styled.View`
  gap: 10px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const InfoText = styled.Text`
  font-size: ${hp(1.6)}px;
  font-weight: 500;
  color: ${theme.colors.textLight};
`;

const SettingsButton = styled.Pressable`
  position: absolute;
  right: 0;
  padding: 5px;
  border-radius: ${theme.radius.sm}px;
  background-color: rgba(0,0,0,0.07);
`;

const ListStyle = {
  paddingHorizontal: wp(4),
  paddingBottom: 30,
};

const NoPostText = styled.Text`
  font-size: ${hp(2)}px;
  text-align: center;
  color: ${theme.colors.text};
`;

const FollowContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: 40px;
  margin-top: 10px;
`;

const FollowItem = styled.View`
  align-items: center;
`;

const FollowCount = styled.Text`
  font-size: ${hp(2.5)}px;
  font-weight: bold;
  color: ${theme.colors.textDark};
`;

const FollowLabel = styled.Text`
  font-size: ${hp(1.6)}px;
  color: ${theme.colors.textLight};
`;

var limit = 0;
const Profile = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getPosts = async (isRefreshing = false) => {
    // call the api here

    if (!hasMore && !isRefreshing) return null;

    if (isRefreshing) {
      limit = 10; // Resetta il limite durante il refresh
    } else {
      limit += 10;
    }

    console.log("fetching post: ", limit);
    let res = await fetchPost(limit, user.id);
    if (res.success) {
      if (posts.length == res.data.length) {
        setHasMore(false);
      }
      setPosts(res.data);
    }
    if (isRefreshing) {
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getPosts(true);
  }, []);

  return (
    <ScreenWrapper bg="white">
      <FlatList
        data={posts}
        ListHeaderComponent={<UserHeader user={user} router={router} />}
        ListHeaderComponentStyle={{ marginBottom: 30 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={ListStyle}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            currentUser={user}
            router={router}
            isUserProfile={true}
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
            <View style={{ marginVertical: posts.length == 0 ? 100 : 30 }}>
              <Loading />
            </View>
          ) : (
            <View style={{ marginVertical: 30 }}>
              <NoPostText>{t('noMorePosts')}</NoPostText>
            </View>
          )
        }
      />
    </ScreenWrapper>
  );
};

const UserHeader = ({ user, router }) => {
  const { t } = useTranslation();
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      if (user?.id) {
        const followers = await getFollowersCount(user.id);
        const following = await getFollowingCount(user.id);
        setFollowersCount(followers);
        setFollowingCount(following);
      }
    };

    fetchCounts();
  }, [user]);

  return (
    <HeaderContainer>
      <View>
        <Header title={t('profile')} mb={30} />
        <SettingsButton
          onPress={() => router.push("settings/settings")}
        >
          <Icon name="settings" color={theme.colors.text} />
        </SettingsButton>
      </View>

      <Container>
        <View style={{ gap: 15 }}>
          <AvatarContainer>
            <Avatar
              uri={user?.image}
              size={hp(12)}
              rounded={theme.radius.xxl}
            />
            <EditIcon
              onPress={() => router.push("editProfile")}
            >
              <Icon name="edit" size={20} />
            </EditIcon>
          </AvatarContainer>

          {/* username and address */}
          <View style={{ alignItems: "center", gap: 4 }}>
            <UserName>{user && user.name}</UserName>
            <InfoText>{user && user.address}</InfoText>
          </View>

          {/* follower / following section */}
          <FollowContainer>
            <TouchableOpacity onPress={() => router.push("/followers")}>
              <FollowItem>
                <FollowCount>{followersCount}</FollowCount>
                <FollowLabel>{t('followers')}</FollowLabel>
              </FollowItem>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/followings")}>
              <FollowItem>
                <FollowCount>{followingCount}</FollowCount>
                <FollowLabel>{t('following')}</FollowLabel>
              </FollowItem>
            </TouchableOpacity>
          </FollowContainer>

          {/* email, phone, bio */}
          <InfoContainer>
            <InfoRow>
              <Icon name="mail" size={20} color={theme.colors.textLight} />
              <InfoText>{user && user.email}</InfoText>
            </InfoRow>
            {user && user.phoneNumber && (
              <InfoRow>
                <Icon name="call" size={20} color={theme.colors.textLight} />
                <InfoText>{user.phoneNumber}</InfoText>
              </InfoRow>
            )}
            {user && user.bio && (
              <InfoText>{user.bio}</InfoText>
            )}
          </InfoContainer>
        </View>
      </Container>
    </HeaderContainer>
  );
};

export default Profile;


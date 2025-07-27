import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  View,
} from "react-native";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import ThemeWrapper from "../../components/ThemeWrapper";
import { useAuth } from "../../context/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getFollowingList, FollowingInfo } from "../../services/followsService";
import Avatar from "../../components/Avatar";
import { wp, hp } from "../../helpers/common";
import { useTheme } from "../../context/ThemeContext";
import Header from "../../components/Header";
import { User } from "../../src/types";

// Interfacce per i tipi
interface RouteParams {
  userId?: string;
  [key: string]: any;
}

// Styled Components
const Container = styled.View`
  flex: 1;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
`;

const Item = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
  padding-top: ${hp(2)}px;
  padding-bottom: ${hp(2)}px;
  border-bottom-width: 1px;
  border-color: ${props => props.theme.colors.darkLight};
`;

const FollowingName = styled.Text`
  margin-left: ${wp(4)}px;
  font-size: ${hp(2.2)}px;
  color: ${props => props.theme.colors.textDark};
`;

const EmptyListContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  margin-top: ${hp(20)}px;
`;

const EmptyListText = styled.Text`
  color: ${props => props.theme.colors.textLight};
  font-size: ${hp(2)}px;
`;

const Followings: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { userId } = useLocalSearchParams<RouteParams>();
  const router = useRouter();
  const targetUserId = userId || currentUser?.id;
  const [followings, setFollowings] = useState<FollowingInfo[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { isDarkMode } = useTheme();
  const theme = useStyledTheme();

  const fetchFollowings = async (): Promise<void> => {
    if (targetUserId) {
      setRefreshing(true);
      const data = await getFollowingList(targetUserId);
      setFollowings(data);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFollowings();
  }, [targetUserId]);

  const openUserProfile = (followerId: string): void => {
    if (followerId === currentUser?.id) {
      router.push("/profile");
    } else {
      router.push({
        pathname: "/userProfile",
        params: { userId: followerId },
      });
    }
  };

  const renderItem = ({ item }: { item: FollowingInfo }): React.ReactElement => {
    return (
      <Item onPress={() => openUserProfile(item.following.id)}>
        <Avatar
          uri={item.following.image}
          size={hp(8)}
          rounded={theme.radius.xl}
          isDarkMode={isDarkMode}
        />
        <FollowingName>{item.following.name}</FollowingName>
      </Item>
    );
  };

  return (
    <ThemeWrapper>
      <Container>
        <Header title="Following" />
        <FlatList
          data={followings}
          keyExtractor={(item) => item.following_id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchFollowings}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyListContainer>
              <EmptyListText>No followings found</EmptyListText>
            </EmptyListContainer>
          }
        />
      </Container>
    </ThemeWrapper>
  );
};

export default Followings;

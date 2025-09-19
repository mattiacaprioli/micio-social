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
import { getFollowersList, FollowerInfo } from "../../services/followsService";
import Avatar from "../../components/Avatar";
import { wp, hp } from "../../helpers/common";
import { useTheme } from "../../context/ThemeContext";
import Header from "../../components/Header";

// Interfacce per i tipi
interface RouteParams {
  userId?: string;
  [key: string]: any;
}

// Styled Components
const Container = styled.View`
  flex: 1;
  padding-top: ${hp(6)}px;
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

const FollowerName = styled.Text`
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

const Followers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { userId } = useLocalSearchParams<RouteParams>();
  const router = useRouter();
  const targetUserId = userId || currentUser?.id;
  const [followers, setFollowers] = useState<FollowerInfo[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { isDarkMode } = useTheme();
  const theme = useStyledTheme();

  const fetchFollowers = async (): Promise<void> => {
    if (targetUserId) {
      setRefreshing(true);
      const data = await getFollowersList(targetUserId);
      setFollowers(data);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFollowers();
  }, [targetUserId]);

  const openUserProfile = (followerId: string): void => {
    if (followerId === currentUser?.id) {
      router.push("/(tabs)/profile");
    } else {
      router.push({
        pathname: "/userProfile",
        params: { userId: followerId },
      });
    }
  };

  const renderItem = ({ item }: { item: FollowerInfo }): React.ReactElement => (
    <Item onPress={() => openUserProfile(item.follower.id)}>
      <Avatar
        uri={item.follower.image}
        size={hp(8)}
        rounded={theme.radius.xl}
        isDarkMode={isDarkMode}
      />
      <FollowerName>{item.follower.name}</FollowerName>
    </Item>
  );

  return (
    <ThemeWrapper>
      <View style={{ flex: 1 }}>
        {/* Header fisso */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
          <Header title="Follower" />
        </View>

        <Container>
          <FlatList
          data={followers}
          keyExtractor={(item) => item.follower_id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchFollowers}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyListContainer>
              <EmptyListText>No followers found</EmptyListText>
            </EmptyListContainer>
          }
        />
        </Container>
      </View>
    </ThemeWrapper>
  );
};

export default Followers;

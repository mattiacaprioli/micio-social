import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  RefreshControl,
  View,
} from "react-native"; 
import styled from "styled-components/native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import { getFollowersList } from "../../services/followsService";
import Avatar from "../../components/Avatar";
import { wp, hp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Header from "../../components/Header";

// Styled Components
const Container = styled.View`
  flex: 1;
  background-color: white;
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
  border-color: #ccc;
`;

const FollowerName = styled.Text`
  margin-left: ${wp(4)}px;
  font-size: ${hp(2.2)}px;
  color: ${theme.colors.textDark};
`;

const EmptyListContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  margin-top: ${hp(20)}px;
`;

const EmptyListText = styled.Text``;

const Followers = () => {
  const { user: currentUser } = useAuth();
  const { userId } = useLocalSearchParams();
  const targetUserId = userId || currentUser?.id;
  const [followers, setFollowers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFollowers = async () => {
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

  const renderItem = ({ item }) => (
    <Item>
      <Avatar
        uri={item.follower.image}
        size={hp(8)}
        rounded={theme.radius.xl}
      />
      <FollowerName>{item.follower.name}</FollowerName>
    </Item>
  );

  return (
    <ScreenWrapper bg="white">
      <Container>
        <Header title="Followers" />
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
    </ScreenWrapper>
  );
};

export default Followers;


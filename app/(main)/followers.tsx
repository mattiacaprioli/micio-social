import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  View,
} from "react-native"; 
import styled from "styled-components/native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../context/AuthContext";
import { useLocalSearchParams } from "expo-router";
import { getFollowersList, FollowerInfo } from "../../services/followsService";
import Avatar from "../../components/Avatar";
import { wp, hp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Header from "../../components/Header";
import { useTranslation } from 'react-i18next';

// Interfacce per i tipi
interface RouteParams {
  userId?: string;
  [key: string]: any;
}

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

const Followers: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { userId } = useLocalSearchParams<RouteParams>();
  const { t } = useTranslation();
  const targetUserId = userId || currentUser?.id;
  const [followers, setFollowers] = useState<FollowerInfo[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

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

  const renderItem = ({ item }: { item: FollowerInfo }): React.ReactElement => (
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
        <Header title={t('followers')} />
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
              <EmptyListText>{t('noFollowersFound')}</EmptyListText>
            </EmptyListContainer>
          }
        />
      </Container>
    </ScreenWrapper>
  );
};

export default Followers;

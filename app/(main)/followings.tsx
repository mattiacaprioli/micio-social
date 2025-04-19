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
import { getFollowingList, FollowingInfo } from "../../services/followsService";
import Avatar from "../../components/Avatar";
import { wp, hp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Header from "../../components/Header";
import { useTranslation } from 'react-i18next';
import { User } from "../../src/types";

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

const FollowingName = styled.Text`
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

const Followings: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { userId } = useLocalSearchParams<RouteParams>();
  const { t } = useTranslation();
  const targetUserId = userId || currentUser?.id;
  const [followings, setFollowings] = useState<FollowingInfo[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

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

  const renderItem = ({ item }: { item: FollowingInfo }): React.ReactElement => {
    return (
      <Item>
        <Avatar
          uri={item.following.image}
          size={hp(8)}
          rounded={theme.radius.xl}
        />
        <FollowingName>{item.following.name}</FollowingName>
      </Item>
    );
  };

  return (
    <ScreenWrapper bg="white">
      <Container>
        <Header title={t('followings')} />
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
              <EmptyListText>{t('noFollowingsFound')}</EmptyListText>
            </EmptyListContainer>
          }
        />
      </Container>
    </ScreenWrapper>
  );
};

export default Followings;

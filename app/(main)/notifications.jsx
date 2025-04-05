import { ScrollView, RefreshControl, Text, View } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components/native"; 
import { fetchNotifications, deleteNotification } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useRouter } from "expo-router";
import NotificationItem from "../../components/NotificationItem";
import Header from "../../components/Header";

// Styled Components
const Container = styled.View`
  flex: 1;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
`;

const ListStyle = styled.ScrollView`
  padding-top: 20px;
  padding-bottom: 20px;
  gap: 10px;
`;

const NoDataText = styled.Text`
  font-size: ${hp(1.8)}px;
  font-weight: ${theme.fonts.medium};
  color: ${theme.colors.text};
  text-align: center;
`;


const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    getNotifications();
  }, []);

  const getNotifications = async (isRefreshing = false) => {
    let res = await fetchNotifications(user.id);
    if (res.success) {
      setNotifications(res.data);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    let res = await deleteNotification(notificationId);
    if (res.success) {
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getNotifications().finally(() => setRefreshing(false));
  }, []);

  return (
    <ScreenWrapper>
      <Container>
        <Header title="Notifications" />
        <ListStyle
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }} // Inline style for contentContainerStyle
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={[theme.colors.primary]}
            />
          }
        >
          {notifications.map((item) => {
            return (
              <NotificationItem key={item?.id} item={item} router={router} onDelete={() => handleDeleteNotification(item.id)} />
            );
          })}
          {
            notifications.length === 0 && (
              <NoDataText>No notifications yet</NoDataText>
            )
          }
        </ListStyle>
      </Container>
    </ScreenWrapper>
  );
};

export default Notifications;


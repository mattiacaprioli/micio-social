import { ScrollView, RefreshControl, Text, View } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { fetchNotifications, deleteNotification } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import { hp, wp } from "../../helpers/common";
import ThemeWrapper from "../../components/ThemeWrapper";
import { useRouter } from "expo-router";
import NotificationItem from "../../components/NotificationItem";
import Header from "../../components/Header";

interface Notification {
  id: string;
  data: string;
  title: string;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    image: string | null;
  };
}

const Container = styled.View`
  flex: 1;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
`;

const ListStyle = styled.ScrollView`
  flex: 1;
`;

const NoDataText = styled.Text`
  text-align: center;
  color: ${props => props.theme.colors.textLight};
  font-size: ${hp(2)}px;
  margin-top: ${hp(4)}px;
`;

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { user } = useAuth();
  const router = useRouter();
  const theme = useStyledTheme();

  const getNotifications = async () => {
    if (!user?.id) return;

    const response = await fetchNotifications(user.id);
    if (response.success && response.data) {
      setNotifications(response.data);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    const response = await deleteNotification(notificationId);
    if (response.success) {
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    }
  };

  useEffect(() => {
    getNotifications();
  }, [user?.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getNotifications().finally(() => setRefreshing(false));
  }, []);

  return (
    <ThemeWrapper>
      <Container>
        <Header title="Notifiche" />
        <ListStyle
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        >
          {notifications.map((item) => (
            <NotificationItem
              key={item.id}
              item={item}
              router={router}
              onDelete={() => handleDeleteNotification(item.id)}
            />
          ))}
          {notifications.length === 0 && (
            <NoDataText>Nessuna notifica</NoDataText>
          )}
        </ListStyle>
      </Container>
    </ThemeWrapper>
  );
};

export default Notifications;
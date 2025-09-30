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
import { supabase } from "../../lib/supabase";

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
  padding-top: ${hp(6)}px;
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

    if (!user?.id) return;

    const notificationChannel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiverId=eq.${user.id}`,
        },
        async (payload) => {
          console.log("🔔 New notification received in notifications screen:", payload);

          if (payload.new) {
            const { data, error } = await supabase
              .from("notifications")
              .select(`
                *,
                sender: senderId(id, name, image)
              `)
              .eq("id", payload.new.id)
              .single();

            if (!error && data) {
              setNotifications((prev) => [data, ...prev]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, [user?.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getNotifications().finally(() => setRefreshing(false));
  }, []);

  return (
    <ThemeWrapper>
      <View style={{ flex: 1 }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
          <Header title="Notifiche" />
        </View>

        <Container>
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
            <NoDataText>No notifications found</NoDataText>
          )}
        </ListStyle>
        </Container>
      </View>
    </ThemeWrapper>
  );
};

export default Notifications;
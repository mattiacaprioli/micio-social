import { ScrollView, StyleSheet, RefreshControl, Text, View } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { fetchNotifications, deleteNotification } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useRouter } from "expo-router";
import NotificationItem from "../../components/NotificationItem";
import Header from "../../components/Header";

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
      <View style={styles.container}>
        <Header title="Notifications" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
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
              <Text style={styles.noData}>No notifications yet</Text>
            )
          }
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  listStyle: {
    paddingVertical: 20,
    gap: 10,
  },
  noData: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    textAlign: "center",
  },
});

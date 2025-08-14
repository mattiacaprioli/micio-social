import React from "react";
import { View } from "react-native";
import { Slot, usePathname } from "expo-router";
import TabBar from "../../components/TabBar";
import { RefreshProvider, useRefresh } from "../../context/RefreshContext";

const MainLayoutContent: React.FC = () => {
  const pathname = usePathname();
  const { homeRefreshRef } = useRefresh();

  const handleHomeRefresh = () => {
    if (homeRefreshRef.current) {
      homeRefreshRef.current();
    }
  };

  const hideTabBarRoutes = ['/newPost', '/chat', '/notifications', '/settings', '/search', '/editProfile', '/userProfile'];
  const shouldHideTabBar = hideTabBarRoutes.some(route => pathname.startsWith(route));

  return (
    <View style={{ flex: 1 }}>
      <Slot />
      {!shouldHideTabBar && (
        <TabBar currentRoute={pathname} onRefresh={handleHomeRefresh} />
      )}
    </View>
  );
};

const MainLayout: React.FC = () => {
  return (
    <RefreshProvider>
      <MainLayoutContent />
    </RefreshProvider>
  );
};

export default MainLayout;
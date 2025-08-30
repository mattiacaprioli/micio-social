import React, { createContext, useContext, useState, useEffect } from "react";
import { View, AppState } from "react-native";
import { Slot, usePathname } from "expo-router";
import TabBar from "../../components/TabBar";
import { RefreshProvider, useRefresh } from "../../context/RefreshContext";

// Context per gestire la visibilità del TabBar
const TabBarVisibilityContext = createContext<{
  isTabBarVisible: boolean;
  setTabBarVisible: (visible: boolean) => void;
}>({
  isTabBarVisible: true,
  setTabBarVisible: () => {},
});

export const useTabBarVisibility = () => useContext(TabBarVisibilityContext);

const MainLayoutContent: React.FC = () => {
  const pathname = usePathname();
  const { homeRefreshRef } = useRefresh();
  const { isTabBarVisible } = useTabBarVisibility();

  const handleHomeRefresh = () => {
    if (homeRefreshRef.current) {
      homeRefreshRef.current();
    }
  };

  const hideTabBarRoutes = ['/newPost', '/postDetails', '/chat', '/notifications', '/settings', '/search', '/editProfile', '/userProfile', '/ecommerce/productDetails', '/pets/addPet', '/pets/editPet', '/pets/petDetails'];
  const shouldHideTabBar = hideTabBarRoutes.some(route => pathname.startsWith(route));

  return (
    <View style={{ flex: 1 }}>
      <Slot />
      {!shouldHideTabBar && isTabBarVisible && (
        <TabBar currentRoute={pathname} onRefresh={handleHomeRefresh} />
      )}
    </View>
  );
};

const MainLayout: React.FC = () => {
  const [isTabBarVisible, setTabBarVisible] = useState(true);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        setTimeout(() => {
          setTabBarVisible(prev => prev === false ? true : prev);
        }, 100);
      }
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      appStateSubscription?.remove();
    };
  }, []);

  return (
    <RefreshProvider>
      <TabBarVisibilityContext.Provider value={{ isTabBarVisible, setTabBarVisible }}>
        <MainLayoutContent />
      </TabBarVisibilityContext.Provider>
    </RefreshProvider>
  );
};

export default MainLayout;
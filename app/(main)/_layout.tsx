import React, { createContext, useContext, useState, useEffect } from "react";
import { View, AppState } from "react-native";
import { Slot } from "expo-router";
import { RefreshProvider } from "../../context/RefreshContext";

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
  return (
    <View style={{ flex: 1 }}>
      <Slot />
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
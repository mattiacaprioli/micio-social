import { View, Text, LogBox } from "react-native";
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { getUserData } from "../services/userService";
import i18n from '../lib/i18n'; // Import the i18n configuration
import { I18nextProvider } from 'react-i18next'; // Import I18nextProvider

LogBox.ignoreLogs(['Warning: TNodeChildrenRenderer', 'Warning: MemoizedTNodeRenderer', 'Warning: TRenderEngineProvider'])

const _layout = () => {
  return (
    <AuthProvider>
      <I18nextProvider i18n={i18n}>
        <MainLayout />
      </I18nextProvider>
    </AuthProvider>
  );
};

const MainLayout = () => {
  const { setAuth, setUserData } = useAuth();
  const router = useRouter();

  const updateUserData = async (user, email) => {
    let res = await getUserData(user?.id);
    if (res.success) {
      setUserData({...res.data, email});
    }
  };

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      // console.log("session user:  ", session?.user?.id);

      if (session) {
        setAuth(session?.user);
        updateUserData(session?.user, session?.user?.email);
        router.replace("/home");
      } else {
        setAuth(null);
        router.replace("/welcome");
      }
    });
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="(main)/postDetails"
        options={{
          presentation: 'modal'
        }}
      />
    </Stack>
  );
};

export default _layout;

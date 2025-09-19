import { LogBox } from "react-native";
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ThemeProvider as ThemeContextProvider } from "../context/ThemeContext";
import ThemeProvider from "../components/ThemeProvider";
import { supabase } from "../lib/supabase";
import { getUserData } from "../services/userService";
//import '../lib/i18n'; // Importa prima il setup di i18n
import i18n from '../lib/i18n';
import { User } from '@supabase/supabase-js';
import { Session } from '@supabase/supabase-js';
import { UserRow } from "../src/types/supabase";

// Ignora alcuni warning specifici
LogBox.ignoreLogs(['Warning: TNodeChildrenRenderer', 'Warning: MemoizedTNodeRenderer', 'Warning: TRenderEngineProvider']);

const Layout: React.FC = () => {
  return (
    // <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <ThemeContextProvider>
          <ThemeProvider>
            <MainLayout />
          </ThemeProvider>
        </ThemeContextProvider>
      </AuthProvider>
    // </I18nextProvider>
  );
};

const MainLayout: React.FC = () => {
  const { setAuth, setUserData } = useAuth();
  const router = useRouter();

  const updateUserData = async (user: User | null, email?: string): Promise<void> => {
    if (!user?.id) return;

    const res = await getUserData(user.id);
    if (res.success && res.data) {
      setUserData({ ...res.data, email: email ?? '' });
    }
  };

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      if (session) {
        setAuth(session.user);
        updateUserData(session.user, session.user.email);
        router.replace("/(tabs)/home" as any);
      } else {
        setAuth(null);
        router.replace("/welcome" as any);
      }
    });

    // Cleanup della sottoscrizione
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(main)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(main)/postDetails"
        options={{
          presentation: 'modal'
        }}
      />
    </Stack>
  );
};

export default Layout;

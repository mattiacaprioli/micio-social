import { LogBox } from "react-native";
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { ThemeProvider as ThemeContextProvider } from "../context/ThemeContext";
import { LanguageProvider } from "../context/LanguageContext";
import ThemeProvider from "../components/ThemeProvider";
import { supabase } from "../lib/supabase";
import { getUserData } from "../services/userService";
//import '../lib/i18n'; // Importa prima il setup di i18n
import i18n from '../lib/i18n';
import { User } from '@supabase/supabase-js';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { UserRow } from "../src/types/supabase";

// Ignora alcuni warning specifici
LogBox.ignoreLogs(['Warning: TNodeChildrenRenderer', 'Warning: MemoizedTNodeRenderer', 'Warning: TRenderEngineProvider']);

const Layout: React.FC = () => {
  return (
    // <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <AuthProvider>
          <ThemeContextProvider>
            <ThemeProvider>
              <MainLayout />
            </ThemeProvider>
          </ThemeContextProvider>
        </AuthProvider>
      </LanguageProvider>
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

  const handleDeepLink = async (url: string) => {
    // PKCE flow: URL contains ?code=XXXX
    try {
      const parsed = new URL(url);
      const code = parsed.searchParams.get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        return;
      }

      // Implicit flow: URL contains #access_token=XXX&type=recovery
      const fragment = url.split("#")[1];
      if (fragment) {
        const params = new URLSearchParams(fragment);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const type = params.get("type");
        if (accessToken && refreshToken && type === "recovery") {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        }
      }
    } catch {
      // URL parsing failed — not a recovery link
    }
  };

  useEffect(() => {
    // Handle deep link if app was opened from a closed state
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Handle deep link while app is in foreground/background
    const linkingSub = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    const { data } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === "PASSWORD_RECOVERY") {
          router.replace("/resetPassword" as any);
          return;
        }
        if (session) {
          setAuth(session.user);
          updateUserData(session.user, session.user.email);
          router.replace("/(tabs)/home" as any);
        } else {
          setAuth(null);
          router.replace("/welcome" as any);
        }
      }
    );

    return () => {
      linkingSub.remove();
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

import React from "react";
import { Tabs, useRouter } from "expo-router";
import { useTheme as useStyledTheme } from "styled-components/native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { hp } from "../../helpers/common";
import Icon from "../../assets/icons";
import Avatar from "../../components/Avatar";
import { RefreshProvider } from "../../context/RefreshContext";
import { Animated, Pressable, View } from "react-native";

const getTabBarColors = (theme: any) => ({
  background: theme.colors.background,
  plusButton: theme.colors.primary,
  active: theme.colors.primary,
  inactive: theme.colors.textLight,
  border: theme.colors.darkLight,
  text: theme.colors.text,
  borderColor: theme.colors.background
});

const AnimatedPlusButton: React.FC<{ onPress: () => void; color: string; borderColor: string }> = ({ onPress, color, borderColor }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        {
          position: 'relative',
          top: -hp(1.5),
          backgroundColor: color,
          width: hp(6.4),
          height: hp(6.4),
          borderRadius: hp(3.2),
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ scale: scaleAnim }],
          shadowColor: color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
          borderWidth: 3,
          borderColor: borderColor,
          zIndex: 10,
        }
      ]}
    >
      <Icon name="plus" size={hp(3)} color="white" />
    </AnimatedPressable>
  );
};

const TabsLayout: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const theme = useStyledTheme();
  const router = useRouter();
  const tabBarColors = getTabBarColors(theme);

  return (
    <RefreshProvider>
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: hp(6),
              backgroundColor: tabBarColors.background,
              paddingTop: hp(1),
              paddingBottom: hp(1),
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 5,
            },
            tabBarActiveTintColor: tabBarColors.active,
            tabBarInactiveTintColor: tabBarColors.inactive,
            tabBarShowLabel: false,
            tabBarItemStyle: {
              flex: 1,
              paddingHorizontal: hp(1),
            },
          }}
        >
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name="home" size={hp(3)} color={color} />
            ),
          }}
        />
        
        <Tabs.Screen
          name="pets"
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name="catIcon" size={hp(3)} color={color} />
            ),
            tabBarItemStyle: {
              marginRight: hp(3),
            },
          }}
        />

        <Tabs.Screen
          name="ecommerce"
          options={{
            tabBarIcon: ({ color }) => (
              <Icon name="shoppingCart" size={hp(3)} color={color} />
            ),
            tabBarItemStyle: {
              marginLeft: hp(3),
            },
          }}
        />
        
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Avatar
                uri={(user as any)?.image}
                size={hp(4)}
                rounded={theme.radius.xl}
                isDarkMode={isDarkMode}
                style={{
                  borderWidth: focused ? 2 : 0,
                  borderColor: focused ? tabBarColors.active : undefined
                }}
              />
            ),
          }}
        />
      </Tabs>

        {/* Bottone Plus sovrapposto al centro della TabBar */}
        <View
          style={{
            position: 'absolute',
            bottom: hp(1),
            left: '50%',
            marginLeft: -hp(3),
            zIndex: 1000,
            elevation: 1000,
          }}
        >
          <AnimatedPlusButton
            onPress={() => router.push("/(main)/newPost")}
            color={tabBarColors.plusButton}
            borderColor={tabBarColors.borderColor}
          />
        </View>
      </View>
    </RefreshProvider>
  );
};

export default TabsLayout;

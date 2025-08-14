import React from "react";
import { Pressable, Animated } from "react-native";
import styled from "styled-components/native";
import { useRouter } from "expo-router";
import { hp, wp } from "../helpers/common";
import Icon from "../assets/icons";
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useTheme as useStyledTheme } from "styled-components/native";
import { Theme } from "../constants/theme";

interface TabBarProps {
  currentRoute?: string;
  onRefresh?: () => void;
  theme?: Theme;
}

// Funzione per ottenere i colori della TabBar in base al tema
const getTabBarColors = (theme: any) => ({
  background: theme.colors.background, // Sfondo in base al tema
  plusButton: theme.colors.primary, // Arancione primario per il bottone plus
  active: theme.colors.primary, // Arancione primario per le icone attive
  inactive: theme.colors.textLight, // Colore grigio per le icone inattive
  border: theme.colors.darkLight, // Colore del bordo superiore
  text: theme.colors.text, // Colore del testo
  borderColor: theme.colors.background // Colore del bordo del bottone plus
});

// Styled Components
const Container = styled.View<{ theme: Theme }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${hp(6)}px;
  background-color: ${props => props.theme.colors.background};
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding-top: ${hp(1)}px;
  padding-bottom: ${hp(1)}px;
  /* Bordo superiore */
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.darkLight};
  /* Ombra sottile per iOS e Android */
  box-shadow: 0px -2px 8px rgba(0, 0, 0, 0.05);
`;

const TabButton = styled(Pressable)<{ isActive?: boolean }>`
  align-items: center;
  justify-content: center;
  padding: ${hp(0)}px;
  width: ${wp(16)}px;

`;

const PlusButtonContainer = styled.View`
  position: relative;
  top: -${hp(1.5)}px;
  width: ${hp(6)}px;
  height: ${hp(6)}px;
  z-index: 10;
`;


const AnimatedPressable = Animated.createAnimatedComponent(Pressable);



const TabBar: React.FC<TabBarProps> = ({ currentRoute = "/home", onRefresh }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const theme = useStyledTheme();
  const tabBarColors = getTabBarColors(theme);

  // Animazione per il pulsante plus
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

  return (
    <>
      <Container>

        <TabButton
          onPress={() => {
            if (currentRoute === "/home" && onRefresh) {
              // Se siamo già nella home, eseguiamo il refresh invece di navigare
              onRefresh();
            } else {
              router.push("/home");
            }
          }}
          isActive={currentRoute === "/home"}
        >
          <Icon
            name="home"
            size={hp(3)}
            color={currentRoute === "/home" ? tabBarColors.active : tabBarColors.inactive}
          />
        </TabButton>

        <TabButton
          onPress={() => router.push("/ecommerce/ecommerce")}
          isActive={currentRoute.startsWith("/ecommerce")}
        >
          <Icon
            name="shoppingCart"
            size={hp(3)}
            color={currentRoute.startsWith("/ecommerce") ? tabBarColors.active : tabBarColors.inactive}
          />
        </TabButton>

        {/* Bottone plus al centro con animazione */}
        <PlusButtonContainer>
          <AnimatedPressable
            onPress={() => router.push("/newPost")}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
              {
                backgroundColor: tabBarColors.plusButton,
                width: hp(6),
                height: hp(6),
                borderRadius: hp(3),
                justifyContent: 'center',
                alignItems: 'center',
                transform: [{ scale: scaleAnim }],
                shadowColor: tabBarColors.plusButton,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
                borderWidth: 3,
                borderColor: tabBarColors.borderColor,
              }
            ]}
          >
            <Icon name="plus" size={hp(3)} color="white" />
          </AnimatedPressable>
        </PlusButtonContainer>

        <TabButton
          onPress={() => router.push("/pets/pets")}
          isActive={currentRoute === "/pets"}
        >
          <Icon
            name="catIcon"
            size={hp(3)}
            color={currentRoute === "/pets" ? tabBarColors.active : tabBarColors.inactive}
          />
        </TabButton>

        <TabButton
          onPress={() => router.push("/profile")}
          isActive={currentRoute === "/profile"}
        >
          <Avatar
            uri={(user as any)?.image}
            size={hp(4)}
            rounded={theme.radius.xl}
            isDarkMode={isDarkMode}
            style={{
              borderWidth: currentRoute === "/profile" ? 2 : 0,
              borderColor: currentRoute === "/profile" ? tabBarColors.active : undefined
            }}
          />
        </TabButton>
      </Container>
    </>
  );
};

export default TabBar;

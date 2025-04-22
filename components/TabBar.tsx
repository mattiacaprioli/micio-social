import React from "react";
import { Pressable, Animated } from "react-native";
import styled from "styled-components/native";
import { useRouter } from "expo-router";
import { hp, wp } from "../helpers/common";
import Icon from "../assets/icons";
import Avatar from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { theme } from "../constants/theme";

interface TabBarProps {
  currentRoute?: string;
  onRefresh?: () => void;
}

// Colori per la TabBar
const tabBarColors = {
  background: "white", // Sfondo bianco per coerenza con l'header
  plusButton: theme.colors.primary, // Arancione primario per il bottone plus
  active: theme.colors.primary, // Arancione primario per le icone attive
  inactive: theme.colors.textLight, // Colore grigio per le icone inattive
  border: theme.colors.darkLight // Colore del bordo superiore
};

// Styled Components
const Container = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${hp(6)}px;
  background-color: ${tabBarColors.background};
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding-top: ${hp(1)}px;
  padding-bottom: ${hp(1)}px;
  /* Bordo superiore */
  border-top-width: 1px;
  border-top-color: ${tabBarColors.border};
  /* Ombra sottile per iOS e Android */
  box-shadow: 0px -2px 8px rgba(0, 0, 0, 0.05);
`;

const TabButton = styled(Pressable)<{ isActive?: boolean }>`
  align-items: center;
  justify-content: center;
  padding: ${hp(0)}px;
  width: ${wp(20)}px;

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
            // color={currentRoute === "/home" ? tabBarColors.active : tabBarColors.inactive}
            color={theme.colors.text}
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
                borderColor: 'white',
              }
            ]}
          >
            <Icon name="plus" size={hp(3)} color="white" />
          </AnimatedPressable>
        </PlusButtonContainer>

        <TabButton
          onPress={() => router.push("/profile")}
          isActive={currentRoute === "/profile"}
        >
          <Avatar
            uri={(user as any)?.image}
            size={hp(4)}
            rounded={theme.radius.xl}
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

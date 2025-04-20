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
}

// Colori per la TabBar
const tabBarColors = {
  background: theme.colors.textDark, // Colore scuro per lo sfondo
  plusButton: theme.colors.primary, // Arancione primario per il bottone plus
  active: theme.colors.primary, // Arancione primario per le icone attive
  inactive: "rgba(255,255,255,0.7)" // Bianco semi-trasparente per le icone inattive
};

// Styled Components
const Container = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${hp(5)}px;
  background-color: ${tabBarColors.background};
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding-bottom: ${hp(1)}px;
  /* Ombra per iOS e Android */
  box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1);
`;

const TabButton = styled(Pressable)<{ isActive?: boolean }>`
  align-items: center;
  justify-content: center;
  padding: ${hp(0)}px;
  width: ${wp(20)}px;

`;

const PlusButtonContainer = styled.View`
  position: relative;
  top: -${hp(2)}px;
  width: ${hp(6)}px;
  height: ${hp(6)}px;
  z-index: 10;
`;


const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Componente per creare l'effetto curvo nella parte superiore della tabbar
const CurveEffect = styled.View`
  position: absolute;
  top: -${hp(1)}px;
  left: 50%;
  width: ${wp(30)}px;
  height: ${hp(4)}px;
  margin-left: -${wp(15)}px;
  background-color: ${tabBarColors.background};
  border-top-left-radius: ${hp(5)}px;
  border-top-right-radius: ${hp(5)}px;
  z-index: 5;
`;

const LeftSide = styled.View`
  position: absolute;
  top: -${hp(1.1)}px;
  left: 0;
  width: 43%;
  height: ${hp(1.3)}px;
  background-color: ${tabBarColors.background};
  border-top-right-radius: 100%;
`;

const RightSide = styled.View`
  position: absolute;
  top: -${hp(1.1)}px;
  right: 0;
  width: 43%;
  height: ${hp(1.3)}px;
  background-color: ${tabBarColors.background};
  border-top-left-radius: 100%;
`;

const TabBar: React.FC<TabBarProps> = ({ currentRoute = "/home" }) => {
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
        {/* Componenti per creare la forma speciale della tabbar */}
        <LeftSide />
        <RightSide />

        <TabButton
          onPress={() => router.push("/home")}
          isActive={currentRoute === "/home"}
        >
          <Icon
            name="home"
            size={hp(3)}
            color={currentRoute === "/home" ? tabBarColors.active : tabBarColors.inactive}
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
                elevation: 8,
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

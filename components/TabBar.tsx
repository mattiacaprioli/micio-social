import React from "react";
import { Pressable } from "react-native";
import styled from "styled-components/native";
import { useRouter } from "expo-router";
import { hp, wp } from "../helpers/common";
import Icon from "../assets/icons";
import Avatar from "./Avatar";
import { useAuth } from "@/context/AuthContext";
import { theme } from "@/constants/theme";

interface TabBarProps {
  currentRoute?: string;
}

// Styled Components
const Container = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${hp(7)}px;
  background-color: #3b2f63; /* Colore viola scuro come nell'immagine */
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding-bottom: ${hp(1)}px;
  border-top-left-radius: ${hp(3)}px;
  border-top-right-radius: ${hp(3)}px;
`;

const TabButton = styled(Pressable)<{ isActive?: boolean }>`
  align-items: center;
  justify-content: center;
  padding: ${hp(1)}px;
  width: ${wp(20)}px;
`;

const PlusButtonContainer = styled.View`
  position: relative;
  top: -${hp(2)}px;
  width: ${hp(6)}px;
  height: ${hp(6)}px;
  z-index: 10;
`;

const PlusButton = styled(Pressable)`
  background-color: #8a4fff; /* Colore viola come nell'immagine */
  width: ${hp(6)}px;
  height: ${hp(6)}px;
  border-radius: ${hp(3)}px;
  justify-content: center;
  align-items: center;
  /* Ombra per iOS e Android */
  box-shadow: 0px 4px 8px rgba(138, 79, 255, 0.3);
`;

const TabBar: React.FC<TabBarProps> = ({ currentRoute = "/home" }) => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <>
      <Container>
        <TabButton
          onPress={() => router.push("/home")}
          isActive={currentRoute === "/home"}
        >
          <Icon
            name="home"
            size={hp(3)}
            color={currentRoute === "/home" ? "white" : "rgba(255,255,255,0.7)"}
          />
        </TabButton>

        {/* Bottone plus al centro */}
        <PlusButtonContainer>
          <PlusButton onPress={() => router.push("/newPost")}>
            <Icon name="plus" size={hp(3)} color="white" />
          </PlusButton>
        </PlusButtonContainer>

        <TabButton
          onPress={() => router.push("/profile")}
          isActive={currentRoute === "/profile"}
        >
          <Avatar
            uri={(user as any)?.image}
            size={hp(4.3)}
            rounded={theme.radius.sm}
            style={{ borderWidth: 2 }}
          />
        </TabButton>
      </Container>
    </>
  );
};

export default TabBar;

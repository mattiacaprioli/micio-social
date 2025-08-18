import {
  Alert,
  Image,
  View,
  ViewStyle,
} from "react-native";
import React from "react";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import ThemeWrapper from "../../../components/ThemeWrapper";
import { useRouter } from "expo-router";
import Header from "../../../components/Header";
import { wp, hp } from "../../../helpers/common";
import Icon from "../../../assets/icons";
import { supabase } from "../../../lib/supabase";

// Interfacce per i tipi
interface SettingsOption {
  label: string;
  icon: string;
  action: () => void;
}

// Styled Components
const ScreenContainer = styled.View`
  flex: 1;
  padding-top: ${hp(8)}px;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
`;

const Card = styled.View`
  margin-top: ${hp(2)}px;
  background-color: ${props => props.theme.colors.darkLight};
  border-radius: ${props => props.theme.radius.xxl}px;
  padding-top: ${hp(1.5)}px;
  padding-bottom: ${hp(1.5)}px;
  padding-left: ${wp(2)}px;
  padding-right: ${wp(2)}px;
  border-width: 0.5px;
  border-color: ${props => props.theme.colors.dark};
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.05);
  gap: ${hp(2)}px;
`;

const Item = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: ${hp(2)}px;
  padding-bottom: ${hp(2)}px;
  padding-left: ${wp(3)}px;
  padding-right: ${wp(3)}px;
  border-radius: ${props => props.theme.radius.lg}px;
  background-color: ${props => props.theme.colors.background};
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.1);
`;

const ItemText = styled.Text`
  font-size: ${hp(2)}px;
  color: ${props => props.theme.colors.textDark};
  font-weight: 500;
`;

const ItemTextLogout = styled(ItemText)`
  color: ${props => props.theme.colors.rose};
`;

const WelcomeImage = styled(Image)`
  width: ${hp(20)}px;
  height: ${wp(40)}px;
  align-self: center;
  margin-top: auto;
`;

const Title = styled.Text`
  color: ${props => props.theme.colors.text};
  font-size: ${hp(3)}px;
  text-align: center;
  font-weight: ${props => props.theme.fonts.extraBold};
`;

const VersionText = styled.Text`
  color: ${props => props.theme.colors.text};
  font-size: ${hp(1.5)}px;
  text-align: center;
  font-weight: 500;
  padding-bottom: ${hp(2)}px;
`;

const Settings: React.FC = () => {
  const router = useRouter();
  const theme = useStyledTheme();

  const onLogout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("logout", "errorSigningOut");
    }
  };

  const handleLogout = async (): Promise<void> => {
    // show confirm modal
    Alert.alert("Confirm", "Are you sure you want to log out?", [
      {
        text: "cancel",
        onPress: () => console.log("Modal cancelled"),
        style: "cancel",
      },
      {
        text: "logout",
        onPress: () => onLogout(),
        style: "destructive",
      },
    ]);
  };

  const settingsOptions: SettingsOption[] = [
    {
      label: "account",
      icon: "arrowRight",
      action: () => router.push("/settings/accountSettings"),
    },
    {
      label: "notifications",
      icon: "arrowRight",
      action: () => router.push("/settings/notificationsSettings"),
    },
    {
      label: "information",
      icon: "arrowRight",
      action: () => router.push("/settings/informationSettings"),
    }
  ];

  return (
    <ThemeWrapper>
      <View style={{ flex: 1 }}>
        {/* Header fisso */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
          <Header title={"settings"} />
        </View>

        <ScreenContainer>
          <Card>
          {settingsOptions.map((option, index) => (
            <Item
              key={index}
              onPress={option.action}
            >
              <ItemText>{option.label}</ItemText>
              <Icon name={option.icon} size={20} color={theme.colors.textDark} />
            </Item>
          ))}
          <Item onPress={handleLogout}>
            <ItemTextLogout>{"logout"}</ItemTextLogout>
            <Icon name="logout" size={20} color={theme.colors.rose} />
          </Item>
        </Card>
        {/* <WelcomeImage
          resizeMode="contain"
          source={require("../../../assets/images/welcome.png")}
        /> */}
        <View style={{flex: 1, justifyContent: 'flex-end'}}>
          <Title>{"micioSocial"}</Title>
          <VersionText>{"appVersion"} 1.0.0</VersionText>
        </View>

        </ScreenContainer>
      </View>
    </ThemeWrapper>
  );
};

export default Settings;

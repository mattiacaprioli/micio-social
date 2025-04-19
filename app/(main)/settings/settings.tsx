import {
  Alert,
  Image,
  ViewStyle,
} from "react-native";
import React from "react";
import styled from "styled-components/native";
import ScreenWrapper from "../../../components/ScreenWrapper";
import { useRouter } from "expo-router";
import Header from "../../../components/Header";
import { wp, hp } from "../../../helpers/common";
import Icon from "../../../assets/icons";
import { theme } from "../../../constants/theme";
import { supabase } from "../../../lib/supabase";
import { useTranslation } from 'react-i18next';

// Interfacce per i tipi
interface SettingsOption {
  label: string;
  icon: string;
  action: () => void;
}

// Styled Components
const ScreenContainer = styled.View`
  flex: 1;
  background-color: white;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
`;

const Card = styled.View`
  margin-top: ${hp(2)}px;
  background-color: ${theme.colors.darkLight};
  border-radius: ${theme.radius.xxl}px;
  padding-top: ${hp(1.5)}px;
  padding-bottom: ${hp(1.5)}px;
  padding-left: ${wp(2)}px;
  padding-right: ${wp(2)}px;
  border-width: 0.5px;
  border-color: ${theme.colors.dark};
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
  border-radius: ${theme.radius.lg}px;
  background-color: white;
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.1);
`;

const ItemText = styled.Text`
  font-size: ${hp(2)}px;
  color: ${theme.colors.textDark};
  font-weight: 500;
`;

const ItemTextLogout = styled(ItemText)`
  color: ${theme.colors.rose};
`;

const WelcomeImage = styled(Image)`
  width: ${hp(20)}px;
  height: ${wp(40)}px;
  align-self: center;
  margin-top: auto;
`;

const Title = styled.Text`
  color: ${theme.colors.text};
  font-size: ${hp(3)}px;
  text-align: center;
  font-weight: ${theme.fonts.extraBold};
`;

const VersionText = styled.Text`
  color: ${theme.colors.text};
  font-size: ${hp(1.5)}px;
  text-align: center;
  font-weight: 500;
  padding-bottom: ${hp(2)}px;
`;

const Settings: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const onLogout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert(t("logout"), t("errorSigningOut"));
    }
  };

  const handleLogout = async (): Promise<void> => {
    // show confirm modal
    Alert.alert(t("confirm"), t("areYouSureLogout"), [
      {
        text: t("cancel"),
        onPress: () => console.log("Modal cancelled"),
        style: "cancel",
      },
      {
        text: t("logout"),
        onPress: () => onLogout(),
        style: "destructive",
      },
    ]);
  };

  const settingsOptions: SettingsOption[] = [
    {
      label: t("account"),
      icon: "arrowRight",
      action: () => router.push("/settings/accountSettings"),
    },
    {
      label: t("notifications"),
      icon: "arrowRight",
      action: () => router.push("/settings/notificationsSettings"),
    },
    {
      label: t("information"),
      icon: "arrowRight",
      action: () => router.push("/settings/informationSettings"),
    }
  ];

  return (
    <ScreenWrapper bg="white">
      <ScreenContainer>
        <Header title={t("settings")} />
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
            <ItemTextLogout>{t("logout")}</ItemTextLogout>
            <Icon name="logout" size={20} color={theme.colors.rose} />
          </Item>
        </Card>
        <WelcomeImage
          resizeMode="contain"
          source={require("../../../assets/images/welcome.png")}
        />
        <Title>{t("micioSocial")}</Title>
        <VersionText>{t("appVersion")} 1.0.0</VersionText>
      </ScreenContainer>
    </ScreenWrapper>
  );
};

export default Settings;

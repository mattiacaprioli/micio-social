import React, { useState } from "react";
import {
  Text,
  View,
  Alert,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import styled from "styled-components/native";
import ScreenWrapper from "../../../components/ScreenWrapper";
import Header from "../../../components/Header";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { wp, hp } from "../../../helpers/common";
import { theme } from "../../../constants/theme";
import { useTranslation } from 'react-i18next'; 

// Styled Components
const Container = styled.View`
  flex: 1;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
  background-color: white;
`;

const Form = styled.View`
  margin-top: ${hp(3)}px;
  padding-bottom: 20px;
  gap: ${hp(2)}px;
`;

const SectionTitle = styled.Text`
  font-size: ${hp(2)}px;
  font-weight: 600;
  color: ${theme.colors.textDark};
  margin-bottom: ${hp(1)}px;
`;

const SettingItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: ${hp(1)}px;
  padding-bottom: ${hp(1)}px;
`;

const SettingLabel = styled.Text`
  font-size: ${hp(2)}px;
  color: ${theme.colors.textDark};
`;

const LanguageButton = styled.TouchableOpacity`
  padding-top: ${hp(0.5)}px;
  padding-bottom: ${hp(0.5)}px;
  padding-left: ${wp(2)}px;
  padding-right: ${wp(2)}px;
  background-color: ${theme.colors.primary};
  border-radius: ${theme.radius.sm}px;
`;

const LanguageText = styled.Text`
  color: white;
  font-size: ${hp(1.8)}px;
`;

const AccountSettings = () => {
  const [personalInfo, setPersonalInfo] = useState({ name: "", email: "" });
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [language, setLanguage] = useState("English");
  const { i18n, t } = useTranslation();

  const handleUpdatePersonalInfo = () => {
    if (!personalInfo.name || !personalInfo.email) {
      Alert.alert(
        "Error",
        "All fields are required to update personal information."
      );
      return;
    }
    console.log("Updated personal information:", personalInfo);
    Alert.alert("Success", "Personal information updated successfully!");
  };

  const handleChangePassword = () => {
    if (!password.current || !password.new || !password.confirm) {
      Alert.alert("Error", "All fields are required to change password.");
      return;
    }
    if (password.new !== password.confirm) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    console.log("Password changed successfully.");
    Alert.alert("Success", "Password updated successfully!");
  };

  const handleDeactivateAccount = () => {
    Alert.alert(
      "Deactivate Account",
      "Are you sure you want to deactivate your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          onPress: () => console.log("Account deactivated"),
          style: "destructive",
        },
      ]
    );
  };

  const toggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
    Alert.alert(
      "Theme Changed",
      `Theme set to ${!isDarkTheme ? "Dark" : "Light"}`
    );
  };

  const toggleLanguage = () => {
    const newLanguage = language === "English" ? "Italian" : "English";
    setLanguage(newLanguage);
    const newLanguageCode = newLanguage === "English" ? "en" : "it";
    i18n.changeLanguage(newLanguageCode); // Change the language in i18next
    Alert.alert(t("languageChanged"), `${t("languageSetTo")} ${newLanguage}`);
  };

  return (
    <ScreenWrapper bg="white">
      <ScrollView style={{ flex: 1 }}>
        <Container>
          <Header title={t("accountSettings")} />

          <Form>
            <SectionTitle>{t("updatePersonalInfo")}</SectionTitle>
            <Input
              placeholder={t("email")}
              value={personalInfo.email}
              onChangeText={(text) =>
                setPersonalInfo({ ...personalInfo, email: text })
              }
            />
            <Button
              title={t("updateInformation")}
              loading={loading}
              onPress={handleUpdatePersonalInfo}
            />
          </Form>

          <Form>
            <SectionTitle>{t("changePassword")}</SectionTitle>
            <Input
              placeholder={t("currentPassword")}
              secureTextEntry
              value={password.current}
              onChangeText={(text) =>
                setPassword({ ...password, current: text })
              }
            />
            <Input
              placeholder={t("newPassword")}
              secureTextEntry
              value={password.new}
              onChangeText={(text) => setPassword({ ...password, new: text })}
            />
            <Input
              placeholder={t("confirmNewPassword")}
              secureTextEntry
              value={password.confirm}
              onChangeText={(text) =>
                setPassword({ ...password, confirm: text })
              }
            />
            <Button
              title={t("changePassword")}
              loading={loading}
              onPress={handleChangePassword}
            />
          </Form>

          <Form>
            <SectionTitle>{t("appSettings")}</SectionTitle>
            <SettingItem>
              <SettingLabel>{t("darkTheme")}</SettingLabel>
              <Switch
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor={
                  isDarkTheme ? theme.colors.primary : theme.colors.textLight
                }
                onValueChange={toggleTheme}
                value={isDarkTheme}
              />
            </SettingItem>
            <SettingItem>
              <SettingLabel>{t("language")}</SettingLabel>
              <LanguageButton
                onPress={toggleLanguage}
              >
                <LanguageText>{language}</LanguageText>
              </LanguageButton>
            </SettingItem>
          </Form>

          <Form>
            <SectionTitle>{t("deactivateAccount")}</SectionTitle>
            <Button
              title={t("deactivateAccount")}
              danger
              onPress={handleDeactivateAccount}
            />
          </Form>
        </Container>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default AccountSettings;

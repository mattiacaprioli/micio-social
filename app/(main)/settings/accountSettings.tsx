import React, { useState, useEffect } from "react";
import {
  Alert,
  Switch,
  ScrollView,
} from "react-native";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import ThemeWrapper from "../../../components/ThemeWrapper";
import Header from "../../../components/Header";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { wp, hp } from "../../../helpers/common";
import { useTheme } from "../../../context/ThemeContext";
import { useTranslation } from 'react-i18next';

// Interfaces for types
interface PersonalInfo {
  name: string;
  email: string;
}

interface PasswordData {
  current: string;
  new: string;
  confirm: string;
}

// Styled Components
const Container = styled.View`
  flex: 1;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
  background-color: ${props => props.theme.colors.background};
`;

const Form = styled.View`
  margin-top: ${hp(3)}px;
  padding-bottom: 20px;
  gap: ${hp(2)}px;
`;

const SectionTitle = styled.Text`
  font-size: ${hp(2)}px;
  font-weight: 600;
  color: ${props => props.theme.colors.textDark};
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
  color: ${props => props.theme.colors.textDark};
`;

const LanguageButton = styled.TouchableOpacity`
  padding-top: ${hp(0.5)}px;
  padding-bottom: ${hp(0.5)}px;
  padding-left: ${wp(2)}px;
  padding-right: ${wp(2)}px;
  background-color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.radius.sm}px;
`;

const LanguageText = styled.Text`
  color: white;
  font-size: ${hp(1.8)}px;
`;

const AccountSettings: React.FC = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({ name: "", email: "" });
  const [password, setPassword] = useState<PasswordData>({
    current: "",
    new: "",
    confirm: "",
  });
  const [loading] = useState<boolean>(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { i18n, t } = useTranslation();
  const [language, setLanguage] = useState<string>(i18n.language === 'en' ? 'English' : 'Italian'); // Initialize based on current language
  const theme = useStyledTheme();

  // Add this useEffect for debugging
  useEffect(() => {
    console.log('Current language:', i18n.language);
    console.log('Available translations:', i18n.store.data);
  }, []);

  const handleUpdatePersonalInfo = (): void => {
    if (!personalInfo.name || !personalInfo.email) {
      Alert.alert(
        t("error"),
        t("allFieldsRequired")
      );
      return;
    }
    console.log("Updated personal information:", personalInfo);
    Alert.alert(t("success"), t("personalInfoUpdated"));
  };

  const handleChangePassword = (): void => {
    if (!password.current || !password.new || !password.confirm) {
      Alert.alert(t("error"), t("allFieldsRequired"));
      return;
    }
    if (password.new !== password.confirm) {
      Alert.alert(t("error"), t("passwordsDoNotMatch"));
      return;
    }
    console.log("Password changed successfully.");
    Alert.alert(t("success"), t("passwordUpdated"));
  };

  const handleDeactivateAccount = (): void => {
    Alert.alert(
      t("deactivateAccount"),
      t("deactivateAccountConfirm"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("deactivate"),
          onPress: () => console.log("Account deactivated"),
          style: "destructive",
        },
      ]
    );
  };

  const handleToggleTheme = (): void => {
    toggleTheme();
    Alert.alert(
      t("themeChanged"),
      `${t("themeSetTo")} ${!isDarkMode ? t("dark") : t("light")}`
    );
  };

  const toggleLanguage = (): void => {
    const newLanguage = language === "English" ? "Italian" : "English";
    const newLanguageCode = newLanguage === "English" ? "en" : "it";
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguageCode);
    Alert.alert(t("languageChanged"), `${t("languageSetTo")} ${newLanguage}`);
    console.log('Language changed to:', newLanguageCode); // For debugging
  };

  return (
    <ThemeWrapper>
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
                  false: theme.colors.dark,
                  true: theme.colors.primary,
                }}
                thumbColor={
                  isDarkMode ? theme.colors.primary : theme.colors.textLight
                }
                onValueChange={handleToggleTheme}
                value={isDarkMode}
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
              buttonStyle={{ backgroundColor: theme.colors.rose }}
              onPress={handleDeactivateAccount}
            />
          </Form>
        </Container>
      </ScrollView>
    </ThemeWrapper>
  );
};

export default AccountSettings;

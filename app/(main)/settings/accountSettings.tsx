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

// Interfacce per i tipi
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
  const [language, setLanguage] = useState<string>('Italiano');
  const theme = useStyledTheme();

  const handleUpdatePersonalInfo = (): void => {
    if (!personalInfo.name || !personalInfo.email) {
      Alert.alert(
        "Errore",
        "Tutti i campi sono obbligatori"
      );
      return;
    }
    console.log("Updated personal information:", personalInfo);
    Alert.alert("Successo", "Informazioni personali aggiornate");
  };

  const handleChangePassword = (): void => {
    if (!password.current || !password.new || !password.confirm) {
      Alert.alert("Errore", "Tutti i campi sono obbligatori");
      return;
    }
    if (password.new !== password.confirm) {
      Alert.alert("Errore", "Le password non corrispondono");
      return;
    }
    console.log("Password changed successfully.");
    Alert.alert("Successo", "Password aggiornata");
  };

  const handleDeactivateAccount = (): void => {
    Alert.alert(
      "Confirm",
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

  const handleToggleTheme = (): void => {
    toggleTheme();
    Alert.alert(
      "Theme Changed",
      `Theme set to ${!isDarkMode ? "dark" : "light"}`
    );
  };

  const toggleLanguage = (): void => {
    const newLanguage = language === "English" ? "Italiano" : "English";
    setLanguage(newLanguage);
    Alert.alert("Language Changed", `Language set to ${newLanguage}`);
    console.log('Language changed to:', newLanguage);
  };

  return (
    <ThemeWrapper>
      <ScrollView style={{ flex: 1 }}>
        <Container>
          <Header title="Account Settings" />

          <Form>
            <SectionTitle>Update Personal Information</SectionTitle>
            <Input
              placeholder="Email"
              value={personalInfo.email}
              onChangeText={(text) =>
                setPersonalInfo({ ...personalInfo, email: text })
              }
            />
            <Button
              title="Update Information"
              loading={loading}
              onPress={handleUpdatePersonalInfo}
            />
          </Form>

          <Form>
            <SectionTitle>Change Password</SectionTitle>
            <Input
              placeholder="Current Password"
              secureTextEntry
              value={password.current}
              onChangeText={(text) =>
                setPassword({ ...password, current: text })
              }
            />
            <Input
              placeholder="New Password"
              secureTextEntry
              value={password.new}
              onChangeText={(text) => setPassword({ ...password, new: text })}
            />
            <Input
              placeholder="Confirm New Password"
              secureTextEntry
              value={password.confirm}
              onChangeText={(text) =>
                setPassword({ ...password, confirm: text })
              }
            />
            <Button
              title="Change Password"
              loading={loading}
              onPress={handleChangePassword}
            />
          </Form>

          <Form>
            <SectionTitle>App Settings</SectionTitle>
            <SettingItem>
              <SettingLabel>Dark Theme</SettingLabel>
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
            {/* TODO: fix change language */}
            {/* <SettingItem>
              <SettingLabel>Language</SettingLabel>
              <LanguageButton
                onPress={toggleLanguage}
              >
                <LanguageText>{language}</LanguageText>
              </LanguageButton>
            </SettingItem> */}
          </Form>

          <Form>
            <SectionTitle>Deactivate Account</SectionTitle>
            <Button
              title="Deactivate Account"
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

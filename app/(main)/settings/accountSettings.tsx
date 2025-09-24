import React, { useState, useEffect } from "react";
import {
  Switch,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import ThemeWrapper from "../../../components/ThemeWrapper";
import Header from "../../../components/Header";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Icon from "../../../assets/icons";
import { wp, hp } from "../../../helpers/common";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";
import {
  changePassword,
  validatePasswordStrength,
} from "../../../services/authService";
import { supabase } from "../../../lib/supabase";
import PrimaryModal from "../../../components/PrimaryModal";
import { useModal } from "../../../hooks/useModal";

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

const Container = styled.View`
  flex: 1;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
  background-color: ${(props) => props.theme.colors.background};
  padding-top: ${hp(6)}px;
`;

const Form = styled.View`
  margin-top: ${hp(3)}px;
  padding-bottom: 20px;
  gap: ${hp(2)}px;
`;

const SectionTitle = styled.Text`
  font-size: ${hp(2)}px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textDark};
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
  font-size: ${hp(1.5)}px;
  color: ${(props) => props.theme.colors.textDark};
`;

const LanguageButton = styled.TouchableOpacity`
  padding-top: ${hp(0.5)}px;
  padding-bottom: ${hp(0.5)}px;
  padding-left: ${wp(2)}px;
  padding-right: ${wp(2)}px;
  background-color: ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.radius.sm}px;
`;

const LanguageText = styled.Text`
  color: white;
  font-size: ${hp(1.8)}px;
`;

const AccountSettings: React.FC = () => {
  const { user } = useAuth();
  const { modalRef, showError, showSuccess, showConfirm } = useModal();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    email: "",
  });
  const [password, setPassword] = useState<PasswordData>({
    current: "",
    new: "",
    confirm: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const [language, setLanguage] = useState<string>("Italiano");
  const [showCurrentPassword, setShowCurrentPassword] =
    useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const theme = useStyledTheme();

  const handleUpdatePersonalInfo = (): void => {
    if (!personalInfo.name || !personalInfo.email) {
      showError("All fields are required", "Error");
      return;
    }
    console.log("Updated personal information:", personalInfo);
    showSuccess("Personal information updated", "Success");
  };

  const handleChangePassword = async (): Promise<void> => {
    if (!password.current || !password.new || !password.confirm) {
      showError("All fields are required", "Error");
      return;
    }

    if (password.new !== password.confirm) {
      showError("Passwords do not match", "Error");
      return;
    }

    if (!user?.email) {
      showError("User not authenticated", "Error");
      return;
    }

    const passwordValidation = validatePasswordStrength(password.new);
    if (!passwordValidation.isValid) {
      showError(
        passwordValidation.message ||
          "Password does not meet security requirements",
        "Invalid Password"
      );
      return;
    }

    if (password.current === password.new) {
      showError(
        "New password must be different from current password",
        "Error"
      );
      return;
    }

    setLoading(true);

    try {
      const result = await changePassword({
        currentPassword: password.current,
        newPassword: password.new,
        email: user.email,
      });

      setLoading(false);

      if (result.success) {
        setPassword({
          current: "",
          new: "",
          confirm: "",
        });

        showSuccess(
          "Password changed successfully. For security reasons, you will be logged out and need to sign in again.",
          "Password Updated",
          handleLogoutAfterPasswordChange
        );
      } else {
        showError(result.msg || "Error changing password", "Error");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error changing password:", error);
      showError("An unexpected error occurred", "Error");
    }
  };

  const handleLogoutAfterPasswordChange = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        showError("Error during logout", "Error");
      }
    } catch (error) {
      console.error("Logout error:", error);
      showError("Error during logout", "Error");
    }
  };

  const handleDeactivateAccount = (): void => {
    showConfirm(
      "Are you sure you want to deactivate your account? This action cannot be undone.",
      () => console.log("Account deactivated")
    );
  };

  const handleToggleTheme = (): void => {
    toggleTheme();
    showSuccess(
      `Theme set to ${!isDarkMode ? "dark" : "light"}`,
      "Theme Changed"
    );
  };

  const toggleLanguage = (): void => {
    const newLanguage = language === "English" ? "Italiano" : "English";
    setLanguage(newLanguage);
    showSuccess(`Language set to ${newLanguage}`, "Language Changed");
    console.log("Language changed to:", newLanguage);
  };

  return (
    <ThemeWrapper>
      <View style={{ flex: 1 }}>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
        >
          <Header title="Account Settings" />
        </View>
        <ScrollView style={{ flex: 1 }}>
          <Container>
            {/* <Form>
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
            </Form> */}

            <Form>
              <SectionTitle>Change Password</SectionTitle>
              <Input
                placeholder="Current Password"
                secureTextEntry={!showCurrentPassword}
                value={password.current}
                onChangeText={(text) =>
                  setPassword({ ...password, current: text })
                }
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    <Icon
                      name={showCurrentPassword ? "eyeOff" : "eye"}
                      size={22}
                      color={theme.colors.textLight}
                    />
                  </TouchableOpacity>
                }
              />
              <Input
                placeholder="New Password"
                secureTextEntry={!showNewPassword}
                value={password.new}
                onChangeText={(text) => setPassword({ ...password, new: text })}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Icon
                      name={showNewPassword ? "eyeOff" : "eye"}
                      size={22}
                      color={theme.colors.textLight}
                    />
                  </TouchableOpacity>
                }
              />
              <Input
                placeholder="Confirm New Password"
                secureTextEntry={!showConfirmPassword}
                value={password.confirm}
                onChangeText={(text) =>
                  setPassword({ ...password, confirm: text })
                }
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Icon
                      name={showConfirmPassword ? "eyeOff" : "eye"}
                      size={22}
                      color={theme.colors.textLight}
                    />
                  </TouchableOpacity>
                }
              />
              {password.new.length > 0 && (
                <View
                  style={{
                    marginTop: 10,
                    padding: 10,
                    backgroundColor: theme.colors.gray,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: theme.colors.textDark,
                      marginBottom: 5,
                    }}
                  >
                    Password requirements:
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: validatePasswordStrength(password.new).isValid
                        ? theme.colors.primary
                        : theme.colors.rose,
                    }}
                  >
                    {validatePasswordStrength(password.new).isValid
                      ? "✓ Valid password"
                      : validatePasswordStrength(password.new).message}
                  </Text>
                </View>
              )}
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
      </View>
      
      <PrimaryModal
        ref={modalRef}
      />
    </ThemeWrapper>
  );
};

export default AccountSettings;

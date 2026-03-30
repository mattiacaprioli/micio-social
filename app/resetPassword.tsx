import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import styled from "styled-components/native";
import AuthWrapper from "../components/AuthWrapper";
import { StatusBar } from "expo-status-bar";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import Input from "../components/Input";
import Button from "../components/Button";
import Icon from "../assets/icons/index";
import {
  validatePasswordStrength,
  PasswordStrengthResult,
} from "../services/authService";
import { supabase } from "../lib/supabase";
import PrimaryModal from "../components/PrimaryModal";
import { useModal } from "../hooks/useModal";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Container = styled.View`
  flex: 1;
  gap: 45px;
  padding-left: ${wp(5)}px;
  padding-right: ${wp(5)}px;
`;

const TitleText = styled.Text`
  font-size: ${hp(4)}px;
  font-weight: ${theme.fonts.bold};
  color: ${theme.colors.text};
`;

const SubtitleText = styled.Text`
  font-size: ${hp(1.8)}px;
  color: ${theme.colors.textLight};
  margin-top: ${hp(1)}px;
  line-height: ${hp(2.8)}px;
`;

const FormContainer = styled.View`
  gap: 20px;
`;

const PasswordCard = styled.View`
  background-color: #f5f5f5;
  border-radius: ${theme.radius.lg}px;
  padding: ${hp(2)}px;
  gap: ${hp(1.5)}px;
`;

const StrengthBarContainer = styled.View`
  flex-direction: row;
  gap: ${wp(1)}px;
  margin-top: ${hp(0.5)}px;
`;

const StrengthBarSegment = styled.View<{ $active: boolean; $color: string }>`
  flex: 1;
  height: ${hp(0.5)}px;
  border-radius: ${hp(0.25)}px;
  background-color: ${(props) => (props.$active ? props.$color : "#e3e3e3")};
`;

const StrengthLabel = styled.Text<{ $color: string }>`
  font-size: ${hp(1.4)}px;
  font-weight: 600;
  color: ${(props) => props.$color};
  margin-top: ${hp(0.3)}px;
`;

const RequirementRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${wp(2)}px;
  padding-top: ${hp(0.3)}px;
  padding-bottom: ${hp(0.3)}px;
`;

const RequirementText = styled.Text<{ $passed: boolean }>`
  font-size: ${hp(1.5)}px;
  color: ${(props) => (props.$passed ? "#22c55e" : "#7C7C7C")};
`;

const MatchIndicator = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${wp(1.5)}px;
`;

const MatchText = styled.Text<{ $matches: boolean }>`
  font-size: ${hp(1.5)}px;
  font-weight: 600;
  color: ${(props) => (props.$matches ? "#22c55e" : "#ef4444")};
`;

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState<string>("");
  const [confirm, setConfirm] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [passwordValidation, setPasswordValidation] =
    useState<PasswordStrengthResult | null>(null);
  const { modalRef, showError, showSuccess } = useModal();

  useEffect(() => {
    if (password.length > 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setPasswordValidation(validatePasswordStrength(password));
    } else {
      setPasswordValidation(null);
    }
  }, [password]);

  const passwordsMatch = confirm.length > 0 && password === confirm;

  const canSubmit =
    passwordValidation?.isValid === true && passwordsMatch;

  const getStrengthColor = (strength: string): string => {
    switch (strength) {
      case "weak": return theme.colors.rose;
      case "fair": return theme.colors.primary;
      case "strong": return "#f59e0b";
      case "very_strong": return "#22c55e";
      default: return "#e3e3e3";
    }
  };

  const getStrengthLabel = (strength: string): string => {
    switch (strength) {
      case "weak": return "Weak";
      case "fair": return "Fair";
      case "strong": return "Strong";
      case "very_strong": return "Very Strong";
      default: return "";
    }
  };

  const getActiveSegments = (strength: string): number => {
    switch (strength) {
      case "weak": return 1;
      case "fair": return 2;
      case "strong": return 3;
      case "very_strong": return 4;
      default: return 0;
    }
  };

  const onSubmit = async (): Promise<void> => {
    if (!canSubmit) {
      showError("Please fill all fields correctly", "Error");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      showError(error.message, "Error");
      return;
    }

    showSuccess(
      "Your password has been reset successfully. Please sign in with your new password.",
      "Password Reset!",
      async () => {
        await supabase.auth.signOut();
      }
    );
  };

  return (
    <AuthWrapper>
      <StatusBar style="dark" />
      <Container>
        <View>
          <TitleText>Set New</TitleText>
          <TitleText>Password</TitleText>
          <SubtitleText>
            Choose a strong password for your account.
          </SubtitleText>
        </View>

        <FormContainer>
          <PasswordCard>
            <Input
              icon={<Icon name="lock" size={hp(2.5)} color={theme.colors.textLight} />}
              placeholder="New Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              forceLightMode={true}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    name={showPassword ? "eyeOff" : "eye"}
                    size={hp(2.2)}
                    color={theme.colors.textLight}
                  />
                </TouchableOpacity>
              }
            />

            {passwordValidation && (
              <View>
                <StrengthBarContainer>
                  {[1, 2, 3, 4].map((segment) => (
                    <StrengthBarSegment
                      key={segment}
                      $active={
                        segment <=
                        getActiveSegments(passwordValidation.strength)
                      }
                      $color={getStrengthColor(passwordValidation.strength)}
                    />
                  ))}
                </StrengthBarContainer>
                <StrengthLabel
                  $color={getStrengthColor(passwordValidation.strength)}
                >
                  {getStrengthLabel(passwordValidation.strength)}
                </StrengthLabel>

                {passwordValidation.rules.map((rule) => (
                  <RequirementRow key={rule.key}>
                    <Icon
                      name={rule.passed ? "checkCircle" : "xCircle"}
                      size={hp(1.8)}
                      color={rule.passed ? "#22c55e" : theme.colors.rose}
                    />
                    <RequirementText $passed={rule.passed}>
                      {rule.label}
                    </RequirementText>
                  </RequirementRow>
                ))}
              </View>
            )}

            <Input
              icon={<Icon name="lock" size={hp(2.5)} color={theme.colors.textLight} />}
              placeholder="Confirm New Password"
              secureTextEntry={!showConfirm}
              value={confirm}
              onChangeText={setConfirm}
              forceLightMode={true}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Icon
                    name={showConfirm ? "eyeOff" : "eye"}
                    size={hp(2.2)}
                    color={theme.colors.textLight}
                  />
                </TouchableOpacity>
              }
            />

            {confirm.length > 0 && (
              <MatchIndicator>
                <Icon
                  name={passwordsMatch ? "checkCircle" : "alertCircle"}
                  size={hp(1.8)}
                  color={passwordsMatch ? "#22c55e" : theme.colors.rose}
                />
                <MatchText $matches={passwordsMatch}>
                  {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                </MatchText>
              </MatchIndicator>
            )}
          </PasswordCard>

          <Button
            title="Reset Password"
            loading={loading}
            onPress={onSubmit}
            disabled={!canSubmit}
            hasShadow={canSubmit}
          />
        </FormContainer>
      </Container>

      <PrimaryModal ref={modalRef} forceLight />
    </AuthWrapper>
  );
};

export default ResetPassword;

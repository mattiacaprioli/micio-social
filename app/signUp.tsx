import { Pressable, Text, View, TouchableOpacity } from "react-native";
import React, { useRef, useState } from "react";
import styled from "styled-components/native";
import AuthWrapper from "../components/AuthWrapper";
import { StatusBar } from "expo-status-bar";
import BackButton from "../components/BackButton";
import { useRouter } from "expo-router";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import Input from "../components/Input";
import Button from "../components/Button";
import Icon from "../assets/icons/index";
import { supabase } from "../lib/supabase";
import { validatePasswordStrength, signInWithGoogle } from "../services/authService";
import PrimaryModal from "../components/PrimaryModal";
import { useModal } from "../hooks/useModal";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

// Styled Components
const Container = styled.View`
  flex: 1;
  gap: 45px;
  padding-left: ${wp(5)}px;
  padding-right: ${wp(5)}px;
`;

const WelcomeText = styled.Text`
  font-size: ${hp(4)}px;
  font-weight: ${theme.fonts.bold};
  color: ${theme.colors.text};
`;

const FormContainer = styled.View`
  gap: 25px;
`;

const FormHelperText = styled.Text`
  font-size: ${hp(1.5)}px;
  color: ${theme.colors.text};
`;

const FooterContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 5px;
`;

const FooterText = styled.Text`
  text-align: center;
  color: ${theme.colors.text};
  font-size: ${hp(1.6)}px;
`;

const LoginLink = styled(FooterText)`
  color: ${theme.colors.primaryDark};
  font-weight: ${theme.fonts.semibold};
`;

const DividerRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

const DividerLine = styled.View`
  flex: 1;
  height: 1px;
  background-color: ${theme.colors.gray};
`;

const DividerText = styled.Text`
  font-size: ${hp(1.5)}px;
  color: ${theme.colors.textLight};
`;

const GoogleButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-width: 1px;
  border-color: ${theme.colors.gray};
  border-radius: ${theme.radius.xl}px;
  padding: ${hp(1.5)}px ${wp(4)}px;
  background-color: #ffffff;
`;

const GoogleButtonText = styled.Text`
  font-size: ${hp(1.8)}px;
  color: ${theme.colors.text};
  font-weight: ${theme.fonts.semibold};
`;

const SignUp: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const emailRef = useRef<string>("");
  const nameRef = useRef<string>("");
  const passwordRef = useRef<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const { modalRef, showError } = useModal();

  const onGoogleSignIn = async (): Promise<void> => {
    setLoading(true);
    const res = await signInWithGoogle();
    setLoading(false);
    if (!res.success) {
      showError(res.msg ?? t('googleSignInFailed'), t('signUp'));
    }
  };

  const onSubmit = async (): Promise<void> => {
    if (!emailRef.current || !passwordRef.current || !nameRef.current) {
      showError(t('pleaseFillAllFields'), t('signUp'));
      return;
    }

    let name = nameRef.current.trim();
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      const firstFailing = passwordValidation.rules.find((r) => !r.passed);
      showError(
        firstFailing?.label || t('passwordNotSecure'),
        t('signUp')
      );
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    setLoading(false);

    if (error) {
      showError(error.message, t('signUp'));
    }
  };

  return (
    <AuthWrapper>
      <StatusBar style="dark" />
      <Container>
        <BackButton router={router} />

        {/* Welcome */}
        <View>
          <WelcomeText>{t('lets')}</WelcomeText>
          <WelcomeText>{t('getStartedExclamation')}</WelcomeText>
        </View>

        {/* Form */}
        <FormContainer>
          <FormHelperText>
            {t('pleaseFillDetails')}
          </FormHelperText>
          <Input
            icon={<Icon name="user" size={26} />}
            placeholder={t('enterYourName')}
            onChangeText={(value) => (nameRef.current = value)}
            forceLightMode={true}
          />
          <Input
            icon={<Icon name="mail" size={26} />}
            placeholder={t('enterYourEmail')}
            onChangeText={(value) => (emailRef.current = value)}
            forceLightMode={true}
          />
          <Input
            icon={<Icon name="lock" size={26} />}
            placeholder={t('enterYourPassword')}
            secureTextEntry={!showPassword}
            onChangeText={(value) => {
              passwordRef.current = value;
              setPassword(value);
            }}
            forceLightMode={true}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? "eyeOff" : "eye"}
                  size={22}
                  color={theme.colors.textLight}
                />
              </TouchableOpacity>
            }
          />

          {/* Password Requirements */}
          {password.length > 0 && (
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
                  color: theme.colors.text,
                  marginBottom: 5,
                }}
              >
                {t('passwordRequirements')}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: validatePasswordStrength(password).isValid
                    ? theme.colors.primary
                    : theme.colors.rose,
                }}
              >
                {validatePasswordStrength(password).isValid
                  ? `✓ ${t('validPassword')}`
                  : validatePasswordStrength(password).rules.find((r) => !r.passed)?.label}
              </Text>
            </View>
          )}

          {/* Button */}
          <Button title={t('signUp')} loading={loading} onPress={onSubmit} />

          {/* Divider */}
          <DividerRow>
            <DividerLine />
            <DividerText>{t('or')}</DividerText>
            <DividerLine />
          </DividerRow>

          {/* Google Sign In */}
          <GoogleButton onPress={onGoogleSignIn} disabled={loading}>
            <AntDesign name="google" size={20} color="#EA4335" />
            <GoogleButtonText>{t('continueWithGoogle')}</GoogleButtonText>
          </GoogleButton>
        </FormContainer>

        {/* Footer */}
        <FooterContainer>
          <FooterText>{t('alreadyHaveAccount')}</FooterText>
          <Pressable onPress={() => router.push("/login" as any)}>
            <LoginLink>{t('login')}</LoginLink>
          </Pressable>
        </FooterContainer>
      </Container>

      <PrimaryModal ref={modalRef} forceLight />
    </AuthWrapper>
  );
};

export default SignUp;

import { Alert, Pressable, View } from "react-native";
import React, { useRef, useState } from "react";
import styled from "styled-components/native";
import ScreenWrapper from "../components/ScreenWrapper";
import { StatusBar } from "expo-status-bar";
import BackButton from "../components/BackButton";
import { useRouter } from "expo-router";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import Input from "../components/Input";
import Button from "../components/Button";
import Icon from "../assets/icons/index";
import { supabase } from "../lib/supabase";
import { useTranslation } from 'react-i18next';

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

const ForgotPasswordText = styled.Text`
  color: ${theme.colors.text};
  font-weight: ${theme.fonts.semibold};
  text-align: right;
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

const SignUpLink = styled(FooterText)`
  color: ${theme.colors.primaryDark};
  font-weight: ${theme.fonts.semibold};
`;

const Login: React.FC = () => {
  const router = useRouter();
  const emailRef = useRef<string>("");
  const passwordRef = useRef<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();

  const onSubmit = async (): Promise<void> => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert(t("login"), t("pleaseFillAllFields"));
      return;
    }

    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    setLoading(false);

    if (error) {
      Alert.alert(t("login"), error.message);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <Container>
        <BackButton router={router} />

        {/* Welcome */}
        <View>
          <WelcomeText>{t('hey')},</WelcomeText>
          <WelcomeText>{t('welcomeBack')}</WelcomeText>
        </View>

        {/* Form */}
        <FormContainer>
          <FormHelperText>
            {t('pleaseLoginToContinue')}
          </FormHelperText>
          <Input
            icon={<Icon name="mail" size={26} />}
            placeholder={t('enterYourEmail')}
            onChangeText={(value) => (emailRef.current = value)}
          />
          <Input
            icon={<Icon name="lock" size={26} />}
            placeholder={t('enterYourPassword')}
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
          />
          <ForgotPasswordText>{t('forgotPassword')}</ForgotPasswordText>

          {/* Login Button */}
          <Button title={t('login')} loading={loading} onPress={onSubmit} />
        </FormContainer>

        {/* Footer */}
        <FooterContainer>
          <FooterText>{t('dontHaveAccount')}</FooterText>
          <Pressable onPress={() => router.push("/(auth)/signUp" as any)}>
            <SignUpLink>{t('signUp')}</SignUpLink>
          </Pressable>
        </FooterContainer>
      </Container>
    </ScreenWrapper>
  );
};

export default Login;

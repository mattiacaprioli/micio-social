import { Alert, Pressable, Text, View, TouchableOpacity } from "react-native";
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

const SignUp: React.FC = () => {
  const router = useRouter();
  const emailRef = useRef<string>("");
  const nameRef = useRef<string>("");
  const passwordRef = useRef<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { t } = useTranslation();

  const onSubmit = async (): Promise<void> => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert(t("signUp"), t("pleaseFillAllFields"));
      return;
    }
    let name = nameRef.current.trim();
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

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
      Alert.alert(t("signUp"), error.message);
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
          <WelcomeText>{t('getStarted')}</WelcomeText>
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
            onChangeText={(value) => (passwordRef.current = value)}
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

          {/* Button */}
          <Button title={t('signUp')} loading={loading} onPress={onSubmit} />
        </FormContainer>

        {/* Footer */}
        <FooterContainer>
          <FooterText>{t('alreadyHaveAccount')}</FooterText>
          <Pressable onPress={() => router.push("/login" as any)}>
            <LoginLink>{t('login')}</LoginLink>
          </Pressable>
        </FooterContainer>
      </Container>
    </AuthWrapper>
  );
};

export default SignUp;

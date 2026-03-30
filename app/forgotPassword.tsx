import React, { useRef, useState } from "react";
import { View } from "react-native";
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
import { sendPasswordResetEmail } from "../services/authService";
import PrimaryModal from "../components/PrimaryModal";
import { useModal } from "../hooks/useModal";

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
  gap: 25px;
`;

const SuccessCard = styled.View`
  background-color: #f0fdf4;
  border-radius: ${theme.radius.lg}px;
  padding: ${hp(3)}px ${wp(5)}px;
  align-items: center;
  gap: ${hp(2)}px;
`;

const SuccessTitle = styled.Text`
  font-size: ${hp(2.2)}px;
  font-weight: ${theme.fonts.bold};
  color: #15803d;
  text-align: center;
`;

const SuccessMessage = styled.Text`
  font-size: ${hp(1.7)}px;
  color: #166534;
  text-align: center;
  line-height: ${hp(2.8)}px;
`;

const BackToLoginText = styled.Text`
  color: ${theme.colors.primaryDark};
  font-weight: ${theme.fonts.semibold};
  font-size: ${hp(1.7)}px;
  text-align: center;
`;

const ForgotPassword: React.FC = () => {
  const router = useRouter();
  const emailRef = useRef<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  const { modalRef, showError } = useModal();

  const onSubmit = async (): Promise<void> => {
    const email = emailRef.current.trim();
    if (!email) {
      showError("Please enter your email address", "Missing Email");
      return;
    }

    setLoading(true);
    const result = await sendPasswordResetEmail(email);
    setLoading(false);

    if (!result.success) {
      showError(result.msg ?? "Failed to send reset email", "Error");
      return;
    }

    setSent(true);
  };

  return (
    <AuthWrapper>
      <StatusBar style="dark" />
      <Container>
        <BackButton router={router} />

        <View>
          <TitleText>Forgot</TitleText>
          <TitleText>Password?</TitleText>
          <SubtitleText>
            Enter your email address and we'll send you a link to reset your
            password.
          </SubtitleText>
        </View>

        {sent ? (
          <SuccessCard>
            <Icon name="mail" size={hp(5)} color="#22c55e" />
            <SuccessTitle>Email Sent!</SuccessTitle>
            <SuccessMessage>
              Check your inbox and tap the link in the email to reset your
              password.
            </SuccessMessage>
            <BackToLoginText onPress={() => router.back()}>
              Back to Login
            </BackToLoginText>
          </SuccessCard>
        ) : (
          <FormContainer>
            <Input
              icon={<Icon name="mail" size={26} />}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(value) => (emailRef.current = value)}
              forceLightMode={true}
            />
            <Button
              title="Send Reset Link"
              loading={loading}
              onPress={onSubmit}
            />
          </FormContainer>
        )}
      </Container>

      <PrimaryModal ref={modalRef} forceLight />
    </AuthWrapper>
  );
};

export default ForgotPassword;

import { Alert, Pressable, Text, View } from "react-native";
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


const SignUp = () => {
  const router = useRouter();
  const emailRef = useRef(null);
  const nameRef = useRef(null);
  const passwordRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Sign Up", "Please fill all fields!");
      return;
    }
    let name = nameRef.current.trim();
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);

    const { data: {session}, error} = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          name 
        } 
      }
    });
    setLoading(false);

    // console.log('session: ', session);
    // console.log('error: ', error);
    if (error) {
      Alert.alert("Sign Up", error.message);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <Container>
        <BackButton router={router} />

        {/* Welcome */}
        <View>
          <WelcomeText>Let's</WelcomeText>
          <WelcomeText>Get Started</WelcomeText>
        </View>

        {/* Form */}
        <FormContainer>
          <FormHelperText>
            Please fill the details to create an account
          </FormHelperText>
          <Input
            icon={<Icon name="user" size={26} />}
            placeholder="Enter your name"
            onChangeText={(value) => (nameRef.current = value)}
          />
          <Input
            icon={<Icon name="mail" size={26} />}
            placeholder="Enter your email"
            onChangeText={(value) => (emailRef.current = value)}
          />
          <Input
            icon={<Icon name="lock" size={26} />}
            placeholder="Enter your password"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
          />

          {/* Button */}
          <Button title="Sign up" loading={loading} onPress={onSubmit} />
        </FormContainer>

        {/* Footer */}
        <FooterContainer>
          <FooterText>Already have an account?</FooterText>
          <Pressable onPress={() => router.push("login")}>
            <LoginLink>Login</LoginLink>
          </Pressable>
        </FooterContainer>
      </Container>
    </ScreenWrapper>
  );
};

export default SignUp;


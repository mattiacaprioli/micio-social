import { View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import styled from 'styled-components/native'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import { hp, wp } from '../helpers/common'
import { theme } from '../constants/theme'
import Button from '../components/Button'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Styled Components
const Container = styled.View`
  flex: 1;
  justify-content: space-around;
  align-items: center;
  background-color: white;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
`;

const WelcomeImage = styled.Image`
  width: ${hp(30)}px;
  height: ${wp(100)}px;
  align-self: center;
`;

const Title = styled.Text`
  color: ${theme.colors.text};
  font-size: ${hp(4)}px;
  text-align: center;
  font-weight: ${theme.fonts.extraBold};
`;

const Punchline = styled.Text`
  color: ${theme.colors.text};
  font-size: ${hp(1.7)}px;
  text-align: center;
  padding-left: ${wp(10)}px;
  padding-right: ${wp(10)}px;
`;

const Footer = styled.View`
  gap: 30px;
  width: 100%;
`;

const BottomTextContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 5px;
`;

const LoginText = styled.Text`
  color: ${theme.colors.text};
  text-align: center;
  font-size: ${hp(1.6)}px;
`;

const LoginLink = styled(LoginText)`
  color: ${theme.colors.primaryDark};
  font-weight: ${theme.fonts.semibold};
`;


const Welcome = () => {
  const router = useRouter();
  const { t } = useTranslation(); // Get the t function
  
  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <Container>
        {/* Welcome image */}
        <WelcomeImage resizeMode='contain' source={require('../assets/images/welcome.png')} />
      
        {/* title */}
        <View style={{gap: 20}}>
          <Title>{t('micioSocial')}</Title>
          <Punchline>
            {t('welcomePunchline')}
          </Punchline>
        </View>

        {/* footer */}
        <Footer>
          <Button
            title={t('getStarted')}
            buttonStyle={{marginHorizontal: wp(3)}}
            onPress={() => router.push('signUp')}
          />
          <BottomTextContainer>
            <LoginText>
              {t('alreadyHaveAccount')}
            </LoginText>
            <Pressable onPress={() => router.push('login')}>
              <LoginLink>
                Login
              </LoginLink>
            </Pressable>
          </BottomTextContainer>
        </Footer>
      </Container>
    </ScreenWrapper>
  )
}

export default Welcome

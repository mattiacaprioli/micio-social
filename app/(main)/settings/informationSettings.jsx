import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import styled from "styled-components/native";
import ScreenWrapper from "../../../components/ScreenWrapper";
import Header from "../../../components/Header";
import { wp, hp } from "../../../helpers/common";
import { theme } from "../../../constants/theme";
import { useTranslation } from 'react-i18next'; 

// Styled Components
const Container = styled.View`
  flex: 1;
  background-color: white;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
`;

const Card = styled.View`
  margin-top: ${hp(2)}px;
  background-color: ${theme.colors.darkLight};
  border-radius: ${theme.radius.xxl}px;
  padding-top: ${hp(1.5)}px;
  padding-bottom: ${hp(1.5)}px;
  padding-left: ${wp(2)}px;
  padding-right: ${wp(2)}px;
  border-width: 0.5px;
  border-color: ${theme.colors.border};
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.05;
  shadow-radius: 6px;
  elevation: 3;
  gap: ${hp(2)}px;
`;

const Item = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: ${hp(2)}px;
  padding-bottom: ${hp(2)}px;
  padding-left: ${wp(3)}px;
  padding-right: ${wp(3)}px;
  border-radius: ${theme.radius.lg}px;
  background-color: white;
  /* Shadow styles integrated */
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3px;
  elevation: 2;
`;

const ItemText = styled.Text`
  font-size: ${hp(2)}px;
  color: ${theme.colors.textDark};
  font-weight: 500;
`;

const Footer = styled.View`
  margin-top: ${hp(3)}px;
  align-items: center;
`;

const FooterText = styled.Text`
  font-size: ${hp(1.8)}px;
  color: ${theme.colors.textLight};
  font-weight: 400;
`;


const InformationSettings = () => {
  const { t } = useTranslation();

  const infoOptions = [
    { label: t("privacyPolicy"), action: () => console.log("Privacy Policy pressed") },
    { label: t("termsOfService"), action: () => console.log("Terms of Service pressed") },
    { label: t("support"), action: () => console.log("Support pressed") },
  ];

  return (
    <ScreenWrapper bg="white">
      <Container>
        <Header title={t("information")} />

        <Card>
          {infoOptions.map((option, index) => (
            <Item
              key={index}
              onPress={option.action}
            >
              <ItemText>{option.label}</ItemText>
            </Item>
          ))}
        </Card>

        <Footer>
          <FooterText>{t("micioSocial")}</FooterText>
          <FooterText>{t("appVersion")} 1.0.0</FooterText>
        </Footer>
      </Container>
    </ScreenWrapper>
  );
};

export default InformationSettings;

import React from "react";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import ThemeWrapper from "../../../components/ThemeWrapper";
import Header from "../../../components/Header";
import { wp, hp } from "../../../helpers/common";

// Interfacce per i tipi
interface InfoOption {
  label: string;
  action: () => void;
}

// Styled Components
const Container = styled.View`
  flex: 1;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
`;

const Card = styled.View`
  margin-top: ${hp(2)}px;
  background-color: ${props => props.theme.colors.darkLight};
  border-radius: ${props => props.theme.radius.xxl}px;
  padding-top: ${hp(1.5)}px;
  padding-bottom: ${hp(1.5)}px;
  padding-left: ${wp(2)}px;
  padding-right: ${wp(2)}px;
  border-width: 0.5px;
  border-color: ${props => props.theme.colors.dark};
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.05);
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
  border-radius: ${props => props.theme.radius.lg}px;
  background-color: ${props => props.theme.colors.background};
  /* Shadow styles integrated */
  box-shadow: 0px 2px 3px rgba(0, 0, 0, 0.1);
`;

const ItemText = styled.Text`
  font-size: ${hp(2)}px;
  color: ${props => props.theme.colors.textDark};
  font-weight: 500;
`;

const Footer = styled.View`
  margin-top: ${hp(3)}px;
  align-items: center;
`;

const FooterText = styled.Text`
  font-size: ${hp(1.8)}px;
  color: ${props => props.theme.colors.textLight};
  font-weight: 400;
`;

const InformationSettings: React.FC = () => {
  const theme = useStyledTheme();

  const infoOptions: InfoOption[] = [
    { label: "Privacy Policy", action: () => console.log("Privacy Policy pressed") },
    { label: "Termini di Servizio", action: () => console.log("Terms of Service pressed") },
    { label: "Supporto", action: () => console.log("Support pressed") },
  ];

  return (
    <ThemeWrapper>
      <Container>
        <Header title="Informazioni" />

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
          <FooterText>Micio Social</FooterText>
          <FooterText>Versione app: 1.0.0</FooterText>
        </Footer>
      </Container>
    </ThemeWrapper>
  );
};

export default InformationSettings;

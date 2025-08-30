import React from "react";
import styled from "styled-components/native";
import { hp, wp } from "../../helpers/common";
import Icon from "../../assets/icons";
import Button from "../Button";

interface EmptyPetsStateProps {
  onAddPet: () => void;
  title?: string;
  message?: string;
}

const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${hp(4)}px;
`;

const IconContainer = styled.View`
  width: ${hp(12)}px;
  height: ${hp(12)}px;
  border-radius: ${hp(6)}px;
  background-color: ${(props) => props.theme.colors.primary}20;
  align-items: center;
  justify-content: center;
  margin-bottom: ${hp(3)}px;
`;

const Title = styled.Text`
  font-size: ${hp(2.5)}px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textDark};
  text-align: center;
  margin-bottom: ${hp(1)}px;
`;

const Message = styled.Text`
  font-size: ${hp(1.8)}px;
  color: ${(props) => props.theme.colors.textLight};
  text-align: center;
  line-height: ${hp(2.5)}px;
  margin-bottom: ${hp(4)}px;
  padding: 0 ${wp(4)}px;
`;

const EmptyPetsState: React.FC<EmptyPetsStateProps> = ({ 
  onAddPet, 
  title = "Nessun gatto ancora",
  message = "Aggiungi il profilo del tuo primo gatto per iniziare a condividere i suoi momenti speciali!"
}) => {
  return (
    <Container>
      <IconContainer>
        <Icon 
          name="plus" 
          size={hp(4)} 
          strokeWidth={1.5}
        />
      </IconContainer>
      
      <Title>{title}</Title>
      <Message>{message}</Message>
      
      <Button
        title="Aggiungi il tuo primo gatto"
        onPress={onAddPet}
        buttonStyle={{ 
          paddingHorizontal: wp(5),
          paddingVertical: hp(1)
        }}
      />
    </Container>
  );
};

export default EmptyPetsState;

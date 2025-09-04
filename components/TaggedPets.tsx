import React from "react";
import { ScrollView } from "react-native";
import styled from "styled-components/native";
import { hp, wp } from "../helpers/common";
import Avatar from "./Avatar";
import Icon from "../assets/icons";

interface TaggedPet {
  id: string;
  name: string;
  image?: string;
}

interface TaggedPetsProps {
  pets: TaggedPet[];
  maxVisible?: number;
}

const Container = styled.View`
  margin-top: ${hp(0.8)}px;
  margin-bottom: ${hp(0.8)}px;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
  display: flex;
  flex-direction: row;
  gap: ${hp(0.5)}px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${wp(1)}px;
`;

const HeaderText = styled.Text`
  font-size: ${hp(1.3)}px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textLight};
`;

const PetsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${wp(1.5)}px;
  flex-wrap: wrap;
`;

const PetChip = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => props.theme.colors.gray + '20'};
  border-radius: ${hp(2)}px;
  padding-left: ${wp(0.5)}px;
  padding-right: ${wp(2.5)}px;
  padding-top: ${hp(0.3)}px;
  padding-bottom: ${hp(0.3)}px;
  border: 1px solid ${(props) => props.theme.colors.gray + '40'};
`;

const PetName = styled.Text`
  font-size: ${hp(1.3)}px;
  font-weight: 500;
  color: ${(props) => props.theme.colors.textDark};
  margin-left: ${wp(1.5)}px;
  max-width: ${wp(20)}px;
`;

const MorePetsChip = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => props.theme.colors.primary + '15'};
  border-radius: ${hp(2)}px;
  padding-left: ${wp(2)}px;
  padding-right: ${wp(2)}px;
  padding-top: ${hp(0.3)}px;
  padding-bottom: ${hp(0.3)}px;
  border: 1px solid ${(props) => props.theme.colors.primary + '30'};
`;

const MorePetsText = styled.Text`
  font-size: ${hp(1.2)}px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.primary};
`;

const TaggedPets: React.FC<TaggedPetsProps> = ({ pets, maxVisible = 4 }) => {
  if (!pets || pets.length === 0) {
    return null;
  }

  const visiblePets = pets.slice(0, maxVisible);
  const remainingCount = pets.length - maxVisible;

  return (
    <Container>
      <Header>
        <Icon name="catIcon" size={hp(1.4)} />
        <HeaderText>
          con {pets.length === 1 ? "" : `${pets.length} `}
          {pets.length === 1 ? pets[0].name : "gatti: "}
        </HeaderText>
      </Header>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: wp(4) }}
      >
        <PetsContainer>
          {visiblePets.map((pet) => (
            <PetChip key={pet.id}>
              <Avatar
                uri={pet.image}
                size={hp(2.2)}
                rounded={hp(1.1)}
              />
              <PetName numberOfLines={1}>
                {pet.name}
              </PetName>
            </PetChip>
          ))}

          {remainingCount > 0 && (
            <MorePetsChip>
              <MorePetsText>+{remainingCount} altri</MorePetsText>
            </MorePetsChip>
          )}
        </PetsContainer>
      </ScrollView>
    </Container>
  );
};

export default TaggedPets;

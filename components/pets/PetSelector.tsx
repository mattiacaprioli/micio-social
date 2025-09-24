import React, { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import styled from "styled-components/native";
import { hp, wp } from "../../helpers/common";
import { Pet } from "../../services/types";
import { getUserPets } from "../../services/petService";
import Icon from "../../assets/icons";
import Avatar from "../Avatar";
import { useAuth } from "../../context/AuthContext";
import PrimaryModal from "../PrimaryModal";
import { useModal } from "../../hooks/useModal";

interface PetSelectorProps {
  selectedPetIds: string[];
  onSelectionChange: (petIds: string[]) => void;
  maxSelections?: number;
}

const Container = styled.View`
  margin-bottom: ${hp(2)}px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${wp(2)}px;
  margin-bottom: ${hp(1.5)}px;
`;

const Title = styled.Text`
  font-size: ${hp(1.8)}px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textDark};
`;

const SubTitle = styled.Text`
  font-size: ${hp(1.4)}px;
  color: ${(props) => props.theme.colors.textLight};
  margin-left: auto;
`;

const PetsScrollView = styled.ScrollView`
  max-height: ${hp(10)}px;
`;

const PetItem = styled.TouchableOpacity<{ selected: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: ${wp(3)}px;
  padding: ${hp(1)}px ${wp(2)}px;
  border-radius: ${(props) => props.theme.radius.lg}px;
  border: 1px solid ${(props) => 
    props.selected 
      ? props.theme.colors.primary 
      : props.theme.colors.gray + '40'
  };
  background-color: ${(props) => 
    props.selected 
      ? props.theme.colors.primary + '10' 
      : 'transparent'
  };
  margin-right: ${wp(2)}px;
  margin-bottom: ${hp(1)}px;
`;

const PetInfo = styled.View`
  flex: 1;
`;

const PetName = styled.Text`
  font-size: ${hp(1.6)}px;
  font-weight: 500;
  color: ${(props) => props.theme.colors.textDark};
`;

const PetBreed = styled.Text`
  font-size: ${hp(1.3)}px;
  color: ${(props) => props.theme.colors.textLight};
  margin-top: ${hp(0.2)}px;
`;

const CheckIcon = styled.View<{ selected: boolean }>`
  width: ${hp(2.5)}px;
  height: ${hp(2.5)}px;
  border-radius: ${hp(1.25)}px;
  border: 2px solid ${(props) => props.theme.colors.primary};
  background-color: ${(props) => 
    props.selected ? props.theme.colors.primary : 'transparent'
  };
  align-items: center;
  justify-content: center;
`;

const NoPetsText = styled.Text`
  font-size: ${hp(1.6)}px;
  color: ${(props) => props.theme.colors.textLight};
  text-align: center;
  padding: ${hp(2)}px;
`;

const AddPetButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${wp(2)}px;
  padding: ${hp(1.5)}px ${wp(4)}px;
  border: 1px dashed ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.radius.lg}px;
  margin-top: ${hp(1)}px;
`;

const AddPetText = styled.Text`
  color: ${(props) => props.theme.colors.primary};
  font-size: ${hp(1.5)}px;
  font-weight: 500;
`;

const PetSelector: React.FC<PetSelectorProps> = ({
  selectedPetIds,
  onSelectionChange,
  maxSelections = 5
}) => {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const { modalRef, showError } = useModal();

  useEffect(() => {
    loadUserPets();
  }, [user?.id]);

  const loadUserPets = async () => {
    if (!user?.id) return;

    try {
      const result = await getUserPets(user.id);
      if (result.success) {
        setPets(result.data || []);
      } else {
        console.error("Error loading pets:", result.msg);
      }
    } catch (error) {
      console.error("Error loading pets:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePetSelection = (petId: string) => {
    const isSelected = selectedPetIds.includes(petId);
    
    if (isSelected) {
      onSelectionChange(selectedPetIds.filter(id => id !== petId));
    } else {
      if (selectedPetIds.length < maxSelections) {
        onSelectionChange([...selectedPetIds, petId]);
      } else {
        showError(
          `Puoi taggare al massimo ${maxSelections} gatti per post`,
          "Limite raggiunto"
        );
      }
    }
  };

  if (loading) {
    return null;
  }

  if (pets.length === 0) {
    return null;
  }

  return (
    <Container>
      <Header>
        <Icon name="catIcon" size={hp(2)} />
        <Title>Tagga i tuoi gatti</Title>
         {selectedPetIds.length > 0 && (
          <View style={{ 
            backgroundColor: '#10B981', 
            paddingHorizontal: wp(2), 
            paddingVertical: hp(0.3),
            borderRadius: 10,
            marginLeft: wp(2)
          }}>
            <Title style={{ 
              color: 'white', 
              fontSize: hp(1.3) 
            }}>
              {selectedPetIds.length}
            </Title>
          </View>
        )}
        <SubTitle>(opzionale)</SubTitle>
      </Header>

      <View>
        {pets.map((pet) => {
          const isSelected = selectedPetIds.includes(pet.id);
          
          return (
            <PetItem
              key={pet.id}
              selected={isSelected}
              onPress={() => togglePetSelection(pet.id)}
            >
              <Avatar 
                uri={pet.image}
                size={hp(4)}
                rounded={10}
              />
              
              <PetInfo>
                <PetName>{pet.name}</PetName>
                {pet.breed && <PetBreed>{pet.breed}</PetBreed>}
              </PetInfo>

              <CheckIcon selected={isSelected}>
                {isSelected && (
                  <Icon 
                    name="check" 
                    size={hp(1.2)} 
                    color="white" 
                  />
                )}
              </CheckIcon>
            </PetItem>
          );
        })}
      </View>
      
      <PrimaryModal
        ref={modalRef}
      />
    </Container>
  );
};

export default PetSelector;

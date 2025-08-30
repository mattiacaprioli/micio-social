import {
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import React from "react";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { hp, wp } from "../../helpers/common";
import Avatar from "../Avatar";
import Icon from "../../assets/icons";
import { Image } from "expo-image";
import { getSupabaseFileUrl } from "../../services/imageService";
import { useTheme } from "../../context/ThemeContext";
import { Pet } from "../../services/types";
import moment from "moment";

interface PetCardProps {
  pet: Pet;
  onEdit?: (pet: Pet) => void;
  onDelete?: (pet: Pet) => void;
  onPress?: (pet: Pet) => void;
  showActions?: boolean;
}

const Container = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.radius.xl}px;
  padding: ${hp(2)}px;
  margin: ${hp(1)}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 3;
  border: 1px solid ${(props) => props.theme.colors.gray}20;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${hp(1.5)}px;
`;

const PetInfo = styled.View`
  flex: 1;
  margin-left: ${wp(3)}px;
`;

const PetName = styled.Text`
  font-size: ${hp(2.2)}px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textDark};
  margin-bottom: ${hp(0.5)}px;
`;

const PetDetails = styled.Text`
  font-size: ${hp(1.6)}px;
  color: ${(props) => props.theme.colors.textLight};
  margin-bottom: ${hp(0.3)}px;
`;

const PetBio = styled.Text`
  font-size: ${hp(1.5)}px;
  color: ${(props) => props.theme.colors.textLight};
  margin-top: ${hp(1)}px;
  line-height: ${hp(2)}px;
`;

const ActionsContainer = styled.View`
  flex-direction: row;
  gap: ${wp(2)}px;
`;

const ActionButton = styled.TouchableOpacity<{ variant?: 'edit' | 'delete' }>`
  padding: ${hp(0.8)}px;
  border-radius: ${(props) => props.theme.radius.md}px;
  background-color: ${(props) => 
    props.variant === 'delete' 
      ? props.theme.colors.rose + '20' 
      : props.theme.colors.primary + '20'
  };
`;

const AgeContainer = styled.View`
  position: absolute;
  top: ${hp(1)}px;
  right: ${hp(1)}px;
  background-color: ${(props) => props.theme.colors.primary}90;
  padding: ${hp(0.5)}px ${wp(2)}px;
  border-radius: ${(props) => props.theme.radius.lg}px;
`;

const AgeText = styled.Text`
  color: white;
  font-size: ${hp(1.3)}px;
  font-weight: 600;
`;

const GenderIcon = styled.View<{ gender?: string }>`
  width: ${hp(2.5)}px;
  height: ${hp(2.5)}px;
  border-radius: ${hp(1.25)}px;
  background-color: ${(props) => 
    props.gender === 'male' 
      ? '#4A90E2' 
      : props.gender === 'female' 
        ? '#E24A90' 
        : props.theme.colors.gray
  };
  align-items: center;
  justify-content: center;
`;

const ImageContainer = styled.View`
  position: relative;
`;

const PetCard: React.FC<PetCardProps> = ({ 
  pet, 
  onEdit, 
  onDelete, 
  onPress, 
  showActions = true 
}) => {
  const theme = useStyledTheme();
  const { isDarkMode } = useTheme();

  const handleDelete = () => {
    Alert.alert(
      "Elimina profilo",
      `Sei sicuro di voler eliminare il profilo di ${pet.name}?`,
      [
        { text: "Annulla", style: "cancel" },
        { 
          text: "Elimina", 
          style: "destructive",
          onPress: () => onDelete?.(pet)
        },
      ]
    );
  };

  const calculateAge = () => {
    if (pet.age) {
      return `${pet.age} ann${pet.age === 1 ? 'o' : 'i'}`;
    }
    if (pet.birthDate) {
      const age = moment().diff(moment(pet.birthDate), 'years');
      return `${age} ann${age === 1 ? 'o' : 'i'}`;
    }
    return null;
  };

  const formatDetails = () => {
    const details = [];
    if (pet.breed) details.push(pet.breed);
    if (pet.gender && pet.gender !== 'unknown') {
      details.push(pet.gender === 'male' ? 'Maschio' : 'Femmina');
    }
    if (pet.weight) details.push(`${pet.weight} kg`);
    
    return details.join(' • ');
  };

  const imageSource = pet.image 
    ? { uri: getSupabaseFileUrl(pet.image) }
    : require("../../assets/images/defaultUser.png");

  return (
    <Container onPress={() => onPress?.(pet)} activeOpacity={0.8}>
      <Header>
        <ImageContainer>
          <Avatar 
            uri={pet.image}
            size={hp(6)}
            rounded={theme.radius.xl}
            isDarkMode={isDarkMode}
          />
          {calculateAge() && (
            <AgeContainer>
              <AgeText>{calculateAge()}</AgeText>
            </AgeContainer>
          )}
        </ImageContainer>
        
        <PetInfo>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: wp(1) }}>
            <PetName numberOfLines={1}>{pet.name}</PetName>
            {pet.gender && pet.gender !== 'unknown' && (
              <GenderIcon gender={pet.gender}>
                <Icon 
                  name={pet.gender === 'male' ? 'user' : 'user'} 
                  size={hp(1.2)} 
                  color="white" 
                />
              </GenderIcon>
            )}
          </View>
          
          {formatDetails() && (
            <PetDetails numberOfLines={1}>{formatDetails()}</PetDetails>
          )}
          
          {pet.isNeutered && (
            <PetDetails style={{ color: theme.colors.primary }}>
              Sterilizzato{pet.gender === 'female' ? 'a' : ''}
            </PetDetails>
          )}
        </PetInfo>

        {showActions && (
          <ActionsContainer>
            {onEdit && (
              <ActionButton variant="edit" onPress={() => onEdit(pet)}>
                <Icon 
                  name="edit" 
                  size={hp(1.8)} 
                  color={theme.colors.primary} 
                />
              </ActionButton>
            )}
            {onDelete && (
              <ActionButton variant="delete" onPress={handleDelete}>
                <Icon 
                  name="delete" 
                  size={hp(1.8)} 
                  color={theme.colors.rose} 
                />
              </ActionButton>
            )}
          </ActionsContainer>
        )}
      </Header>

      {pet.bio && (
        <PetBio numberOfLines={3}>{pet.bio}</PetBio>
      )}
    </Container>
  );
};

export default PetCard;

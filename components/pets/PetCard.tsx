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
import { getUserImageSrc } from "../../services/imageService";
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
  background-color: ${props => props.theme.colors.background};
  border-radius: ${wp(3)}px;
  margin: ${hp(1)}px ${wp(2)}px;
  shadow-color: #000;
  shadow-offset: 0px 6px;
  shadow-opacity: 0.12;
  shadow-radius: 16px;
  elevation: 12;
  overflow: hidden;
  border: 1px solid ${(props) => props.theme.colors.cardBorder}30;
  transform: scale(1);
`;

const ImageSection = styled.View`
  position: relative;
  height: ${hp(22)}px;
  background-color: ${(props) => props.theme.colors.primary}20;
  overflow: hidden;
`;

const PetImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const QuickActions = styled.View`
  position: absolute;
  top: ${hp(1)}px;
  right: ${wp(2)}px;
  flex-direction: row;
  gap: ${wp(1)}px;
`;

const QuickActionButton = styled.TouchableOpacity<{ variant?: 'edit' | 'delete' }>`
  width: ${hp(4)}px;
  height: ${hp(4)}px;
  border-radius: ${hp(2)}px;
  background-color: ${(props) => 
    props.variant === 'delete' 
      ? 'rgba(239, 68, 68, 0.9)' 
      : 'rgba(59, 130, 246, 0.9)'
  };
  align-items: center;
  justify-content: center;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.25;
  shadow-radius: 4px;
  elevation: 4;
`;

const ContentSection = styled.View`
  padding: ${hp(2)}px ${wp(4)}px ${hp(2.5)}px;
  background-color: ${props => props.theme.colors.background};
`;

const MainInfo = styled.View`
  margin-bottom: ${hp(1.5)}px;
`;

const PetName = styled.Text`
  font-size: ${hp(2.6)}px;
  font-weight: 800;
  color: ${(props) => props.theme.colors.textDark};
  margin-bottom: ${hp(1)}px;
  letter-spacing: 0.3px;
`;

const InfoBadges = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${wp(2)}px;
`;

const InfoBadge = styled.View<{ color?: string }>`
  background-color: ${(props) => props.color || props.theme.colors.primary}12;
  padding: ${hp(0.6)}px ${wp(3)}px;
  border-radius: ${wp(2)}px;
  border: 1.5px solid ${(props) => props.color || props.theme.colors.primary}25;
`;

const BadgeText = styled.Text<{ color?: string }>`
  color: ${(props) => props.color || props.theme.colors.primary};
  font-size: ${hp(1.4)}px;
  font-weight: 700;
  letter-spacing: 0.2px;
`;

const GenderBadge = styled.View<{ gender?: string }>`
  flex-direction: row;
  align-items: center;
  background-color: ${(props) => 
    props.gender === 'male' 
      ? '#3B82F615' 
      : props.gender === 'female' 
        ? '#EC489815' 
        : props.theme.colors.gray + '15'
  };
  padding: ${hp(0.4)}px ${wp(2)}px;
  border-radius: ${(props) => props.theme.radius.xs}px;
  border: 1px solid ${(props) => 
    props.gender === 'male' 
      ? '#3B82F630' 
      : props.gender === 'female' 
        ? '#EC489830' 
        : props.theme.colors.gray + '30'
  };
  gap: ${wp(1)}px;
`;

const GenderText = styled.Text<{ gender?: string }>`
  color: ${(props) => 
    props.gender === 'male' 
      ? '#3B82F6' 
      : props.gender === 'female' 
        ? '#EC4899' 
        : props.theme.colors.textLight
  };
  font-size: ${hp(1.3)}px;
  font-weight: 600;
`;

const BioBadge = styled.View`
  background-color: ${(props) => props.theme.colors.primary}08;
  border-radius: ${wp(2)}px;
  padding: ${hp(1.2)}px ${wp(3.5)}px;
  margin-top: ${hp(1.5)}px;
  border: 1px solid ${(props) => props.theme.colors.primary}15;
  position: relative;
`;

const BioText = styled.Text`
  font-size: ${hp(1.5)}px;
  color: ${(props) => props.theme.colors.textLight};
  line-height: ${hp(2.3)}px;
  font-style: italic;
  font-weight: 500;
`;

const AgeIndicator = styled.View`
  position: absolute;
  top: ${hp(1.5)}px;
  left: ${wp(3)}px;
  background-color: rgba(0, 0, 0, 0.8);
  padding: ${hp(0.7)}px ${wp(3)}px;
  border-radius: ${wp(4)}px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const AgeText = styled.Text`
  color: #FFFFFF;
  font-size: ${hp(1.4)}px;
  font-weight: 800;
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

  const getGenderIcon = () => {
    return pet.gender === 'male' ? 'user' : 'user';
  };

  const getGenderColor = () => {
    return pet.gender === 'male' ? '#3B82F6' : '#EC4899';
  };

  return (
    <Container onPress={() => onPress?.(pet)} activeOpacity={0.95}>
      {/* Sezione Immagine */}
      <ImageSection>
        <PetImage
          source={getUserImageSrc(pet.image)}
          contentFit="cover"
          transition={300}
        />

        {/* Age Indicator */}
        {calculateAge() && (
          <AgeIndicator>
            <AgeText>{calculateAge()}</AgeText>
          </AgeIndicator>
        )}

        {/* Quick Actions */}
        {showActions && (
          <QuickActions>
            {onEdit && (
              <QuickActionButton variant="edit" onPress={() => onEdit(pet)}>
                <Icon name="edit" size={hp(1.8)} color="white" />
              </QuickActionButton>
            )}
            {onDelete && (
              <QuickActionButton variant="delete" onPress={handleDelete}>
                <Icon name="delete" size={hp(1.8)} color="white" />
              </QuickActionButton>
            )}
          </QuickActions>
        )}
      </ImageSection>

      {/* Sezione Contenuto */}
      <ContentSection>
        <MainInfo>
          <PetName numberOfLines={1}>{pet.name}</PetName>
          
          <InfoBadges>
            {/* Genere */}
            {pet.gender && pet.gender !== 'unknown' && (
              <GenderBadge gender={pet.gender}>
                <Icon 
                  name={getGenderIcon()} 
                  size={hp(1.2)} 
                  color={getGenderColor()} 
                />
                <GenderText gender={pet.gender}>
                  {pet.gender === 'male' ? 'Maschio' : 'Femmina'}
                </GenderText>
              </GenderBadge>
            )}

            {/* Razza */}
            {pet.breed && (
              <InfoBadge>
                <BadgeText>{pet.breed}</BadgeText>
              </InfoBadge>
            )}

            {/* Peso */}
            {pet.weight && (
              <InfoBadge color="#06D6A0">
                <BadgeText color="#06D6A0">{pet.weight} kg</BadgeText>
              </InfoBadge>
            )}

            {/* Sterilizzato */}
            {pet.isNeutered && (
              <InfoBadge color="#F72585">
                <BadgeText color="#F72585">
                  Sterilizzat{pet.gender === 'female' ? 'a' : 'o'}
                </BadgeText>
              </InfoBadge>
            )}
          </InfoBadges>
        </MainInfo>

        {/* Bio */}
        {pet.bio && (
          <BioBadge>
            <BioText numberOfLines={2}>{pet.bio}</BioText>
          </BioBadge>
        )}
      </ContentSection>
    </Container>
  );
};

export default PetCard;

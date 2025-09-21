import {
  Alert,
} from "react-native";
import React from "react";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { hp, wp } from "../../helpers/common";
import Icon from "../../assets/icons";
import { Image } from "expo-image";
import { getUserImageSrc } from "../../services/imageService";
import { Pet } from "../../services/types";
import moment from "moment";

interface PetCardProps {
  pet: Pet;
  onEdit?: (pet: Pet) => void;
  onDelete?: (pet: Pet) => void;
  onPress?: (pet: Pet) => void;
  showActions?: boolean;
}

// Minimal variant components
const Container = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.background};
  border-radius: ${wp(5)}px;
  margin: ${hp(0.5)}px ${wp(1.5)}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.05;
  shadow-radius: 4px;
  elevation: 3;
  overflow: hidden;
  border: 1px solid ${(props) => props.theme.colors.cardBorder}15;
  padding: ${hp(2)}px;
  flex-direction: row;
  align-items: center;
  min-height: ${hp(8)}px;
`;

const Avatar = styled.View`
  width: ${hp(6)}px;
  height: ${hp(6)}px;
  border-radius: ${hp(3)}px;
  overflow: hidden;
  background-color: ${(props) => props.theme.colors.primary}20;
  margin-right: ${wp(3)}px;
`;

const PetImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const Info = styled.View`
  flex: 1;
`;

const PetName = styled.Text`
  font-size: ${hp(1.9)}px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textDark};
  margin-bottom: ${hp(0.3)}px;
`;

const Subtitle = styled.Text`
  font-size: ${hp(1.4)}px;
  color: ${(props) => props.theme.colors.textLight};
  font-weight: 500;
`;

const Actions = styled.View`
  flex-direction: row;
  gap: ${wp(1.5)}px;
`;

const ActionButton = styled.TouchableOpacity<{ variant?: 'edit' | 'delete' }>`
  width: ${hp(3.5)}px;
  height: ${hp(3.5)}px;
  border-radius: ${hp(1.75)}px;
  background-color: ${(props) =>
    props.variant === 'delete'
      ? props.theme.colors.rose + '20'
      : props.theme.colors.primary + '20'
  };
  align-items: center;
  justify-content: center;
  border: 1px solid ${(props) =>
    props.variant === 'delete'
      ? props.theme.colors.rose + '40'
      : props.theme.colors.primary + '40'
  };
`;



const PetCard: React.FC<PetCardProps> = ({
  pet,
  onEdit,
  onDelete,
  onPress,
  showActions = true
}) => {
  const theme = useStyledTheme();

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

  return (
    <Container onPress={() => onPress?.(pet)} activeOpacity={0.95}>
      <Avatar>
        <PetImage
          source={getUserImageSrc(pet.image)}
          contentFit="cover"
          transition={300}
        />
      </Avatar>

      <Info>
        <PetName numberOfLines={1}>{pet.name}</PetName>
        <Subtitle numberOfLines={1}>
          {[
            pet.breed,
            pet.gender && pet.gender !== 'unknown' ? (pet.gender === 'male' ? 'Maschio' : 'Femmina') : null,
            calculateAge()
          ].filter(Boolean).join(' • ')}
        </Subtitle>
      </Info>

      {showActions && (
        <Actions>
          {onEdit && (
            <ActionButton variant="edit" onPress={() => onEdit(pet)}>
              <Icon name="edit" size={hp(1.6)} color={theme.colors.primary} />
            </ActionButton>
          )}
          {onDelete && (
            <ActionButton variant="delete" onPress={handleDelete}>
              <Icon name="delete" size={hp(1.6)} color={theme.colors.rose} />
            </ActionButton>
          )}
        </Actions>
      )}
    </Container>
  );
};

export default PetCard;

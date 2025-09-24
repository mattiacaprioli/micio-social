import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import ThemeWrapper from "../../../components/ThemeWrapper";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../components/Header";
import Loading from "../../../components/Loading";
import Avatar from "../../../components/Avatar";
import Icon from "../../../assets/icons";
import { getPetById, deletePet } from "../../../services/petService";
import { Pet } from "../../../services/types";
import { hp, wp } from "../../../helpers/common";
import { useTheme } from "../../../context/ThemeContext";
import moment from "moment";
import PrimaryModal from "../../../components/PrimaryModal";
import { useModal } from "../../../hooks/useModal";

const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
`;

const ContentContainer = styled.ScrollView`
  flex: 1;
  padding: ${hp(2)}px;
`;

const ProfileSection = styled.View`
  align-items: center;
  padding: ${hp(3)}px;
  background-color: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.radius.xl}px;
  margin-bottom: ${hp(2)}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 3;
`;

const PetName = styled.Text`
  font-size: ${hp(3)}px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textDark};
  margin-top: ${hp(1.5)}px;
  margin-bottom: ${hp(0.5)}px;
`;

const PetSubtitle = styled.Text`
  margin-top: ${hp(1)}px;
  font-size: ${hp(1.8)}px;
  color: ${(props) => props.theme.colors.textLight};
  margin-bottom: ${hp(1)}px;
`;

const ActionsContainer = styled.View`
  flex-direction: row;
  gap: ${wp(4)}px;
  margin-top: ${hp(1)}px;
`;

const ActionButton = styled.TouchableOpacity<{ variant?: 'primary' | 'danger' }>`
  flex: 1;
  padding: ${hp(1.5)}px ${wp(6)}px;
  border-radius: ${(props) => props.theme.radius.lg}px;
  background-color: ${(props) => 
    props.variant === 'danger' 
      ? props.theme.colors.rose 
      : props.theme.colors.primary
  };
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: ${wp(2)}px;
`;

const ActionButtonText = styled.Text`
  color: white;
  font-weight: 600;
  font-size: ${hp(1.6)}px;
`;

const InfoSection = styled.View`
  background-color: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.radius.xl}px;
  padding: ${hp(2.5)}px;
  margin-bottom: ${hp(2)}px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 3;
`;

const SectionTitle = styled.Text`
  font-size: ${hp(2.2)}px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textDark};
  margin-bottom: ${hp(1.5)}px;
`;

const InfoRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${hp(1.2)}px;
  gap: ${wp(3)}px;
`;

const InfoIcon = styled.View`
  width: ${hp(2.5)}px;
  height: ${hp(2.5)}px;
  align-items: center;
  justify-content: center;
`;

const InfoText = styled.Text`
  flex: 1;
  font-size: ${hp(1.7)}px;
  color: ${(props) => props.theme.colors.textDark};
`;

const InfoLabel = styled.Text`
  font-size: ${hp(1.5)}px;
  color: ${(props) => props.theme.colors.textLight};
  font-weight: 500;
  margin-bottom: ${hp(0.5)}px;
`;

const BioText = styled.Text`
  font-size: ${hp(1.7)}px;
  color: ${(props) => props.theme.colors.textDark};
  line-height: ${hp(2.4)}px;
`;

const TagContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${wp(2)}px;
  margin-top: ${hp(1)}px;
  margin-bottom: ${hp(1)}px;
`;

const Tag = styled.View<{ color?: string }>`
  background-color: ${(props) => props.color || props.theme.colors.primary}20;
  padding: ${hp(0.5)}px ${wp(3)}px;
  border-radius: ${(props) => props.theme.radius.lg}px;
  border: 1px solid ${(props) => props.color || props.theme.colors.primary}40;
`;

const TagText = styled.Text<{ color?: string }>`
  font-size: ${hp(1.4)}px;
  font-weight: 500;
  color: ${(props) => props.color || props.theme.colors.primary};
`;

const PetDetails: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { modalRef, showError, showConfirm, showSuccess } = useModal();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const theme = useStyledTheme();
  const { isDarkMode } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState<Pet | null>(null);

  // Carica i dati del gatto
  useEffect(() => {
    const loadPet = async () => {
      if (!petId) {
        showError("ID gatto mancante", "Errore");
        router.back();
        return;
      }

      try {
        const result = await getPetById(petId);
        if (result.success && result.data) {
          setPet(result.data);
        } else {
          showError(result.msg || "Gatto non trovato", "Errore");
          router.back();
        }
      } catch (error) {
        console.error("Error loading pet:", error);
        showError("Errore nel caricamento del gatto", "Errore");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadPet();
  }, [petId]);

  const handleEdit = () => {
    if (pet) {
      router.push({
        pathname: "/(main)/pets/editPet",
        params: { petId: pet.id }
      });
    }
  };

  const handleDelete = () => {
    if (!pet) return;

    showConfirm(
      `Sei sicuro di voler eliminare il profilo di ${pet.name}? Questa azione non può essere annullata.`,
      confirmDelete,
      () => {},
      "Elimina profilo"
    );
  };

  const confirmDelete = async () => {
    if (!pet) return;

    try {
      const result = await deletePet(pet.id);
      if (result.success) {
        showSuccess(
          `Il profilo di ${pet.name} è stato eliminato.`,
          "Eliminato",
          () => router.back()
        );
      } else {
        showError(result.msg || "Errore nell'eliminazione", "Errore");
      }
    } catch (error) {
      console.error("Error deleting pet:", error);
      showError("Errore nell'eliminazione del gatto", "Errore");
    }
  };

  const calculateAge = () => {
    if (pet?.age) {
      return `${pet.age} ann${pet.age === 1 ? 'o' : 'i'}`;
    }
    if (pet?.birthDate) {
      const age = moment().diff(moment(pet.birthDate), 'years');
      return `${age} ann${age === 1 ? 'o' : 'i'}`;
    }
    return null;
  };

  const formatGender = (gender?: string) => {
    switch (gender) {
      case 'male': return 'Maschio';
      case 'female': return 'Femmina';
      case 'unknown': return 'Non specificato';
      default: return null;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return moment(dateString).format('DD/MM/YYYY');
  };

  // Loading state
  if (loading) {
    return (
      <ThemeWrapper>
        <View style={{ flex: 1 }}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
            <Header title="Dettagli Gatto" />
          </View>
          
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Loading />
          </View>
        </View>
      </ThemeWrapper>
    );
  }

  if (!pet) {
    return null;
  }

  return (
    <ThemeWrapper>
      <View style={{ flex: 1 }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
          <Header title={pet.name} />
        </View>

        <Container style={{ paddingBottom: 20, paddingTop: 40 }}>
          <ContentContainer showsVerticalScrollIndicator={false}>
            {/* Sezione Profilo */}
            <ProfileSection>
              <Avatar 
                uri={pet.image}
                size={hp(12)}
                rounded={theme.radius.xxl}
                isDarkMode={isDarkMode}
              />
              
              {(pet.breed || calculateAge()) && (
                <PetSubtitle>
                  {[pet.breed, calculateAge()].filter(Boolean).join(' • ')}
                </PetSubtitle>
              )}

              {/* Tags */}
              <TagContainer>
                {formatGender(pet.gender) && (
                  <Tag color={pet.gender === 'male' ? '#4A90E2' : pet.gender === 'female' ? '#E24A90' : theme.colors.gray}>
                    <TagText color={pet.gender === 'male' ? '#4A90E2' : pet.gender === 'female' ? '#E24A90' : theme.colors.gray}>
                      {formatGender(pet.gender)}
                    </TagText>
                  </Tag>
                )}
                
                {pet.isNeutered && (
                  <Tag color="#10B981">
                    <TagText color="#10B981">
                      Sterilizzato{pet.gender === 'female' ? 'a' : ''}
                    </TagText>
                  </Tag>
                )}
              </TagContainer>

              {/* Pulsanti azione */}
              <ActionsContainer>
                <ActionButton onPress={handleEdit}>
                  <Icon name="edit" size={hp(1.8)} color="white" />
                  <ActionButtonText>Modifica</ActionButtonText>
                </ActionButton>
                
                <ActionButton variant="danger" onPress={handleDelete}>
                  <Icon name="delete" size={hp(1.8)} color="white" />
                  <ActionButtonText>Elimina</ActionButtonText>
                </ActionButton>
              </ActionsContainer>
            </ProfileSection>

            {/* Informazioni Generali */}
            <InfoSection>
              <SectionTitle>Informazioni Generali</SectionTitle>
              
              {pet.weight && (
                <InfoRow>
                  <InfoIcon>
                    <Icon name="package" size={hp(1.8)} color={theme.colors.primary} />
                  </InfoIcon>
                  <View style={{ flex: 1 }}>
                    <InfoLabel>Peso</InfoLabel>
                    <InfoText>{pet.weight} kg</InfoText>
                  </View>
                </InfoRow>
              )}

              {pet.birthDate && (
                <InfoRow>
                  <InfoIcon>
                    <Icon name="clock" size={hp(1.8)} color={theme.colors.primary} />
                  </InfoIcon>
                  <View style={{ flex: 1 }}>
                    <InfoLabel>Data di nascita</InfoLabel>
                    <InfoText>{formatDate(pet.birthDate)}</InfoText>
                  </View>
                </InfoRow>
              )}

              <InfoRow>
                <InfoIcon>
                  <Icon name="clock" size={hp(1.8)} color={theme.colors.primary} />
                </InfoIcon>
                <View style={{ flex: 1 }}>
                  <InfoLabel>Aggiunto il</InfoLabel>
                  <InfoText>{formatDate(pet.createdAt)}</InfoText>
                </View>
              </InfoRow>
            </InfoSection>

            {/* Bio */}
            {pet.bio && (
              <InfoSection>
                <SectionTitle>Descrizione</SectionTitle>
                <BioText>{pet.bio}</BioText>
              </InfoSection>
            )}

            {/* Note Mediche */}
            {pet.medicalNotes && (
              <InfoSection>
                <SectionTitle>Note Mediche</SectionTitle>
                <BioText>{pet.medicalNotes}</BioText>
              </InfoSection>
            )}
          </ContentContainer>
        </Container>
      </View>
      
      <PrimaryModal
        ref={modalRef}
      />
    </ThemeWrapper>
  );
};

export default PetDetails;

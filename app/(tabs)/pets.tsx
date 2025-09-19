import React, { useEffect, useState, useCallback } from "react";
import { FlatList, RefreshControl, Alert, View, Text, ListRenderItem } from "react-native";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { useFocusEffect, useRouter } from "expo-router";
import ThemeWrapper from "../../components/ThemeWrapper";
import { useAuth } from "../../context/AuthContext";
import { wp, hp } from "../../helpers/common";
import Icon from "../../assets/icons";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import { usePathname } from "expo-router";
import { getUserPets, deletePet } from "../../services/petService";
import { Pet } from "../../services/types";
import PetCard from "../../components/pets/PetCard";
import EmptyPetsState from "../../components/pets/EmptyPetsState";
import { useTheme } from "../../context/ThemeContext";

const Container = styled.View`
  flex: 1;
  padding-top: ${hp(6)}px;
  background-color: ${(props) => props.theme.colors.background};
`;

const ContentContainer = styled.View`
  flex: 1;
`;

const HeaderWithButton = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${wp(4)}px;
  margin-bottom: ${hp(2)}px;
`;

const AddHeaderButton = styled.TouchableOpacity`
  padding: ${hp(0.5)}px ${wp(3)}px;
  border-radius: ${(props) => props.theme.radius.xs}px;
  background-color: ${(props) => props.theme.colors.primary};
  flex-direction: row;
  align-items: center;
  gap: ${wp(1)}px;
`;

const AddButtonText = styled.Text`
  color: white;
  font-weight: 600;
  font-size: ${hp(1.6)}px;
`;

const ListContainer = styled.View`
  flex: 1;
  padding: 0 ${wp(2)}px;
`;

const AddButton = styled.TouchableOpacity`
  position: absolute;
  bottom: 25px;
  right: 25px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: ${(props) => props.theme.colors.primary};
  justify-content: center;
  align-items: center;
  shadow-color: ${(props) => props.theme.colors.primary};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  elevation: 5;
`;

const Pets: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useStyledTheme();
  const { isDarkMode } = useTheme();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);

  // Carica i pets dell'utente
  const loadPets = async () => {
    if (!user?.id) return;

    try {
      const result = await getUserPets(user.id);
      if (result.success) {
        setPets(result.data || []);
      } else {
        Alert.alert("Errore", result.msg || "Errore nel caricamento dei gatti");
      }
    } catch (error) {
      console.error("Error loading pets:", error);
      Alert.alert("Errore", "Errore nel caricamento dei gatti");
    } finally {
      setLoading(false);
    }
  };

  // Refresh pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPets();
    setRefreshing(false);
  };

  // Gestione eliminazione pet
  const handleDeletePet = async (pet: Pet) => {
    try {
      const result = await deletePet(pet.id);
      if (result.success) {
        setPets(prev => prev.filter(p => p.id !== pet.id));
        Alert.alert("Successo", `${pet.name} è stato eliminato`);
      } else {
        Alert.alert("Errore", result.msg || "Errore nell'eliminazione");
      }
    } catch (error) {
      console.error("Error deleting pet:", error);
      Alert.alert("Errore", "Errore nell'eliminazione del gatto");
    }
  };

  // Navigazione alle schermate
  const navigateToAddPet = () => {
    router.push("/(main)/pets/addPet");
  };

  const navigateToEditPet = (pet: Pet) => {
    router.push({
      pathname: "/(main)/pets/editPet",
      params: { petId: pet.id }
    });
  };

  const navigateToPetDetails = (pet: Pet) => {
    router.push({
      pathname: "/(main)/pets/petDetails",
      params: { petId: pet.id }
    });
  };

  // Render item della FlatList
  const renderPetItem: ListRenderItem<Pet> = ({ item }) => (
    <PetCard
      pet={item}
      onEdit={navigateToEditPet}
      onDelete={handleDeletePet}
      onPress={navigateToPetDetails}
      showActions={true}
    />
  );

  // Carica pets quando il componente viene montato o torna in focus
  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [user?.id])
  );

  const rightButton = (
    <AddHeaderButton onPress={navigateToAddPet}>
      <Icon name="plus" size={hp(1.8)} color="white" />
      <AddButtonText>Add</AddButtonText>
    </AddHeaderButton>
  );

  // Loading iniziale
  if (loading) {
    return (
      <ThemeWrapper>
        <View style={{ flex: 1 }}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
            <Header title="I Miei Gatti" showBackButton={false} />
          </View>
          <Container theme={theme}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Loading />
            </View>
          </Container>
        </View>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <View style={{ flex: 1 }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
          <Header title="My cats" showBackButton={false} rightButton={rightButton} />
        </View>

        <Container theme={theme}>
          <ContentContainer>

            {/* Lista dei gatti o stato vuoto */}
            <ListContainer>
              {pets.length === 0 ? (
                <EmptyPetsState onAddPet={navigateToAddPet} />
              ) : (
                <FlatList
                  data={pets}
                  renderItem={renderPetItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={handleRefresh}
                      colors={[theme.colors.primary]}
                      tintColor={theme.colors.primary}
                    />
                  }
                  contentContainerStyle={{
                    paddingBottom: hp(10),
                  }}
                />
              )}
            </ListContainer>

          </ContentContainer>
        </Container>
      </View>
    </ThemeWrapper>
  );
};

export default Pets;

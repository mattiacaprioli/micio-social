import React, { useState } from "react";
import { View, Alert } from "react-native";
import { useRouter } from "expo-router";
import ThemeWrapper from "../../../components/ThemeWrapper";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../components/Header";
import PetForm from "../../../components/pets/PetForm";
import { createPet, uploadPetImage } from "../../../services/petService";
import { CreatePetData, UpdatePetData } from "../../../services/types";
import { uploadFile } from "../../../services/imageService";

const AddPet: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreatePetData | UpdatePetData) => {
    if (!user?.id) {
      Alert.alert("Errore", "Utente non trovato");
      return;
    }

    // Per AddPet, dovremmo sempre ricevere CreatePetData
    const petData = data as CreatePetData;

    setIsLoading(true);

    try {
      let finalPetData = { ...petData };

      // Se c'è un'immagine, la carichiamo prima
      if (petData.image && typeof petData.image === 'string' && petData.image.startsWith('file://')) {
        const uploadResult = await uploadFile("pets", petData.image, true);
        if (uploadResult.success) {
          finalPetData.image = uploadResult.data;
        } else {
          // Se l'upload fallisce, procediamo senza immagine
          finalPetData.image = undefined;
          Alert.alert("Avviso", "L'immagine non è stata caricata, ma il profilo è stato salvato");
        }
      }

      // Creiamo il profilo del gatto
      const result = await createPet(finalPetData);

      if (result.success) {
        Alert.alert(
          "Successo", 
          `Il profilo di ${petData.name} è stato creato!`,
          [
            {
              text: "OK",
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert("Errore", result.msg || "Errore nella creazione del profilo");
      }
    } catch (error) {
      console.error("Error creating pet:", error);
      Alert.alert("Errore", "Errore inaspettato nella creazione del profilo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ThemeWrapper>
      <View style={{ flex: 1 }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
          <Header title="Aggiungi Gatto" />
        </View>
        
        <View style={{ flex: 1, paddingTop: 80 }}>
          <PetForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            userId={user?.id}
          />
        </View>
      </View>
    </ThemeWrapper>
  );
};

export default AddPet;

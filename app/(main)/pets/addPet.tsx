import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import ThemeWrapper from "../../../components/ThemeWrapper";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../components/Header";
import PetForm from "../../../components/pets/PetForm";
import { createPet, uploadPetImage } from "../../../services/petService";
import { CreatePetData, UpdatePetData } from "../../../services/types";
import { uploadFile } from "../../../services/imageService";
import PrimaryModal from "../../../components/PrimaryModal";
import { useModal } from "../../../hooks/useModal";

const AddPet: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { modalRef, showError, showSuccess } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreatePetData | UpdatePetData) => {
    if (!user?.id) {
      showError("Utente non trovato", "Errore");
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
          showError("L'immagine non è stata caricata, ma il profilo è stato salvato", "Avviso");
        }
      }

      // Creiamo il profilo del gatto
      const result = await createPet(finalPetData);

      if (result.success) {
        showSuccess(
          `Il profilo di ${petData.name} è stato creato!`,
          "Successo",
          () => router.back()
        );
      } else {
        showError(result.msg || "Errore nella creazione del profilo", "Errore");
      }
    } catch (error) {
      console.error("Error creating pet:", error);
      showError("Errore inaspettato nella creazione del profilo", "Errore");
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
      
      <PrimaryModal ref={modalRef} />
    </ThemeWrapper>
  );
};

export default AddPet;

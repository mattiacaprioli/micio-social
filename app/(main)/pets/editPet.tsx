import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import ThemeWrapper from "../../../components/ThemeWrapper";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../components/Header";
import PetForm from "../../../components/pets/PetForm";
import Loading from "../../../components/Loading";
import { getPetById, updatePet } from "../../../services/petService";
import { CreatePetData, UpdatePetData, Pet } from "../../../services/types";
import { uploadFile } from "../../../services/imageService";
import PrimaryModal from "../../../components/PrimaryModal";
import { useModal } from "../../../hooks/useModal";

const EditPet: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { modalRef, showError, showSuccess } = useModal();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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
        setInitialLoading(false);
      }
    };

    loadPet();
  }, [petId]);

  const handleSubmit = async (data: CreatePetData | UpdatePetData) => {
    if (!petId) {
      showError("ID gatto mancante", "Errore");
      return;
    }

    setIsLoading(true);

    try {
      let finalData = { ...data } as UpdatePetData;

      // Se c'è una nuova immagine, la carichiamo prima
      if (data.image && typeof data.image === 'string' && data.image.startsWith('file://')) {
        const uploadResult = await uploadFile("pets", data.image, true);
        if (uploadResult.success) {
          finalData.image = uploadResult.data;
        } else {
          // Se l'upload fallisce, manteniamo l'immagine esistente
          delete finalData.image;
          showError("L'immagine non è stata aggiornata, ma le altre modifiche sono state salvate", "Avviso");
        }
      }

      // Aggiorniamo il profilo del gatto
      const result = await updatePet(petId, finalData);

      if (result.success) {
        showSuccess(
          "Il profilo è stato aggiornato!",
          "Successo",
          () => router.back()
        );
      } else {
        showError(result.msg || "Errore nell'aggiornamento del profilo", "Errore");
      }
    } catch (error) {
      console.error("Error updating pet:", error);
      showError("Errore inaspettato nell'aggiornamento del profilo", "Errore");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Loading iniziale
  if (initialLoading) {
    return (
      <ThemeWrapper>
        <View style={{ flex: 1 }}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
            <Header title="Modifica Gatto" />
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
          <Header title={`Modifica ${pet.name}`} />
        </View>
        
        <View style={{ flex: 1, paddingTop: 80 }}>
          <PetForm
            initialData={pet}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </View>
      </View>
      
      <PrimaryModal ref={modalRef} />
    </ThemeWrapper>
  );
};

export default EditPet;

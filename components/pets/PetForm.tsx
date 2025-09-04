import React, { useState } from "react";
import {
  View,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import styled from "styled-components/native";
import { hp, wp } from "../../helpers/common";
import Input from "../Input";
import Button from "../Button";
import Avatar from "../Avatar";
import Icon from "../../assets/icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { CreatePetData, UpdatePetData, Pet } from "../../services/types";
import { getUserImageSrc } from "../../services/imageService";
import moment from "moment";

interface PetFormProps {
  initialData?: Pet | null;
  onSubmit: (data: CreatePetData | UpdatePetData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  userId?: string; // Necessario per la creazione
}

const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
`;

const FormContainer = styled.View`
  padding: ${hp(2)}px;
  gap: ${hp(2)}px;
`;

const SectionTitle = styled.Text`
  font-size: ${hp(2)}px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textDark};
`;

const AvatarContainer = styled.View`
  align-self: center;
  margin-bottom: ${hp(2)}px;
  position: relative;
`;

const CameraButton = styled.TouchableOpacity`
  position: absolute;
  bottom: -${hp(0.5)}px;
  right: -${hp(0.5)}px;
  background-color: ${(props) => props.theme.colors.primary};
  width: ${hp(3.5)}px;
  height: ${hp(3.5)}px;
  border-radius: ${hp(1.75)}px;
  align-items: center;
  justify-content: center;
  border: 2px solid ${(props) => props.theme.colors.background};
`;

const GenderSelector = styled.TouchableOpacity`
  height: ${hp(5)}px;
  border-width: 0.4px;
  border-color: ${(props) => props.theme.colors.text};
  border-radius: ${(props) => props.theme.radius.sm}px;
  padding: 0 18px;
  justify-content: center;
  background-color: ${(props) => props.theme.colors.background};
`;

const GenderText = styled.Text<{ hasValue: boolean }>`
  color: ${(props) => 
    props.hasValue 
      ? props.theme.colors.textDark 
      : props.theme.colors.textLight
  };
`;

const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.View`
  background-color: ${(props) => props.theme.colors.background};
  padding: ${hp(3)}px;
  border-radius: ${(props) => props.theme.radius.lg}px;
  width: 80%;
  max-width: 300px;
`;

const ModalOption = styled.TouchableOpacity`
  padding: ${hp(2)}px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.colors.gray}30;
`;

const ModalOptionText = styled.Text`
  font-size: ${hp(1.8)}px;
  color: ${(props) => props.theme.colors.textDark};
`;

const CancelButton = styled.TouchableOpacity`
  padding: ${hp(2)}px;
  align-items: center;
  margin-top: ${hp(1)}px;
`;

const CancelButtonText = styled.Text`
  font-size: ${hp(1.8)}px;
  color: ${(props) => props.theme.colors.rose};
  font-weight: 500;
`;

const CheckboxContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${wp(3)}px;
  padding: ${hp(1)}px 0;
`;

const Checkbox = styled.TouchableOpacity<{ checked: boolean }>`
  width: ${hp(2.5)}px;
  height: ${hp(2.5)}px;
  border-radius: ${hp(0.5)}px;
  border-width: 2px;
  border-color: ${(props) => props.theme.colors.primary};
  background-color: ${(props) => 
    props.checked ? props.theme.colors.primary : 'transparent'
  };
  align-items: center;
  justify-content: center;
`;

const CheckboxText = styled.Text`
  color: ${(props) => props.theme.colors.textDark};
  font-size: ${hp(1.7)}px;
`;

const ButtonsContainer = styled.View`
  flex-direction: row;
  gap: ${wp(4)}px;
  margin-top: ${hp(3)}px;
`;

const PetForm: React.FC<PetFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  userId,
}) => {
  // Form state
  const [name, setName] = useState(initialData?.name || "");
  const [breed, setBreed] = useState(initialData?.breed || "");
  const [age, setAge] = useState(initialData?.age?.toString() || "");
  const [gender, setGender] = useState<'male' | 'female' | 'unknown' | undefined>(
    initialData?.gender
  );
  const [bio, setBio] = useState(initialData?.bio || "");
  const [weight, setWeight] = useState(initialData?.weight?.toString() || "");
  const [birthDate, setBirthDate] = useState<string>(
    initialData?.birthDate ? moment(initialData.birthDate).format('DD/MM/YYYY') : ""
  );
  const [isNeutered, setIsNeutered] = useState(initialData?.isNeutered || false);
  const [medicalNotes, setMedicalNotes] = useState(initialData?.medicalNotes || "");
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | string | null>(
    initialData?.image || null
  );

  // Modal states
  const [showGenderModal, setShowGenderModal] = useState(false);

  // Funzione per formattare la data di nascita
  const formatBirthday = (input: string): string => {
    const digits = input.replace(/\D/g, "");
    if (digits.length === 0) return "";
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2);
    return (
      digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4, 8)
    );
  };

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permesso necessario', 'Serve il permesso per accedere alla galleria');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Errore', 'Non è stato possibile selezionare l\'immagine');
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Errore', 'Il nome è obbligatorio');
      return;
    }

    if (!initialData && !userId) {
      Alert.alert('Errore', 'UserId mancante per la creazione');
      return;
    }

    const formData: CreatePetData | UpdatePetData = {
      name: name.trim(),
      breed: breed.trim() || undefined,
      age: age ? parseInt(age) : undefined,
      gender: gender || undefined,
      bio: bio.trim() || undefined,
      weight: weight ? parseFloat(weight) : undefined,
      birthDate: birthDate ? moment(birthDate, 'DD/MM/YYYY').isValid() ? moment(birthDate, 'DD/MM/YYYY').toISOString() : undefined : undefined,
      isNeutered,
      medicalNotes: medicalNotes.trim() || undefined,
      image: typeof image === 'string' ? image : image?.uri || undefined,
    };

    // Se è una creazione, aggiungiamo userId
    if (!initialData && userId) {
      (formData as CreatePetData).userId = userId;
    }

    onSubmit(formData);
  };

  const formatGender = (genderValue?: 'male' | 'female' | 'unknown') => {
    switch (genderValue) {
      case 'male': return 'Maschio';
      case 'female': return 'Femmina';
      case 'unknown': return 'Non specificato';
      default: return 'Seleziona sesso';
    }
  };

  const getImageSource = () => {
    if (image && typeof image === 'object' && 'uri' in image) {
      return { uri: image.uri };
    }

    if (typeof image === 'string') {
      return getUserImageSrc(image);
    }

    return require("../../assets/images/defaultUser.png");
  };

  return (
    <Container>
      <ScrollView>
        <FormContainer>
          {/* Foto del gatto */}
          <View style={{ alignItems: 'center' }}>
            <AvatarContainer>
              <Image 
                source={getImageSource()}
                style={{
                  width: hp(12),
                  height: hp(12),
                  borderRadius: hp(6),
                }}
              />
              <CameraButton onPress={handleImagePick}>
                <Icon name="camera" size={hp(1.8)} color="white" />
              </CameraButton>
            </AvatarContainer>
          </View>

          {/* Informazioni base */}
          <SectionTitle>Informazioni Base</SectionTitle>
          
          <Input
            icon={<Icon name="user" />}
            placeholder="Nome del gatto *"
            value={name}
            onChangeText={setName}
          />

          <Input
            placeholder="Razza (es. Persiano, Maine Coon)"
            value={breed}
            onChangeText={setBreed}
          />

          <Input
            placeholder="Età (anni)"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />

          <GenderSelector onPress={() => setShowGenderModal(true)}>
            <GenderText hasValue={!!gender}>
              {formatGender(gender)}
            </GenderText>
          </GenderSelector>

          <Input
            placeholder="Peso (kg)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />

          <Input
            placeholder="Data di nascita (GG/MM/AAAA)"
            value={birthDate}
            keyboardType="numeric"
            maxLength={10}
            onChangeText={(text) => {
              const formatted = formatBirthday(text);
              setBirthDate(formatted);
            }}
          />

          <CheckboxContainer>
            <Checkbox 
              checked={isNeutered} 
              onPress={() => setIsNeutered(!isNeutered)}
            >
              {isNeutered && <Icon name="check" size={hp(1.5)} color="white" />}
            </Checkbox>
            <CheckboxText>Sterilizzato/a</CheckboxText>
          </CheckboxContainer>

          {/* Bio e note */}
          <SectionTitle>Descrizione</SectionTitle>
          
          <CheckboxText>descrivi il tuo gatto</CheckboxText>
          <Input
            placeholder="Racconta qualcosa del tuo gatto..."
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            containerStyle={{ height: hp(10) }}
          />

          <CheckboxText>Note mediche (opzionale)</CheckboxText>
          <Input
            placeholder="Note mediche (opzionale)"
            value={medicalNotes}
            onChangeText={setMedicalNotes}
            multiline
            numberOfLines={4}
            containerStyle={{ height: hp(10) }}
          />

          {/* Bottoni */}
          <ButtonsContainer>
            <View style={{ flex: 1 }}>
              <Button
                title="Annulla"
                onPress={onCancel}
                buttonStyle={{
                  backgroundColor: '#f5f5f5',
                  borderWidth: 1,
                  borderColor: '#ccc',
                }}
                textStyle={{ color: '#666' }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title={isLoading ? "Salvataggio..." : (initialData ? "Aggiorna" : "Salva")}
                onPress={handleSubmit}
                loading={isLoading}
              />
            </View>
          </ButtonsContainer>
        </FormContainer>
      </ScrollView>

      {/* Modal sesso */}
      <Modal
        visible={showGenderModal}
        transparent
        animationType="slide"
      >
        <ModalContainer>
          <ModalContent>
            <ModalOption onPress={() => { setGender('male'); setShowGenderModal(false); }}>
              <ModalOptionText>Maschio</ModalOptionText>
            </ModalOption>
            <ModalOption onPress={() => { setGender('female'); setShowGenderModal(false); }}>
              <ModalOptionText>Femmina</ModalOptionText>
            </ModalOption>
            <ModalOption onPress={() => { setGender('unknown'); setShowGenderModal(false); }}>
              <ModalOptionText>Non specificato</ModalOptionText>
            </ModalOption>
            <CancelButton onPress={() => setShowGenderModal(false)}>
              <CancelButtonText>Annulla</CancelButtonText>
            </CancelButton>
          </ModalContent>
        </ModalContainer>
      </Modal>
    </Container>
  );
};

export default PetForm;

import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  Modal,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import styled from "styled-components/native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { wp, hp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Header from "../../components/Header";
import { Image } from "expo-image";
import { useAuth } from "../../context/AuthContext";
import { getUserImageSrc, uploadFile } from "../../services/imageService";
import Icon from "../../assets/icons";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { updateUser } from "../../services/userService";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

// Styled Components
const Container = styled.View`
  flex: 1;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
  padding-bottom: 20px;
`;

const AvatarContainer = styled.View`
  height: ${hp(14)}px;
  width: ${hp(14)}px;
  align-self: center;
`;

const AvatarImage = styled(Image)`
  height: 100%;
  width: 100%;
  border-radius: ${theme.radius.xxl * 1.8}px;
  border-width: 1px;
  border-color: ${theme.colors.darkLight};
`;

const CameraIcon = styled.Pressable`
  position: absolute;
  bottom: 0;
  right: -10px;
  padding: 8px;
  border-radius: 50px;
  background-color: white;
  shadow-color: ${theme.colors.textLight};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.4;
  shadow-radius: 5px;
  elevation: 7;
`;

const Form = styled.View`
  margin-top: 20px;
  gap: 18px;
`;

const SectionTitle = styled.Text`
  font-size: ${hp(2)}px;
  font-weight: bold;
  color: ${theme.colors.text};
  margin-top: 10px;
  margin-bottom: 10px;
`;

const BioInputContainer = styled.View`
  position: relative;
`;

// Note: Input component already uses styled-components internally or has its own styling.
// We pass containerStyle for specific overrides like height/padding.
const bioContainerStyle = {
  height: hp(15),
  alignItems: 'flex-start',
  paddingVertical: 15,
};

const CharCount = styled.Text`
  position: absolute;
  bottom: 5px;
  right: 10px;
  font-size: ${hp(1.5)}px;
  color: ${theme.colors.textLight};
`;

const PhoneInputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  border-width: 0.4px;
  border-color: ${theme.colors.text};
  border-radius: ${theme.radius.xxl}px;
  background-color: white;
  padding-left: 10px;
  padding-right: 10px;
  height: ${hp(7.2)}px;
`;

const PrefixContainer = styled.TouchableOpacity`
  padding-left: 10px;
  padding-right: 10px;
  justify-content: center;
  align-items: center;
`;

const PrefixText = styled.Text`
  font-size: ${hp(2)}px;
  color: ${theme.colors.text};
`;

// Note: Input component already uses styled-components internally or has its own styling.
// We pass containerStyle for specific overrides like flex/marginLeft.
const phoneInputContainerStyle = {
  flex: 1,
  marginLeft: 5,
  borderWidth: 0, // Remove border from Input as it's on PhoneInputContainer
  height: '100%', // Make Input fill the container height
};

const GenderSelector = styled.TouchableOpacity`
  height: ${hp(7.2)}px;
  justify-content: center;
  padding-left: 18px;
  padding-right: 18px;
  border-width: 0.4px;
  border-color: ${theme.colors.text};
  border-radius: ${theme.radius.xxl}px;
  background-color: white;
`;

const GenderText = styled.Text`
  color: ${(props) => props.hasValue ? theme.colors.text : theme.colors.textLight};
  font-size: ${hp(2)}px;
`;

const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0,0,0,0.5);
`;

const ModalContent = styled.View`
  width: 80%;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  align-items: center;
`;

const ModalOption = styled.TouchableOpacity`
  padding-top: 10px;
  padding-bottom: 10px;
  width: 100%;
  align-items: center;
`;

const ModalOptionText = styled.Text`
  font-size: ${hp(2)}px;
  color: ${theme.colors.text};
`;

const CancelButton = styled.TouchableOpacity`
  background-color: ${theme.colors.primary};
  margin-top: 15px;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: ${theme.radius.xxl}px;
`;

const CancelButtonText = styled.Text`
  font-size: ${hp(2)}px;
  color: white;
  font-weight: bold;
`;

const MAX_BIO_LENGTH = 200;

const EditProfile = () => {
  const router = useRouter();
  const { user: currentUser, setUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    name: "",
    city: "",
    bio: "",
    phoneNumber: "",
    birthday: "",
    gender: "",
    image: null,
  });

  // Nuove variabili di stato per gestire prefisso e numero separatamente
  const [phonePrefix, setPhonePrefix] = useState("+39");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPrefixModalVisible, setPrefixModalVisible] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name || "",
        address: currentUser.address || "",
        bio: currentUser.bio || "",
        phoneNumber: currentUser.phoneNumber || "",
        birthday: currentUser.birthday || "",
        gender: currentUser.gender || "",
        image: currentUser.image || null,
      });
      // Se il numero inizia con il "+" proviamo a dividerlo in prefisso e numero
      if (currentUser.phoneNumber && currentUser.phoneNumber.startsWith("+")) {
        const match = currentUser.phoneNumber.match(/^(\+\d{2,3})(.*)/);
        if (match) {
          setPhonePrefix(match[1]);
          setPhoneNumber(match[2]);
        } else {
          setPhoneNumber(currentUser.phoneNumber);
        }
      } else {
        setPhoneNumber(currentUser.phoneNumber || "");
      }
    }
  }, [currentUser]);

  const formatBirthday = (input) => {
    const digits = input.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4, 8);
  };

  const onPickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.cancelled) {
      setUser({ ...user, image: result.assets[0] });
    }
  };

  const onSubmit = async () => {
    const { name, address, bio, birthday, gender, image } = user;
    if (!name || !address || !bio || !phoneNumber || !birthday || !gender) {
      Alert.alert("Profile", "Please fill all fields");
      return;
    }

    setLoading(true);

    let uploadedImageUrl = user.image; // Keep existing remote URL if image wasn't changed
    if (image && typeof image === "object") { // Check if image is a new local file object
      const imagesRes = await uploadFile("profiles", image.uri, true);
      if (imagesRes.success) {
        uploadedImageUrl = imagesRes.data; // Update with new remote URL
      } else {
        uploadedImageUrl = null; // Reset if upload failed
        Alert.alert("Upload Error", "Failed to upload profile image.");
        setLoading(false);
        return;
      }
    }

    const updatedUser = {
      name,
      address,
      bio,
      birthday,
      gender,
      image: uploadedImageUrl, // Use the potentially updated image URL
      phoneNumber: phonePrefix + phoneNumber, // Combine prefix and number
    };

    const res = await updateUser(currentUser?.id, updatedUser);
    setLoading(false);

    if (res.success) {
      setUserData({ ...currentUser, ...updatedUser }); // Update local auth context
      router.back();
    } else {
      Alert.alert("Update Error", "Failed to update profile.");
    }
  };

  const imageSource =
    user.image && typeof user.image === "object"
      ? user.image.uri // Local file URI
      : getUserImageSrc(user.image); // Remote file URL or default

  return (
    <ScreenWrapper bg="white">
      <ScrollView style={{ flex: 1 }}>
        <Container>
          <Header title="Edit Profile" />

          {/* Sezione profilo */}
          <Form>
            <AvatarContainer>
              <AvatarImage source={imageSource} />
              <CameraIcon onPress={onPickImage}>
                <Icon name="camera" size={20} />
              </CameraIcon>
            </AvatarContainer>

            <SectionTitle>Profile Details</SectionTitle>
            <Input
              icon={<Icon name="user" />}
              placeholder="Enter your name"
              value={user.name}
              onChangeText={(value) => setUser({ ...user, name: value })}
            />
            <Input
              icon={<Icon name="location" />}
              placeholder="Enter your city"
              value={user.address}
              onChangeText={(value) => setUser({ ...user, address: value })}
            />

            {/* BIO con limite di 200 caratteri e contatore */}
            <BioInputContainer>
              <Input
                placeholder="Enter your bio"
                value={user.bio}
                multiline
                containerStyle={bioContainerStyle} // Pass style object
                onChangeText={(value) => {
                  if (value.length <= MAX_BIO_LENGTH) {
                    setUser({ ...user, bio: value });
                  }
                }}
              />
              <CharCount>
                {user.bio.length}/{MAX_BIO_LENGTH}
              </CharCount>
            </BioInputContainer>

            {/* Sezione Informazioni Personali */}
            <SectionTitle>Personal Information</SectionTitle>
            {/* Campo per il numero di telefono con selezione del prefisso */}
            <PhoneInputContainer>
              <PrefixContainer
                onPress={() => setPrefixModalVisible(true)}
              >
                <PrefixText>{phonePrefix}</PrefixText>
              </PrefixContainer>
              <Input
                placeholder="Enter your phone number"
                value={phoneNumber}
                keyboardType="phone-pad"
                onChangeText={(value) => setPhoneNumber(value)}
                containerStyle={phoneInputContainerStyle} // Pass style object
              />
            </PhoneInputContainer>

            <Input
              placeholder="Enter your birthday (DD/MM/YYYY)"
              value={user.birthday}
              keyboardType="numeric"
              maxLength={10}
              onChangeText={(text) => {
                const formatted = formatBirthday(text);
                setUser({ ...user, birthday: formatted });
              }}
            />

            {/* Selettore per il genere */}
            <GenderSelector
              onPress={() => setModalVisible(true)}
            >
              <GenderText hasValue={!!user.gender}>
                {user.gender ? user.gender : "Select Gender"}
              </GenderText>
            </GenderSelector>

            {/* Modal per la selezione del genere */}
            <Modal
              visible={isModalVisible}
              transparent={true}
              animationType="slide"
            >
              <ModalContainer>
                <ModalContent>
                  <ModalOption
                    onPress={() => {
                      setUser({ ...user, gender: "male" });
                      setModalVisible(false);
                    }}
                  >
                    <ModalOptionText>Male</ModalOptionText>
                  </ModalOption>
                  <ModalOption
                    onPress={() => {
                      setUser({ ...user, gender: "female" });
                      setModalVisible(false);
                    }}
                  >
                    <ModalOptionText>Female</ModalOptionText>
                  </ModalOption>
                  <ModalOption
                    onPress={() => {
                      setUser({ ...user, gender: "other" });
                      setModalVisible(false);
                    }}
                  >
                    <ModalOptionText>Other</ModalOptionText>
                  </ModalOption>
                  <CancelButton
                    onPress={() => setModalVisible(false)}
                  >
                    <CancelButtonText>Cancel</CancelButtonText>
                  </CancelButton>
                </ModalContent>
              </ModalContainer>
            </Modal>

            {/* Modal per la selezione del prefisso */}
            <Modal
              visible={isPrefixModalVisible}
              transparent={true}
              animationType="slide"
            >
              <ModalContainer>
                <ModalContent>
                  <ModalOption
                    onPress={() => {
                      setPhonePrefix("+39");
                      setPrefixModalVisible(false);
                    }}
                  >
                    <ModalOptionText>+39 Italy</ModalOptionText>
                  </ModalOption>
                  <ModalOption
                    onPress={() => {
                      setPhonePrefix("+1");
                      setPrefixModalVisible(false);
                    }}
                  >
                    <ModalOptionText>+1 USA</ModalOptionText>
                  </ModalOption>
                  <ModalOption
                    onPress={() => {
                      setPhonePrefix("+44");
                      setPrefixModalVisible(false);
                    }}
                  >
                    <ModalOptionText>+44 UK</ModalOptionText>
                  </ModalOption>
                  <CancelButton
                    onPress={() => setPrefixModalVisible(false)}
                  >
                    <CancelButtonText>Cancel</CancelButtonText>
                  </CancelButton>
                </ModalContent>
              </ModalContainer>
            </Modal>

            <Button title="Update" loading={loading} onPress={onSubmit} />
          </Form>
        </Container>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default EditProfile;

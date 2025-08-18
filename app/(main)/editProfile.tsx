import { Alert, ScrollView, Modal, ViewStyle, View } from "react-native";
import React, { useEffect, useState } from "react";
import styled from "styled-components/native";
import ThemeWrapper from "../../components/ThemeWrapper";
import { wp, hp } from "../../helpers/common";
import Header from "../../components/Header";
import { Image } from "expo-image";
import { useAuth, ExtendedUser } from "../../context/AuthContext";
import { getUserImageSrc, uploadFile } from "../../services/imageService";
import Icon from "../../assets/icons";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { updateUser } from "../../services/userService";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { UserRow } from "../../src/types/supabase";

// Interfacce per i tipi
interface UserFormData {
  name: string;
  website?: string;
  bio?: string;
  phoneNumber?: string;
  birthday?: string;
  gender?: string;
  image?: ImagePicker.ImagePickerAsset | string | null;
  [key: string]: any;
}

// Utilizziamo il tipo definito in userService.ts
type UpdateUserData = Partial<Omit<UserRow, "id" | "created_at">> & {
  // Utilizziamo phoneNumber (camelCase) che è il nome corretto della colonna nel database
  phoneNumber?: string;
};

// Styled Components
const Container = styled.View`
  flex: 1;
  padding-left: ${wp(4)}px;
  padding-right: ${wp(4)}px;
  padding-bottom: 20px;
  padding-top: ${hp(6)}px;
`;

const AvatarContainer = styled.View`
  height: ${hp(14)}px;
  width: ${hp(14)}px;
  align-self: center;
`;

const AvatarImage = styled(Image)`
  height: 100%;
  width: 100%;
  border-radius: ${(props) => props.theme.radius.xxl * 1.8}px;
  border-width: 1px;
  border-color: ${(props) => props.theme.colors.darkLight};
`;

const CameraIcon = styled.Pressable`
  position: absolute;
  bottom: 0;
  right: -10px;
  padding: 8px;
  border-radius: 50px;
  background-color: ${(props) => props.theme.colors.background};
  /* Utilizziamo le proprietà corrette per React Native */
  box-shadow: 0px 4px 5px ${(props) => props.theme.colors.textLight};
`;

const Form = styled.View`
  margin-top: 20px;
  gap: 18px;
`;

const SectionTitle = styled.Text`
  font-size: ${hp(2)}px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text};
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
  alignItems: "flex-start" as const,
  paddingVertical: 15,
};

const CharCount = styled.Text`
  position: absolute;
  bottom: 5px;
  right: 10px;
  font-size: ${hp(1.5)}px;
  color: ${(props) => props.theme.colors.textLight};
`;

const PhoneInputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  border-width: 0.4px;
  border-color: ${(props) => props.theme.colors.text};
  border-radius: ${(props) => props.theme.radius.xxl}px;
  background-color: ${(props) => props.theme.colors.background};
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
  font-size: ${hp(1.9)}px;
  color: ${(props) => props.theme.colors.text};
`;

// Note: Input component already uses styled-components internally or has its own styling.
// We pass containerStyle for specific overrides like flex/marginLeft.
const phoneInputContainerStyle: ViewStyle = {
  flex: 1,
  marginLeft: 5,
  borderWidth: 0, // Remove border from Input as it's on PhoneInputContainer
  height: "100%" as any, // Make Input fill the container height
};

const GenderSelector = styled.TouchableOpacity`
  height: ${hp(7.2)}px;
  justify-content: center;
  padding-left: 18px;
  padding-right: 18px;
  border-width: 0.4px;
  border-color: ${(props) => props.theme.colors.text};
  border-radius: ${(props) => props.theme.radius.xxl}px;
  background-color: ${(props) => props.theme.colors.background};
`;

interface GenderTextProps {
  hasValue: boolean;
}

const GenderText = styled.Text<GenderTextProps>`
  color: ${(props) =>
    props.hasValue ? props.theme.colors.text : props.theme.colors.textLight};
  font-size: ${hp(2)}px;
`;

const ModalContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.View`
  width: 80%;
  background-color: ${(props) => props.theme.colors.background};
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
  color: ${(props) => props.theme.colors.text};
`;

const CancelButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.colors.primary};
  margin-top: 15px;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: ${(props) => props.theme.radius.xxl}px;
`;

const CancelButtonText = styled.Text`
  font-size: ${hp(2)}px;
  color: white;
  font-weight: bold;
`;

const MAX_BIO_LENGTH = 200;

const EditProfile: React.FC = () => {
  const router = useRouter();
  const { user: currentUser, setUserData } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<UserFormData>({
    name: "",
    website: "",
    bio: "",
    phoneNumber: "",
    birthday: "",
    gender: "",
    image: null,
  });

  // Nuove variabili di stato per gestire prefisso e numero separatamente
  const [phonePrefix, setPhonePrefix] = useState<string>("+39");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isPrefixModalVisible, setPrefixModalVisible] =
    useState<boolean>(false);

  const [isModalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      // Verifichiamo se currentUser ha le proprietà che ci servono
      // Utilizziamo type guard per verificare se è un ExtendedUser
      const isExtendedUser = (user: any): user is ExtendedUser => {
        return "name" in user;
      };

      if (isExtendedUser(currentUser)) {
        // Ora TypeScript sa che currentUser è di tipo ExtendedUser
        const extUser = currentUser as ExtendedUser; // Cast esplicito per TypeScript
        setUser({
          name: extUser.name || "",
          website: extUser.website || "",
          bio: extUser.bio || "",
          phoneNumber: extUser.phoneNumber || "", // Utilizziamo phoneNumber (camelCase)
          birthday: extUser.birthday || "",
          gender: extUser.gender || "",
          image: extUser.image || null,
        });

        // Se il numero inizia con il "+" proviamo a dividerlo in prefisso e numero
        if (extUser.phoneNumber && extUser.phoneNumber.startsWith("+")) {
          const match = extUser.phoneNumber.match(/^(\+\d{2})(.*)/);
          if (match) {
            setPhonePrefix(match[1]);
            setPhoneNumber(match[2]);
          } else {
            setPhoneNumber(extUser.phoneNumber);
          }
        } else {
          setPhoneNumber(extUser.phoneNumber || "");
        }
      } else {
        // Se non è un ExtendedUser, inizializziamo con valori vuoti
        setUser({
          name: "",
          website: "",
          bio: "",
          phoneNumber: "",
          birthday: "",
          gender: "",
          image: null,
        });
      }
    }
  }, [currentUser]);

  const formatBirthday = (input: string): string => {
    const digits = input.replace(/\D/g, "");
    if (digits.length === 0) return "";
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return digits.slice(0, 2) + "/" + digits.slice(2);
    return (
      digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4, 8)
    );
  };

  const onPickImage = async (): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]) {
      setUser({ ...user, image: result.assets[0] });
    }
  };

  const onSubmit = async (): Promise<void> => {
    const { name, website, bio, birthday, gender, image } = user;
    if (!name || !bio || !phoneNumber || !birthday || !gender) {
      Alert.alert("Profile", "Please fill all required fields");
      return;
    }

    setLoading(true);

    let uploadedImageUrl: string | undefined =
      typeof image === "string" ? image : undefined; // Keep existing remote URL if image wasn't changed
    if (image && typeof image === "object") {
      // Check if image is a new local file object
      const imagesRes = await uploadFile("profiles", image.uri, true);
      if (imagesRes.success) {
        uploadedImageUrl = imagesRes.data; // Update with new remote URL
      } else {
        uploadedImageUrl = undefined; // Reset if upload failed
        Alert.alert("Upload Error", "Failed to upload profile image");
        setLoading(false);
        return;
      }
    }

    // Utilizziamo phoneNumber (camelCase) che è il nome corretto della colonna nel database
    const updatedUser: UpdateUserData = {
      name,
      website,
      bio,
      birthday,
      gender,
      image: uploadedImageUrl, // Use the potentially updated image URL
      phoneNumber: phonePrefix + phoneNumber, // Combine prefix and number
    };

    if (!currentUser?.id) {
      setLoading(false);
      Alert.alert("Update Error", "User not found");
      return;
    }

    console.log("Updating user with data:", JSON.stringify(updatedUser));
    const res = await updateUser(currentUser.id, updatedUser);
    setLoading(false);

    if (res.success) {
      console.log("Update successful:", JSON.stringify(res.data));
      // Verifichiamo se currentUser è di tipo ExtendedUser
      if ("name" in currentUser) {
        // Creiamo un nuovo oggetto ExtendedUser con i dati aggiornati
        const updatedExtendedUser: ExtendedUser = {
          ...(currentUser as ExtendedUser),
          name: updatedUser.name || (currentUser as ExtendedUser).name,
          website: updatedUser.website,
          bio: updatedUser.bio,
          birthday: updatedUser.birthday,
          gender: updatedUser.gender,
          image: updatedUser.image,
          phoneNumber: updatedUser.phoneNumber, // Utilizziamo phoneNumber (camelCase)
        };
        setUserData(updatedExtendedUser); // Update local auth context
      }
      router.back();
    } else {
      console.error("Update failed:", res.msg);
      Alert.alert(
        "Update Error",
        res.msg || "Failed to update profile. Please try again."
      );
    }
  };

  const imageSource =
    user.image && typeof user.image === "object"
      ? { uri: user.image.uri } // Local file URI
      : getUserImageSrc(
          typeof user.image === "string" ? user.image : undefined
        ); // Remote file URL or default

  return (
    <ThemeWrapper>
      <View style={{ flex: 1 }}>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
          }}
        >
          <Header title="Edit Profile" />
        </View>
        <ScrollView style={{ flex: 1 }}>
          <Container>

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
                icon={<Icon name="link" />}
                placeholder="Enter your website"
                value={user.website}
                onChangeText={(value) => setUser({ ...user, website: value })}
              />

              {/* BIO con limite di 200 caratteri e contatore */}
              <BioInputContainer>
                <Input
                  placeholder="Enter your bio"
                  value={user.bio || ""}
                  multiline
                  containerStyle={bioContainerStyle} // Pass style object
                  onChangeText={(value) => {
                    if (value.length <= MAX_BIO_LENGTH) {
                      setUser({ ...user, bio: value });
                    }
                  }}
                />
                <CharCount>
                  {(user.bio || "").length}/{MAX_BIO_LENGTH}
                </CharCount>
              </BioInputContainer>

              {/* Sezione Informazioni Personali */}
              <SectionTitle>Personal Information</SectionTitle>
              {/* Campo per il numero di telefono con selezione del prefisso */}
              <PhoneInputContainer>
                <PrefixContainer onPress={() => setPrefixModalVisible(true)}>
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
                placeholder="Enter your birthday (GG/MM/AAAA)"
                value={user.birthday}
                keyboardType="numeric"
                maxLength={10}
                onChangeText={(text) => {
                  const formatted = formatBirthday(text);
                  setUser({ ...user, birthday: formatted });
                }}
              />

              {/* Selettore per il genere */}
              <GenderSelector onPress={() => setModalVisible(true)}>
                <GenderText hasValue={!!user.gender}>
                  {user.gender ? user.gender : "Select gender"}
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
                    <CancelButton onPress={() => setModalVisible(false)}>
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
                        setPhonePrefix("+44");
                        setPrefixModalVisible(false);
                      }}
                    >
                      <ModalOptionText>+44 UK</ModalOptionText>
                    </ModalOption>
                    <CancelButton onPress={() => setPrefixModalVisible(false)}>
                      <CancelButtonText>Cancel</CancelButtonText>
                    </CancelButton>
                  </ModalContent>
                </ModalContainer>
              </Modal>

              <Button title="Update" loading={loading} onPress={onSubmit} />
            </Form>
          </Container>
        </ScrollView>
      </View>
    </ThemeWrapper>
  );
};

export default EditProfile;

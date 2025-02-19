import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
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

    if (typeof image === "object") {
      const imagesRes = await uploadFile("profiles", image.uri, true);
      if (imagesRes.success) {
        user.image = imagesRes.data;
      } else {
        user.image = null;
      }
    }
    const updatedUser = {
      ...user,
      phonePrefix,
      phoneNumber,
    };

    const res = await updateUser(currentUser?.id, updatedUser);
    setLoading(false);

    if (res.success) {
      setUserData({ ...currentUser, ...updatedUser });
      router.back();
    }
  };

  const imageSource =
    user.image && typeof user.image === "object"
      ? user.image.uri
      : getUserImageSrc(user.image);

  return (
    <ScreenWrapper bg="white">
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Header title="Edit Profile" />

          {/* Sezione profilo */}
          <View style={styles.form}>
            <View style={styles.avatarContainer}>
              <Image source={imageSource} style={styles.avatar} />
              <Pressable style={styles.cameraIcon} onPress={onPickImage}>
                <Icon name="camera" size={20} />
              </Pressable>
            </View>

            <Text style={styles.sectionTitle}>Profile Details</Text>
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
            <View style={{ position: "relative" }}>
              <Input
                placeholder="Enter your bio"
                value={user.bio}
                multiline
                containerStyle={styles.bio}
                onChangeText={(value) => {
                  if (value.length <= MAX_BIO_LENGTH) {
                    setUser({ ...user, bio: value });
                  }
                }}
              />
              <Text style={styles.charCount}>
                {user.bio.length}/{MAX_BIO_LENGTH}
              </Text>
            </View>

            {/* Sezione Informazioni Personali */}
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {/* Campo per il numero di telefono con selezione del prefisso */}
            <View style={styles.phoneInputContainer}>
              <TouchableOpacity
                style={styles.prefixContainer}
                onPress={() => setPrefixModalVisible(true)}
              >
                <Text style={styles.prefixText}>{phonePrefix}</Text>
              </TouchableOpacity>
              <Input
                placeholder="Enter your phone number"
                value={phoneNumber}
                keyboardType="phone-pad"
                onChangeText={(value) => setPhoneNumber(value)}
                containerStyle={styles.phoneInput}
              />
            </View>

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
            <TouchableOpacity
              style={[styles.input, styles.genderSelector]}
              onPress={() => setModalVisible(true)}
            >
              <Text
                style={[
                  styles.genderText,
                  !user.gender && styles.placeholderText,
                ]}
              >
                {user.gender ? user.gender : "Select Gender"}
              </Text>
            </TouchableOpacity>

            {/* Modal per la selezione del genere */}
            <Modal
              visible={isModalVisible}
              transparent={true}
              animationType="slide"
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <TouchableOpacity
                    onPress={() => {
                      setUser({ ...user, gender: "male" });
                      setModalVisible(false);
                    }}
                    style={styles.modalOption}
                  >
                    <Text style={styles.modalOptionText}>Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setUser({ ...user, gender: "female" });
                      setModalVisible(false);
                    }}
                    style={styles.modalOption}
                  >
                    <Text style={styles.modalOptionText}>Female</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setUser({ ...user, gender: "other" });
                      setModalVisible(false);
                    }}
                    style={styles.modalOption}
                  >
                    <Text style={styles.modalOptionText}>Other</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalOption, styles.cancelButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Modal per la selezione del prefisso */}
            <Modal
              visible={isPrefixModalVisible}
              transparent={true}
              animationType="slide"
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <TouchableOpacity
                    onPress={() => {
                      setPhonePrefix("+39");
                      setPrefixModalVisible(false);
                    }}
                    style={styles.modalOption}
                  >
                    <Text style={styles.modalOptionText}>+39 Italy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setPhonePrefix("+1");
                      setPrefixModalVisible(false);
                    }}
                    style={styles.modalOption}
                  >
                    <Text style={styles.modalOptionText}>+1 USA</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setPhonePrefix("+44");
                      setPrefixModalVisible(false);
                    }}
                    style={styles.modalOption}
                  >
                    <Text style={styles.modalOptionText}>+44 UK</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalOption, styles.cancelButton]}
                    onPress={() => setPrefixModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Button title="Update" loading={loading} onPress={onSubmit} />
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingBottom: 20,
  },
  avatarContainer: {
    height: hp(14),
    width: hp(14),
    alignSelf: "center",
  },
  avatar: {
    height: "100%",
    width: "100%",
    borderRadius: theme.radius.xxl * 1.8,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: theme.colors.darkLight,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: -10,
    padding: 8,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  form: {
    marginTop: 20,
    gap: 18,
  },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: "bold",
    color: theme.colors.text,
    marginVertical: 10,
  },
  bio: {
    flexDirection: "row",
    height: hp(15),
    alignItems: "flex-start",
    paddingVertical: 15,
  },
  charCount: {
    position: "absolute",
    bottom: 5,
    right: 10,
    fontSize: hp(1.5),
    color: theme.colors.textLight,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    backgroundColor: "white",
    paddingHorizontal: 10,
    height: hp(7.2),
  },
  prefixContainer: {
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  prefixText: {
    fontSize: hp(2),
    color: theme.colors.text,
  },
  phoneInput: {
    flex: 1,
    marginLeft: 5,
  },
  genderSelector: {
    height: hp(7.2),
    justifyContent: "center",
    paddingHorizontal: 18,
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    backgroundColor: "white",
  },
  genderText: {
    color: theme.colors.text,
    fontSize: hp(2),
  },
  placeholderText: {
    color: theme.colors.textLight,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalOption: {
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
  },
  modalOptionText: {
    fontSize: hp(2),
    color: theme.colors.text,
  },
  cancelButton: {
    backgroundColor: theme.colors.primary,
    marginTop: 15,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: theme.radius.xxl,
  },
  cancelButtonText: {
    fontSize: hp(2),
    color: "white",
    fontWeight: "bold",
  },
});

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
    }
  }, [currentUser]);

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
    const { name, address, bio, phoneNumber, birthday, gender, image } =
      user;

    if (
      !name ||
      !address ||
      !bio ||
      !phoneNumber ||
      !birthday ||
      !gender
    ) {
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

    const res = await updateUser(currentUser?.id, user);
    setLoading(false);

    if (res.success) {
      setUserData({ ...currentUser, ...user });
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

          {/* Profile Section */}
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
            <Input
              placeholder="Enter your bio"
              value={user.bio}
              multiline
              containerStyle={styles.bio}
              onChangeText={(value) => setUser({ ...user, bio: value })}
            />

            {/* Personal Info Section */}
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Input
              icon={<Icon name="call" />}
              placeholder="Enter your phone number"
              value={user.phoneNumber}
              onChangeText={(value) => setUser({ ...user, phoneNumber: value })}
            />
            <Input
              placeholder="Enter your birthday (DD-MM-YYYY)"
              value={user.birthday}
              onChangeText={(value) => setUser({ ...user, birthday: value })}
            />

            {/* Gender Selector */}
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

            {/* Modal for Gender Selection */}
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
  genderSelector: {
    height: hp(7.2), // Altezza coerente con gli Input
    justifyContent: "center",
    paddingHorizontal: 18, // Coerente con Input
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

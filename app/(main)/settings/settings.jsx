import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  View,
} from "react-native";
import React from "react";
import ScreenWrapper from "../../../components/ScreenWrapper";
import { useRouter } from "expo-router";
import Header from "../../../components/Header";
import { wp, hp } from "../../../helpers/common";
import Icon from "../../../assets/icons";
import { theme } from "../../../constants/theme";
import { supabase } from "../../../lib/supabase";

const Settings = () => {
  const router = useRouter();
  const onLogout = async () => {
    // setAuth(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Logout", "error signing out!");
    }
  };

  const handleLogout = async () => {
    // show confirm modal
    Alert.alert("Confirm", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        onPress: () => console.log("Modal cancelled"),
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => onLogout(),
        style: "destructive",
      },
    ]);
  };

  const settingsOptions = [
    {
      label: "Account",
      icon: "arrowRight",
      action: () => router.push("settings/accountSettings"),
    },
    {
      label: "Notifications",
      icon: "arrowRight",
      action: () => router.push("settings/notificationsSettings"),
    },
    {
      label: "Information",
      icon: "arrowRight",
      action: () => router.push("settings/informationSettings"),
    }
  ];

  return (
    <ScreenWrapper bg="white">
      <View style={styles.screenContainer}>
        <Header title="Settings" />
        <View style={styles.card}>
          {settingsOptions.map((option, index) => (
            <SettingItem
              key={index}
              label={option.label}
              iconName={option.icon}
              onPress={option.action}
            />
          ))}
          <SettingItem
            label="Logout"
            iconName="logout"
            onPress={handleLogout}
            textStyle={styles.itemTextLogout}
            iconColor={theme.colors.rose}
          />
        </View>
      </View>
      <Image
        style={styles.image}
        resizeMode="contain"
        source={require("../../../assets/images/welcome.png")}
      />
      <Text style={styles.title}>Micio Social</Text>
      <Text style={styles.versionText}>App Version: 1.0.0</Text>
    </ScreenWrapper>
  );
};

const SettingItem = ({
  label,
  iconName,
  onPress,
  textStyle = {},
  iconColor = theme.colors.textDark,
}) => (
  <TouchableOpacity style={[styles.item, styles.shadow]} onPress={onPress}>
    <Text style={[styles.itemText, textStyle]}>{label}</Text>
    <Icon name={iconName} size={20} color={iconColor} />
  </TouchableOpacity>
);

export default Settings;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: wp(4),
  },
  card: {
    marginTop: hp(2),
    backgroundColor: theme.colors.darkLight,
    borderRadius: theme.radius.xxl,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(2),
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    gap: hp(2),
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp(2),
    paddingHorizontal: wp(3),
    borderRadius: theme.radius.lg,
    backgroundColor: "white",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemText: {
    fontSize: hp(2),
    color: theme.colors.textDark,
    fontWeight: "500",
  },
  itemTextLogout: {
    fontSize: hp(2),
    color: theme.colors.rose,
    fontWeight: "500",
  },
  image: {
    width: hp(20),
    height: wp(40),
    alignSelf: "center",
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3),
    textAlign: "center",
    fontWeight: theme.fonts.extraBold,
  },
  versionText: {
    color: theme.colors.text,
    fontSize: hp(1.5),
    textAlign: "center",
    fontWeight: "500",
    paddingBottom: hp(2),
  },
});

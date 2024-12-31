import React, { useState } from "react";
import { StyleSheet, Text, View, Alert, Switch, TouchableOpacity, ScrollView } from "react-native";
import ScreenWrapper from "../../../components/ScreenWrapper";
import Header from "../../../components/Header";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { wp, hp } from "../../../helpers/common";
import { theme } from "../../../constants/theme";

const AccountSettings = () => {
  const [personalInfo, setPersonalInfo] = useState({ name: "", email: "" });
  const [password, setPassword] = useState({ current: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [language, setLanguage] = useState("English");

  const handleUpdatePersonalInfo = () => {
    if (!personalInfo.name || !personalInfo.email) {
      Alert.alert("Error", "All fields are required to update personal information.");
      return;
    }
    console.log("Updated personal information:", personalInfo);
    Alert.alert("Success", "Personal information updated successfully!");
  };

  const handleChangePassword = () => {
    if (!password.current || !password.new || !password.confirm) {
      Alert.alert("Error", "All fields are required to change password.");
      return;
    }
    if (password.new !== password.confirm) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    console.log("Password changed successfully.");
    Alert.alert("Success", "Password updated successfully!");
  };

  const handleDeactivateAccount = () => {
    Alert.alert(
      "Deactivate Account",
      "Are you sure you want to deactivate your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Deactivate", onPress: () => console.log("Account deactivated"), style: "destructive" },
      ]
    );
  };

  const toggleTheme = () => {
    setIsDarkTheme((prev) => !prev);
    Alert.alert("Theme Changed", `Theme set to ${!isDarkTheme ? "Dark" : "Light"}`);
  };

  const toggleLanguage = () => {
    const newLanguage = language === "English" ? "Italian" : "English";
    setLanguage(newLanguage);
    Alert.alert("Language Changed", `Language set to ${newLanguage}`);
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header title="Account Settings" />
        
        <ScrollView style={{ flex: 1 }}>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Update Personal Information</Text>
          <Input
            placeholder="Email"
            value={personalInfo.email}
            onChangeText={(text) => setPersonalInfo({ ...personalInfo, email: text })}
          />
          <Button title="Update Information" loading={loading} onPress={handleUpdatePersonalInfo} />
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <Input
            placeholder="Current Password"
            secureTextEntry
            value={password.current}
            onChangeText={(text) => setPassword({ ...password, current: text })}
          />
          <Input
            placeholder="New Password"
            secureTextEntry
            value={password.new}
            onChangeText={(text) => setPassword({ ...password, new: text })}
          />
          <Input
            placeholder="Confirm New Password"
            secureTextEntry
            value={password.confirm}
            onChangeText={(text) => setPassword({ ...password, confirm: text })}
          />
          <Button title="Change Password" loading={loading} onPress={handleChangePassword} />
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Dark Theme</Text>
            <Switch
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={isDarkTheme ? theme.colors.primary : theme.colors.textLight}
              onValueChange={toggleTheme}
              value={isDarkTheme}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Language</Text>
            <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
              <Text style={styles.languageText}>{language}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Deactivate Account</Text>
          <Button title="Deactivate Account" danger onPress={handleDeactivateAccount} />
        </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default AccountSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    backgroundColor: "white",
  },
  form: {
    marginTop: hp(3),
    gap: hp(2),
  },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: "600",
    color: theme.colors.textDark,
    marginBottom: hp(1),
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hp(1),
  },
  settingLabel: {
    fontSize: hp(2),
    color: theme.colors.textDark,
  },
  languageButton: {
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(2),
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.sm,
  },
  languageText: {
    color: "white",
    fontSize: hp(1.8),
  },
});

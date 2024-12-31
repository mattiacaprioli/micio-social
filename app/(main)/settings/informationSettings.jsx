import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import ScreenWrapper from "../../../components/ScreenWrapper";
import Header from "../../../components/Header";
import { wp, hp } from "../../../helpers/common";
import { theme } from "../../../constants/theme";

const InformationSettings = () => {
  const infoOptions = [
    { label: "Privacy Policy", action: () => console.log("Privacy Policy pressed") },
    { label: "Terms of Service", action: () => console.log("Terms of Service pressed") },
    { label: "Support", action: () => console.log("Support pressed") },
  ];

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header title="Information" />

        <View style={styles.card}>
          {infoOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.item, styles.shadow]}
              onPress={option.action}
            >
              <Text style={styles.itemText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Micio Social</Text>
          <Text style={styles.footerText}>Version 1.0.0</Text>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default InformationSettings;

const styles = StyleSheet.create({
  container: {
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
  footer: {
    marginTop: hp(3),
    alignItems: "center",
  },
  footerText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    fontWeight: "400",
  },
});

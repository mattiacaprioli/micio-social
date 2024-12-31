import React, { useState } from "react";
import { StyleSheet, Text, View, Switch } from "react-native";
import ScreenWrapper from "../../../components/ScreenWrapper";
import Header from "../../../components/Header";
import { wp, hp } from "../../../helpers/common";
import { theme } from "../../../constants/theme";

const NotificationsSettings = () => {
  const [followersEnabled, setFollowersEnabled] = useState(true);
  const [likesEnabled, setLikesEnabled] = useState(true);
  const [commentsEnabled, setCommentsEnabled] = useState(true);

  const toggleFollowers = () => setFollowersEnabled((previousState) => !previousState);
  const toggleLikes = () => setLikesEnabled((previousState) => !previousState);
  const toggleComments = () => setCommentsEnabled((previousState) => !previousState);

  const settingsOptions = [
    {
      label: "New Followers",
      value: followersEnabled,
      toggle: toggleFollowers,
    },
    {
      label: "Likes",
      value: likesEnabled,
      toggle: toggleLikes,
    },
    {
      label: "Comments",
      value: commentsEnabled,
      toggle: toggleComments,
    },
  ];

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header title="Notifications" />
        <View style={styles.card}>
          {settingsOptions.map((option, index) => (
            <View key={index} style={styles.item}>
              <Text style={styles.itemText}>{option.label}</Text>
              <Switch
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={option.value ? theme.colors.primary : theme.colors.textLight}
                onValueChange={option.toggle}
                value={option.value}
              />
            </View>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default NotificationsSettings;

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
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: theme.radius.lg,
    backgroundColor: "white",
  },
  itemText: {
    fontSize: hp(2),
    color: theme.colors.textDark,
    fontWeight: "500",
  },
});

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { theme } from "../constants/theme";
import { hp } from "../helpers/common";
import Avatar from "./Avatar";
import moment from "moment";
import Icon from "../assets/icons";

const NotificationItem = ({ item, router, onDelete }) => {
  const handleClick = () => {
    const parsedData = JSON.parse(item?.data);
    if (parsedData.userId) {
      // Notifica di follow: naviga al profilo dell'utente che ha iniziato a seguire
      router.push({ pathname: "userProfile", params: { userId: parsedData.userId } });
    } else if (parsedData.postId) {
      // Notifica di like o altro: naviga ai dettagli del post
      router.push({ pathname: "postDetails", params: { postId: parsedData.postId, commentId: parsedData.commentId } });
    } else {
      console.warn("Formato dei dati della notifica non riconosciuto:", parsedData);
    }
  };  

  const createdAt = moment(item?.created_at).format("MMM DD");

  return (
    <TouchableOpacity style={styles.container} onPress={handleClick}>
      <Avatar size={hp(5)} uri={item?.sender?.image} />
      <View style={styles.nameTitle}>
        <Text style={styles.text}>{item?.sender?.name}</Text>
        <Text style={[styles.text, { color: theme.colors.textDark }]}>
          {item?.title}
        </Text>
      </View>
      <Text style={[styles.text, { color: theme.colors.textLight }]}>
        {createdAt}
      </Text>
      <TouchableOpacity
        onPress={(event) => {
          event.stopPropagation();
          onDelete();
        }}
      >
        <Icon name="delete" size={20} color={theme.colors.rose} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "white",
    borderWidth: 0.5,
    borderColor: theme.colors.darkLight,
    padding: 15,
    // paddingVertical: 12,
    borderRadius: theme.radius.xxl,
    borderCurve: "continuous",
  },
  nameTitle: {
    flex: 1,
    gap: 2,
  },
  text: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
});

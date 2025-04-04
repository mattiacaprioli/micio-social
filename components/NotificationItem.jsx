import { Text, TouchableOpacity, View } from "react-native"; // Removed StyleSheet
import React from "react";
import styled from "styled-components/native"; // Added styled-components
import { theme } from "../constants/theme";
import { hp } from "../helpers/common";
import Avatar from "./Avatar";
import moment from "moment";
import Icon from "../assets/icons";

// Styled Components
const Container = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background-color: white;
  border-width: 0.5px;
  border-color: ${theme.colors.darkLight};
  padding: 15px;
  border-radius: ${theme.radius.xxl}px;
`;

const NameTitleContainer = styled.View`
  flex: 1;
  gap: 2px;
`;

const StyledText = styled.Text`
  font-size: ${hp(1.6)}px;
  font-weight: ${theme.fonts.medium};
  color: ${theme.colors.text};
`;

const TitleText = styled(StyledText)`
  color: ${theme.colors.textDark};
`;

const DateText = styled(StyledText)`
  color: ${theme.colors.textLight};
`;


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
    <Container onPress={handleClick}>
      <Avatar size={hp(5)} uri={item?.sender?.image} />
      <NameTitleContainer>
        <StyledText>{item?.sender?.name}</StyledText>
        <TitleText>{item?.title}</TitleText>
      </NameTitleContainer>
      <DateText>{createdAt}</DateText>
      <TouchableOpacity
        onPress={(event) => {
          event.stopPropagation();
          onDelete();
        }}
      >
        <Icon name="delete" size={20} color={theme.colors.rose} />
      </TouchableOpacity>
    </Container>
  );
};

export default NotificationItem;

import { TouchableOpacity } from "react-native";
import React from "react";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { hp } from "../helpers/common";
import Avatar from "./Avatar";
import moment from "moment";
import Icon from "../assets/icons";
import { Router } from "expo-router";
import { NotificationUser } from "../services/notificationService";
import { useTheme } from "../context/ThemeContext";

interface NotificationItemProps {
  item: {
    id: string;
    data: string;
    title: string;
    created_at: string;
    sender?: NotificationUser;
  };
  router: Router;
  onDelete: () => void;
}

interface ParsedNotificationData {
  userId?: string;
  postId?: string;
  commentId?: string;
}

const Container = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background-color: ${props => props.theme.colors.background};
  border-width: 0.5px;
  border-color: ${props => props.theme.colors.darkLight};
  padding: 15px;
  border-radius: ${props => props.theme.radius.xxl}px;
`;

const NameTitleContainer = styled.View`
  flex: 1;
  gap: 2px;
`;

const StyledText = styled.Text`
  font-size: ${hp(1.6)}px;
  font-weight: ${props => props.theme.fonts.medium};
  color: ${props => props.theme.colors.text};
`;

const TitleText = styled(StyledText)`
  color: ${props => props.theme.colors.textDark};
`;

const DateText = styled(StyledText)`
  color: ${props => props.theme.colors.textLight};
`;

const NotificationItem: React.FC<NotificationItemProps> = ({ item, router, onDelete }) => {
  const { isDarkMode } = useTheme();
  const theme = useStyledTheme();
  const handleClick = () => {
    try {
      const parsedData: ParsedNotificationData = JSON.parse(item?.data);
      if (parsedData.userId) {
        router.push({
          pathname: "/(main)/userProfile",
          params: { userId: parsedData.userId }
        });
      } else if (parsedData.postId) {
        router.push({
          pathname: "/(main)/postDetails",
          params: {
            postId: parsedData.postId,
            commentId: parsedData.commentId
          }
        });
      } else {
        console.warn("Formato dei dati della notifica non riconosciuto:", parsedData);
      }
    } catch (error) {
      console.error("Errore nel parsing dei dati della notifica:", error);
    }
  };

  const createdAt = moment(item?.created_at).format("MMM DD");

  return (
    <Container onPress={handleClick}>
      <Avatar size={hp(5)} uri={item?.sender?.image} isDarkMode={isDarkMode} />
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


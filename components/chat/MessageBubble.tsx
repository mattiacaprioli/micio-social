import React from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { wp, hp } from "../../helpers/common";
import { MessageWithUser } from "../../services/chatService";
import Avatar from "../Avatar";
import Loading from "../Loading";
import ReadStatus from "./ReadStatus";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

interface MessageBubbleProps {
  message: MessageWithUser;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  onLongPress?: (message: MessageWithUser) => void;
  isEditing?: boolean;
  editingText?: string;
  onEditingTextChange?: (text: string) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
}

const MessageContainer = styled.View<{ isCurrentUser: boolean }>`
  flex-direction: ${(props) => (props.isCurrentUser ? "row-reverse" : "row")};
  align-items: flex-end;
  margin-vertical: ${hp(0.5)}px;
  margin-horizontal: ${wp(4)}px;
`;

const BubbleContainer = styled(Pressable)<{ isCurrentUser: boolean }>`
  max-width: 75%;
  background-color: ${(props) =>
    props.isCurrentUser ? props.theme.colors.primary : props.theme.colors.card};
  border-radius: ${wp(4)}px;
  padding-horizontal: ${wp(3)}px;
  padding-vertical: ${hp(1)}px;
  margin-horizontal: ${wp(1)}px;
`;

const MessageText = styled.Text<{ isCurrentUser: boolean }>`
  font-size: ${hp(2)}px;
  color: ${(props) =>
    props.isCurrentUser ? "white" : props.theme.colors.textDark};
  line-height: ${hp(2.4)}px;
`;

const TimeText = styled.Text<{ isCurrentUser: boolean }>`
  font-size: ${hp(1.4)}px;
  color: ${(props) =>
    props.isCurrentUser
      ? "rgba(255,255,255,0.8)"
      : props.theme.colors.textLight};
  margin-top: ${hp(0.5)}px;
  margin-left: auto;
  align-self: ${(props) => (props.isCurrentUser ? "flex-end" : "flex-start")};
`;

const AvatarContainer = styled.View`
  width: ${hp(4)}px;
  height: ${hp(4)}px;
`;

const DeletedText = styled.Text<{ isCurrentUser: boolean }>`
  font-size: ${hp(1.7)}px;
  color: ${(props) => props.theme.colors.text};
  font-style: italic;
  line-height: ${hp(2.4)}px;
`;

const EditedIndicator = styled.Text<{ isCurrentUser: boolean }>`
  font-size: ${hp(1.2)}px;
  color: ${(props) =>
    props.isCurrentUser
      ? "rgba(255,255,255,0.6)"
      : props.theme.colors.textLight};
  margin-top: ${hp(0.2)}px;
`;

const RowView = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: ${wp(2)}px;
`;

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  showAvatar = true,
  onLongPress,
}) => {
  const theme = useStyledTheme();
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openUserProfile = (userId: string) => {
    if (message.sender.id === currentUser?.id) {
      router.push("/profile");
    } else {
      router.push({
        pathname: "/userProfile",
        params: { userId: message.sender.id },
      });
    }
  };
  
  return (
    <MessageContainer isCurrentUser={isCurrentUser}>
      {!isCurrentUser && showAvatar && (
        <TouchableOpacity onPress={() => openUserProfile(message.sender.id)}>
          <AvatarContainer>
            <Avatar uri={message.sender.image} size={hp(4)} />
          </AvatarContainer>
        </TouchableOpacity>
      )}

      <BubbleContainer
        isCurrentUser={isCurrentUser}
        theme={theme}
        onLongPress={() => onLongPress?.(message)}
        delayLongPress={500}
      >
        {message.is_deleted ? (
          <DeletedText isCurrentUser={isCurrentUser} theme={theme}>
            Message deleted
          </DeletedText>
        ) : (
          <>
            <MessageText isCurrentUser={isCurrentUser} theme={theme}>
              {message.content}
            </MessageText>
          </>
        )}
        <RowView>
          {!message.is_deleted && (
            <ReadStatus
              isRead={message.is_read || false}
              isCurrentUser={isCurrentUser}
            />
          )}
          {message.updated_at && (
            <EditedIndicator isCurrentUser={isCurrentUser} theme={theme}>
              Edited
            </EditedIndicator>
          )}

          {!message.is_deleted && (
            <TimeText isCurrentUser={isCurrentUser} theme={theme}>
              {formatMessageTime(message.created_at)}
            </TimeText>
          )}
        </RowView>
      </BubbleContainer>

      {isCurrentUser && showAvatar && (
        <TouchableOpacity onPress={() => openUserProfile(message.sender.id)}>
          <AvatarContainer>
            <Avatar uri={message.sender.image} size={hp(4)} />
          </AvatarContainer>
        </TouchableOpacity>
      )}

      {message.sending && (
        <View
          style={{
            marginTop: 4,
            alignSelf: isCurrentUser ? "flex-end" : "flex-start",
          }}
        >
          <Loading size="small" />
        </View>
      )}
    </MessageContainer>
  );
};

export default MessageBubble;

import React from "react";
import { View, Text } from "react-native";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { wp, hp } from "@/helpers/common";
import { MessageWithUser } from "@/services/chatService";
import Avatar from "../Avatar";
import Loading from "../Loading";
import ReadStatus from "./ReadStatus";

interface MessageBubbleProps {
  message: MessageWithUser;
  isCurrentUser: boolean;
  showAvatar?: boolean;
}

const MessageContainer = styled.View<{ isCurrentUser: boolean }>`
  flex-direction: ${(props) => (props.isCurrentUser ? "row-reverse" : "row")};
  align-items: flex-end;
  margin-vertical: ${hp(0.5)}px;
  margin-horizontal: ${wp(4)}px;
`;

const BubbleContainer = styled.View<{ isCurrentUser: boolean }>`
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
  align-self: ${(props) => (props.isCurrentUser ? "flex-end" : "flex-start")};
`;

const AvatarContainer = styled.View`
  width: ${hp(4)}px;
  height: ${hp(4)}px;
`;

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  showAvatar = true,
}) => {
  const theme = useStyledTheme();

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <MessageContainer isCurrentUser={isCurrentUser}>
      {!isCurrentUser && showAvatar && (
        <AvatarContainer>
          <Avatar uri={message.sender.image} size={hp(4)} />
        </AvatarContainer>
      )}

      <BubbleContainer isCurrentUser={isCurrentUser} theme={theme}>
        <MessageText isCurrentUser={isCurrentUser} theme={theme}>
          {message.content}
        </MessageText>
        <TimeText isCurrentUser={isCurrentUser} theme={theme}>
          {formatMessageTime(message.created_at)}
        </TimeText>
        <ReadStatus
          isRead={message.is_read || false}
          isCurrentUser={isCurrentUser}
        />
      </BubbleContainer>

      {isCurrentUser && showAvatar && (
        <AvatarContainer>
          <Avatar uri={message.sender.image} size={hp(4)} />
        </AvatarContainer>
      )}
      {message.sending && (
        <View
          style={{
            marginTop: 4,
            alignSelf: isCurrentUser ? "flex-end" : "flex-start",
          }}
        >
          <Loading size="small" /> {/* o un piccolo spinner */}
        </View>
      )}
    </MessageContainer>
  );
};

export default MessageBubble;

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  FlatList,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import styled from "styled-components/native";
import { useTheme as useStyledTheme } from "styled-components/native";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import ThemeWrapper from "@/components/ThemeWrapper";
import { useAuth } from "@/context/AuthContext";
import { wp, hp } from "@/helpers/common";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import MessageBubble from "@/components/chat/MessageBubble";
import MessageInput from "@/components/chat/MessageInput";
import {
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  MessageWithUser,
} from "@/services/chatService";
import { supabase } from "@/lib/supabase";

const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
`;

const MessagesContainer = styled.View`
  flex: 1;
`;

const ChatDetails: React.FC = () => {
  const { user } = useAuth();
  const theme = useStyledTheme();
  const params = useLocalSearchParams();

  const conversationId = params.conversationId as string;
  const otherUserId = params.otherUserId as string;
  const otherUserName = params.otherUserName as string;
  const otherUserImage = params.otherUserImage as string;

  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = async () => {
    if (!conversationId) return;

    const result = await getConversationMessages(conversationId);
    if (result.success && result.data) {
      setMessages(result.data);
      if (user?.id) {
        await markMessagesAsRead(conversationId, user.id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          console.log("Nuovo messaggio ricevuto:", payload);

          const { data: messageWithSender, error } = await supabase
            .from("messages")
            .select(
              `
              *,
              sender:users!messages_sender_id_fkey(id, name, image)
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (!error && messageWithSender) {
            const newMessage: MessageWithUser = {
              ...messageWithSender,
              sender: {
                id: messageWithSender.sender.id,
                name: messageWithSender.sender.name,
                image: messageWithSender.sender.image,
              },
            };

            setMessages((prev) => [...prev, newMessage]);

            if (user?.id && newMessage.sender_id !== user.id) {
              await markMessagesAsRead(conversationId, user.id);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id
                ? { ...msg, is_read: payload.new.is_read }
                : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchMessages();
    }, [conversationId])
  );

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (messageText: string) => {
    if (!user?.id || !conversationId || sending) return;

    setSending(true);

    const extendedUser = user as any;
    const tempMessage: MessageWithUser = {
      id: `temp-${Date.now()}`, // ID temporaneo
      created_at: new Date().toISOString(),
      conversation_id: conversationId,
      sender_id: user.id,
      content: messageText,
      sending: true,
      is_read: false,
      sender: {
        id: user.id,
        name: extendedUser.name || "Tu",
        image: extendedUser.image || null,
      },
    };

    setMessages((prev) => [...prev, tempMessage]);

    const result = await sendMessage(conversationId, user.id, messageText);

    if (result.success) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, sending: false } : msg
        )
      );
    }

    if (!result.success) {
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      Alert.alert("Errore", "Could not send message. Please try again.");
    } else {
      // Se l'invio ha successo, sostituisci il messaggio temporaneo con quello reale
      // (questo verrà gestito automaticamente dal realtime quando arriva il messaggio vero)
      // Per ora lasciamo il messaggio temporaneo, verrà sostituito dal realtime
    }

    setSending(false);
  };

  const renderMessage = ({
    item,
    index,
  }: {
    item: MessageWithUser;
    index: number;
  }) => {
    const isCurrentUser = item.sender_id === user?.id;
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showAvatar =
      !previousMessage || previousMessage.sender_id !== item.sender_id;

    return (
      <MessageBubble
        message={item}
        isCurrentUser={isCurrentUser}
        showAvatar={showAvatar}
      />
    );
  };

  if (loading) {
    return (
      <ThemeWrapper>
        <Container theme={theme}>
          <Header title={otherUserName} showBackButton />
          <Loading />
        </Container>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Container theme={theme}>
          <Header title={otherUserName} showBackButton />

          <MessagesContainer>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => {
                flatListRef.current?.scrollToEnd({ animated: false });
              }}
            />
          </MessagesContainer>

          <MessageInput onSendMessage={handleSendMessage} disabled={sending} />
        </Container>
      </KeyboardAvoidingView>
    </ThemeWrapper>
  );
};

export default ChatDetails;

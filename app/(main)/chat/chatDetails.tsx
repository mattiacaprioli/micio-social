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
import ThemeWrapper from "../../../components/ThemeWrapper";
import { useAuth } from "../../../context/AuthContext";
import { wp, hp } from "../../../helpers/common";
import Header from "../../../components/Header";
import Loading from "../../../components/Loading";
import MessageBubble from "../../../components/chat/MessageBubble";
import MessageInput from "../../../components/chat/MessageInput";
import {
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  MessageWithUser,
  getConversationMessagesWithPagination,
  unhideConversation,
  deleteMessage,
  editMessage,
} from "../../../services/chatService";
import { supabase } from "../../../lib/supabase";
import RBSheet from "react-native-raw-bottom-sheet";
import { Ionicons } from "@expo/vector-icons";

const Container = styled.View`
  flex: 1;
  background-color: ${(props) => props.theme.colors.background};
  padding-top: ${hp(6)}px;
`;

const MessagesContainer = styled.View`
  flex: 1;
`;

const BottomSheetContent = styled.View`
  padding: ${wp(4)}px;
`;

const ActionItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: ${wp(4)}px;
  border-radius: ${wp(2)}px;
`;

const ActionText = styled.Text<{ color?: string }>`
  font-size: ${hp(2)}px;
  margin-left: ${wp(3)}px;
  color: ${(props) => props.color || props.theme.colors.textDark};
  font-weight: ${(props) => props.theme.fonts.medium};
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const flatListRef = useRef<FlatList>(null);
  const bottomSheetRef = useRef<RBSheet>(null);
  const [selectedMessage, setSelectedMessage] =
    useState<MessageWithUser | null>(null);

  const fetchMessages = async (loadMore = false) => {
    if (loadMore) setLoadingMore(true);
    else setLoading(true);

    const offset = loadMore ? messages.length : 0;
    const result = await getConversationMessagesWithPagination(
      conversationId,
      50,
      offset
    );

    if (result.success && result.data) {
      if (loadMore) {
        setMessages((prev) => [...result.data!, ...prev]);
      } else {
        setMessages(result.data);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);
      }

      setHasMoreMessages(result.data.length === 50);

      if (user?.id) {
        await markMessagesAsRead(conversationId, user.id);
      }
    }

    setLoading(false);
    setLoadingMore(false);
  };

  const loadMoreMessages = () => {
    if (!loadingMore && hasMoreMessages) {
      fetchMessages(true);
    }
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
              // 🔥 AGGIUNGI QUESTA PARTE: Mostra di nuovo la conversazione se era nascosta quando ricevi un messaggio
              await unhideConversation(user.id, conversationId);
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
                ? {
                    ...msg,
                    is_read: payload.new.is_read,
                    content: payload.new.content,
                    is_deleted: payload.new.is_deleted,
                    updated_at: payload.new.updated_at
                  }
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

  const handleLongPressMessage = (message: MessageWithUser) => {
    if (message.sender.id !== user?.id) return;

    setSelectedMessage(message);
    bottomSheetRef.current?.open();
  };
  const handleDeleteMessage = async (messageId: string) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await deleteMessage(messageId, user?.id || "");
            if (result.success) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === messageId ? { ...msg, is_deleted: true } : msg
                )
              );
            } else {
              Alert.alert(
                "Error",
                result.msg || "Unable to delete message"
              );
            }
          },
        },
      ]
    );
  };

  const handleStartEdit = (message: MessageWithUser) => {
    setEditingMessageId(message.id);
    setEditingText(message.content);
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editingText.trim()) return;

    const result = await editMessage(
      editingMessageId,
      editingText,
      user?.id || ""
    );
    if (result.success) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === editingMessageId
            ? {
                ...msg,
                content: editingText.trim(),
                updated_at: new Date().toISOString(),
              }
            : msg
        )
      );
      setEditingMessageId(null);
      setEditingText("");
    } else {
      Alert.alert(
        "Error",
        result.msg || "Unable to edit message"
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  useFocusEffect(
    useCallback(() => {
      fetchMessages();
    }, [conversationId])
  );

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 300);
    }
  }, [messages]);

  const handleSendMessage = async (messageText: string) => {
    if (!user?.id || !conversationId || sending) return;

    if (editingMessageId) {
      const result = await editMessage(editingMessageId, messageText, user.id);
      if (result.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === editingMessageId
              ? {
                  ...msg,
                  content: messageText.trim(),
                  updated_at: new Date().toISOString(),
                }
              : msg
          )
        );
        setEditingMessageId(null);
        setEditingText("");
      } else {
        Alert.alert(
          "Error",
          result.msg || "Unable to edit message"
        );
      }
      return;
    }

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
      is_deleted: false,
      updated_at: null,
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

      // 🔥 AGGIUNGI QUESTA PARTE: Mostra di nuovo la conversazione se era nascosta
      await unhideConversation(user.id, conversationId);
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

    const isEditing = editingMessageId === item.id;

    return (
      <MessageBubble
        message={item}
        isCurrentUser={isCurrentUser}
        showAvatar={showAvatar}
        onLongPress={handleLongPressMessage}
        isEditing={isEditing}
        editingText={editingText}
        onEditingTextChange={setEditingText}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
      />
    );
  };

  if (loading) {
    return (
      <ThemeWrapper>
        <View style={{ flex: 1 }}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
            <Header title={otherUserName} showBackButton />
          </View>

          <Container theme={theme}>
            <Loading />
          </Container>
        </View>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={{ flex: 1 }}>
          {/* Header fisso */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
            <Header title={otherUserName} showBackButton />
          </View>

          <Container theme={theme}>
            <MessagesContainer>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              showsVerticalScrollIndicator={false}
              onEndReached={loadMoreMessages}
              onEndReachedThreshold={0.1}
              ListHeaderComponent={loadingMore ? <Loading /> : null}
              onContentSizeChange={() => {
                if (!loadingMore) {
                  setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: false });
                  }, 50);
                }
              }}
              onLayout={() => {
                if (messages.length > 0) {
                  setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: false });
                  }, 100);
                }
              }}
            />
          </MessagesContainer>

          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={sending}
            editingText={editingText}
            isEditing={!!editingMessageId}
            onCancelEdit={handleCancelEdit}
          />
          </Container>
        </View>
      </KeyboardAvoidingView>
      <RBSheet
        ref={bottomSheetRef}
        height={200}
        openDuration={250}
        customStyles={{
          container: {
            borderTopLeftRadius: wp(4),
            borderTopRightRadius: wp(4),
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <BottomSheetContent>
          {selectedMessage && (
            <>
              {(() => {
                const messageTime = new Date(
                  selectedMessage.created_at
                ).getTime();
                const now = new Date().getTime();
                const fifteenMinutes = 15 * 60 * 1000;
                const canEdit = now - messageTime <= fifteenMinutes;

                return canEdit && !selectedMessage.is_deleted ? (
                  <ActionItem
                    onPress={() => {
                      handleStartEdit(selectedMessage);
                      bottomSheetRef.current?.close();
                    }}
                  >
                    <Ionicons
                      name="create-outline"
                      size={hp(2.5)}
                      color={theme.colors.primary}
                    />
                    <ActionText theme={theme} color={theme.colors.primary}>
                      Edit
                    </ActionText>
                  </ActionItem>
                ) : null;
              })()}

              <ActionItem
                onPress={() => {
                  bottomSheetRef.current?.close();
                  setTimeout(
                    () => handleDeleteMessage(selectedMessage.id),
                    300
                  );
                }}
              >
                <Ionicons name="trash-outline" size={hp(2.5)} color="#FF3B30" />
                <ActionText color="#FF3B30">Delete</ActionText>
              </ActionItem>
            </>
          )}
        </BottomSheetContent>
      </RBSheet>
    </ThemeWrapper>
  );
};

export default ChatDetails;

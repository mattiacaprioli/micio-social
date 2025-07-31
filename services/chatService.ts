import { supabase } from "../lib/supabase";
import { Database } from "../src/types/supabase";
import { ApiResponse } from "./types";

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type ConversationInsert =
  Database["public"]["Tables"]["conversations"]["Insert"];
type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

export interface ConversationWithUser extends ConversationRow {
  otherUser: {
    id: string;
    name: string;
    image?: string | null;
  };
  lastMessage?: {
    content: string;
    created_at: string;
  };
}

export interface MessageWithUser extends MessageRow {
  sender: {
    id: string;
    name: string;
    image?: string | null;
  };
  sending?: boolean;
}

export const getUserConversations = async (
  userId: string
): Promise<ApiResponse<ConversationWithUser[]>> => {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select(
        `
        *,
        user1:users!conversations_user1_id_fkey(id, name, image),
        user2:users!conversations_user2_id_fkey(id, name, image),
        messages(content, created_at)
      `
      )
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order("last_message_at", { ascending: false });

    if (error) {
      console.log("getUserConversations error: ", error);
      return { success: false, msg: "Could not fetch conversations" };
    }

    const conversationsWithUsers: ConversationWithUser[] =
      data?.map((conv) => {
        const otherUser = conv.user1_id === userId ? conv.user2 : conv.user1;
        const lastMessage = conv.messages?.[0] || null;

        return {
          ...conv,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            image: otherUser.image,
          },
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                created_at: lastMessage.created_at,
              }
            : undefined,
        };
      }) || [];

    return { success: true, data: conversationsWithUsers };
  } catch (error) {
    console.log("getUserConversations error: ", error);
    return { success: false, msg: "Could not fetch conversations" };
  }
};

export const createOrFindConversation = async (
  user1Id: string,
  user2Id: string
): Promise<ApiResponse<ConversationRow>> => {
  try {
    const { data: existing, error: findError } = await supabase
      .from("conversations")
      .select("*")
      .or(
        `and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`
      )
      .single();

    if (existing && !findError) {
      return { success: true, data: existing };
    }

    const newConversation: ConversationInsert = {
      user1_id: user1Id,
      user2_id: user2Id,
    };

    const { data, error } = await supabase
      .from("conversations")
      .insert(newConversation)
      .select()
      .single();

    if (error) {
      console.log("createOrFindConversation error: ", error);
      return { success: false, msg: "Could not create conversation" };
    }

    return { success: true, data };
  } catch (error) {
    console.log("createOrFindConversation error: ", error);
    return { success: false, msg: "Could not create conversation" };
  }
};

export const getConversationMessages = async (
  conversationId: string
): Promise<ApiResponse<MessageWithUser[]>> => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:users!messages_sender_id_fkey(id, name, image)
      `
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.log("getConversationMessages error: ", error);
      return { success: false, msg: "Could not fetch messages" };
    }

    const messagesWithUsers: MessageWithUser[] =
      data?.map((msg) => ({
        ...msg,
        sender: {
          id: msg.sender.id,
          name: msg.sender.name,
          image: msg.sender.image,
        },
      })) || [];

    return { success: true, data: messagesWithUsers };
  } catch (error) {
    console.log("getConversationMessages error: ", error);
    return { success: false, msg: "Could not fetch messages" };
  }
};

export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string
): Promise<ApiResponse<MessageRow>> => {
  try {
    const newMessage: MessageInsert = {
      conversation_id: conversationId,
      sender_id: senderId,
      content: content.trim(),
    };

    const { data, error } = await supabase
      .from("messages")
      .insert(newMessage)
      .select()
      .single();

    if (error) {
      console.log("sendMessage error: ", error);
      return { success: false, msg: "Could not send message" };
    }

    return { success: true, data };
  } catch (error) {
    console.log("sendMessage error: ", error);
    return { success: false, msg: "Could not send message" };
  }
};

export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<ApiResponse<boolean>> => {
  try {
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .eq("is_read", false);

    if (error) {
      console.log("markMessagesAsRead error: ", error);
      return { success: false, msg: "Could not mark messages as read" };
    }

    return { success: true, data: true };
  } catch (error) {
    console.log("markMessagesAsRead error: ", error);
    return { success: false, msg: "Could not mark messages as read" };
  }
};

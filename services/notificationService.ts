import { supabase } from "../lib/supabase";
import { ApiResponse } from "./types";

interface NotificationUser {
  id: string;
  name: string;
  image: string | null;
}

interface Notification {
  id: string;
  senderId: string;
  receiverId: string;
  title: string;
  data: string;
  created_at: string;
  sender?: NotificationUser;
}

interface CreateNotificationData {
  senderId: string;
  receiverId: string;
  title: string;
  data: string;
}

export const createNotification = async (notification: CreateNotificationData): Promise<ApiResponse<Notification>> => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.log("notification error: ", error);
      return { success: false, msg: "Something went wrong!" };
    }

    return { success: true, data };
  } catch (error) {
    console.log("notification error: ", error);
    return { success: false, msg: "Something went wrong!" };
  }
};

export const fetchNotifications = async (receiverId: string): Promise<ApiResponse<Notification[]>> => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        *,
        sender: senderId(id, name, image)
      `)
      .eq("receiverId", receiverId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("fetchNotifications error: ", error);
      return { success: false, msg: "Could not fetch notifications" };
    }

    return { success: true, data };
  } catch (error) {
    console.log("fetchNotifications error: ", error);
    return { success: false, msg: "Could not fetch notifications" };
  }
};

export const deleteNotification = async (notificationId: string): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      console.log("deleteNotification error: ", error);
      return { success: false, msg: "Could not delete notification" };
    }

    return { success: true };
  } catch (error) {
    console.log("deleteNotification error: ", error);
    return { success: false, msg: "Could not delete notification" };
  }
};
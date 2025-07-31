import { supabase } from "../lib/supabase";
import { UserRow } from "../src/types/supabase";
import { ApiResponse } from "./types";

export interface UserWithBasicInfo {
  id: string;
  name: string;
  image: string | null;
  bio?: string | null;
}

export const getUserData = async (userId: string): Promise<ApiResponse<UserRow>> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      return { success: false, msg: error?.message };
    }
    return { success: true, data };
  } catch (error) {
    const err = error as Error;
    console.log("got error: ", err);
    return { success: false, msg: err.message };
  }
};

type UpdateUserData = Partial<Omit<UserRow, 'id' | 'created_at'>>;

export const updateUser = async (
  userId: string,
  data: UpdateUserData
): Promise<ApiResponse<UpdateUserData>> => {
  try {
    console.log("updateUser called with userId:", userId);
    console.log("updateUser data:", JSON.stringify(data));

    const { data: responseData, error } = await supabase
      .from("users")
      .update(data)
      .eq("id", userId)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return { success: false, msg: error?.message };
    }

    console.log("Supabase update response:", JSON.stringify(responseData));
    return { success: true, data };
  } catch (error) {
    const err = error as Error;
    console.error("updateUser error:", err);
    return { success: false, msg: err.message };
  }
};

export const searchUsers = async (searchQuery: string, limit = 20): Promise<ApiResponse<UserWithBasicInfo[]>> => {
  try {
    if (!searchQuery || searchQuery.trim() === "") {
      return { success: true, data: [] };
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, name, image, bio")
      .ilike("name", `%${searchQuery}%`)
      .limit(limit);

    if (error) {
      console.log("searchUsers error: ", error);
      return { success: false, msg: "Could not search users" };
    }

    return { success: true, data: data as UserWithBasicInfo[] };
  } catch (error) {
    console.log("searchUsers error: ", error);
    return { success: false, msg: "Could not search users" };
  }
};
import { supabase } from "../lib/supabase";
import { UserRow } from "@/src/types/supabase";
import { ApiResponse } from "./types";

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
    const { error } = await supabase
      .from("users")
      .update(data)
      .eq("id", userId);

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
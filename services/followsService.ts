
import { supabase } from "../lib/supabase";
import { ApiResponse } from "./types";

// Interfacce base
interface FollowUser {
  follower_id: string;
  following_id: string;
}

export interface UserBasicInfo {
  id: string;
  name: string;
  image: string | null;
}

// Interfacce per i dati restituiti da Supabase
export interface FollowerInfo {
  follower_id: string;
  follower: UserBasicInfo;  // Ora è un singolo oggetto, non un array
}

export interface FollowingInfo {
  following_id: string;
  following: UserBasicInfo;  // Ora è un singolo oggetto, non un array
}

// Interfacce specifiche per i dati Supabase
interface SupabaseFollowerResponse {
  follower_id: string;
  follower: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface SupabaseFollowingResponse {
  following_id: string;
  following: {
    id: string;
    name: string;
    image: string | null;
  };
}

export const followUser = async (followerId: string, followingId: string): Promise<ApiResponse<FollowUser>> => {
  const { data, error } = await supabase
    .from('follows')
    .insert([{ follower_id: followerId, following_id: followingId }])
    .select()
    .single();

  if (error) {
    console.error(error);
    return { success: false, error };
  }
  return { success: true, data };
};

export const unfollowUser = async (followerId: string, followingId: string): Promise<ApiResponse<FollowUser>> => {
  const { data, error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .select()
    .single();

  if (error) {
    console.error(error);
    return { success: false, error };
  }
  return { success: true, data };
};

export const getFollowersCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);

  if (error) {
    console.error("Error fetching followers count:", error);
    return 0;
  }

  return count || 0;
};

export const getFollowingCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);

  if (error) {
    console.error("Error fetching following count:", error);
    return 0;
  }

  return count || 0;
};

export const getFollowersList = async (userId: string): Promise<FollowerInfo[]> => {
  const { data, error } = await supabase
    .from("follows")
    .select(`
      follower_id,
      follower:users!follows_follower_id_fkey (id, name, image)
    `)
    .eq("following_id", userId);

  if (error) {
    console.error("Error fetching followers list:", error);
    return [];
  }

  // Convertiamo i dati nel formato corretto
  return (data as unknown as SupabaseFollowerResponse[]).map(item => ({
    follower_id: item.follower_id,
    follower: item.follower
  }));
};

export const getFollowingList = async (userId: string): Promise<FollowingInfo[]> => {
  const { data, error } = await supabase
    .from("follows")
    .select(`
      following_id,
      following:users!follows_following_id_fkey (id, name, image)
    `)
    .eq("follower_id", userId);

  if (error) {
    console.error("Error fetching following list:", error);
    return [];
  }

  // Assicuriamoci che i dati siano nel formato corretto
  return (data as unknown as FollowingInfo[]) || [];
};

export const isUserFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId);

  if (error) {
    console.error("Error checking if user is following:", error);
    return false;
  }

  return data !== null && data.length > 0;
};





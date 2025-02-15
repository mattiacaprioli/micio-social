import { supabase } from "../lib/supabase";

export const followUser = async (followerId, followingId) => {
  const { data, error } = await supabase
    .from('follows')
    .insert([{ follower_id: followerId, following_id: followingId }]);

  if (error) console.error(error);
  return data;
};

export const unfollowUser = async (followerId, followingId) => {
  const { data, error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  if (error) console.error(error);
  return data;
};

export const getFollowersCount = async (userId) => {
  const { count, error } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId);

  if (error) {
    console.error("Errore nel recupero dei follower:", error);
    return 0;
  }

  return count;
};

export const getFollowingCount = async (userId) => {
  const { count, error } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId);

  if (error) {
    console.error("Errore nel recupero dei following:", error);
    return 0;
  }

  return count;
};
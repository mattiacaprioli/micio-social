import { supabase } from "@/lib/supabase";
import { ApiResponse } from "./types";
import { Story, UserStoryGroup, CreateStoryInput } from "./types";
import { uploadFile } from "./imageService";

export const fetchFeedStories = async (
  currentUserId: string
): Promise<ApiResponse<UserStoryGroup[]>> => {
  try {
    // Get followed user IDs
    const { data: follows, error: followsError } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", currentUserId);

    if (followsError) return { success: false, msg: followsError.message };

    const followingIds = (follows || []).map((f: { following_id: string }) => f.following_id);
    const userIds = [...followingIds, currentUserId];

    // Fetch active stories for followed users + self
    const { data: stories, error: storiesError } = await supabase
      .from("stories")
      .select("*, user:user_id(id, name, image), story_views(viewer_id)")
      .in("user_id", userIds)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: true });

    if (storiesError) return { success: false, msg: storiesError.message };

    if (!stories || stories.length === 0) {
      return { success: true, data: [] };
    }

    // Group stories by user
    const groupMap = new Map<string, UserStoryGroup>();

    for (const story of stories as Story[]) {
      const userId = story.user_id;
      const userName = story.user?.name ?? "";
      const userImage = story.user?.image ?? null;

      if (!groupMap.has(userId)) {
        groupMap.set(userId, {
          userId,
          userName,
          userImage,
          stories: [],
          hasUnseenStory: false,
        });
      }

      const group = groupMap.get(userId)!;
      group.stories.push(story);

      const hasSeen = (story.story_views ?? []).some(
        (v: { viewer_id: string }) => v.viewer_id === currentUserId
      );
      if (!hasSeen) {
        group.hasUnseenStory = true;
      }
    }

    let groups = Array.from(groupMap.values());

    // Sort: current user first, then unseen before seen
    groups.sort((a, b) => {
      if (a.userId === currentUserId) return -1;
      if (b.userId === currentUserId) return 1;
      if (a.hasUnseenStory && !b.hasUnseenStory) return -1;
      if (!a.hasUnseenStory && b.hasUnseenStory) return 1;
      return 0;
    });

    return { success: true, data: groups };
  } catch (error) {
    return { success: false, msg: (error as Error).message };
  }
};

export const createStory = async (
  input: CreateStoryInput
): Promise<ApiResponse<Story>> => {
  try {
    console.log("[createStory] uploading image...", input.imageUri);
    const uploadResult = await uploadFile("storyImages", input.imageUri, true);
    console.log("[createStory] upload result:", JSON.stringify(uploadResult));
    if (!uploadResult.success || !uploadResult.data) {
      return { success: false, msg: uploadResult.msg ?? "Upload failed" };
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("stories")
      .insert({
        user_id: input.userId,
        file: uploadResult.data,
        caption: input.caption ?? null,
        expires_at: expiresAt,
      })
      .select()
      .single();

    console.log("[createStory] insert result - data:", JSON.stringify(data), "error:", JSON.stringify(error));
    if (error) return { success: false, msg: error.message || JSON.stringify(error) };
    return { success: true, data: data as Story };
  } catch (err) {
    console.error("[createStory] exception:", err);
    return { success: false, msg: (err as Error).message || String(err) };
  }
};

export const markStoryViewed = async (
  storyId: string,
  viewerId: string
): Promise<ApiResponse<null>> => {
  try {
    const { error } = await supabase
      .from("story_views")
      .upsert({ story_id: storyId, viewer_id: viewerId })
      .select();

    if (error) return { success: false, msg: error.message };
    return { success: true, data: null };
  } catch (error) {
    return { success: false, msg: (error as Error).message };
  }
};

export const deleteStory = async (
  storyId: string
): Promise<ApiResponse<null>> => {
  try {
    const { error } = await supabase
      .from("stories")
      .delete()
      .eq("id", storyId);

    if (error) return { success: false, msg: error.message };
    return { success: true, data: null };
  } catch (error) {
    return { success: false, msg: (error as Error).message };
  }
};

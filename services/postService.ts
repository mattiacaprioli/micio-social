import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService";
import { ApiResponse } from "./types";
import { PostRow } from "@/src/types/supabase";

interface PostFile {
  uri: string;
  type: "image" | "video";
}

interface CreatePostInput {
  id?: string;
  userId: string;
  body?: string;
  file?: PostFile | string;
}

interface PostWithRelations extends PostRow {
  user?: {
    id: string;
    name: string;
    image: string | null;
  };
  postLikes: Array<any>;
  comments: Array<any> | { count: number };
}

interface PostLike {
  userId: string;
  postId: string;
}

interface Comment {
  id?: string;
  userId: string;
  postId: string;
  text: string;
}

export const createOrUpdatePost = async (post: CreatePostInput): Promise<ApiResponse<PostRow>> => {
  try {
    if (post.file && typeof post.file === "object") {
      const isImage = post.file.type === "image";
      const folderName = isImage ? "postImages" : "postVideos";
      const fileResult = await uploadFile(folderName, post.file.uri, isImage);
      
      if (fileResult.success && fileResult.data) {
        post.file = fileResult.data;
      } else {
        return { success: false, msg: "Could not upload media" };
      }
    }

    const { data, error } = await supabase
      .from("posts")
      .upsert({
        id: post.id,
        userId: post.userId,
        body: post.body,
        file: post.file
      })
      .select()
      .single();

    if (error) {
      console.log("createPost error: ", error);
      return { success: false, msg: "Could not create your post" };
    }
    return { success: true, data };
  } catch (error) {
    console.log("createPost error: ", error);
    return { success: false, msg: "Could not create your post" };
  }
};

export const fetchPost = async (limit = 10, userId?: string): Promise<ApiResponse<PostWithRelations[]>> => {
  try {
    let query = supabase
      .from("posts")
      .select(`
        *,
        user: users (id, name, image),
        postLikes (*),
        comments (count)
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq("userId", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.log("fetchPost error: ", error);
      return { success: false, msg: "Could not fetch the posts" };
    }

    return { success: true, data };
  } catch (error) {
    console.log("fetchPost error: ", error);
    return { success: false, msg: "Could not fetch the posts" };
  }
};

interface PostWithComments extends PostWithRelations {
  comments: Array<{
    id: string;
    text: string;
    user: {
      id: string;
      name: string;
      image: string | null;
    };
  }>;
}

export const fetchPostDetails = async (postId: string): Promise<ApiResponse<PostWithComments>> => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        user: users (id, name, image),
        postLikes (*),
        comments (*, user: users (id, name, image))
      `)
      .eq("id", postId)
      .order("created_at", { ascending: false, foreignTable: "comments" })
      .single();

    if (error) {
      console.log("fetchPostDetails error: ", error);
      return { success: false, msg: "Could not fetch the post" };
    }

    return { success: true, data };
  } catch (error) {
    console.log("fetchPostDetails error: ", error);
    return { success: false, msg: "Could not fetch the post" };
  }
};

export const createPostLike = async (postLike: PostLike): Promise<ApiResponse<PostLike>> => {
  try {
    const { data, error } = await supabase
      .from("postLikes")
      .insert(postLike)
      .select()
      .single();

    if (error) {
      console.log("postLike error: ", error);
      return { success: false, msg: "Could not like the post" };
    }

    return { success: true, data };
  } catch (error) {
    console.log("postLike error: ", error);
    return { success: false, msg: "Could not like the post" };
  }
};

export const removePostLike = async (postId: string, userId: string): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase
      .from("postLikes")
      .delete()
      .eq("userId", userId)
      .eq("postId", postId);

    if (error) {
      console.log("postLike error: ", error);
      return { success: false, msg: "Could not remove the post like" };
    }

    return { success: true };
  } catch (error) {
    console.log("postLike error: ", error);
    return { success: false, msg: "Could not remove the post like" };
  }
};

export const createComment = async (comment: Comment): Promise<ApiResponse<Comment>> => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select()
      .single();

    if (error) {
      console.log("comment error: ", error);
      return { success: false, msg: "Could not create your comment" };
    }

    return { success: true, data };
  } catch (error) {
    console.log("comment error: ", error);
    return { success: false, msg: "Could not create your comment" };
  }
};

export const removeComment = async (commentId: string): Promise<ApiResponse<{ commentId: string }>> => {
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.log("removeComment error: ", error);
      return { success: false, msg: "Could not remove the comment" };
    }

    return { success: true, data: { commentId } };
  } catch (error) {
    console.log("removeComment error: ", error);
    return { success: false, msg: "Could not remove the comment" };
  }
};

export const removePost = async (postId: string): Promise<ApiResponse<{ postId: string }>> => {
  try {
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) {
      console.log("removePost error: ", error);
      return { success: false, msg: "Could not remove the post" };
    }

    return { success: true, data: { postId } };
  } catch (error) {
    console.log("removePost error: ", error);
    return { success: false, msg: "Could not remove the post" };
  }
};


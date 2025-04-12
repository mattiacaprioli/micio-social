
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  msg?: string;
  error?: SupabaseError;
}

export interface CreatePostData {
  file?: {
    uri: string;
    type: "image" | "video";
  } | string;
  body?: string;
  userId: string;
  id?: string;
}


export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  msg?: string;
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
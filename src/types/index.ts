export interface User {
  id: string;
  name: string;
  email?: string;
  image?: string;
  bio?: string;
  website?: string;
  birthday?: string;
  gender?: string;
  phoneNumber?: string;
}

export interface Post {
  id: string;
  userId: string;
  body?: string;
  file?: string | {
    uri: string;
    type: "image" | "video";
  };
  createdAt: string;
  user?: User;
  postLikes?: Array<any>;
  comments?: Array<any>;
}

export interface Comment {
  id: string;
  post_id: string;
  userId: string;
  text: string;
  created_at: string;
  user?: User;
}



export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  address?: string;
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
  postId: string;
  userId: string;
  text: string;
  createdAt: string;
  user?: User;
}
export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Omit<UserRow, 'id' | 'created_at'>;
        Update: Partial<Omit<UserRow, 'id' | 'created_at'>>;
      };
      posts: {
        Row: PostRow;
        Insert: Omit<PostRow, 'id' | 'created_at'>;
        Update: Partial<Omit<PostRow, 'id' | 'created_at'>>;
      };
      comments: {
        Row: CommentRow;
        Insert: Omit<CommentRow, 'id' | 'created_at'>;
        Update: Partial<Omit<CommentRow, 'id' | 'created_at'>>;
      };
    };
  };
}

export interface UserRow {
  id: string;
  created_at: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  address?: string;
  birthday?: string;
  gender?: string;
  phone_number?: string;
}

export interface PostRow {
  id: string;
  created_at: string;
  user_id: string;
  body?: string;
  file?: string;
}

export interface CommentRow {
  id: string;
  created_at: string;
  post_id: string;
  user_id: string;
  text: string;
}
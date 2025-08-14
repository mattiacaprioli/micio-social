export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Omit<UserRow, "id" | "created_at">;
        Update: Partial<Omit<UserRow, "id" | "created_at">>;
      };
      posts: {
        Row: PostRow;
        Insert: Omit<PostRow, "id" | "created_at">;
        Update: Partial<Omit<PostRow, "id" | "created_at">>;
      };
      comments: {
        Row: CommentRow;
        Insert: Omit<CommentRow, "id" | "created_at">;
        Update: Partial<Omit<CommentRow, "id" | "created_at">>;
      };
      conversations: {
        Row: ConversationRow;
        Insert: Omit<
          ConversationRow,
          "id" | "created_at" | "updated_at" | "last_message_at"
        >;
        Update: Partial<Omit<ConversationRow, "id" | "created_at">>;
      };
      messages: {
        Row: MessageRow;
        Insert: Omit<MessageRow, "id" | "created_at">;
        Update: Partial<Omit<MessageRow, "id" | "created_at">>;
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
  phoneNumber?: string;
}

export interface PostRow {
  id: string;
  created_at: string;
  user_id: string;
  body?: string;
  file?: string;
  category?: string;
}

export interface CommentRow {
  id: string;
  created_at: string;
  post_id: string;
  user_id: string;
  text: string;
}

export interface ConversationRow {
  id: string;
  created_at: string;
  updated_at: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
}

export interface MessageRow {
  id: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read?: boolean;
  is_deleted: boolean | null;
  updated_at: string | null
}

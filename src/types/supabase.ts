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
      pets: {
        Row: PetRow;
        Insert: Omit<PetRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<PetRow, "id" | "created_at" | "updated_at">>;
      };
      stories: {
        Row: {
          id: string;
          user_id: string;
          file: string;
          caption: string | null;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file: string;
          caption?: string | null;
          created_at?: string;
          expires_at?: string;
        };
        Update: Partial<{
          id?: string;
          user_id: string;
          file: string;
          caption?: string | null;
          created_at?: string;
          expires_at?: string;
        }>;
      };
      story_views: {
        Row: {
          story_id: string;
          viewer_id: string;
          viewed_at: string;
        };
        Insert: {
          story_id: string;
          viewer_id: string;
          viewed_at?: string;
        };
        Update: never;
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
  website?: string;
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
  pet_ids?: string[]; // Array di ID dei gatti taggati
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

export interface PetRow {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string;
  breed?: string;
  age?: number;
  gender?: 'male' | 'female' | 'unknown';
  bio?: string;
  image?: string;
  weight?: number;
  birth_date?: string;
  is_neutered?: boolean;
  medical_notes?: string;
}
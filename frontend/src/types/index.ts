export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface Article {
  id: number;
  url: string;
  title: string;
  author: string | null;
  content: string | null;
  excerpt: string | null;
  thumbnail_url: string | null;
  site_name: string | null;
  reading_time_minutes: number;
  word_count: number;
  is_read: boolean;
  is_archived: boolean;
  saved_at: string;
  updated_at: string;
}

export interface ArticleListResponse {
  articles: Article[];
  total: number;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
}

export interface ArticleFilters {
  is_read?: boolean;
  is_archived?: boolean;
  limit?: number;
  offset?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  sharif?: string;
  phone_number?: string;
  image?: string;
  lang?: 'uz' | 'ru' | 'en';
  created_at?: string;
}

export interface UserCreate {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  sharif?: string;
  phone_number?: string;
  lang?: 'uz' | 'ru' | 'en';
}

export interface University {
  id: number;
  university_name: string;
  state: string;
  level: string;
  grant_name: string;
  grand_amount: string;
  grand_turi: string;
  directions: string;
  reception_start: string;
  reception_end: string;
  updated_at?: string;
  created_at?: string;
}

export interface UniversityFilters {
  university_name?: string;
  state?: string;
  level?: string;
  grant_name?: string;
  grand_amount?: string;
  grand_turi?: string;
  directions?: string;
  search?: string;
  page?: number;
}

export interface Eslatma {
  id: number;
  eslatma_matni: string;
  universitet: number;
  user: number;
  eslatma_kun?: string;
  ogohlantirish_sms?: string;
  qolgan_kun?: string;
  tugash_kun?: string;
  updated_at?: string;
  created_at?: string;
}

export interface EslatmaFilters {
  user?: number;
  university?: number;
  eslatma_matni?: string;
  qolgan_kun?: string;
  tugash_kun?: string;
  search?: string;
  page?: number;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AiChatRequest {
  text: string;
  file?: File;
  target_lang?: string;
  response_type?: 'text' | 'json';
}

export interface AiChatResponse {
  text: string;
  title?: string;
  file?: string;
}
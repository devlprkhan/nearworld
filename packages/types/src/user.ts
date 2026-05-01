// ─── User ────────────────────────────────────────
export interface User {
  id: string
  supabase_auth_id?: string | null
  username?: string | null
  email?: string | null
  phone?: string | null
  full_name?: string | null
  date_of_birth?: string | null
  avatar_url?: string | null
  bio?: string | null
  auth_provider: string
  is_verified: boolean
  is_private: boolean
  is_profile_complete: boolean
  created_at: string
  updated_at: string
}

// ─── Auth Inputs ─────────────────────────────────
export interface RegisterInput {
  email?: string
  phone?: string
  password: string
}

export interface LoginInput {
  email?: string
  phone?: string
  password: string
}

export interface SocialLoginInput {
  provider: 'google' | 'apple' | 'facebook'
  id_token: string
}

export interface SendOtpInput {
  email?: string
  phone?: string
}

export interface VerifyOtpInput {
  email?: string
  phone?: string
  token: string
}

// ─── Auth Tokens ─────────────────────────────────
export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface AuthResponse {
  tokens: AuthTokens
  user: User
}

// ─── API Response Wrappers ───────────────────────
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error'
  data?: T
  message?: string
  error?: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta
}

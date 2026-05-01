import { getSupabaseAdmin } from '../config/supabase'
import type { User } from '@nearworld/types'

interface SupabaseAuthResult {
  access_token: string
  refresh_token: string
  expires_in: number
  user: User
}

export async function registerUser(input: {
  email?: string
  phone?: string
  password: string
}): Promise<User> {
  const supabase = getSupabaseAdmin()

  const payload: Record<string, unknown> = {
    password: input.password,
    email_confirm: true,
    phone_confirm: true,
  }
  if (input.email) payload.email = input.email
  if (input.phone) payload.phone = input.phone

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase.auth.admin.createUser(payload as any)

  if (error) throw new Error(error.message)
  return data.user as unknown as User
}

async function supabaseFetch(
  path: string,
  body: Record<string, unknown>
): Promise<SupabaseAuthResult> {
  const supabaseUrl = process.env.SUPABASE_URL!
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

  const response = await fetch(`${supabaseUrl}${path}`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await response.json()

  if (!response.ok) {
    throw new Error(data.error_description || 'Request failed')
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    user: data.user,
  }
}

export async function loginWithPassword(
  email?: string,
  phone?: string,
  password?: string
): Promise<SupabaseAuthResult> {
  return supabaseFetch('/auth/v1/token?grant_type=password', { email, phone, password })
}

export async function loginWithSocial(
  provider: string,
  idToken: string
): Promise<SupabaseAuthResult> {
  return supabaseFetch('/auth/v1/token?grant_type=id_token', { provider, id_token: idToken })
}

export async function sendOtp(email?: string, phone?: string): Promise<void> {
  await supabaseFetch('/auth/v1/otp', { email, phone })
}

export async function verifyOtp(
  email?: string,
  phone?: string,
  token?: string
): Promise<SupabaseAuthResult> {
  return supabaseFetch('/auth/v1/token?grant_type=otp', { email, phone, token })
}

import { prisma } from '../config/database'

/**
 * Find a user by their Supabase auth ID, or create one if they're new.
 * Called on every authenticated request to ensure the user exists locally.
 */
export async function findOrCreateUser(
  supabaseAuthId: string,
  email?: string | null,
  phone?: string | null,
  authProvider?: string
) {
  let user = await prisma.users.findUnique({
    where: { supabase_auth_id: supabaseAuthId },
  })

  if (!user) {
    const data: Record<string, unknown> = {
      id: crypto.randomUUID(),
      supabase_auth_id: supabaseAuthId,
      email: email ?? null,
      auth_provider: authProvider ?? 'email',
    }

    // Only set phone if it has a value — avoids NULL unique conflict
    if (phone) {
      data.phone = phone
    }

    user = await prisma.users.create({ data: data as any })
  }

  return user
}

/**
 * Get user by their internal UUID (used by all other tables: posts, likes, etc.)
 */
export async function getUserById(id: string) {
  return prisma.users.findUnique({
    where: { id },
  })
}

/**
 * Get user by Supabase auth ID.
 */
export async function getUserBySupabaseAuthId(supabaseAuthId: string) {
  return prisma.users.findUnique({
    where: { supabase_auth_id: supabaseAuthId },
  })
}

/**
 * Update user profile fields.
 */
export async function updateUser(
  supabaseAuthId: string,
  data: {
    username?: string
    full_name?: string
    bio?: string
    avatar_url?: string
  }
) {
  return prisma.users.update({
    where: { supabase_auth_id: supabaseAuthId },
    data,
  })
}

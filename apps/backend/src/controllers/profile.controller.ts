import type { Request, Response } from 'express'
import { findOrCreateUser } from '../services/profile.service'

/**
 * GET /api/v1/users/me
 * Returns the current authenticated user's profile.
 * Creates the user in our DB if this is their first request.
 */
export async function getMyProfile(req: Request, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const user = await findOrCreateUser(
    req.userId, // Supabase UUID from JWT
    req.userEmail,
    req.userPhone
  )

  res.json({
    user: {
      id: user.id,
      supabase_auth_id: user.supabase_auth_id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      bio: user.bio,
      auth_provider: user.auth_provider,
      is_verified: user.is_verified,
      is_private: user.is_private,
      is_profile_complete: user.is_profile_complete,
      created_at: user.created_at,
    },
  })
}

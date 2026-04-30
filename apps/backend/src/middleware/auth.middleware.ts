import { Request, Response, NextFunction } from 'express'
import { jwtVerify, createRemoteJWKSet } from 'jose'

declare global {
  namespace Express {
    interface Request {
      userId?: string
      userEmail?: string
      userPhone?: string
    }
  }
}

// Remove the top-level constant — it caches the wrong value
let JWKS: ReturnType<typeof createRemoteJWKSet> | null = null

function getJWKS() {
  const supabaseUrl = process.env.SUPABASE_URL
  if (!supabaseUrl) throw new Error('SUPABASE_URL is not defined')

  if (!JWKS) {
    JWKS = createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`))
  }
  return JWKS
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const supabaseUrl = process.env.SUPABASE_URL!
    console.log('SUPABASE_URL being used:', process.env.SUPABASE_URL)
    const { payload } = await jwtVerify(token, getJWKS(), {
      issuer: `${supabaseUrl}/auth/v1`,
      audience: 'authenticated',
    })

    req.userId = payload.sub
    req.userEmail = payload.email as string | undefined
    req.userPhone = payload.phone as string | undefined
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.split(' ')[1]
  const supabaseUrl = process.env.SUPABASE_URL!

  jwtVerify(token, getJWKS(), {
    issuer: `${supabaseUrl}/auth/v1`,
    audience: 'authenticated',
  })
    .then(({ payload }) => {
      req.userId = payload.sub
      req.userEmail = payload.email as string | undefined
      req.userPhone = payload.phone as string | undefined
    })
    .catch(() => {})
    .finally(() => next())
}

import type { Request, Response } from 'express'
import * as authService from '../services/auth.service'
import { AppError } from '../middleware/error.middleware'

/**
 * POST /api/v1/auth/register
 * Register with email + password or phone + password.
 */
export async function register(req: Request, res: Response) {
  const { email, phone, password } = req.body

  if (!email && !phone) {
    throw new AppError(400, 'Email or phone is required')
  }

  if (!password || password.length < 6) {
    throw new AppError(400, 'Password must be at least 6 characters')
  }

  const user = await authService.registerUser({ email, phone, password })

  res.status(201).json({
    status: 'success',
    data: { user },
  })
}

/**
 * POST /api/v1/auth/login
 * Login with email + password or phone + password.
 */
export async function login(req: Request, res: Response) {
  const { email, phone, password } = req.body

  if (!email && !phone) {
    throw new AppError(400, 'Email or phone is required')
  }

  if (!password) {
    throw new AppError(400, 'Password is required')
  }

  const result = await authService.loginWithPassword(email, phone, password)

  res.json({
    status: 'success',
    data: {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      expires_in: result.expires_in,
      user: result.user,
    },
  })
}

/**
 * POST /api/v1/auth/social
 * Social login with Google, Apple, or Facebook ID token.
 */
export async function socialLogin(req: Request, res: Response) {
  const { provider, id_token } = req.body

  if (!provider || !id_token) {
    throw new AppError(400, 'Provider and id_token are required')
  }

  const validProviders = ['google', 'apple', 'facebook']

  if (!validProviders.includes(provider)) {
    throw new AppError(400, `Provider must be one of: ${validProviders.join(', ')}`)
  }

  const result = await authService.loginWithSocial(provider, id_token)

  res.json({
    status: 'success',
    data: {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      expires_in: result.expires_in,
      user: result.user,
    },
  })
}

/**
 * POST /api/v1/auth/otp/send
 * Send OTP to email or phone.
 */
export async function sendOtp(req: Request, res: Response) {
  const { email, phone } = req.body

  if (!email && !phone) {
    throw new AppError(400, 'Email or phone is required')
  }

  await authService.sendOtp(email, phone)

  res.json({
    status: 'success',
    message: 'OTP sent successfully',
  })
}

/**
 * POST /api/v1/auth/otp/verify
 * Verify OTP and get tokens.
 */
export async function verifyOtp(req: Request, res: Response) {
  const { email, phone, token } = req.body

  if (!email && !phone) {
    throw new AppError(400, 'Email or phone is required')
  }

  if (!token) {
    throw new AppError(400, 'OTP token is required')
  }

  const result = await authService.verifyOtp(email, phone, token)

  res.json({
    status: 'success',
    data: {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      expires_in: result.expires_in,
      user: result.user,
    },
  })
}

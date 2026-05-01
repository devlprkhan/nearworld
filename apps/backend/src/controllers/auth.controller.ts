import type { Request, Response } from 'express'
import * as authService from '../services/auth.service'
import { AppError } from '../middleware/error.middleware'
import type { ApiResponse, AuthResponse } from '@nearworld/types'
import { findOrCreateUser } from '../services/profile.service'

export async function register(req: Request, res: Response) {
  const { email, phone, password } = req.body
  if (!email && !phone) throw new AppError(400, 'Email or phone is required')
  if (!password || password.length < 6)
    throw new AppError(400, 'Password must be at least 6 characters')

  const user = await authService.registerUser({ email, phone, password })
  console.log('🔍 REGISTER user keys:', Object.keys(user as any))
  console.log('🔍 REGISTER raw_app_meta_data:', (user as any).raw_app_meta_data)

  // Sync to our DB
  const rawUser = user as any
  await findOrCreateUser(user.id, user.email, user.phone, rawUser.app_metadata?.provider)

  const response: ApiResponse = { status: 'success', data: { user } }
  res.status(201).json(response)
}

export async function login(req: Request, res: Response) {
  const { email, phone, password } = req.body
  if (!email && !phone) throw new AppError(400, 'Email or phone is required')
  if (!password) throw new AppError(400, 'Password is required')

  const result = await authService.loginWithPassword(email, phone, password)
  console.log('🔍 LOGIN user keys:', Object.keys(result.user as any))
  console.log('🔍 LOGIN raw_app_meta_data:', (result.user as any).raw_app_meta_data)

  // Sync to our DB
  const rawResult = result as any
  await findOrCreateUser(result.user.id, result.user.email, rawResult.app_metadata?.provider)

  const response: ApiResponse<AuthResponse> = {
    status: 'success',
    data: {
      tokens: {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        expires_in: result.expires_in,
      },
      user: result.user,
    },
  }
  res.json(response)
}

export async function socialLogin(req: Request, res: Response) {
  const { provider, id_token } = req.body
  if (!provider || !id_token) throw new AppError(400, 'Provider and id_token are required')
  if (!['google', 'apple', 'facebook'].includes(provider))
    throw new AppError(400, 'Invalid provider')

  const result = await authService.loginWithSocial(provider, id_token)
  console.log('🔍 SOCIAL user keys:', Object.keys(result.user as any))
  console.log('🔍 SOCIAL raw_app_meta_data:', (result.user as any).raw_app_meta_data)

  // Sync to our DB
  const rawResult = result as any
  await findOrCreateUser(result.user.id, result.user.email, rawResult.app_metadata?.provider)

  const response: ApiResponse<AuthResponse> = {
    status: 'success',
    data: {
      tokens: {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        expires_in: result.expires_in,
      },
      user: result.user,
    },
  }
  res.json(response)
}

export async function sendOtp(req: Request, res: Response) {
  const { email, phone } = req.body
  if (!email && !phone) throw new AppError(400, 'Email or phone is required')
  await authService.sendOtp(email, phone)
  res.json({ status: 'success', message: 'OTP sent successfully' })
}

export async function verifyOtp(req: Request, res: Response) {
  const { email, phone, token } = req.body
  if (!email && !phone) throw new AppError(400, 'Email or phone is required')
  if (!token) throw new AppError(400, 'OTP token is required')

  const result = await authService.verifyOtp(email, phone, token)
  console.log('🔍 OTP user keys:', Object.keys(result.user as any))
  console.log('🔍 OTP raw_app_meta_data:', (result.user as any).raw_app_meta_data)

  // Sync to our DB
  const rawResult = result as any
  await findOrCreateUser(result.user.id, result.user.email, rawResult.app_metadata?.provider)

  const response: ApiResponse<AuthResponse> = {
    status: 'success',
    data: {
      tokens: {
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        expires_in: result.expires_in,
      },
      user: result.user,
    },
  }
  res.json(response)
}

import { Router } from 'express'
import userRouter from './user.routes'

export const router = Router()

// This maps to /api/v1/users
router.use('/users', userRouter)

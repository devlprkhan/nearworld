import { Router, type Router as RouterType } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { getMyProfile } from '../controllers/profile.controller'

const userRouter: RouterType = Router()

userRouter.get('/me', authenticate, getMyProfile)

export default userRouter

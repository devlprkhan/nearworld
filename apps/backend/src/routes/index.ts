import { Router, type Router as RouterType } from 'express'
import { API_ROUTES } from '../constants'
import userRouter from './user.routes'
import authRouter from './auth.routes'

export const router: RouterType = Router()

router.use(API_ROUTES.AUTH, authRouter)
router.use(API_ROUTES.USERS, userRouter)

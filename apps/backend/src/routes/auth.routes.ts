import { Router, type Router as RouterType } from 'express'
import { register, login, socialLogin, sendOtp, verifyOtp } from '../controllers/auth.controller'

const authRouter: RouterType = Router()

// Password-based auth
authRouter.post('/register', register)
authRouter.post('/login', login)

// Social login
authRouter.post('/social', socialLogin)

// Password-Less OTP
authRouter.post('/otp/send', sendOtp)
authRouter.post('/otp/verify', verifyOtp)

export default authRouter

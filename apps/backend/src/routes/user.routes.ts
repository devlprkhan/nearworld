import { Router } from 'express'
import * as UserController from '../controllers/user.controller'

const userRouter = Router()

// GET /api/v1/users
userRouter.get('/', UserController.getUsers)

// POST /api/v1/users/register
userRouter.post('/register', UserController.registerUser)

export default userRouter

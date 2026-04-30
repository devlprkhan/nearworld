import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { getMyProfile } from '../controllers/profile.controller'
import { findOrCreateUser } from '../services/profile.service'

const userRouter = Router()

userRouter.get('/me', authenticate, getMyProfile)

// TEMPORARY — bypass auth for testing
userRouter.get('/test-create', async (req, res) => {
  const user = await findOrCreateUser('630c7912-56e9-4491-a051-82954f739a50', 'test@nearworld.dev')
  res.json({ user })
})

export default userRouter

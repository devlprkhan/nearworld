import type { Request, Response } from 'express'

export const getUsers = async (req: Request, res: Response) => {
  // Logic to fetch users from your DB (Prisma/TypeORM) goes here
  res.json({ message: 'List of users' })
}

export const registerUser = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400)
    throw new Error('Please provide email and password')
  }

  res.status(201).json({
    message: 'User registered successfully',
    user: { email },
  })
}

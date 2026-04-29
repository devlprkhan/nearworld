export interface User {
  id: string
  email: string
  name: string | null
  createdAt: Date
  updatedAt: Date
}

export type CreateUserInput = Pick<User, 'email'> & {
  name?: string
}

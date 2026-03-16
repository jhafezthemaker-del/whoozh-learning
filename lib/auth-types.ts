export interface User {
  id: string
  email: string
  password: string
  name: string
  createdAt: Date
}

export interface Session {
  userId: string
  email: string
  name: string
}

export interface AuthResponse {
  success: boolean
  message: string
  error?: string
}

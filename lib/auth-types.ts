export interface User {
  id: string
  user_id: string
  email: string
  password: string
  name: string
  createdAt: Date
}

export interface Session {
  user_id: string
  email: string
  name: string
  image?: string | null
}

export interface AuthResponse {
  success: boolean
  message: string
  error?: string
}

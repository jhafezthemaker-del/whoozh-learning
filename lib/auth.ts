import { auth } from '@/auth'
import { Session } from 'next-auth'

export async function getSession(): Promise<Session | null> {
  const session = await auth()
  return session
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return !!session
}

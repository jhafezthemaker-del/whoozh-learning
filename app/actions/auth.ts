'use server'

import { signIn, signOut } from '@/auth'
import prisma from '@/lib/prisma'
import bcryptjs from 'bcryptjs'

export async function registerAction(
  email: string,
  password: string,
  name: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!email || !password || !name) {
      return { success: false, message: 'All fields are required' }
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, message: 'Email already registered' }
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10)

    // Create new user in the database
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    })

    // Sign the user in immediately after registration
    return await loginAction(email, password)
  } catch (error: any) {
    console.error('[v0] Registration error:', error)
    return { success: false, message: 'Registration failed' }
  }
}

export async function loginAction(
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' }
    }

    await signIn('credentials', {
      email,
      password,
      redirect: false, // Handle redirect manually on client side to show errors if needed
    })

    return { success: true, message: 'Login successful' }
  } catch (error: any) {
    if (error?.type === 'CredentialsSignin') {
      return { success: false, message: 'Invalid email or password' }
    }
    // NextAuth throws AuthError instances, wait for nextjs redirect to finish correctly
    if(error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error('[v0] Login error:', error)
    return { success: false, message: 'Login failed' }
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirect: false })
}

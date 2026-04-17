'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import fs from 'fs/promises'
import path from 'path'

export async function updateProfileAction(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.user_id) {
    return { success: false, message: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const file = formData.get('image') as File | null

  try {
    let imageUrl = session.user.image || null

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileExtension = path.extname(file.name)
      const filename = `${session.user.user_id}-${Date.now()}${fileExtension}`
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      
      // Ensure directory exists
      await fs.mkdir(uploadDir, { recursive: true })
      
      const filePath = path.join(uploadDir, filename)
      await fs.writeFile(filePath, buffer)
      imageUrl = `/uploads/${filename}`
    }

    await prisma.user.update({
      where: { user_id: session.user.user_id },
      data: {
        name,
        image: imageUrl,
      },
    })

    revalidatePath('/profile')
    revalidatePath('/') // Revalidate home/header as well
    
    return { success: true, message: 'Profile updated successfully' }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, message: 'Failed to update profile' }
  }
}
import bcryptjs from 'bcryptjs'

export async function changePasswordAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.user_id) {
    return { success: false, message: 'Not authenticated' }
  }

  const currentPassword = formData.get('currentPassword')
  const newPassword = formData.get('newPassword')
  const confirmPassword = formData.get('confirmPassword')

  if (
    typeof currentPassword !== 'string' ||
    typeof newPassword !== 'string' ||
    typeof confirmPassword !== 'string'
  ) {
    return { success: false, message: 'Missing required fields' }
  }

  if (newPassword !== confirmPassword) {
    return { success: false, message: 'New passwords do not match' }
  }

  if (newPassword.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { user_id: session.user.user_id },
    })

    if (!user || !user.password) {
      return { success: false, message: 'User not found or password not set' }
    }

    const passwordsMatch = await bcryptjs.compare(currentPassword, user.password)
    if (!passwordsMatch) {
      return { success: false, message: 'Incorrect current password' }
    }

    const hashedNewPassword = await bcryptjs.hash(newPassword, 10)

    await prisma.user.update({
      where: { user_id: session.user.user_id },
      data: {
        password: hashedNewPassword,
      },
    })

    return { success: true, message: 'Password changed successfully' }
  } catch (error) {
    console.error('Error changing password:', error)
    return { success: false, message: 'Failed to change password' }
  }
}

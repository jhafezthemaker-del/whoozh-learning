'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import fs from 'fs/promises'
import path from 'path'

export async function updateProfileAction(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { success: false, message: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const file = formData.get('image') as File | null

  try {
    let imageUrl = session.user.image || null

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileExtension = path.extname(file.name)
      const filename = `${session.user.id}-${Date.now()}${fileExtension}`
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      
      // Ensure directory exists
      await fs.mkdir(uploadDir, { recursive: true })
      
      const filePath = path.join(uploadDir, filename)
      await fs.writeFile(filePath, buffer)
      imageUrl = `/uploads/${filename}`
    }

    await prisma.user.update({
      where: { id: session.user.id },
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

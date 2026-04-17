'use server'

import { google } from '@ai-sdk/google'
import { generateText, Output } from 'ai'
import { z } from 'zod'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Define the schema for the roadmap
const RoadmapSchema = z.object({
  weeks: z.array(z.object({
    title: z.string(),
    days: z.array(z.object({
      title: z.string(),
      sessions: z.array(z.object({
        topic: z.string(),
        time: z.string(),
      })),
    })),
  })),
})

export type RoadmapData = z.infer<typeof RoadmapSchema>

export async function generateRoadmapAction(subjectId: string, subjectName: string) {
  const session = await auth()
  if (!session?.user?.user_id) {
    throw new Error('Not authenticated')
  }

  const today = new Date()
  const dateString = today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })

  try {
    const { output } = await generateText({
      model: google('gemini-3-pro-preview'),
      output: Output.object({ schema: RoadmapSchema }),
      prompt: `Create a 4-week learning roadmap for the subject: ${subjectName}.
      The roadmap should start from today, which is ${dateString}.
      Format the roadmap in weeks and days. 
      Each day should have 2-3 topics/sessions with specific times (e.g., 9:00am, 2:00pm).
      Ensure the topics are logical and progress from beginner to advanced.`,
    })

    return { success: true, roadmap: output }
  } catch (error) {
    console.error('Error generating roadmap:', error)
    return { success: false, message: 'Failed to generate roadmap' }
  }
}

export async function saveRoadmapAction(subjectId: string, roadmapData: RoadmapData) {
  const session = await auth()
  if (!session?.user?.user_id) {
    throw new Error('Not authenticated')
  }

  try {
    await prisma.roadmap.upsert({
      where: {
        user_id_subject_id: {
          user_id: session.user.user_id,
          subject_id: subjectId,
        },
      },
      update: {
        data: roadmapData as any,
      },
      create: {
        user_id: session.user.user_id,
        subject_id: subjectId,
        data: roadmapData as any,
      },
    })

    revalidatePath(`/topic/${subjectId}`)
    return { success: true }
  } catch (error) {
    console.error('Error saving roadmap:', error)
    return { success: false, message: 'Failed to save roadmap' }
  }
}

export async function getRoadmapAction(subjectId: string) {
  const session = await auth()
  if (!session?.user?.user_id) {
    return null
  }

  try {
    const roadmap = await prisma.roadmap.findUnique({
      where: {
        user_id_subject_id: {
          user_id: session.user.user_id,
          subject_id: subjectId,
        },
      },
    })

    return roadmap ? (roadmap.data as unknown as RoadmapData) : null
  } catch (error) {
    console.error('Error fetching roadmap:', error)
    return null
  }
}

'use server'

import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { promises as fs } from 'fs'
import path from 'path'

export async function getInterviewsAction(subjectId: string, topicName: string) {
  const session = await auth()
  if (!session?.user?.user_id) {
    throw new Error('Not authenticated')
  }

  return await prisma.interview.findMany({
    where: {
      user_id: session.user.user_id,
      subject_id: subjectId,
      topic_name: topicName,
    },
    orderBy: {
      created_at: 'desc',
    },
  })
}

export async function generateInterviewQuestionAction(
  topicName: string,
  history: { role: 'user' | 'assistant'; content: string }[]
) {
  const historyText = history
    .map((h) => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.content}`)
    .join('\n')

  const prompt = `You are a professional technical interviewer conducting a mock interview for the topic: "${topicName}".
  
  Here is the conversation history so far:
  ${historyText || '(No history yet. Start by asking the first question.)'}

  Your task is to generate the next single interview question.
  Guidelines:
  - Be professional and direct.
  - If the conversation history is empty, ask the first question about ${topicName}.
  - If the conversation history has questions and answers, review the last answer from the Candidate and ask a relevant follow-up question, or move to the next logical concept in ${topicName}.
  - Ask exactly ONE question. Do not include introductory filler. Just ask the question.
  - Keep the question concise and clear.`

  try {
    const { text } = await generateText({
      model: google('gemini-3.5-flash'),
      prompt: prompt,
    })

    return text.trim()
  } catch (error) {
    console.error('Error generating interview question:', error)
    return 'Could not generate a question at this moment. Please try again.'
  }
}

export async function saveInterviewAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.user_id) {
    throw new Error('Not authenticated')
  }
  const userId = session.user.user_id

  const audioFile = formData.get('audio') as File
  const subjectId = formData.get('subjectId') as string
  const topicName = formData.get('topicName') as string
  const title = formData.get('title') as string

  if (!audioFile) {
    throw new Error('No audio file provided')
  }

  try {
    const bytes = await audioFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'interviews')
    await fs.mkdir(uploadDir, { recursive: true })

    const filename = `${userId}-${Date.now()}.webm`
    const filepath = path.join(uploadDir, filename)
    await fs.writeFile(filepath, buffer)

    const audioUrl = `/uploads/interviews/${filename}`

    const interview = await prisma.interview.create({
      data: {
        user_id: userId,
        subject_id: subjectId,
        topic_name: topicName,
        title: title || `Interview on ${topicName}`,
        audio_url: audioUrl,
      },
    })

    return { success: true, interview }
  } catch (error) {
    console.error('Error saving interview:', error)
    return { success: false, message: 'Failed to save interview audio file' }
  }
}

export async function deleteInterviewAction(interviewId: string) {
  const session = await auth()
  if (!session?.user?.user_id) {
    throw new Error('Not authenticated')
  }

  try {
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
    })

    if (!interview || interview.user_id !== session.user.user_id) {
      throw new Error('Interview not found or unauthorized')
    }

    // Try to delete file
    try {
      const filepath = path.join(process.cwd(), 'public', interview.audio_url)
      await fs.unlink(filepath)
    } catch (e) {
      console.warn('Could not delete audio file from disk:', e)
    }

    await prisma.interview.delete({
      where: { id: interviewId },
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting interview:', error)
    return { success: false, message: 'Failed to delete interview' }
  }
}

'use server'

import { google } from '@ai-sdk/google'
import { generateText, Output } from 'ai'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const SourceSchema = z.object({
  sources: z.array(z.object({
    title: z.string(),
    description: z.string(),
  }))
})

const ResourceSchema = z.object({
  resources: z.array(z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(['pdf', 'video']),
    url: z.string(),
    duration: z.string().optional(),
  }))
})

export async function getOrGenerateSourcesAction(subjectId: string, subjectName: string) {
  // Check DB
  const existing = await prisma.learningSource.findMany({
    where: { subject_id: subjectId }
  })
  
  if (existing.length > 0) return existing

  // Generate
  const { output } = await generateText({
    model: google('gemini-3-pro-preview'),
    output: Output.object({ schema: SourceSchema }),
    prompt: `Generate 3-5 high-quality learning sources for the subject: ${subjectName}. 
    Each source should have a title and a brief description. 
    These should be broad, authoritative sources like "Oxford English Corpus" or "MIT OpenCourseWare".`
  })

  // Save
  const saved = await Promise.all(output.sources.map((s: { title: string; description: string }) => 
    prisma.learningSource.create({
      data: {
        subject_id: subjectId,
        title: s.title,
        description: s.description,
      }
    })
  ))

  return saved
}

export async function getOrGenerateResourcesAction(topicName: string, subjectId: string, subjectName: string) {
  // Check DB
  const existing = await prisma.learningResource.findMany({
    where: { 
      subject_id: subjectId,
      topic_name: topicName
    }
  })

  if (existing.length > 0) return existing

  // Generate
  const { output } = await generateText({
    model: google('gemini-3-pro-preview'),
    output: Output.object({ schema: ResourceSchema }),
    prompt: `Generate 4 specific learning resources for the topic: "${topicName}" within the subject: "${subjectName}".
    Include 2 videos and 2 PDF/Reading resources.
    For videos, PROVIDE VALID, REAL YOUTUBE EMBED URLS (e.g., https://www.youtube.com/embed/VIDEO_ID).
    For PDFs, provide a placeholder description of where to find the material.
    Ensure titles and descriptions are professional.`
  })

  // Save
  const saved = await Promise.all(output.resources.map((r: { title: string; description: string; type: string; url: string; duration?: string }) => 
    prisma.learningResource.create({
      data: {
        subject_id: subjectId,
        topic_name: topicName,
        title: r.title,
        description: r.description,
        type: r.type,
        url: r.url,
        duration: r.duration,
      }
    })
  ))

  return saved
}

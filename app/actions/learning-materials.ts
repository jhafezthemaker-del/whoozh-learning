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
    For PDFs, provide a valid, public PDF URL (e.g., https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf). Do not provide descriptive text in the url field.
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

export async function addManualResourceAction(data: {
  subjectId: string;
  topicName: string;
  title: string;
  description: string;
  type: string;
  url: string;
}) {
  const saved = await prisma.learningResource.create({
    data: {
      subject_id: data.subjectId,
      topic_name: data.topicName,
      title: data.title,
      description: data.description,
      type: data.type,
      url: data.url,
    }
  });
  return saved;
}

const SingleResourceSchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.enum(['pdf', 'video']),
  url: z.string(),
  duration: z.string().optional(),
});

export async function findAiResourceAction(query: string, topicName: string) {
  const { output } = await generateText({
    model: google('gemini-3-pro-preview'),
    output: Output.object({ schema: ResourceSchema }),
    prompt: `Find 3 high-quality learning resources based on the user's request: "${query}".
    This is for the topic: "${topicName}".
    Include a mix of videos and PDF/Reading resources.
    For videos, PROVIDE VALID, REAL YOUTUBE EMBED URLS (e.g., https://www.youtube.com/embed/VIDEO_ID).
    For PDFs, provide a valid, public PDF URL (e.g., https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf).
    Ensure titles and descriptions are professional.`
  })

  return output.resources;
}

const QuizSchema = z.object({
  title: z.string(),
  questions: z.array(z.object({
    type: z.enum(['multiple-choice', 'true-false', 'fill-in-the-blank']),
    question: z.string(),
    options: z.array(z.string()), // Even for True/False and Fill-in-the-blank, we'll keep options for now to maintain compatibility, but logic can vary
    correctAnswer: z.string(),
  }))
})

export async function getQuizzesAction(subjectId: string, topicName: string) {
  return await prisma.quiz.findMany({
    where: {
      subject_id: subjectId,
      topic_name: topicName
    },
    orderBy: {
      created_at: 'desc'
    }
  })
}

export async function generateQuizAction(
  subjectId: string, 
  topicName: string, 
  subjectName: string,
  config?: {
    itemCount: number,
    questionTypes: string[],
    selectedResourceIds: string[],
    title?: string,
    description?: string
  }
) {
  let contextInfo = '';
  
  if (config?.selectedResourceIds && config.selectedResourceIds.length > 0) {
    const selectedResources = await prisma.learningResource.findMany({
      where: {
        id: { in: config.selectedResourceIds }
      }
    });
    
    contextInfo = `Base the quiz on the following resources:\n${selectedResources.map(r => `- ${r.title}: ${r.description}`).join('\n')}`;
  }

  const itemCount = config?.itemCount || 5;
  const types = config?.questionTypes?.join(', ') || 'multiple-choice';

  // Generate
  const { output } = await generateText({
    model: google('gemini-3-pro-preview'),
    output: Output.object({ schema: QuizSchema }),
    prompt: `Generate a ${itemCount}-question quiz for the topic: "${topicName}" within the subject: "${subjectName}".
    ${config?.title ? `The user named this quiz: "${config.title}".` : ''}
    ${config?.description ? `The quiz description is: "${config.description}".` : ''}
    
    Question Types to include: ${types}.
    
    ${contextInfo}
    
    Guidelines:
    - For 'multiple-choice': Provide 4 distinct options.
    - For 'true-false': Provide exactly 2 options: "True" and "False".
    - For 'fill-in-the-blank': The question should be a sentence with a [blank]. Provide 4 options where one is the correct missing word(s), and the others are plausible but incorrect.
    
    Ensure the questions are challenging but fair.
    Specify the correct answer (which must be one of the options).`
  })

  // Save
  const saved = await prisma.quiz.create({
    data: {
      subject_id: subjectId,
      topic_name: topicName,
      title: config?.title || output.title,
      description: config?.description,
      questions: output.questions as any,
    }
  })

  return saved
}


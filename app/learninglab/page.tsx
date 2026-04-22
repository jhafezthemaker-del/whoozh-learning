import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import LearningLabClientPage from './client-page'
import { categories } from '@/lib/categories'

export default async function LearningAreaPage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  const session = await auth()
  
  if (!session?.user || !(session.user as any).user_id) {
    redirect('/auth/login')
  }

  const userId = (session.user as any).user_id
  const roadmapId = searchParams.id

  let roadmapRecord
  if (roadmapId) {
    roadmapRecord = await prisma.roadmap.findUnique({
      where: { id: roadmapId },
    })

    // Security check: Ensure the roadmap belongs to the user
    if (roadmapRecord && roadmapRecord.user_id !== userId) {
      redirect('/library')
    }
  } else {
    // Fetch the user's latest roadmap to determine what they are studying
    roadmapRecord = await prisma.roadmap.findFirst({
      where: { user_id: userId },
      orderBy: { date_created: 'desc' },
    })
  }

  if (!roadmapRecord) {
    redirect('/roadmap') // or show a "no roadmap" message
  }

  const subjectId = roadmapRecord.subject_id
  const roadmapData = roadmapRecord.data as any

  // Get subject name from categories lib
  const subjectName = categories.find(c => c.id === subjectId)?.name || subjectId

  // Extract the current topic (first session of first day of first week by default)
  const firstWeek = roadmapData?.weeks?.[0]
  const firstDay = firstWeek?.days?.[0]
  const firstTopic = firstDay?.sessions?.[0]?.topic || 'General Overview'

  return (
    <LearningLabClientPage 
      subjectId={subjectId}
      subjectName={subjectName}
      initialTopic={firstTopic}
      roadmap={roadmapData}
    />
  )
}

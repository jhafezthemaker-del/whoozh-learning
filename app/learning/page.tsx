import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Header from '@/components/header'
import { Button } from '@/components/ui/button'
import { RoadmapData } from '@/app/actions/roadmap'
import RoadmapEditor from '@/components/roadmap-editor'

export default async function LearningPage() {
  const session = await auth()
  
  if (!session?.user || !(session.user as any).user_id) {
    redirect('/auth/login')
  }

  const userId = (session.user as any).user_id

  // Fetch the user's latest roadmap
  const roadmapRecord = await prisma.roadmap.findFirst({
    where: { user_id: userId },
    orderBy: { date_created: 'desc' },
  })

  const roadmapData = roadmapRecord?.data as unknown as RoadmapData

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-foreground text-balance mb-3">
              Roadmap
            </h1>
            <p className="text-lg text-muted-foreground">
              Your learning schedule and progress tracker
            </p>
          </div>

          {!roadmapRecord ? (
            <div className="text-center bg-secondary rounded-xl p-8 border border-border">
              <h2 className="text-2xl font-bold text-foreground mb-4">No Roadmap Found</h2>
              <p className="text-muted-foreground mb-6">
                You haven't generated a roadmap yet. Generate one to get started!
              </p>
              <Button size="lg" className="px-8" asChild>
                <a href="/">Go to Subjects</a>
              </Button>
            </div>
          ) : (
            <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <RoadmapEditor 
                initialData={roadmapData} 
                subjectId={roadmapRecord.subject_id} 
                topButtonText="Start Learning"
                bottomButtonText="Start Learning"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

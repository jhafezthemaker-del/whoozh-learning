import { getQuizAttemptAction } from '@/app/actions/learning-materials'
import Header from '@/components/header'
import QuizResultsView from '@/components/quiz-results-view'
import { notFound } from 'next/navigation'

interface QuizDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function QuizDetailPage({ params }: QuizDetailPageProps) {
  try {
    const { id } = await params
    const attempt = await getQuizAttemptAction(id)
    
    if (!attempt) {
      return notFound()
    }

    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-12 max-w-5xl">
          <QuizResultsView attempt={attempt as any} />
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error fetching quiz attempt:', error)
    return notFound()
  }
}

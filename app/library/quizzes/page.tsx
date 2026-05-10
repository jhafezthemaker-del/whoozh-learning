import { getUserQuizAttemptsAction } from '@/app/actions/learning-materials'
import Header from '@/components/header'
import QuizHistoryList from '@/components/quiz-history-list'
import { Trophy, ArrowRight, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function QuizzesPage() {
  const attempts = await getUserQuizAttemptsAction()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Your Quiz History</h1>
            <p className="text-muted-foreground mt-1 text-lg">Review your past assessments and progress</p>
          </div>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-20 bg-secondary/30 rounded-3xl border-2 border-dashed border-border mt-12">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <BookOpen className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">No quizzes taken yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Start learning and test your knowledge with AI-generated quizzes in the Learning Lab.
            </p>
            <Link href="/library">
              <Button size="lg" className="gap-2">
                Go to Library <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <QuizHistoryList initialAttempts={attempts as any} />
        )}
      </main>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { ChevronRight, Calendar, Trophy, CheckCircle2, Trash2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { deleteQuizAttemptAction } from '@/app/actions/learning-materials'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'

interface QuizAttemptCardProps {
  attempt: {
    id: string
    score: number
    total_questions: number
    created_at: Date
    quiz: {
      title: string
      topic_name: string
    }
  }
  isSelected?: boolean
  onToggleSelection?: (id: string) => void
}

export default function QuizAttemptCard({ attempt, isSelected, onToggleSelection }: QuizAttemptCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const percentage = Math.round((attempt.score / attempt.total_questions) * 100)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this quiz attempt? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteQuizAttemptAction(attempt.id)
      toast.success('Quiz attempt deleted')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete attempt:', error)
      toast.error('Failed to delete attempt')
    } finally {
      setIsDeleting(false)
    }
  }
  
  return (
    <div className={`relative group transition-all duration-300 ${isSelected ? 'scale-[0.98]' : ''}`}>
      <Link href={`/library/quizzes/${attempt.id}`} className="block h-full">
        <div className={`bg-card border rounded-2xl p-6 h-full transition-all duration-300 relative overflow-hidden flex flex-col ${
          isSelected 
            ? 'border-primary ring-1 ring-primary/50 shadow-lg shadow-primary/5 bg-primary/5' 
            : 'border-border hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30'
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {onToggleSelection && (
                <div onClick={(e) => e.preventDefault()}>
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelection(attempt.id)}
                    className="w-6 h-6 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </div>
              )}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center gap-2">
               <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-8 h-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors z-20 opacity-0 group-hover:opacity-100"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>

          <h3 className="font-bold text-foreground text-xl mb-1 line-clamp-1 group-hover:text-primary transition-colors pr-10 pl-1">
            {attempt.quiz.title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4 font-medium pl-1">
            Topic: {attempt.quiz.topic_name}
          </p>

          <div className="flex items-center gap-2 mb-6 px-1">
            <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${
                  percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs font-bold text-foreground">{percentage}%</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto pt-4 border-t border-border/50">
            <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
              <Calendar className="w-4 h-4 text-primary/70" />
              <span className="font-medium">{format(new Date(attempt.created_at), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
              <CheckCircle2 className="w-4 h-4 text-primary/70" />
              <span className="font-medium">{attempt.score}/{attempt.total_questions}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

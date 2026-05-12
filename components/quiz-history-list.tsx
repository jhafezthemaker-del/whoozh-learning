'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteMultipleQuizAttemptsAction } from '@/app/actions/learning-materials'
import { toast } from 'sonner'
import QuizAttemptCard from './quiz-attempt-card'
import { Trash2, Loader2, CheckSquare, Square, AlertTriangle, GraduationCap, ChevronLeft, ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import { categories } from '@/lib/categories'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog'

interface QuizHistoryListProps {
  initialAttempts: any[]
}

export default function QuizHistoryList({ initialAttempts }: QuizHistoryListProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null)

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    
    setIsDeleting(true)
    try {
      await deleteMultipleQuizAttemptsAction(selectedIds)
      toast.success(`${selectedIds.length} attempts deleted`)
      setSelectedIds([])
      setIsDeleteDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete attempts:', error)
      toast.error('Failed to delete attempts')
    } finally {
      setIsDeleting(false)
    }
  }

  // Group attempts by subject
  const groupedAttempts = initialAttempts.reduce((acc, attempt: any) => {
    const subjectId = attempt.quiz.subject_id
    if (!acc[subjectId]) {
      acc[subjectId] = []
    }
    acc[subjectId].push(attempt)
    return acc
  }, {} as Record<string, any[]>)

  // Sort subject IDs based on their order in categories
  const sortedSubjectIds = Object.keys(groupedAttempts).sort((a, b) => {
    const indexA = categories.findIndex(c => c.id === a)
    const indexB = categories.findIndex(c => c.id === b)
    return indexA - indexB
  })

  const activeSubject = activeSubjectId ? categories.find(c => c.id === activeSubjectId) : null
  const activeAttempts = activeSubjectId ? groupedAttempts[activeSubjectId] : []

  if (!activeSubjectId) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {sortedSubjectIds.map((subjectId) => {
          const subject = categories.find(c => c.id === subjectId)
          const attempts = groupedAttempts[subjectId]
          
          return (
            <div 
              key={subjectId} 
              onClick={() => setActiveSubjectId(subjectId)}
              className="cursor-pointer group"
            >
              <div className="bg-card border border-border rounded-2xl p-6 h-full hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
                
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300 transform origin-bottom-left">
                    {subject?.icon || '📚'}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>

                <h3 className="font-bold text-foreground text-xl mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                  {subject?.name || subjectId}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2 flex-grow">
                  {subject?.description || `Explore your quiz history for ${subjectId}.`}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto pt-4 border-t border-border/50">
                  <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                    <GraduationCap className="w-4 h-4 text-primary/70" />
                    <span className="font-medium">{attempts.length} {attempts.length === 1 ? 'Quiz' : 'Quizzes'}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/20 p-4 rounded-2xl border border-border/50 sticky top-4 z-30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveSubjectId(null)}
            className="gap-2 rounded-xl border-border/50 hover:bg-background transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            All Subjects
          </Button>

          <div className="h-6 w-[1px] bg-border mx-1 hidden md:block" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds(selectedIds.length === activeAttempts.length ? [] : activeAttempts.map((a: any) => a.id))}
            className="text-muted-foreground hover:text-primary gap-2"
          >
            {selectedIds.length === activeAttempts.length && activeAttempts.length > 0 ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {selectedIds.length === activeAttempts.length && activeAttempts.length > 0 ? 'Deselect All' : 'Select All'}
          </Button>
          
          {selectedIds.length > 0 && (
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
                  className="gap-2 animate-in fade-in slide-in-from-left-2 duration-300 shadow-lg shadow-destructive/20"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete ({selectedIds.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
                <AlertDialogHeader>
                  <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                  <AlertDialogTitle className="text-xl font-bold">Delete Quiz Attempts?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground pt-2">
                    You are about to delete <span className="font-bold text-foreground underline decoration-destructive/30 underline-offset-4">{selectedIds.length}</span> {selectedIds.length === 1 ? 'attempt' : 'attempts'}. This will remove these records from your history permanently.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 gap-3">
                  <AlertDialogCancel className="rounded-xl border-border/50 hover:bg-secondary transition-colors">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={(e) => {
                      e.preventDefault()
                      handleBulkDelete()
                    }}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl px-6 transition-all active:scale-95"
                  >
                    {isDeleting ? 'Deleting...' : `Delete ${selectedIds.length === 1 ? 'Attempt' : 'Attempts'}`}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-2xl">{activeSubject?.icon}</div>
          <div className="text-sm font-bold text-foreground">{activeSubject?.name}</div>
          <div className="text-xs text-muted-foreground bg-background/50 px-3 py-1 rounded-full border border-border/50">
            {activeAttempts.length} Total
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeAttempts.map((attempt: any) => (
          <QuizAttemptCard 
            key={attempt.id} 
            attempt={attempt} 
            isSelected={selectedIds.includes(attempt.id)}
            onToggleSelection={toggleSelection}
          />
        ))}
      </div>
    </div>
  )
}

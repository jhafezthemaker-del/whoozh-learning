'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteMultipleQuizAttemptsAction } from '@/app/actions/learning-materials'
import { toast } from 'sonner'
import QuizAttemptCard from './quiz-attempt-card'
import { Trash2, Loader2, CheckSquare, Square, AlertTriangle } from 'lucide-react'
import { Button } from './ui/button'
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-secondary/20 p-4 rounded-2xl border border-border/50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds(selectedIds.length === initialAttempts.length ? [] : initialAttempts.map(a => a.id))}
            className="text-muted-foreground hover:text-primary gap-2"
          >
            {selectedIds.length === initialAttempts.length ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {selectedIds.length === initialAttempts.length ? 'Deselect All' : 'Select All'}
          </Button>
          
          {selectedIds.length > 0 && (
            <div className="h-4 w-[1px] bg-border mx-2" />
          )}

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
                  Delete Selected ({selectedIds.length})
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
        
        <div className="text-sm text-muted-foreground font-medium">
          {initialAttempts.length} Total Attempts
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialAttempts.map((attempt) => (
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

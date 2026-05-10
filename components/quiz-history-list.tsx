'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteMultipleQuizAttemptsAction } from '@/app/actions/learning-materials'
import { toast } from 'sonner'
import QuizAttemptCard from './quiz-attempt-card'
import { Trash2, Loader2, CheckSquare, Square } from 'lucide-react'
import { Button } from './ui/button'

interface QuizHistoryListProps {
  initialAttempts: any[]
}

export default function QuizHistoryList({ initialAttempts }: QuizHistoryListProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} quiz attempts?`)) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteMultipleQuizAttemptsAction(selectedIds)
      toast.success(`${selectedIds.length} attempts deleted`)
      setSelectedIds([])
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
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
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

'use client'

import { useState } from 'react'
import { Quiz, QuizQuestion } from '@/lib/learning-materials'
import { CheckCircle2, XCircle, RefreshCcw, Trophy, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { saveQuizAttemptAction } from '@/app/actions/learning-materials'
import { useRouter } from 'next/navigation'

interface QuizSectionProps {
  quiz: Quiz
}

export default function QuizSection({ quiz }: QuizSectionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [userAnswers, setUserAnswers] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  const currentQuestion = quiz.questions[currentQuestionIndex]

  const handleAnswerSelect = (option: string) => {
    if (showFeedback) return
    setSelectedAnswer(option)
  }

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return
    setShowFeedback(true)
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    if (isCorrect) {
      setScore(prev => prev + 1)
    }
    setUserAnswers(prev => [...prev, {
      questionIndex: currentQuestionIndex,
      selectedAnswer,
      isCorrect
    }])
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      handleCompleteQuiz()
    }
  }

  const handleCompleteQuiz = async () => {
    setIsSaving(true)
    try {
      await saveQuizAttemptAction({
        quiz_id: quiz.id,
        score,
        total_questions: quiz.questions.length,
        answers: userAnswers,
      })
      setShowResults(true)
    } catch (error) {
      console.error('Failed to save quiz attempt:', error)
      setShowResults(true) // Show results anyway but maybe with a warning
    } finally {
      setIsSaving(false)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setScore(0)
    setShowResults(false)
    setUserAnswers([])
  }

  if (showResults) {
    return (
      <div 
        className="mt-8 p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-3xl font-bold text-foreground mb-2">Quiz Completed!</h3>
        <p className="text-muted-foreground mb-6">
          You scored <span className="text-primary font-bold">{score}</span> out of <span className="font-semibold">{quiz.questions.length}</span>
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <Button onClick={resetQuiz} variant="outline" className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Button>
          <Button onClick={() => router.push('/library/quizzes')} className="gap-2">
            View All My Quizzes
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 space-y-6 animate-in fade-in duration-500 w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-foreground">Topic Quiz: {quiz.title}</h3>
          {quiz.description && (
            <p className="text-sm text-muted-foreground italic line-clamp-2 max-w-2xl">
              {quiz.description}
            </p>
          )}
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </span>
      </div>

      <div className="relative w-full bg-secondary h-3 rounded-full overflow-hidden shadow-inner">
        <div 
          className="absolute left-0 top-0 bg-gradient-to-r from-primary via-primary/80 to-primary h-full transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]"
          style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress-stripe_1s_linear_infinite]" />
        </div>
      </div>

      <div 
        key={currentQuestionIndex}
        className="p-8 rounded-3xl border border-border bg-card shadow-xl shadow-primary/5 animate-in fade-in slide-in-from-right-8 duration-500 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Trophy className="w-24 h-24 text-primary" />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${
            currentQuestion.type === 'multiple-choice' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
            currentQuestion.type === 'true-false' ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' :
            'bg-orange-500/10 text-orange-600 border border-orange-500/20'
          }`}>
            {currentQuestion.type?.replace('-', ' ') || 'Quiz'}
          </div>
          <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Level: Advanced
          </span>
        </div>

        <h4 className="text-2xl font-bold text-foreground mb-8 leading-tight">
          {currentQuestion.question.split(/(\[blank\])/g).map((part, i) => 
            part === '[blank]' ? (
              <span key={i} className="inline-block min-w-[120px] border-b-4 border-primary/40 mx-2 bg-primary/5 rounded-t-lg h-8 translate-y-2" />
            ) : part
          )}
        </h4>
        
        <div className="grid gap-4">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option
            const isCorrect = option === currentQuestion.correctAnswer
            const isWrong = isSelected && !isCorrect

            let variantClass = "border-border bg-card hover:border-primary/40 hover:bg-primary/5 hover:translate-x-1"
            if (showFeedback) {
              if (isCorrect) variantClass = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 scale-[1.02] shadow-lg shadow-green-500/10"
              else if (isWrong) variantClass = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 opacity-90"
              else variantClass = "opacity-40 grayscale-[0.5] cursor-not-allowed"
            } else if (isSelected) {
              variantClass = "border-primary bg-primary/10 text-primary ring-1 ring-primary/30 translate-x-2"
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showFeedback}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group relative overflow-hidden ${variantClass}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center font-bold text-xs transition-colors ${
                    isSelected ? 'bg-primary border-primary text-white' : 'border-border text-muted-foreground group-hover:border-primary/30'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="font-semibold text-base">{option}</span>
                </div>
                {showFeedback && isCorrect && (
                  <div className="bg-green-500 rounded-full p-1 animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                )}
                {showFeedback && isWrong && (
                  <div className="bg-red-500 rounded-full p-1 animate-in zoom-in duration-300">
                    <XCircle className="w-5 h-5 text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-10 flex justify-end">
          {!showFeedback ? (
            <Button 
              onClick={handleSubmitAnswer} 
              disabled={!selectedAnswer}
              className="h-12 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              onClick={handleNextQuestion}
              disabled={isSaving}
              className="h-12 px-10 rounded-2xl bg-foreground hover:bg-foreground/90 text-background font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Complete Assessment'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { CheckCircle2, XCircle, ArrowLeft, Trophy, Lightbulb } from 'lucide-react'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import { QuizQuestion } from '@/lib/learning-materials'

interface QuizResultsViewProps {
  attempt: {
    score: number
    total_questions: number
    answers: {
      questionIndex: number
      selectedAnswer: string
      isCorrect: boolean
    }[]
    quiz: {
      title: string
      questions: any // Stored as Json
    }
  }
}

export default function QuizResultsView({ attempt }: QuizResultsViewProps) {
  const router = useRouter()
  const questions = attempt.quiz.questions as QuizQuestion[]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{attempt.quiz.title} - Results</h1>
          <p className="text-muted-foreground">Detailed breakdown of your answers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-card border border-border rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm h-fit sticky top-24">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <div className="text-5xl font-black text-primary mb-2">
            {Math.round((attempt.score / attempt.total_questions) * 100)}%
          </div>
          <p className="text-muted-foreground font-medium">
            You got {attempt.score} out of {attempt.total_questions} questions correct
          </p>
        </div>

        <div className="md:col-span-2 space-y-6">
          {questions.map((question, index) => {
            const userAnswer = attempt.answers.find(a => a.questionIndex === index)
            const isCorrect = userAnswer?.isCorrect

            return (
              <div 
                key={index}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  isCorrect ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Question {index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-foreground leading-snug">
                      {question.question.replace('[blank]', '_______')}
                    </h3>
                  </div>
                  <div className={`p-2 rounded-full ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                </div>

                <div className="grid gap-3 mb-6">
                  {question.options.map((option, optIndex) => {
                    const isSelected = userAnswer?.selectedAnswer === option
                    const isCorrectOption = option === question.correctAnswer
                    
                    let className = "p-4 rounded-xl border flex items-center justify-between text-sm transition-all "
                    if (isCorrectOption) {
                      className += "border-green-500 bg-green-500/10 font-bold text-green-700 dark:text-green-400"
                    } else if (isSelected && !isCorrectOption) {
                      className += "border-red-500 bg-red-500/10 font-bold text-red-700 dark:text-red-400"
                    } else {
                      className += "border-border bg-background opacity-60"
                    }

                    return (
                      <div key={optIndex} className={className}>
                        <span>{option}</span>
                        {isCorrectOption && <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-green-500 text-white rounded-full">Correct</span>}
                        {isSelected && !isCorrectOption && <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-red-500 text-white rounded-full">Your Answer</span>}
                      </div>
                    )
                  })}
                </div>

                {question.explanation && (
                  <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                      <Lightbulb className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Explanation</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      "{question.explanation}"
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Quiz, QuizQuestion } from '@/lib/learning-materials'
import { CheckCircle2, XCircle, RefreshCcw, Trophy, ArrowRight } from 'lucide-react'
import { Button } from './ui/button'

interface QuizSectionProps {
  quiz: Quiz
}

export default function QuizSection({ quiz }: QuizSectionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const currentQuestion = quiz.questions[currentQuestionIndex]

  const handleAnswerSelect = (option: string) => {
    if (showFeedback) return
    setSelectedAnswer(option)
  }

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return
    setShowFeedback(true)
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      setShowResults(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
    setScore(0)
    setShowResults(false)
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
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-foreground">Topic Quiz: {quiz.title}</h3>
        <span className="text-sm font-medium text-muted-foreground">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </span>
      </div>

      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
        <div 
          className="bg-primary h-full transition-all duration-500"
          style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
        />
      </div>

      <div 
        key={currentQuestionIndex}
        className="p-6 rounded-2xl border border-border bg-card shadow-sm animate-in fade-in slide-in-from-right-4 duration-300"
      >
        <p className="text-lg font-medium text-foreground mb-6">{currentQuestion.question}</p>
        
        <div className="grid gap-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option
            const isCorrect = option === currentQuestion.correctAnswer
            const isWrong = isSelected && !isCorrect

            let variantClass = "border-border hover:border-primary/50 hover:bg-primary/5"
            if (showFeedback) {
              if (isCorrect) variantClass = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400"
              else if (isWrong) variantClass = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400"
              else variantClass = "opacity-50 cursor-not-allowed"
            } else if (isSelected) {
              variantClass = "border-primary bg-primary/10 text-primary"
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ${variantClass}`}
              >
                <span className="font-medium">{option}</span>
                {showFeedback && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {showFeedback && isWrong && <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            )
          })}
        </div>

        <div className="mt-8 flex justify-end">
          {!showFeedback ? (
            <Button 
              onClick={handleSubmitAnswer} 
              disabled={!selectedAnswer}
              className="px-8"
            >
              Submit Answer
            </Button>
          ) : (
            <Button 
              onClick={handleNextQuestion}
              className="gap-2 px-8"
            >
              {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Show Results'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

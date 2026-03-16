'use client'

import Header from '@/components/header'
import { Button } from '@/components/ui/button'
import { roadmapWeeks } from '@/lib/roadmap'
import { Calendar } from 'lucide-react'

export default function LearningPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-foreground text-balance mb-3">
              Roadmap
            </h1>
            <p className="text-lg text-muted-foreground">
              Your learning schedule and progress tracker
            </p>
          </div>

          {/* Weeks */}
          <div className="space-y-8 mb-12">
            {roadmapWeeks.map((week, weekIndex) => (
              <div key={weekIndex} className="space-y-4">
                {/* Week Title */}
                <h2 className="text-3xl font-bold text-foreground">
                  {week.title}
                </h2>

                {/* Days */}
                <div className="space-y-4">
                  {week.days.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="bg-secondary rounded-xl border border-border p-6 hover:shadow-md transition-all"
                    >
                      {/* Day Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold text-foreground">
                          {day.title}
                        </h3>
                      </div>

                      {/* Sessions as Bullets */}
                      <ul className="space-y-2 ml-8">
                        {day.sessions.map((session, sessionIndex) => (
                          <li
                            key={sessionIndex}
                            className="flex items-start gap-3 text-foreground"
                          >
                            <span className="text-primary mt-1">•</span>
                            <div>
                              <span className="font-medium">{session.topic}</span>
                              <span className="text-muted-foreground ml-2">
                                {session.time}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              className="px-12 h-12 text-base font-semibold"
            >
              Update
            </Button>
            <Button
              size="lg"
              className="px-12 h-12 text-base font-semibold"
            >
              Start
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

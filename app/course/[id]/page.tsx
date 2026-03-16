'use client'

import { useParams } from 'next/navigation'
import Header from '@/components/header'
import { courses } from '@/lib/courses'
import { topics } from '@/lib/topics'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft, Star, Users, BookOpen, Clock, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export default function CoursePage() {
  const params = useParams()
  const courseId = params.id as string
  const [isEnrolled, setIsEnrolled] = useState(false)

  const course = courses.find(c => c.id === courseId)
  const topic = course ? topics.find(t => t.id === course.topicId) : null

  if (!course || !topic) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Course not found</h1>
            <Link href="/">
              <Button>Go back to home</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const levelColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Link href={`/topic/${topic.id}`}>
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to {topic.name}
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Course Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-6xl">{topic.icon}</span>
                  <span className={`text-sm font-semibold px-4 py-2 rounded-full ${levelColors[course.level]}`}>
                    {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                  </span>
                </div>
                <h1 className="text-5xl font-bold text-foreground mb-4">{course.name}</h1>
                <p className="text-lg text-muted-foreground mb-4">{course.description}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-foreground">{course.rating}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ({course.enrolledCount.toLocaleString()} students)
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">
                  Instructor: <span className="font-semibold text-foreground">{course.instructor}</span>
                </p>
              </div>

              {/* Enrollment Button */}
              <div className="flex-shrink-0">
                <Button
                  size="lg"
                  onClick={() => setIsEnrolled(!isEnrolled)}
                  className={isEnrolled ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {isEnrolled ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Enrolled
                    </>
                  ) : (
                    'Enroll Now'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Course Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-secondary rounded-xl p-6 border border-border hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Duration</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{course.duration}</p>
            </div>

            <div className="bg-secondary rounded-xl p-6 border border-border hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Lessons</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{course.lessonsCount}</p>
            </div>

            <div className="bg-secondary rounded-xl p-6 border border-border hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Enrolled</span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {(course.enrolledCount / 1000).toFixed(1)}k
              </p>
            </div>
          </div>

          {/* Course Content */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">What you'll learn</h2>
            <div className="bg-secondary rounded-xl p-8 border border-border space-y-5">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-foreground text-lg">Master fundamental concepts and theory</p>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-foreground text-lg">Apply knowledge through hands-on projects</p>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-foreground text-lg">Gain practical skills used by professionals</p>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-foreground text-lg">Earn a certificate of completion</p>
              </div>
            </div>
          </div>

          {/* Curriculum Preview */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">Course curriculum</h2>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-secondary rounded-xl p-6 border border-border hover:border-primary/30 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 text-lg">
                        Module {i + 1}: Introduction to Core Concepts
                      </h3>
                      <p className="text-sm text-muted-foreground">5 lessons • 45 minutes</p>
                    </div>
                    <span className="text-primary text-lg">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8 border border-primary/20 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-3">Ready to get started?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of students learning {course.name} with {course.instructor}
            </p>
            <Button
              size="lg"
              onClick={() => setIsEnrolled(!isEnrolled)}
              className={isEnrolled ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isEnrolled ? 'Go to course' : 'Enroll now'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

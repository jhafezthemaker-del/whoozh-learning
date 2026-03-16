'use client'

import { useParams } from 'next/navigation'
import Header from '@/components/header'
import { topics } from '@/lib/topics'
import { courses } from '@/lib/courses'
import CourseCard from '@/components/course-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function TopicPage() {
  const params = useParams()
  const topicId = params.id as string
  
  const topic = topics.find(t => t.id === topicId)
  const topicCourses = courses.filter(c => c.topicId === topicId)

  if (!topic) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Topic not found</h1>
            <Link href="/">
              <Button>Go back to home</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to topics
          </Button>
        </Link>

        <div className="max-w-6xl mx-auto">
          {/* Topic Header */}
          <div className="mb-12 pb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-6xl">{topic.icon}</span>
              <div>
                <h1 className="text-5xl font-bold text-foreground">{topic.name}</h1>
                <p className="text-muted-foreground mt-3 text-lg">{topic.description}</p>
              </div>
            </div>
          </div>

          {/* Courses Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Available Courses ({topicCourses.length})
            </h2>
            
            {topicCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topicCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-secondary rounded-lg">
                <p className="text-muted-foreground">No courses available for this topic yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

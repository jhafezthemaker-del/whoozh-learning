'use client'

import { Course } from '@/lib/courses'
import { Star, Users, BookOpen, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CourseCardProps {
  course: Course
}

export default function CourseCard({ course }: CourseCardProps) {
  const levelColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  }

  return (
    <Link href={`/course/${course.id}`}>
      <div className="group h-full bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/30 hover:scale-105">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-lg">
              {course.name}
            </h3>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${levelColors[course.level]}`}>
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          </span>
        </div>

        <div className="space-y-3 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>{course.lessonsCount} lessons</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{course.enrolledCount.toLocaleString()} enrolled</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-foreground">{course.rating}</span>
          </div>
          <span className="text-sm font-medium text-primary group-hover:text-primary transition-colors">
            Learn →
          </span>
        </div>

        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
          by {course.instructor}
        </p>
      </div>
    </Link>
  )
}

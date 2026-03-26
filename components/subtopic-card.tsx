'use client'

import { SubTopic } from '@/lib/categories'
import { BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface SubtopicCardProps {
  subtopic: SubTopic
  categoryId: string
}

export default function SubtopicCard({ subtopic, categoryId }: SubtopicCardProps) {
  return (
    <Link href={`/topic/${subtopic.id}`}>
      <div className="group h-full bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/30 hover:scale-105 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="text-3xl mb-2">{subtopic.icon}</div>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
        </div>

        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors text-lg mb-2">
          {subtopic.name}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {subtopic.description}
        </p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          <span>{subtopic.courseCount} courses</span>
        </div>
      </div>
    </Link>
  )
}

'use client'

import { Topic } from '@/lib/topics'
import Link from 'next/link'

interface TopicCardProps {
  topic: Topic
  isSelected?: boolean
  onClick?: () => void
}

export default function TopicCard({ topic, isSelected, onClick }: TopicCardProps) {
  return (
    <Link href={`/topic/${topic.id}`}>
      <div
        onClick={onClick}
        className={`
          group rounded-2xl p-8 cursor-pointer transition-all duration-300 ease-out
          border-2 border-transparent flex flex-col items-center justify-center min-h-40
          ${
            isSelected
              ? 'bg-secondary border-primary shadow-md'
              : 'bg-secondary hover:shadow-md hover:scale-105'
          }
        `}
      >
        <div className="text-5xl mb-4">
          {topic.icon}
        </div>
        
        <h3 className="text-xl font-bold text-foreground text-center group-hover:text-primary transition-colors">
          {topic.name}
        </h3>
      </div>
    </Link>
  )
}

'use client'

import { useState } from 'react'
import Header from '@/components/header'
import TopicCard from '@/components/topic-card'
import { topics } from '@/lib/topics'

export default function Home() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-foreground text-balance">
              Choose subject to get started
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                isSelected={selectedTopic === topic.id}
                onClick={() => setSelectedTopic(topic.id)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

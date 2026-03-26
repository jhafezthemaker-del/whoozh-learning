'use client'

import { useState } from 'react'
import Header from '@/components/header'
import CategoryCard from '@/components/category-card'
import SubtopicCard from '@/components/subtopic-card'
import { categories } from '@/lib/categories'
import { ArrowLeft, BookMarked } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {!selectedCategoryId ? (
            // Categories View
            <>
              <div className="text-center mb-16">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <BookMarked className="w-8 h-8 text-primary" />
                  <h1 className="text-5xl font-bold text-foreground text-balance">
                    Choose a Subject
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Explore our comprehensive learning paths across mathematics, science, programming, languages, finance, and history.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    isSelected={selectedCategoryId === category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                  />
                ))}
              </div>
            </>
          ) : selectedCategory ? (
            // Subtopics View
            <>
              <div className="mb-12">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategoryId(null)}
                  className="gap-2 text-muted-foreground hover:text-foreground mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Subjects
                </Button>

                <div className="flex items-center gap-4 mb-8">
                  <div className={`text-5xl`}>
                    {selectedCategory.icon}
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-foreground mb-2">
                      {selectedCategory.name}
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                      {selectedCategory.description}
                    </p>
                  </div>
                </div>

                {/* Topic Count Summary */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                  <BookMarked className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {selectedCategory.topics.length} Topic Areas • {selectedCategory.topics.reduce((sum, t) => sum + t.courseCount, 0)} Total Courses
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedCategory.topics.map((subtopic) => (
                  <SubtopicCard
                    key={subtopic.id}
                    subtopic={subtopic}
                    categoryId={selectedCategory.id}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  )
}

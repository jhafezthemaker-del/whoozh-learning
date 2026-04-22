'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Header from '@/components/header'
import  {categories}  from '@/lib/categories'

import {courses} from '@/lib/courses'
import CourseCard from '@/components/course-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft, Sparkles, Loader2, Map as MapIcon } from 'lucide-react'
import { generateRoadmapAction, getRoadmapAction, RoadmapData } from '@/app/actions/roadmap'
import RoadmapEditor from '@/components/roadmap-editor'
import { toast } from 'sonner'

export default function TopicPage() {
  const params = useParams()
  const topicId = params.id as string
  const subtopicId = params.subid as string
  const topic = categories.find(t => t.id === topicId)
  const subtopic = topic?.topics.find(t => t.id === subtopicId)


  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(true)

  useEffect(() => {
    async function loadRoadmap() {
      setIsLoadingRoadmap(true)
      const data = await getRoadmapAction(subtopicId)
      setRoadmap(data)
      setIsLoadingRoadmap(false)
    }
    loadRoadmap()
  }, [topicId])

  const handleGenerateRoadmap = async () => {
    if (!topic) return
    setIsGenerating(true)
    const result = await generateRoadmapAction(topic.name)
    setIsGenerating(false)

    if (result.success && result.roadmap) {
      setRoadmap(result.roadmap)
      toast.success('AI Roadmap generated!')
    } else {
      toast.error(result.message || 'Failed to generate roadmap')
    }
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4"> Topic not found</h1>
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
          <div className="mb-12 pb-8 border-b border-border/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <span className="text-7xl drop-shadow-sm">{subtopic?.icon}</span>
                <div>
                  <h1 className="text-5xl font-extrabold text-foreground tracking-tight">{subtopic?.name}</h1>
                  <p className="text-muted-foreground mt-3 text-lg max-w-2xl">{subtopic?.description}</p>
                </div>
              </div>
              
              {!roadmap && !isLoadingRoadmap && (
                <Button 
                  size="lg" 
                  onClick={handleGenerateRoadmap} 
                  disabled={isGenerating}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-14 px-8 text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105"
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  {isGenerating ? 'AI Generating...' : 'Generate AI Roadmap'}
                </Button>
              )}
            </div>
          </div>

          {/* Roadmap Section */}
          {isLoadingRoadmap ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
              <p className="text-muted-foreground animate-pulse">Checking for existing roadmaps...</p>
            </div>
          ) : roadmap ? (
            <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <RoadmapEditor 
                initialData={roadmap} 
                subjectId={topicId} 
                onSave={() => {}} 
              />
            </div>
          ) : null}

          {/* Courses Section */}
          <div className="mb-12">
            
            
            {!roadmap ? (
              <>
              <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <MapIcon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">
                No Roadmap Available
              </h2>
            </div>
              <div className="text-center py-20 bg-secondary/30 rounded-3xl border-2 border-dashed border-border">
                <p className="text-muted-foreground text-lg">No predefined courses available for this topic yet.</p>
                <p className="text-sm text-muted-foreground/60 mt-2">Try generating an AI roadmap above to get started!</p>
              </div>
              </>
            ):null }

          </div>
        </div>
      </main>
    </div>
  )
}

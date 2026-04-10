'use client'

import { useState } from 'react'
import { Resource } from '@/lib/learning-materials'
import { FileText, Play, X, ArrowLeft, Clock, ChevronDown } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface LessonResourcesProps {
  resources: Resource[]
  topicTitle: string
}

const TOPICS = [
  { id: 1, name: 'Topic 1' },
  { id: 2, name: 'Topic 2' },
  { id: 3, name: 'Topic 3' },
  { id: 4, name: 'Topic 4' },
  { id: 5, name: 'Topic 5' },
]

const getFormattedTime = () => {
  const now = new Date()
  return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function LessonResources({ resources, topicTitle }: LessonResourcesProps) {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [selectedTopicId, setSelectedTopicId] = useState(1)

  if (selectedResource) {
    return (
      <div className="w-full h-full flex flex-col bg-background">
        {/* Header with Back Button */}
        <div className="border-b border-border p-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedResource(null)}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </Button>
          <h2 className="text-2xl font-bold text-foreground">{selectedResource.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{selectedResource.description}</p>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedResource.type === 'video' ? (
            <div className="max-w-4xl mx-auto">
              <div className="aspect-video bg-muted rounded-xl overflow-hidden border border-border">
                <iframe
                  width="100%"
                  height="100%"
                  src={selectedResource.url}
                  title={selectedResource.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-muted rounded-xl border border-border p-12 text-center h-96 flex items-center justify-center">
                <div className="space-y-4">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-foreground font-medium mb-2">PDF Document</p>
                    <p className="text-muted-foreground text-sm">{selectedResource.title}</p>
                    <Button className="mt-4" size="sm">
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Top Navigation Header */}
      <div className="border-b border-border px-6 py-4 space-y-4">
        {/* Dropdown and Time Row */}
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border hover:bg-muted transition-colors text-foreground font-medium text-sm group">
                View All Topic
                <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {TOPICS.map((topic) => (
                <DropdownMenuItem
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={selectedTopicId === topic.id ? 'bg-primary/10' : ''}
                >
                  {topic.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2 text-foreground">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Time {getFormattedTime()}</span>
          </div>
        </div>

        {/* Topic Navigation */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Prev:{TOPICS[Math.max(0, selectedTopicId - 2)]?.name || 'Topic 1'}
          </span>
          <span className="font-medium text-foreground">
            Current:{TOPICS.find(t => t.id === selectedTopicId)?.name || 'Topic 1'}
          </span>
          <span>
            Next:{TOPICS[Math.min(TOPICS.length - 1, selectedTopicId)]?.name || 'Topic 1'}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-border p-6">
        <h2 className="text-2xl font-bold text-foreground">Learning Resources</h2>
        <p className="text-sm text-muted-foreground mt-1">{topicTitle}</p>
      </div>

      {/* Resources Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {resources.map((resource) => (
            <button
              key={resource.id}
              onClick={() => setSelectedResource(resource)}
              className="w-full text-left p-4 rounded-xl border border-border hover:border-primary hover:bg-muted/50 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg flex-shrink-0 ${
                  resource.type === 'video'
                    ? 'bg-primary/10'
                    : 'bg-blue-500/10'
                }`}>
                  {resource.type === 'video' ? (
                    <Play className={`w-5 h-5 ${
                      resource.type === 'video'
                        ? 'text-primary'
                        : 'text-blue-500'
                    }`} />
                  ) : (
                    <FileText className="w-5 h-5 text-blue-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {resource.description}
                  </p>
                  {resource.duration && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Duration: {resource.duration}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                    resource.type === 'video'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-blue-500/10 text-blue-600'
                  }`}>
                    {resource.type === 'video' ? (
                      <>
                        <Play className="w-3 h-3" />
                        Video
                      </>
                    ) : (
                      <>
                        <FileText className="w-3 h-3" />
                        PDF
                      </>
                    )}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { categories } from '@/lib/categories'
import { Video, FileText, ExternalLink, PlayCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type LearningResource = {
  id: string
  subject_id: string
  topic_name: string
  title: string
  description: string
  type: string
  url: string
  duration?: string | null
  created_at: Date
}

export default function ResourcesClientPage({ initialResources }: { initialResources: LearningResource[] }) {
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedTopic, setSelectedTopic] = useState<string>('all')

  // Derived state
  const availableSubjects = useMemo(() => {
    const subjectIds = Array.from(new Set(initialResources.map(r => r.subject_id)))
    return categories.filter(c => subjectIds.includes(c.id))
  }, [initialResources])

  const availableTopics = useMemo(() => {
    let resourcesToConsider = initialResources
    if (selectedSubject !== 'all') {
      resourcesToConsider = resourcesToConsider.filter(r => r.subject_id === selectedSubject)
    }
    return Array.from(new Set(resourcesToConsider.map(r => r.topic_name)))
  }, [initialResources, selectedSubject])

  const filteredResources = useMemo(() => {
    return initialResources.filter(r => {
      const matchSubject = selectedSubject === 'all' || r.subject_id === selectedSubject
      const matchTopic = selectedTopic === 'all' || r.topic_name === selectedTopic
      return matchSubject && matchTopic
    })
  }, [initialResources, selectedSubject, selectedTopic])

  // Reset topic when subject changes
  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value)
    setSelectedTopic('all')
  }

  const getSubjectColor = (subjectId: string) => {
    return categories.find(c => c.id === subjectId)?.color || 'from-gray-500 to-slate-500'
  }

  const getSubjectName = (subjectId: string) => {
    return categories.find(c => c.id === subjectId)?.name || subjectId
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Resources</h1>
          <p className="text-muted-foreground mt-1">Explore and filter uploaded materials by subject and topic.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground ml-1">Subject</label>
            <select 
              value={selectedSubject} 
              onChange={handleSubjectChange}
              className="flex h-10 w-full sm:w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Subjects</option>
              {availableSubjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.icon} {subject.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground ml-1">Topic</label>
            <select 
              value={selectedTopic} 
              onChange={(e) => setSelectedTopic(e.target.value)}
              disabled={availableTopics.length === 0}
              className="flex h-10 w-full sm:w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Topics</option>
              {availableTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No resources found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your filters or generating new resources in the learning lab.</p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => {
              setSelectedSubject('all')
              setSelectedTopic('all')
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="group overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 border-border/50 hover:border-primary/50">
              <div className={`h-2 w-full bg-gradient-to-r ${getSubjectColor(resource.subject_id)}`} />
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="font-normal text-xs bg-secondary/50">
                    {getSubjectName(resource.subject_id)}
                  </Badge>
                  {resource.type === 'video' ? (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 flex gap-1 items-center">
                      <Video className="w-3 h-3" /> Video
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 flex gap-1 items-center">
                      <FileText className="w-3 h-3" /> PDF / Doc
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {resource.title}
                </CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground mt-1 line-clamp-1">
                  Topic: {resource.topic_name}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {resource.description}
                </p>
                {resource.duration && (
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5 opacity-80">
                    <PlayCircle className="w-3.5 h-3.5" />
                    {resource.duration}
                  </p>
                )}
              </CardContent>
              <CardFooter className="pt-0 border-t border-border/50 bg-secondary/10 mt-auto px-6 py-4">
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all gap-2">
                    {resource.type === 'video' ? 'Watch Video' : 'View Document'}
                    <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                  </Button>
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

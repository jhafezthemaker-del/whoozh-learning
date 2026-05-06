'use client'
 
import { useState, useEffect } from 'react'
import { Resource, Quiz } from '@/lib/learning-materials'
import { FileText, Play, X, ArrowLeft, Clock, ChevronDown, ExternalLink } from 'lucide-react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { AddResourceModal } from './add-resource-modal'
import { generateQuizAction, getQuizzesAction } from '@/app/actions/learning-materials'
import QuizSection from './quiz-section'
import { Brain, Sparkles, Loader2, Plus, BookOpen, GraduationCap } from 'lucide-react'
import { CreateQuizModal, QuizConfig } from './create-quiz-modal'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'

interface LessonResourcesProps {
  resources: Resource[]
  topicTitle: string
  subjectId: string
  subjectName: string
  onResourceAdded: (resource: Resource) => void
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

const isValidUrl = (urlString: string) => {
  if (!urlString) return false
  if (urlString.startsWith('/') || urlString.startsWith('./')) return true
  try {
    new URL(urlString)
    return true
  } catch (e) {
    return false
  }
}

export default function LessonResources({ resources, topicTitle, subjectId, subjectName, onResourceAdded }: LessonResourcesProps) {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [selectedTopicId, setSelectedTopicId] = useState(1)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null)
  const [generatingQuiz, setGeneratingQuiz] = useState(false)

  // Fetch quizzes on topic change
  useEffect(() => {
    async function fetchQuizzes() {
      if (!topicTitle || !subjectId) return
      try {
        const existingQuizzes = await getQuizzesAction(subjectId, topicTitle)
        setQuizzes(existingQuizzes as unknown as Quiz[])
        // Auto-select first quiz if available and none selected
        if (existingQuizzes.length > 0 && !activeQuizId) {
          // setActiveQuizId(existingQuizzes[0].id) // Don't auto-select, wait for click
        }
      } catch (error) {
        console.error('Failed to fetch quizzes', error)
      }
    }
    fetchQuizzes()
  }, [topicTitle, subjectId])

  const handleGenerateQuiz = async (config?: QuizConfig) => {
    setGeneratingQuiz(true)
    try {
      const newQuiz = await generateQuizAction(
        subjectId, 
        topicTitle, 
        subjectName,
        config
      )
      setQuizzes(prev => [newQuiz as unknown as Quiz, ...prev])
      setActiveQuizId(newQuiz.id)
      toast.success('AI Quiz generated successfully!')
    } catch (error) {
      console.error('Failed to generate quiz', error)
      toast.error('Failed to generate AI quiz')
    } finally {
      setGeneratingQuiz(false)
    }
  }

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
            <div className="max-w-5xl mx-auto h-[75vh] flex flex-col">
              <div className="flex justify-between items-center mb-4 bg-muted/50 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-md">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">Document Viewer</p>
                    <p className="text-xs text-muted-foreground">If the document doesn't load below, it may require opening in a new tab.</p>
                  </div>
                </div>
                {isValidUrl(selectedResource.url) && (
                  <a href={selectedResource.url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="default" className="gap-2">
                      Open in New Tab <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                )}
              </div>
              <div className="bg-muted rounded-xl overflow-hidden border border-border flex-1">
                {isValidUrl(selectedResource.url) ? (
                  <object
                    data={selectedResource.url}
                    type={selectedResource.url.toLowerCase().includes('.pdf') ? 'application/pdf' : undefined}
                    className="w-full h-full border-0 bg-white"
                  >
                    <iframe
                      width="100%"
                      height="100%"
                      src={
                        selectedResource.url.toLowerCase().includes('.pdf') && 
                        !selectedResource.url.includes('localhost') && 
                        !selectedResource.url.startsWith('/')
                          ? `https://docs.google.com/viewer?url=${encodeURIComponent(selectedResource.url)}&embedded=true`
                          : selectedResource.url
                      }
                      title={selectedResource.title}
                      className="w-full h-full border-0 bg-white"
                      onError={(e) => {
                        (e.target as HTMLIFrameElement).style.display = 'none';
                      }}
                    />
                  </object>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-background">
                    <div className="text-center max-w-md">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Resource Details</h3>
                      <p className="text-muted-foreground">{selectedResource.url}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-background min-h-0">
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
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Learning Lab</h2>
            <p className="text-sm text-muted-foreground mt-1">{topicTitle}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="resources" className="flex-1 flex flex-col min-h-0">
        <div className="px-6 border-b border-border bg-muted/20">
          <TabsList className="h-14 bg-transparent p-0 gap-8">
            <TabsTrigger 
              value="resources" 
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger 
              value="quizzes" 
              className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              Quizzes
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="resources" className="flex-1 m-0 overflow-hidden min-h-0">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Study Materials</h3>
                <AddResourceModal 
                  subjectId={subjectId} 
                  topicName={topicTitle} 
                  onResourceAdded={onResourceAdded} 
                />
              </div>
              
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
          </ScrollArea>
        </TabsContent>

        <TabsContent value="quizzes" className="flex-1 m-0 overflow-hidden min-h-0">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Brain className="w-5 h-5" />
                  <span>AI Assessments</span>
                </div>
                <CreateQuizModal 
                  topicTitle={topicTitle}
                  resources={resources}
                  onGenerate={handleGenerateQuiz}
                  generating={generatingQuiz}
                />
              </div>

              <div className="space-y-6">
                {quizzes.length === 0 && !generatingQuiz ? (
                  <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium text-foreground">No quizzes yet</h3>
                    <p className="text-sm text-muted-foreground mb-6">Generate an AI quiz to test your knowledge.</p>
                    <CreateQuizModal 
                      topicTitle={topicTitle}
                      resources={resources}
                      onGenerate={handleGenerateQuiz}
                      generating={generatingQuiz}
                    />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {quizzes.map((q, idx) => (
                        <Button
                          key={q.id}
                          variant={activeQuizId === q.id ? "default" : "outline"}
                          className={`h-auto py-4 px-5 flex flex-col items-start gap-1 text-left relative overflow-hidden transition-all ${
                            activeQuizId === q.id ? "ring-2 ring-primary ring-offset-2" : "hover:border-primary/50"
                          }`}
                          onClick={() => setActiveQuizId(activeQuizId === q.id ? null : q.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-bold block truncate">
                              {q.title || `Quiz ${quizzes.length - idx}`}
                            </span>
                            {q.description && (
                              <span className="text-[10px] opacity-70 line-clamp-1 mt-0.5 italic">
                                {q.description}
                              </span>
                            )}
                          </div>
                          {activeQuizId === q.id && (
                            <div className="absolute top-2 right-2">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                          )}
                        </Button>
                      ))}
                    </div>

                    {activeQuizId && (
                      <div className="mt-8 bg-muted/20 rounded-3xl px-4 sm:px-8 py-10 border border-border animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-bold">Assessment View</h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setActiveQuizId(null)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            Close Assessment
                          </Button>
                        </div>
                        {(() => {
                          const activeQuiz = quizzes.find(q => q.id === activeQuizId);
                          return activeQuiz ? <QuizSection key={activeQuizId} quiz={activeQuiz} /> : null;
                        })()}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

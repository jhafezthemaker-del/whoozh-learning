'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Source } from '@/lib/learning-materials'
import { Plus, FileText, MessageSquare, Map as MapIcon, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from './ui/button'

interface LearningSidebarTabsProps {
  sources: Source[]
  selectedSourceId: string
  onSourceSelect: (id: string) => void
  roadmap?: any
  currentTopic: string
  onTopicSelect: (topic: string) => void
}

export default function LearningSidebarTabs({
  sources,
  selectedSourceId,
  onSourceSelect,
  roadmap,
  currentTopic,
  onTopicSelect,
}: LearningSidebarTabsProps) {
  const [checkedSources, setCheckedSources] = useState<Set<string>>(new Set())
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)

  const toggleSource = (sourceId: string) => {
    const newChecked = new Set(checkedSources)
    if (newChecked.has(sourceId)) {
      newChecked.delete(sourceId)
    } else {
      newChecked.add(sourceId)
    }
    setCheckedSources(newChecked)
  }

  const handleMouseDown = () => {
    setIsResizing(true)
  }

  const handleMouseUp = () => {
    setIsResizing(false)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return
    
    const newWidth = e.clientX
    if (newWidth > 80 && newWidth < 600) {
      setSidebarWidth(newWidth)
    }
  }

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing])

  return (
    <div className={`relative flex ${isResizing ? 'select-none cursor-col-resize' : ''}`}>
      <aside 
        style={{ width: `${sidebarWidth}px` }}
        className={`bg-secondary border-r border-border h-screen overflow-hidden flex flex-col ${isResizing ? '' : 'transition-all'}`}
      >
        {/* Home Link */}
        <div className="p-6 border-b border-border">
          <button className="text-foreground font-medium hover:text-primary transition-colors flex items-center justify-center">
            {sidebarWidth > 350 ? 'Home' : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="roadmap" className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="m-4 w-auto grid w-[calc(100%-2rem)] grid-cols-3">
            <TabsTrigger value="roadmap" className="gap-2 flex items-center justify-center">
              <MapIcon className="w-4 h-4" />
              {sidebarWidth > 350 && <span className="hidden sm:inline">Roadmap</span>}
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-2 flex items-center justify-center">
              <FileText className="w-4 h-4" />
              {sidebarWidth > 350 && <span className="hidden sm:inline">Resources</span>}
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
              {sidebarWidth > 350 && <span className="hidden sm:inline">Chat</span>}
            </TabsTrigger>
          </TabsList>

          {/* Roadmap Tab */}
          <TabsContent value="roadmap" className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
            {roadmap?.weeks?.map((week: any, wIndex: number) => (
              <div key={wIndex} className="space-y-2">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider px-2 truncate">
                  {sidebarWidth > 150 ? week.title : week.title.split(' ')[1] || week.title[0]}
                </h4>
                <div className="space-y-3">
                  {week.days?.map((day: any, dIndex: number) => (
                    <div key={dIndex} className="space-y-1">
                      <div className="text-[10px] font-medium text-muted-foreground px-2 flex items-center gap-2">
                        <div className="h-px flex-1 bg-border/50" />
                        {day.title}
                        <div className="h-px flex-1 bg-border/50" />
                      </div>
                      <div className="space-y-0.5">
                        {day.sessions?.map((session: any, sIndex: number) => (
                          <button
                            key={sIndex}
                            onClick={() => onTopicSelect(session.topic)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center gap-3 group ${
                              currentTopic === session.topic
                                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              currentTopic === session.topic ? 'bg-primary-foreground' : 'bg-primary/30'
                            }`} />
                            <div className="flex-1 min-w-0">
                              {sidebarWidth > 150 && (
                                <>
                                  <p className="text-xs font-medium truncate">{session.topic}</p>
                                  <p className={`text-[10px] ${
                                    currentTopic === session.topic ? 'text-primary-foreground/70' : 'text-muted-foreground/60'
                                  }`}>{session.time}</p>
                                </>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 flex flex-col">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground text-xs"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Sources
            </Button>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide px-2">
                Sources
              </h4>
              <div className="space-y-1">
                {sources.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => onSourceSelect(source.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-xs ${
                      selectedSourceId === source.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checkedSources.has(source.id)}
                      onChange={() => toggleSource(source.id)}
                      className="w-3 h-3 rounded border border-border cursor-pointer accent-primary flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <FileText className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate text-xs">{source.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col">
            <div className="flex-1 flex items-center justify-center text-center py-8">
              <div className="space-y-3">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-sm font-medium text-foreground">AI Assistant</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Chat with AI to discuss the lesson
                  </p>
                </div>
                <input
                  type="text"
                  placeholder="Ask something..."
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </aside>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`w-1 bg-border hover:bg-primary transition-colors cursor-col-resize ${
          isResizing ? 'bg-primary' : ''
        }`}
      />
    </div>
  )
}

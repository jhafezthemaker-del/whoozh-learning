'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Source } from '@/lib/learning-materials'
import { Plus, FileText, MessageSquare } from 'lucide-react'
import { Button } from './ui/button'

interface LearningSidebarTabsProps {
  sources: Source[]
  selectedSourceId: string
  onSourceSelect: (id: string) => void
}

export default function LearningSidebarTabs({
  sources,
  selectedSourceId,
  onSourceSelect,
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
    if (newWidth > 200 && newWidth < 600) {
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
    <div className="relative flex">
      <aside 
        style={{ width: `${sidebarWidth}px` }}
        className="bg-secondary border-r border-border h-screen overflow-hidden transition-all flex flex-col"
      >
        {/* Home Link */}
        <div className="p-6 border-b border-border">
          <button className="text-foreground font-medium hover:text-primary transition-colors">
            Home
          </button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="resources" className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="m-4 w-auto grid w-[calc(100%-2rem)] grid-cols-2">
            <TabsTrigger value="resources" className="gap-2 flex items-center justify-center">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
          </TabsList>

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

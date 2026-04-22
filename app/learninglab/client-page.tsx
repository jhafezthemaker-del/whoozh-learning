'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/header'
import LearningSidebarTabs from '@/components/learning-sidebar-tabs'
import LessonResources from '@/components/lesson-resources'
import NoteBlock from '@/components/note-block'
import { createBlock, Block } from '@/lib/blocks'
import { Plus, Loader2 } from 'lucide-react'
import { getOrGenerateSourcesAction, getOrGenerateResourcesAction } from '@/app/actions/learning-materials'

interface ClientPageProps {
  subjectId: string
  subjectName: string
  initialTopic: string
  roadmap?: any
}

export default function LearningLabClientPage({ 
  subjectId, 
  subjectName, 
  initialTopic,
  roadmap
}: ClientPageProps) {
  const [currentTopic, setCurrentTopic] = useState(initialTopic)
  const [selectedSourceId, setSelectedSourceId] = useState<string>('')
  const [blocks, setBlocks] = useState<Block[]>([
    createBlock('text', 'Click here to start taking notes...', 'initial-block'),
  ])
  const [lessonsWidth, setLessonsWidth] = useState(60)
  const [notesWidth, setNotesWidth] = useState(40)
  const [isResizing, setIsResizing] = useState(false)
  
  const [sources, setSources] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [loadingSources, setLoadingSources] = useState(true)
  const [loadingResources, setLoadingResources] = useState(true)

  // Fetch Sources
  useEffect(() => {
    async function loadSources() {
      setLoadingSources(true)
      try {
        const data = await getOrGenerateSourcesAction(subjectId, subjectName)
        setSources(data)
        if (data.length > 0) setSelectedSourceId(data[0].id)
      } catch (error) {
        console.error('Failed to load sources', error)
      } finally {
        setLoadingSources(false)
      }
    }
    loadSources()
  }, [subjectId, subjectName])

  // Fetch Resources for current topic
  useEffect(() => {
    async function loadResources() {
      if (!currentTopic) return
      setLoadingResources(true)
      try {
        const data = await getOrGenerateResourcesAction(currentTopic, subjectId, subjectName)
        setResources(data)
      } catch (error) {
        console.error('Failed to load resources', error)
      } finally {
        setLoadingResources(false)
      }
    }
    loadResources()
  }, [currentTopic, subjectId, subjectName])

  const addBlock = () => {
    setBlocks([...blocks, createBlock('text')])
  }

  const updateBlock = (updatedBlock: Block) => {
    setBlocks(blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b))
  }

  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId))
  }

  const handleMouseDown = () => {
    setIsResizing(true)
  }

  const handleMouseUp = () => {
    setIsResizing(false)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return

    const mainContent = document.querySelector('main')
    if (!mainContent) return

    const mainRect = mainContent.getBoundingClientRect()
    const newLessonsWidth = ((e.clientX - mainRect.left) / mainRect.width) * 100

    if (newLessonsWidth > 20 && newLessonsWidth < 80) {
      setLessonsWidth(newLessonsWidth)
      setNotesWidth(100 - newLessonsWidth)
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar with Tabs */}
        {loadingSources ? (
          <div className="w-[280px] flex items-center justify-center border-r border-border bg-secondary">
             <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <LearningSidebarTabs
            sources={sources}
            selectedSourceId={selectedSourceId}
            onSourceSelect={setSelectedSourceId}
            roadmap={roadmap}
            currentTopic={currentTopic}
            onTopicSelect={setCurrentTopic}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 overflow-hidden ${isResizing ? 'select-none cursor-col-resize' : ''}`}>
          <div className="flex h-full">
            {/* Lesson Resources Section */}
            <div 
              style={{ width: `${lessonsWidth}%` }}
              className={`border-r border-border overflow-hidden ${isResizing ? '' : 'transition-all'}`}
            >
              {loadingResources ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground animate-pulse">AI is preparing your learning materials...</p>
                </div>
              ) : (
                <LessonResources
                  resources={resources}
                  topicTitle={currentTopic}
                />
              )}
            </div>

            {/* Resize Handle */}
            <div
              onMouseDown={handleMouseDown}
              className={`w-1 bg-border hover:bg-primary transition-colors cursor-col-resize ${
                isResizing ? 'bg-primary' : ''
              }`}
            />

            {/* Notes Section */}
            <div 
              style={{ width: `${notesWidth}%` }}
              className={`bg-muted/30 p-8 overflow-y-auto ${isResizing ? '' : 'transition-all'}`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Notes</h2>
                <button
                  onClick={addBlock}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Block
                </button>
              </div>

              <div className="space-y-1">
                {blocks.map((block) => (
                  <NoteBlock
                    key={block.id}
                    block={block}
                    onUpdate={updateBlock}
                    onDelete={deleteBlock}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

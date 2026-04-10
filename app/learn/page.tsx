'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/header'
import LearningSidebarTabs from '@/components/learning-sidebar-tabs'
import LessonResources from '@/components/lesson-resources'
import NoteBlock from '@/components/note-block'
import { sources, lessonMaterials, getSourceById } from '@/lib/learning-materials'
import { createBlock, Block } from '@/lib/blocks'
import { Plus } from 'lucide-react'

export default function LearningAreaPage() {
  const [selectedSourceId, setSelectedSourceId] = useState(sources[0].id)
  const [blocks, setBlocks] = useState<Block[]>([
    createBlock('text', 'Click here to start taking notes...'),
  ])
  const [lessonsWidth, setLessonsWidth] = useState(60)
  const [notesWidth, setNotesWidth] = useState(40)
  const [isResizing, setIsResizing] = useState(false)
  
  const lesson = lessonMaterials[0]

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
        <LearningSidebarTabs
          sources={sources}
          selectedSourceId={selectedSourceId}
          onSourceSelect={setSelectedSourceId}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="flex h-full">
            {/* Lesson Resources Section */}
            <div 
              style={{ width: `${lessonsWidth}%` }}
              className="border-r border-border overflow-hidden transition-all"
            >
              <LessonResources
                resources={lesson.resources}
                topicTitle={lesson.title}
              />
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
              className="bg-muted/30 p-8 overflow-y-auto transition-all"
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

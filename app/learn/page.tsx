'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/header'
import LearningSidebar from '@/components/learning-sidebar'
import NoteBlock from '@/components/note-block'
import { sources, lessonMaterials, getSourceById } from '@/lib/learning-materials'
import { createBlock, Block } from '@/lib/blocks'
import { ArrowRight, Plus } from 'lucide-react'

export default function LearningAreaPage() {
  const [selectedSourceId, setSelectedSourceId] = useState(sources[0].id)
  const [blocks, setBlocks] = useState<Block[]>([
    createBlock('text', 'Click here to start taking notes...'),
  ])
  const [summaryWidth, setSummaryWidth] = useState(50)
  const [notesWidth, setNotesWidth] = useState(50)
  const [isResizing, setIsResizing] = useState(false)
  
  const selectedSource = getSourceById(selectedSourceId)
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
    const newSummaryWidth = ((e.clientX - mainRect.left) / mainRect.width) * 100

    if (newSummaryWidth > 20 && newSummaryWidth < 80) {
      setSummaryWidth(newSummaryWidth)
      setNotesWidth(100 - newSummaryWidth)
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
        {/* Sidebar */}
        <LearningSidebar
          sources={sources}
          selectedSourceId={selectedSourceId}
          onSourceSelect={setSelectedSourceId}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="flex h-full">
            {/* Summary Section */}
            <div 
              style={{ width: `${summaryWidth}%` }}
              className="border-r border-border p-8 overflow-y-auto transition-all"
            >
              <h2 className="text-2xl font-bold text-foreground mb-6">Summary</h2>
              
              <div className="space-y-4 mb-8">
                <p className="text-foreground leading-relaxed text-base">
                  {lesson.summary}
                </p>
              </div>

              {/* Interactive Input */}
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Start Typing..."
                  className="flex-1 bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="bg-secondary border border-border hover:bg-muted transition-colors rounded-lg px-4 py-3 text-foreground">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
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

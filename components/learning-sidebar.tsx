'use client'

import { Source } from '@/lib/learning-materials'
import { Plus, FileText } from 'lucide-react'
import { Button } from './ui/button'
import { useState, useEffect } from 'react'

interface LearningSidebarProps {
  sources: Source[]
  selectedSourceId: string
  onSourceSelect: (id: string) => void
}

export default function LearningSidebar({
  sources,
  selectedSourceId,
  onSourceSelect,
}: LearningSidebarProps) {
  const [checkedSources, setCheckedSources] = useState<Set<string>>(new Set())
  const [sidebarWidth, setSidebarWidth] = useState(256)
  const [isResizing, setIsResizing] = useState(false)

  const toggleSource = (sourceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
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
  }, [isResizing, handleMouseMove, handleMouseUp])

  return (
    <div className="relative flex">
      <aside 
        style={{ width: `${sidebarWidth}px` }}
        className="bg-secondary border-r border-border p-6 space-y-6 h-screen overflow-y-auto transition-all"
      >
        {/* Home Link */}
        <div>
          <button className="text-foreground font-medium hover:text-primary transition-colors">
            Home
          </button>
        </div>

        {/* Add Sources Button */}
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Sources +
        </Button>

        {/* Sources List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Sources
          </h3>
          <div className="space-y-2">
            {sources.map((source) => (
              <button
                key={source.id}
                onClick={() => onSourceSelect(source.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 group ${
                  selectedSourceId === source.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checkedSources.has(source.id)}
                  onChange={(e) => toggleSource(source.id, e as any)}
                  className="w-4 h-4 rounded border border-border cursor-pointer accent-primary flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                />
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">{source.title}</span>
              </button>
            ))}
          </div>
        </div>
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

'use client'

import { Block, BlockType } from '@/lib/blocks'
import { Trash2, GripVertical, Image, Film } from 'lucide-react'
import { useState } from 'react'

interface NoteBlockProps {
  block: Block
  onUpdate: (block: Block) => void
  onDelete: (blockId: string) => void
}

export default function NoteBlock({ block, onUpdate, onDelete }: NoteBlockProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isEditingUrl, setIsEditingUrl] = useState(false)

  const handleTypeChange = (newType: BlockType) => {
    onUpdate({ ...block, type: newType })
  }

  const handleContentChange = (content: string) => {
    onUpdate({ ...block, content })
  }

  const handleCheckedChange = (checked: boolean) => {
    onUpdate({ ...block, checked })
  }

  const handleUrlChange = (url: string) => {
    onUpdate({ ...block, url })
  }

  const getPlaceholder = () => {
    switch (block.type) {
      case 'heading':
        return 'Heading...'
      case 'bullet-list':
        return 'List item...'
      case 'checkbox':
        return 'Task...'
      case 'image':
        return 'Paste image URL...'
      case 'video':
        return 'Paste video URL...'
      default:
        return 'Type something...'
    }
  }

  return (
    <div
      className="group py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
    >
      {/* Image Block */}
      {block.type === 'image' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
            <input
              type="text"
              value={block.url || ''}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Paste image URL..."
              className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-sm"
            />
          </div>
          {block.url && (
            <img
              src={block.url}
              alt="Note image"
              className="w-full max-w-sm rounded-lg border border-border object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
        </div>
      )}

      {/* Video Block */}
      {block.type === 'video' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
            <input
              type="text"
              value={block.url || ''}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Paste YouTube or video URL..."
              className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-sm"
            />
          </div>
          {block.url && (
            <div className="w-full max-w-sm">
              <iframe
                width="100%"
                height="240"
                src={
                  block.url.includes('youtube.com') || block.url.includes('youtu.be')
                    ? block.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
                    : block.url
                }
                className="rounded-lg border border-border"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      )}

      {/* Text-based Blocks */}
      {(block.type === 'text' || block.type === 'heading' || block.type === 'bullet-list' || block.type === 'checkbox') && (
        <div className="flex items-start gap-2">
          {/* Drag Handle */}
          <div className={`flex-shrink-0 pt-1 ${isFocused ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
          </div>

          {/* Type Indicator / Checkbox */}
          <div className="flex-shrink-0 pt-1">
            {block.type === 'checkbox' ? (
              <input
                type="checkbox"
                checked={block.checked || false}
                onChange={(e) => handleCheckedChange(e.target.checked)}
                className="w-5 h-5 rounded border border-border cursor-pointer accent-primary"
              />
            ) : block.type === 'bullet-list' ? (
              <span className="text-muted-foreground font-bold">•</span>
            ) : block.type === 'heading' ? (
              <span className="text-muted-foreground font-bold text-lg">H</span>
            ) : null}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={block.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={getPlaceholder()}
              className={`w-full bg-transparent text-foreground placeholder-muted-foreground focus:outline-none ${
                block.type === 'heading' ? 'text-lg font-semibold' : ''
              } ${block.checked ? 'line-through text-muted-foreground' : ''}`}
            />
          </div>

          {/* Type Selector and Delete */}
          <div className={`flex items-center gap-1 flex-shrink-0 ${isFocused ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
            <select
              value={block.type}
              onChange={(e) => handleTypeChange(e.target.value as BlockType)}
              className="text-xs bg-secondary border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="text">Text</option>
              <option value="heading">Heading</option>
              <option value="bullet-list">Bullet</option>
              <option value="checkbox">Checkbox</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <button
              onClick={() => onDelete(block.id)}
              className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

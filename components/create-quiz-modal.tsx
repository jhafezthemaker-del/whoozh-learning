'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Resource } from '@/lib/learning-materials'
import { Brain, Plus, Loader2, Check } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface CreateQuizModalProps {
  topicTitle: string
  resources: Resource[]
  onGenerate: (config: QuizConfig) => Promise<void>
  generating: boolean
}

export interface QuizConfig {
  itemCount: number
  questionTypes: string[]
  selectedResourceIds: string[]
  title?: string
  description?: string
}

export function CreateQuizModal({ topicTitle, resources, onGenerate, generating }: CreateQuizModalProps) {
  const [open, setOpen] = useState(false)
  const [itemCount, setItemCount] = useState(5)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questionTypes, setQuestionTypes] = useState<string[]>(['multiple-choice'])
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>(resources.map(r => r.id))

  const handleTypeToggle = (type: string) => {
    setQuestionTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    )
  }

  const handleResourceToggle = (id: string) => {
    setSelectedResourceIds(prev => 
      prev.includes(id) 
        ? prev.filter(rId => rId !== id) 
        : [...prev, id]
    )
  }

  const handleGenerate = async () => {
    if (questionTypes.length === 0) return
    await onGenerate({
      itemCount,
      questionTypes,
      selectedResourceIds,
      title: title || undefined,
      description: description || undefined
    })
    setOpen(false)
    // Reset form
    setTitle('')
    setDescription('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Custom Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            Customize Your Quiz
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative px-6">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-8 py-4">
              {/* Quiz Name & Description */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="quizName" className="text-base font-semibold text-foreground">Quiz Name</Label>
                  <Input 
                    id="quizName" 
                    placeholder={`e.g., ${topicTitle} Mastery Quiz`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-card border-border focus:ring-primary h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quizDesc" className="text-base font-semibold text-foreground">Description (Optional)</Label>
                  <Input 
                    id="quizDesc" 
                    placeholder="Briefly describe what this quiz covers..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-card border-border focus:ring-primary h-11"
                  />
                </div>
              </div>

              {/* Item Count */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="itemCount" className="text-base font-semibold text-foreground">Number of Questions</Label>
                  <div className="bg-primary/10 px-3 py-1 rounded-full">
                    <span className="text-xl font-bold text-primary">{itemCount}</span>
                  </div>
                </div>
                <div className="px-2">
                  <Input
                    id="itemCount"
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={itemCount}
                    onChange={(e) => setItemCount(parseInt(e.target.value))}
                    className="h-2 w-full bg-secondary rounded-lg appearance-none cursor-pointer accent-primary border-none p-0"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-2 px-1 font-medium uppercase tracking-wider">
                    <span>1 Item</span>
                    <span>10 Items</span>
                    <span>20 Items</span>
                  </div>
                </div>
              </div>

              {/* Question Types */}
              <div className="space-y-4">
                <Label className="text-base font-semibold text-foreground">Question Types</Label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'multiple-choice', label: 'Multiple Choice', desc: 'Questions with 4 possible answers' },
                    { id: 'true-false', label: 'True or False', desc: 'Simple binary choice questions' },
                    { id: 'fill-in-the-blank', label: 'Fill in the Blank', desc: 'Complete the sentence with [blank]' }
                  ].map((type) => {
                    const isSelected = questionTypes.includes(type.id);
                    return (
                      <div 
                        key={type.id}
                        onClick={() => handleTypeToggle(type.id)}
                        className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group relative overflow-hidden ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                            : 'border-border hover:border-primary/30 bg-card'
                        }`}
                      >
                        <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'bg-primary border-primary scale-110' : 'border-muted-foreground/30 group-hover:border-primary/50'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold text-sm transition-colors ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {type.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{type.desc}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-all" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resources */}
              <div className="space-y-4 pb-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-foreground">Study Materials</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-7 text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => setSelectedResourceIds(resources.map(r => r.id))}
                  >
                    Select All
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">The AI will generate questions based on these materials.</p>
                <div className="grid gap-2">
                  {resources.map((resource) => {
                    const isSelected = selectedResourceIds.includes(resource.id);
                    return (
                      <div 
                        key={resource.id}
                        onClick={() => handleResourceToggle(resource.id)}
                        className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary/40 bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/20 bg-card/50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Label 
                            htmlFor={`resource-${resource.id}`}
                            className="text-sm font-semibold cursor-pointer block truncate"
                          >
                            {resource.title}
                          </Label>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                              resource.type === 'video' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                            }`}>
                              {resource.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="p-6 pt-2 bg-muted/30 border-t border-border flex items-center justify-between gap-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={generating} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={generating || questionTypes.length === 0}
            className="flex-1 sm:flex-none gap-2 px-8 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            {generating ? 'AI is Crafting...' : 'Generate AI Quiz'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { addManualResourceAction, findAiResourceAction } from '@/app/actions/learning-materials'
import { Loader2, Plus, Upload, Search, ArrowLeft, FileText, Play, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Resource } from '@/lib/learning-materials'

interface AddResourceModalProps {
  subjectId: string
  topicName: string
  onResourceAdded: (resource: Resource) => void
}

export function AddResourceModal({ subjectId, topicName, onResourceAdded }: AddResourceModalProps) {
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  
  // Upload State
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // AI State
  const [step, setStep] = useState<'input' | 'suggestions'>('input')
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set())
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set())

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const uploadData = await uploadRes.json()

      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Upload failed')
      }

      const resource = await addManualResourceAction({
        subjectId,
        topicName,
        title,
        description: description || 'Manually uploaded resource',
        type: file.type.includes('video') ? 'video' : 'pdf',
        url: uploadData.url,
      })

      onResourceAdded(resource as Resource)
      setOpen(false)
      toast.success('Resource added successfully')
      
      // Reset
      setFile(null)
      setTitle('')
      setDescription('')
    } catch (error) {
      toast.error('Failed to upload resource')
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery) return

    setIsSearching(true)
    try {
      const results = await findAiResourceAction(searchQuery, topicName)
      setSuggestions(results)
      setStep('suggestions')
      setSavedIndices(new Set())
    } catch (error) {
      toast.error('Failed to find resources with AI')
      console.error(error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSaveSuggestion = async (suggestion: any, index: number) => {
    setSavingIds(prev => new Set(prev).add(index))
    try {
      const resource = await addManualResourceAction({
        subjectId,
        topicName,
        title: suggestion.title,
        description: suggestion.description,
        type: suggestion.type,
        url: suggestion.url,
      })
      onResourceAdded(resource as Resource)
      setSavedIndices(prev => new Set(prev).add(index))
      toast.success('Resource added!')
    } catch (error) {
      toast.error('Failed to save resource')
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev)
        next.delete(index)
        return next
      })
    }
  }

  const resetAi = () => {
    setStep('input')
    setSuggestions([])
    setSavedIndices(new Set())
  }

  return (
    <Dialog open={open} onOpenChange={(v) => {
      setOpen(v)
      if (!v) resetAi()
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all">
          <Plus className="w-4 h-4" />
          Add Resource
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-background/95 backdrop-blur-md border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            Add Learning Resource
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="upload" className="gap-2 rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Upload className="w-4 h-4" /> Desktop
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2 rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Search className="w-4 h-4" /> AI Suggest
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <form onSubmit={handleUploadSubmit} className="space-y-5">
              <div className="group relative">
                <Label htmlFor="file" className="text-sm font-medium text-muted-foreground mb-2 block">
                  Select File
                </Label>
                <div className={`
                  relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer
                  ${file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}
                `}>
                  <Input 
                    id="file" 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                      const selected = e.target.files?.[0] || null
                      setFile(selected)
                      if (selected && !title) setTitle(selected.name.split('.')[0])
                    }}
                    accept=".pdf,.doc,.docx,video/mp4,video/webm"
                  />
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className={`p-3 rounded-full mb-3 ${file ? 'bg-primary/20' : 'bg-muted'}`}>
                      {file ? <Check className="w-6 h-6 text-primary" /> : <Upload className="w-6 h-6 text-muted-foreground" />}
                    </div>
                    {file ? (
                      <div>
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-foreground">Click or drag to upload</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, MP4, WEBM (Max 50MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-muted-foreground">Title</Label>
                <Input 
                  id="title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Give your resource a name..."
                  className="bg-muted/30 border-border/50 focus:ring-primary/20"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc" className="text-sm font-medium text-muted-foreground">Description (Optional)</Label>
                <Textarea 
                  id="desc" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="What is this resource about?"
                  className="bg-muted/30 border-border/50 focus:ring-primary/20 min-h-[80px] resize-none"
                />
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl font-semibold shadow-lg shadow-primary/20" disabled={!file || !title || isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Add to Resources'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="ai" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {step === 'input' ? (
              <form onSubmit={handleAiSearch} className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary bg-primary/5 p-3 rounded-lg border border-primary/10">
                    <AlertCircle className="w-4 h-4" />
                    AI will find videos and articles for {topicName}
                  </div>
                  <Label htmlFor="query" className="text-sm font-medium text-muted-foreground">What specifically are you looking for?</Label>
                  <Textarea 
                    id="query" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="e.g. Find a beginner-friendly YouTube video about the basic concepts of this topic..."
                    className="bg-muted/30 border-border/50 focus:ring-primary/20 min-h-[120px] resize-none text-base"
                    required 
                  />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl font-semibold shadow-lg shadow-primary/20 gap-2" disabled={!searchQuery || isSearching}>
                  {isSearching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      AI is searching online...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Find Resources
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={() => setStep('input')} className="gap-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" /> Back to Search
                  </Button>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {suggestions.length} Suggestions
                  </span>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {suggestions.map((suggestion, idx) => (
                    <div key={idx} className="group p-4 rounded-xl border border-border/50 bg-muted/20 hover:border-primary/30 hover:bg-muted/30 transition-all">
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-lg flex-shrink-0 ${suggestion.type === 'video' ? 'bg-primary/10' : 'bg-blue-500/10'}`}>
                          {suggestion.type === 'video' ? (
                            <Play className={`w-5 h-5 ${suggestion.type === 'video' ? 'text-primary' : 'text-blue-500'}`} />
                          ) : (
                            <FileText className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-foreground line-clamp-1">{suggestion.title}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{suggestion.description}</p>
                          <p className="text-[10px] text-primary/70 mt-2 font-mono truncate">{suggestion.url}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant={savedIndices.has(idx) ? "ghost" : "default"}
                          disabled={savingIds.has(idx) || savedIndices.has(idx)}
                          onClick={() => handleSaveSuggestion(suggestion, idx)}
                          className={`flex-shrink-0 h-8 ${savedIndices.has(idx) ? 'text-green-500 bg-green-500/5 hover:bg-green-500/10' : ''}`}
                        >
                          {savingIds.has(idx) ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : savedIndices.has(idx) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            'Add'
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-border/50">
                   <p className="text-[11px] text-center text-muted-foreground italic">
                     Not satisfied? <button onClick={resetAi} className="text-primary hover:underline font-medium">Try a different search query</button>
                   </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}


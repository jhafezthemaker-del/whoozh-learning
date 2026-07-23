'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  Volume2, 
  Trash2, 
  Plus, 
  History, 
  Loader2, 
  Sparkles, 
  ChevronRight,
  AlertCircle,
  Keyboard,
  ShieldAlert,
  Download,
  FileAudio,
  Search,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getInterviewsAction,
  generateInterviewQuestionAction,
  saveInterviewAction,
  deleteInterviewAction
} from '@/app/actions/interview'

interface InterviewSectionProps {
  topicTitle: string
  subjectId: string
  subjectName: string
}

interface InterviewRecord {
  id: string
  title: string
  audio_url: string
  created_at: Date
  topic_name?: string
  subject_id?: string
}

type MicStatus = 'unknown' | 'granted' | 'denied' | 'unavailable'

// Get the best supported MIME type for recording
function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
  ]
  for (const type of types) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }
  return ''
}

export default function InterviewSection({ topicTitle, subjectId, subjectName }: InterviewSectionProps) {
  const [interviews, setInterviews] = useState<InterviewRecord[]>([])
  const [allInterviews, setAllInterviews] = useState<InterviewRecord[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [loadingAllList, setLoadingAllList] = useState(false)

  // Interview flow states
  const [mode, setMode] = useState<'dashboard' | 'active'>('dashboard')
  const [step, setStep] = useState<'intro' | 'interviewing' | 'saving' | 'complete'>('intro')
  
  const [questions, setQuestions] = useState<string[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [history, setHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [generatingQuestion, setGeneratingQuestion] = useState(false)
  
  // Mic & recording states
  const [micStatus, setMicStatus] = useState<MicStatus>('unknown')
  const [isRecording, setIsRecording] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [textAnswer, setTextAnswer] = useState('')
  const [textOnly, setTextOnly] = useState(false)

  // Modal / Search state for Recorded Interviews
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterScope, setFilterScope] = useState<'topic' | 'all'>('topic')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // ── Load past interviews for current topic ─────────────────────────────────
  const loadInterviews = async () => {
    setLoadingList(true)
    try {
      const data = await getInterviewsAction(subjectId, topicTitle)
      setInterviews(data as unknown as InterviewRecord[])
    } catch (e) {
      console.error('Failed to load interviews:', e)
      toast.error('Failed to load completed interviews')
    } finally {
      setLoadingList(false)
    }
  }

  // ── Load ALL recorded interviews for user ─────────────────────────────────
  const loadAllInterviews = async () => {
    setLoadingAllList(true)
    try {
      const data = await getInterviewsAction()
      setAllInterviews(data as unknown as InterviewRecord[])
    } catch (e) {
      console.error('Failed to load all interviews:', e)
    } finally {
      setLoadingAllList(false)
    }
  }

  useEffect(() => {
    loadInterviews()
  }, [subjectId, topicTitle])

  // ── Check mic permission on mount ────────────────────────────────────────
  useEffect(() => {
    if (typeof navigator === 'undefined') return
    if (!Boolean(navigator.mediaDevices?.getUserMedia)) {
      setMicStatus('unavailable')
      return
    }
    if (navigator.permissions?.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
        if (result.state === 'granted') setMicStatus('granted')
        else if (result.state === 'denied') setMicStatus('denied')
        else setMicStatus('unknown')
        result.onchange = () => {
          if (result.state === 'granted') setMicStatus('granted')
          else if (result.state === 'denied') setMicStatus('denied')
        }
      }).catch(() => setMicStatus('unknown'))
    }
  }, [])

  // ── Request mic stream ───────────────────────────────────────────────────
  const requestMicAndRecord = async (): Promise<MediaRecorder | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setMicStatus('granted')

      const mimeType = getSupportedMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }
      return recorder
    } catch (err: any) {
      console.warn('Microphone error:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicStatus('denied')
        toast.error('Microphone access blocked by browser policy.')
      } else {
        setMicStatus('unavailable')
        toast.error('Could not start microphone.')
      }
      return null
    }
  }

  // ── Start Mock Interview ─────────────────────────────────────────────────
  const startInterview = async () => {
    setQuestions([])
    setCurrentQuestionIndex(0)
    setHistory([])
    setTranscription('')
    setTextAnswer('')
    audioChunksRef.current = []
    setStep('interviewing')
    setGeneratingQuestion(true)

    if (!textOnly && Boolean(navigator.mediaDevices?.getUserMedia)) {
      const recorder = await requestMicAndRecord()
      if (recorder) {
        mediaRecorderRef.current = recorder
        setTextOnly(false)
      } else {
        setTextOnly(true)
      }
    } else {
      setTextOnly(true)
    }

    try {
      const firstQuestion = await generateInterviewQuestionAction(topicTitle, [])
      setQuestions([firstQuestion])
      setGeneratingQuestion(false)
      speakQuestion(firstQuestion)
    } catch (e) {
      console.error('Failed to start interview:', e)
      setGeneratingQuestion(false)
      toast.error('Failed to generate initial interview question.')
    }
  }

  // ── Read question aloud via speech synthesis ─────────────────────────────
  const speakQuestion = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1.0
    window.speechSynthesis.speak(utterance)
  }

  // ── Toggle Speech Recognition ────────────────────────────────────────────
  const toggleRecording = () => {
    if (textOnly) return

    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause()
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (_) { /* ignore */ }
      }
      setIsRecording(false)
    } else {
      audioChunksRef.current = []
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'recording') {
        try {
          mediaRecorderRef.current.start(250)
        } catch (_) {
          /* ignore state errors */
        }
      }

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
          let currentTranscription = ''
          for (let i = 0; i < event.results.length; i++) {
            currentTranscription += event.results[i][0].transcript
          }
          setTranscription(currentTranscription)
          setTextAnswer(currentTranscription)
        }

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e.error)
        }

        recognition.start()
        recognitionRef.current = recognition
      }
      setIsRecording(true)
    }
  }

  // ── Submit Answer & Advance ──────────────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    if (isRecording) {
      toggleRecording()
    }

    const currentQuestion = questions[currentQuestionIndex]
    const answerToUse = textAnswer.trim() || transcription.trim() || '(No response provided)'

    const updatedHistory = [
      ...history,
      { role: 'assistant' as const, content: currentQuestion },
      { role: 'user' as const, content: answerToUse },
    ]
    setHistory(updatedHistory)

    const nextIndex = currentQuestionIndex + 1

    if (nextIndex >= 3) {
      setStep('saving')

      const saveInterview = async (audioBlob?: Blob) => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop())
          streamRef.current = null
        }

        if (audioBlob && audioBlob.size > 0) {
          const formData = new FormData()
          const ext = getSupportedMimeType().includes('ogg') ? 'ogg' : 'webm'
          formData.append('audio', audioBlob, `interview.${ext}`)
          formData.append('subjectId', subjectId)
          formData.append('topicName', topicTitle)
          formData.append('title', `${topicTitle} AI Mock Interview`)

          const result = await saveInterviewAction(formData)
          if (result.success) {
            toast.success('Mock Interview saved successfully!')
            loadInterviews()
            loadAllInterviews()
          } else {
            toast.error(result.message || 'Failed to save mock interview audio')
          }
        } else {
          toast.success('Interview completed! (Text-only — no audio saved)')
        }
        setStep('complete')
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = async () => {
          const mimeType = getSupportedMimeType() || 'audio/webm'
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
          await saveInterview(audioBlob)
        }
        mediaRecorderRef.current.stop()
      } else {
        await saveInterview()
      }
    } else {
      setCurrentQuestionIndex(nextIndex)
      setTranscription('')
      setTextAnswer('')
      setGeneratingQuestion(true)

      try {
        const nextQuestion = await generateInterviewQuestionAction(topicTitle, updatedHistory)
        setQuestions(prev => [...prev, nextQuestion])
        setGeneratingQuestion(false)
        speakQuestion(nextQuestion)
      } catch (e) {
        console.error('Failed to generate next question:', e)
        setGeneratingQuestion(false)
        toast.error('Failed to load next question.')
      }
    }
  }

  // ── Delete a saved interview ──────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      const result = await deleteInterviewAction(id)
      if (result.success) {
        toast.success('Interview deleted')
        setInterviews(prev => prev.filter(item => item.id !== id))
        setAllInterviews(prev => prev.filter(item => item.id !== id))
      } else {
        toast.error(result.message || 'Failed to delete interview')
      }
    } catch (e) {
      toast.error('Failed to delete interview')
    }
  }

  // ── Quit interview ───────────────────────────────────────────────────────
  const quitInterview = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (_) { /* ignore */ }
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsRecording(false)
    setMode('dashboard')
    setStep('intro')
    setTextOnly(false)
  }

  // Filter list for modal
  const rawList = filterScope === 'topic' ? interviews : allInterviews
  const displayList = rawList.filter(item => 
    searchQuery === '' || 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.topic_name && item.topic_name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Active Interview Mode
  // ═══════════════════════════════════════════════════════════════════════════
  if (mode === 'active') {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col h-[560px] relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6 flex-shrink-0">
          <div>
            <h3 className="font-extrabold text-foreground text-lg sm:text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              AI Practice Interview
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{topicTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsRecordModalOpen(true)
                loadAllInterviews()
              }}
              className="gap-1.5 font-semibold text-xs border-primary/30 hover:border-primary"
            >
              <FileAudio className="w-3.5 h-3.5 text-primary" />
              <span>Recorded Interviews</span>
              {interviews.length > 0 && (
                <span className="bg-primary/20 text-primary px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {interviews.length}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={quitInterview} className="text-destructive hover:bg-destructive/10">
              Quit
            </Button>
          </div>
        </div>

        {/* ── Intro Step ── */}
        {step === 'intro' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mic className="w-8 h-8 text-primary" />
            </div>
            <div className="max-w-sm">
              <h4 className="text-xl font-extrabold text-foreground">AI Mock Interview</h4>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                <span className="font-semibold text-foreground">{topicTitle}</span> — 3 AI-generated questions.
                Speak or type your answers.
              </p>
            </div>

            {/* Mic status banner */}
            {micStatus === 'denied' && (
              <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-left max-w-sm w-full">
                <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Microphone blocked</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    To enable recording, click the 🔒 lock icon in your browser address bar and allow microphone access. The interview will run in <strong>text-only</strong> mode until then.
                  </p>
                </div>
              </div>
            )}

            {micStatus === 'unavailable' && (
              <div className="flex items-start gap-3 bg-secondary/40 border border-border/40 rounded-xl p-3 text-left max-w-sm w-full">
                <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Microphone is not available in this browser. The interview will run in <strong>text-only</strong> mode.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 max-w-xs bg-secondary/40 p-4 rounded-2xl border border-border/40 text-left text-xs text-muted-foreground w-full">
              <div className="flex gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>AI reads questions aloud via speech synthesis.</span>
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                {micStatus === 'denied' || micStatus === 'unavailable' ? (
                  <span><strong>Text-only</strong> mode — type your answers.</span>
                ) : (
                  <span>Speak or type your answers. Voice is transcribed in real-time.</span>
                )}
              </div>
              <div className="flex gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>{micStatus === 'denied' || micStatus === 'unavailable' ? 'Interview runs without audio recording.' : 'Session is saved as an audio file after completion.'}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setMode('dashboard'); setStep('intro') }} className="font-bold">
                Cancel
              </Button>
              <Button
                onClick={startInterview}
                className="font-extrabold gap-2 px-8 bg-primary hover:bg-primary/95 text-primary-foreground"
              >
                <Play className="w-4 h-4 fill-current" />
                Start Interview
              </Button>
            </div>
          </div>
        )}

        {/* ── Interviewing Step ── */}
        {step === 'interviewing' && (
          <div className="flex-1 flex flex-col justify-between min-h-0">
            {/* Question Card */}
            <div className="bg-secondary/40 rounded-2xl p-5 border border-border/40 flex-shrink-0">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Question {currentQuestionIndex + 1} of 3
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 gap-1.5"
                  onClick={() => speakQuestion(questions[currentQuestionIndex])}
                  disabled={generatingQuestion || !questions[currentQuestionIndex]}
                >
                  <Volume2 className="w-4 h-4 text-primary" />
                  Read Aloud
                </Button>
              </div>

              {generatingQuestion ? (
                <div className="flex items-center gap-2 text-muted-foreground py-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI is crafting your next question…</span>
                </div>
              ) : (
                <p className="text-foreground font-semibold leading-relaxed text-sm sm:text-base">
                  {questions[currentQuestionIndex]}
                </p>
              )}
            </div>

            {/* Response Section */}
            <div className="my-4 flex-1 flex flex-col min-h-0 gap-3">
              {!textOnly && (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={toggleRecording}
                    disabled={generatingQuestion}
                    variant={isRecording ? 'destructive' : 'default'}
                    className={`font-bold gap-2 ${isRecording ? 'animate-pulse' : ''}`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4 fill-current" />
                        Pause Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        {transcription ? 'Resume Voice Answer' : 'Record Voice Answer'}
                      </>
                    )}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {isRecording ? 'Listening & transcribing…' : 'Click to record or type below.'}
                  </span>
                </div>
              )}

              {/* Text Area */}
              <div className="flex-1 flex flex-col min-h-0">
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder={
                    textOnly
                      ? 'Type your answer here…'
                      : 'Your voice transcript appears here — or type directly…'
                  }
                  className="flex-1 w-full bg-secondary/30 rounded-xl border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 resize-none min-h-[80px]"
                  disabled={generatingQuestion}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 border-t border-border/50 pt-4 flex-shrink-0">
              <Button
                onClick={handleSubmitAnswer}
                disabled={generatingQuestion || (!textAnswer.trim() && !isRecording)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 px-6 shadow-lg shadow-emerald-500/10 transition-all hover:scale-105"
              >
                <span>{currentQuestionIndex >= 2 ? 'Finish & Save' : 'Next Question'}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Saving Step ── */}
        {step === 'saving' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div>
              <h4 className="text-lg font-bold text-foreground">Interview Finished!</h4>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Saving your session{textOnly ? '' : ' and compiling the audio'}. Please wait…
              </p>
            </div>
          </div>
        )}

        {/* ── Complete Step ── */}
        {step === 'complete' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-foreground">Congratulations!</h4>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                You completed the mock interview for <strong>{topicTitle}</strong>.
                {!textOnly && ' Your audio response has been saved.'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setIsRecordModalOpen(true)
                  loadAllInterviews()
                }}
                variant="outline"
                className="px-6 font-bold gap-2 border-primary/30"
              >
                <FileAudio className="w-4 h-4 text-primary" />
                Show Recorded List
              </Button>
              <Button
                onClick={() => { setMode('dashboard'); setStep('intro'); setTextOnly(false) }}
                className="px-8 font-bold"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* ── Dialog / Modal for Recorded Interviews ── */}
        <Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
            <DialogHeader className="pb-2 border-b border-border/50">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
                  <FileAudio className="w-5 h-5 text-primary" />
                  Recorded Mock Interviews
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Listen to your saved voice recordings and review past practice sessions.
              </DialogDescription>
            </DialogHeader>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 py-3 border-b border-border/40">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search recordings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-secondary/30 border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="flex gap-1.5 bg-secondary/40 p-1 rounded-xl border border-border/40 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterScope('topic')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    filterScope === 'topic'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  This Topic ({interviews.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterScope('all')
                    loadAllInterviews()
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    filterScope === 'all'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All Recordings ({allInterviews.length})
                </button>
              </div>
            </div>

            {/* Recorded Interviews List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-0 pr-1">
              {loadingAllList && filterScope === 'all' ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">Loading all recorded interviews…</p>
                </div>
              ) : displayList.length === 0 ? (
                <div className="text-center py-12 bg-secondary/10 rounded-xl border border-dashed border-border/50">
                  <FileAudio className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="font-semibold text-foreground text-sm">No recorded interviews found</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                    {searchQuery
                      ? 'No recording matches your search filter.'
                      : 'Take an AI practice interview with audio recording enabled to build your history.'}
                  </p>
                </div>
              ) : (
                displayList.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card border border-border/60 hover:border-primary/40 rounded-xl p-4 transition-all shadow-xs flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-primary/70" />
                            {new Date(item.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {item.topic_name && (
                            <span className="bg-secondary px-2 py-0.5 rounded-full text-[10px] font-medium text-foreground">
                              {item.topic_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={item.audio_url}
                          download
                          title="Download Audio"
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          onClick={() => handleDelete(item.id)}
                          title="Delete Recording"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-secondary/20 p-2 rounded-lg border border-border/40">
                      <audio src={item.audio_url} controls className="w-full h-8 rounded" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — Dashboard
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 h-full flex flex-col min-h-0 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground text-lg">Completed Mock Interviews</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            onClick={() => {
              setIsRecordModalOpen(true)
              loadAllInterviews()
            }}
            className="gap-2 font-bold text-sm border-primary/30 hover:border-primary"
          >
            <FileAudio className="w-4 h-4 text-primary" />
            <span>Show Recorded Interviews</span>
            {interviews.length > 0 && (
              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                {interviews.length}
              </span>
            )}
          </Button>
          <Button
            onClick={() => { setMode('active'); setStep('intro') }}
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold gap-2 shadow-lg shadow-primary/10 transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Start New AI Interview
          </Button>
        </div>
      </div>

      {/* Interview List */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {step === 'intro' && mode === 'dashboard' && (
          <>
            {loadingList ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
                <p className="text-sm text-muted-foreground">Loading your completed interviews…</p>
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-16 bg-secondary/15 rounded-2xl border border-dashed border-border/50">
                <Mic className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h4 className="font-bold text-foreground text-lg">No interviews taken yet</h4>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                  Take your first AI-powered mock interview to practice speaking and review your answers.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Button
                    onClick={() => { setMode('active'); setStep('intro') }}
                    className="font-bold"
                  >
                    Start Practice Interview
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                {interviews.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card border border-border/60 hover:border-primary/45 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors pr-6">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground font-medium block mt-1">
                          {new Date(item.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={item.audio_url}
                          download
                          title="Download Audio"
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-secondary rounded-full transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                          onClick={() => handleDelete(item.id)}
                          title="Delete Interview"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3">
                      <audio src={item.audio_url} controls className="w-full h-9 rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Dialog / Modal for Recorded Interviews ── */}
      <Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="pb-2 border-b border-border/50">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-extrabold flex items-center gap-2">
                <FileAudio className="w-5 h-5 text-primary" />
                Recorded Mock Interviews
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Listen to your saved voice recordings and review past practice sessions.
            </DialogDescription>
          </DialogHeader>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 py-3 border-b border-border/40">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search recordings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary/30 border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="flex gap-1.5 bg-secondary/40 p-1 rounded-xl border border-border/40 text-xs">
              <button
                type="button"
                onClick={() => setFilterScope('topic')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  filterScope === 'topic'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                This Topic ({interviews.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterScope('all')
                  loadAllInterviews()
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  filterScope === 'all'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All Recordings ({allInterviews.length})
              </button>
            </div>
          </div>

          {/* Recorded Interviews List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-0 pr-1">
            {loadingAllList && filterScope === 'all' ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Loading all recorded interviews…</p>
              </div>
            ) : displayList.length === 0 ? (
              <div className="text-center py-12 bg-secondary/10 rounded-xl border border-dashed border-border/50">
                <FileAudio className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="font-semibold text-foreground text-sm">No recorded interviews found</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                  {searchQuery
                    ? 'No recording matches your search filter.'
                    : 'Take an AI practice interview with audio recording enabled to build your history.'}
                </p>
              </div>
            ) : (
              displayList.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border/60 hover:border-primary/40 rounded-xl p-4 transition-all shadow-xs flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{item.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-primary/70" />
                          {new Date(item.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {item.topic_name && (
                          <span className="bg-secondary px-2 py-0.5 rounded-full text-[10px] font-medium text-foreground">
                            {item.topic_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={item.audio_url}
                        download
                        title="Download Audio"
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        onClick={() => handleDelete(item.id)}
                        title="Delete Recording"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-secondary/20 p-2 rounded-lg border border-border/40">
                    <audio src={item.audio_url} controls className="w-full h-8 rounded" />
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

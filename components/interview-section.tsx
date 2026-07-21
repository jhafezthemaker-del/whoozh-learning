'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
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
  ShieldAlert
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
  const [loadingList, setLoadingList] = useState(true)

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
  // textOnly = true when mic is denied — user types their answers
  const [textOnly, setTextOnly] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // ── Load past interviews ──────────────────────────────────────────────────
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

  useEffect(() => {
    loadInterviews()
  }, [subjectId, topicTitle])

  // ── Check mic permission on mount ────────────────────────────────────────
  useEffect(() => {
    if (typeof navigator === 'undefined') return
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus('unavailable')
      return
    }
    // Use the Permissions API if available (doesn't prompt the user)
    if (navigator.permissions?.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
        if (result.state === 'granted') setMicStatus('granted')
        else if (result.state === 'denied') setMicStatus('denied')
        else setMicStatus('unknown') // 'prompt' — we'll ask when they start
        result.onchange = () => {
          if (result.state === 'granted') setMicStatus('granted')
          else if (result.state === 'denied') setMicStatus('denied')
        }
      }).catch(() => setMicStatus('unknown'))
    }
  }, [])

  // ── Initialize Speech Recognition ────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const rec = new SpeechRecognition()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'

    rec.onresult = (event: any) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript
        else interim += event.results[i][0].transcript
      }
      const text = final || interim
      if (text) {
        setTranscription(text)
        setTextAnswer(prev => prev ? prev + ' ' + text : text)
      }
    }

    rec.onerror = (event: any) => {
      // Swallow 'no-speech' errors — they are benign
      if (event.error !== 'no-speech') {
        console.error('Speech recognition error:', event.error)
      }
    }

    recognitionRef.current = rec
  }, [])

  // ── Text-To-Speech ───────────────────────────────────────────────────────
  const speakQuestion = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1.05
    window.speechSynthesis.speak(utterance)
  }

  // ── Request mic & create recorder ────────────────────────────────────────
  const requestMicAndRecord = async (): Promise<MediaRecorder | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setMicStatus('granted')

      const mimeType = getSupportedMimeType()
      const recorderOptions = mimeType ? { mimeType } : {}
      const recorder = new MediaRecorder(stream, recorderOptions)

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      return recorder
    } catch (err: any) {
      const isDenied =
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        err?.message?.toLowerCase().includes('permission')

      if (isDenied) {
        setMicStatus('denied')
      } else {
        console.error('Mic error:', err)
      }
      return null
    }
  }

  // ── Start Interview ───────────────────────────────────────────────────────
  const startInterview = async () => {
    setQuestions([])
    setHistory([])
    setCurrentQuestionIndex(0)
    setTranscription('')
    setTextAnswer('')
    audioChunksRef.current = []
    setStep('interviewing')
    setGeneratingQuestion(true)

    // Try to get mic access (non-blocking — fall back to text-only)
    if (!textOnly && navigator.mediaDevices?.getUserMedia) {
      const recorder = await requestMicAndRecord()
      if (recorder) {
        mediaRecorderRef.current = recorder
        setTextOnly(false)
      } else {
        // Mic denied — switch to text-only mode silently
        setTextOnly(true)
        mediaRecorderRef.current = null
        toast('🎙️ No microphone access — switching to text-only mode.', {
          description: 'You can still type your answers. The interview will not be recorded as audio.',
          duration: 5000,
        })
      }
    } else {
      setTextOnly(true)
      mediaRecorderRef.current = null
    }

    // Generate first question (always works, regardless of mic)
    try {
      const firstQuestion = await generateInterviewQuestionAction(topicTitle, [])
      setQuestions([firstQuestion])
      setGeneratingQuestion(false)
      speakQuestion(firstQuestion)
    } catch (e) {
      console.error('Failed to generate question:', e)
      setGeneratingQuestion(false)
      toast.error('Failed to generate question. Please try again.')
    }
  }

  // ── Recording controls ───────────────────────────────────────────────────
  const handleStartRecording = () => {
    if (!mediaRecorderRef.current) return
    setTranscription('')

    try {
      if (mediaRecorderRef.current.state === 'inactive') {
        mediaRecorderRef.current.start(1000)
      } else if (mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume()
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.start() } catch (_) { /* already started */ }
      }
      setIsRecording(true)
    } catch (e) {
      console.error('Failed to start recording:', e)
      toast.error('Could not start recording.')
    }
  }

  const handleStopRecording = () => {
    if (!mediaRecorderRef.current) return
    try {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause()
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (_) { /* ignore */ }
      }
      setIsRecording(false)
    } catch (e) {
      console.error('Failed to stop recording:', e)
    }
  }

  // ── Submit Answer ────────────────────────────────────────────────────────
  const handleSubmitAnswer = async () => {
    if (isRecording) handleStopRecording()

    const answer = textAnswer.trim() || '(No answer provided)'
    const question = questions[currentQuestionIndex]

    const updatedHistory = [
      ...history,
      { role: 'assistant' as const, content: question },
      { role: 'user' as const, content: answer },
    ]
    setHistory(updatedHistory)

    const nextIndex = currentQuestionIndex + 1

    if (nextIndex >= 3) {
      // ── End of interview ──
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
          } else {
            toast.error(result.message || 'Failed to save mock interview audio')
          }
        } else {
          // text-only — no audio to save, just mark complete
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
      // ── Next question ──
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
          <Button variant="ghost" size="sm" onClick={quitInterview} className="text-destructive hover:bg-destructive/10">
            Quit
          </Button>
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

            {/* Answer Input */}
            <div className="flex-1 flex flex-col my-4 gap-3 min-h-0">
              {/* Voice recording area — only when mic is available */}
              {!textOnly && (
                <div className="flex flex-col items-center justify-center py-3 bg-secondary/15 rounded-2xl border border-dashed border-border/60 px-4 flex-shrink-0">
                  {isRecording ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center relative">
                          <Mic className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-red-500 animate-pulse">RECORDING…</span>
                      {transcription && (
                        <p className="text-xs text-muted-foreground italic text-center max-w-md line-clamp-2">
                          &ldquo;{transcription}&rdquo;
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 bg-secondary/80 rounded-full flex items-center justify-center">
                        <MicOff className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground">Voice paused</span>
                    </div>
                  )}

                  <div className="flex gap-3 mt-3">
                    {!isRecording ? (
                      <Button
                        onClick={handleStartRecording}
                        disabled={generatingQuestion}
                        size="sm"
                        className="bg-primary hover:bg-primary/95 text-primary-foreground gap-2 font-bold"
                      >
                        <Mic className="w-4 h-4" />
                        Start Recording
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStopRecording}
                        variant="destructive"
                        size="sm"
                        className="gap-2 font-bold animate-pulse"
                      >
                        <Square className="w-4 h-4" />
                        Pause
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Text-only banner */}
              {textOnly && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex-shrink-0">
                  <Keyboard className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Text-only mode — type your answer below.
                  </p>
                </div>
              )}

              {/* Answer textarea */}
              <div className="flex flex-col gap-1 flex-1 min-h-0">
                <label className="text-xs font-bold text-muted-foreground">
                  {textOnly ? 'Type Your Answer' : 'Answer Transcript / Edit'}
                </label>
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
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-foreground">Congratulations!</h4>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                You completed the mock interview for <strong>{topicTitle}</strong>.
                {!textOnly && ' Your audio response has been saved.'}
              </p>
            </div>
            <Button
              onClick={() => { setMode('dashboard'); setStep('intro'); setTextOnly(false) }}
              className="px-8 font-bold"
            >
              View Completed Interviews
            </Button>
          </div>
        )}
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
        <Button
          onClick={() => { setMode('active'); setStep('intro') }}
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-extrabold gap-2 shadow-lg shadow-primary/10 transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Start New AI Interview
        </Button>
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
                <Button
                  onClick={() => { setMode('active'); setStep('intro') }}
                  className="mt-6 font-bold"
                  variant="outline"
                >
                  Start Practice Interview
                </Button>
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
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
    </div>
  )
}

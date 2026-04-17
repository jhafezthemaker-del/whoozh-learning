'use client'

import { useState } from 'react'
import { RoadmapData, saveRoadmapAction } from '@/app/actions/roadmap'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Save, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface RoadmapEditorProps {
  initialData: RoadmapData
  subjectId: string
  onSave?: () => void
}

export default function RoadmapEditor({ initialData, subjectId, onSave }: RoadmapEditorProps) {
  const [data, setData] = useState<RoadmapData>(initialData)
  const [isSaving, setIsSaving] = useState(false)

  const handleDayTitleChange = (weekIndex: number, dayIndex: number, newTitle: string) => {
    const newData = { ...data }
    newData.weeks[weekIndex].days[dayIndex].title = newTitle
    setData(newData)
  }

  const handleSessionTimeChange = (weekIndex: number, dayIndex: number, sessionIndex: number, newTime: string) => {
    const newData = { ...data }
    newData.weeks[weekIndex].days[dayIndex].sessions[sessionIndex].time = newTime
    setData(newData)
  }

  const handleSave = async () => {
    setIsSaving(true)
    const result = await saveRoadmapAction(subjectId, data)
    setIsSaving(false)

    if (result.success) {
      toast.success('Roadmap saved successfully!')
      onSave?.()
    } else {
      toast.error(result.message || 'Failed to save roadmap')
    }
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between sticky top-20 bg-background/80 backdrop-blur-sm z-10 py-4 border-b border-border mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Your Study Roadmap
          </h2>
          <p className="text-muted-foreground">Adjust the schedule parts to fit your needs</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Roadmap
        </Button>
      </div>

      <div className="space-y-12">
        {data.weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="space-y-6">
            <div className="flex items-center gap-4">
              <h3 className="text-3xl font-bold text-foreground">
                {week.title}
              </h3>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {week.days.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300"
                >
                  {/* Day Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-5 h-5 text-primary" />
                    <Input
                      value={day.title}
                      onChange={(e) => handleDayTitleChange(weekIndex, dayIndex, e.target.value)}
                      className="font-bold text-lg bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary p-0 h-auto"
                    />
                  </div>

                  {/* Sessions */}
                  <ul className="space-y-4">
                    {day.sessions.map((session, sessionIndex) => (
                      <li
                        key={sessionIndex}
                        className="flex flex-col gap-1 pl-8 border-l-2 border-primary/20"
                      >
                        <span className="font-semibold text-foreground">
                          {session.topic}
                        </span>
                        <div className="flex items-center gap-2">
                          <Input
                            value={session.time}
                            onChange={(e) => handleSessionTimeChange(weekIndex, dayIndex, sessionIndex, e.target.value)}
                            className="text-sm text-muted-foreground bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary h-6 p-0 w-24"
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-8 border-t border-border">
        <Button size="lg" onClick={handleSave} disabled={isSaving} className="px-12 h-14 text-lg font-bold gap-2 shadow-xl shadow-primary/20">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Finalize and Save Roadmap
        </Button>
      </div>
    </div>
  )
}

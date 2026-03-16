export interface RoadmapSession {
  topic: string
  time: string
}

export interface RoadmapDay {
  title: string
  sessions: RoadmapSession[]
}

export interface RoadmapWeek {
  title: string
  days: RoadmapDay[]
}

export const roadmapWeeks: RoadmapWeek[] = [
  {
    title: 'Week 1',
    days: [
      {
        title: 'Day 1 - March 2, 2026',
        sessions: [
          { topic: 'topic 1', time: '9:00am' },
          { topic: 'topic 2', time: '10:am' },
        ],
      },
      {
        title: 'Day 2 - March 3, 2026',
        sessions: [
          { topic: 'topic 1', time: '9:00am' },
          { topic: 'topic 2', time: '10:am' },
        ],
      },
    ],
  },
]

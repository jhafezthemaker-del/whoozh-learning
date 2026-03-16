export interface Topic {
  id: string
  name: string
  icon: string
  description: string
  courseCount: number
  color: string
}

export const topics: Topic[] = [
  {
    id: 'algebra',
    name: 'Algebra',
    icon: '🔢',
    description: 'Master algebraic equations and polynomial functions',
    courseCount: 8,
    color: 'bg-amber-50',
  },
  {
    id: 'calculus',
    name: 'Calculus',
    icon: '∫',
    description: 'Learn limits, derivatives, and integral calculus',
    courseCount: 6,
    color: 'bg-orange-50',
  },
  {
    id: 'statistics',
    name: 'Statistics',
    icon: '📊',
    description: 'Explore probability and data analysis',
    courseCount: 7,
    color: 'bg-pink-50',
  },
  {
    id: 'geometry',
    name: 'Geometry',
    icon: '⬛',
    description: 'Understand shapes, proofs, and spatial reasoning',
    courseCount: 6,
    color: 'bg-blue-50',
  },
  {
    id: 'trigonometry',
    name: 'Trigonometry',
    icon: '📐',
    description: 'Master angles, triangles, and periodic functions',
    courseCount: 5,
    color: 'bg-emerald-50',
  },
  {
    id: 'topology',
    name: 'Topology',
    icon: '🌀',
    description: 'Explore advanced geometric structures and properties',
    courseCount: 4,
    color: 'bg-red-50',
  },
]

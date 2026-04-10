export interface Resource {
  id: string
  type: 'pdf' | 'video'
  title: string
  description: string
  duration?: string
  url: string
}

export interface Source {
  id: string
  title: string
  description: string
}

export interface LessonMaterial {
  id: string
  title: string
  summary: string
  notes: string
  sourceId: string
  resources: Resource[]
}

export const sources: Source[] = [
  {
    id: 'phrasal-verbs-100',
    title: '100 Phrasal Verbs',
    description: 'Comprehensive guide to common English phrasal verbs',
  },
  {
    id: 'grammar-rules',
    title: 'English Grammar Rules',
    description: 'Essential grammar patterns and structures',
  },
  {
    id: 'vocabulary-advanced',
    title: 'Advanced Vocabulary',
    description: 'Professional and academic word lists',
  },
]

export const lessonMaterials: LessonMaterial[] = [
  {
    id: 'lesson-1',
    title: 'Phrasal Verbs Basics',
    summary: `These materials offer a comprehensive examination of the grammatical structures, vocabulary variations, and practical applications of the English language. One source outlines standard grammar rules, including word classes and sentence formation, while another highlights the distinct linguistic differences between British and American dialects. To support professional growth, the texts provide a vast directory of business phrasal verbs categorized by workplace scenarios like negotiation and finance. Additionally, the collection includes a behavioral interview guide for developers, utilizing structured frameworks like STAR and SCORE to improve communication. Together, these resources serve as both a technical reference for linguistic mechanics and a functional tool for professional advancement.`,
    notes: '',
    sourceId: 'phrasal-verbs-100',
    resources: [
      {
        id: 'resource-1',
        type: 'pdf',
        title: 'Phrasal Verbs PDF Guide',
        description: 'Complete reference guide with examples and usage patterns',
        url: '#',
      },
      {
        id: 'resource-2',
        type: 'video',
        title: 'Phrasal Verbs Introduction',
        description: 'Learn the basics of phrasal verbs',
        duration: '12:34',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      },
      {
        id: 'resource-3',
        type: 'pdf',
        title: 'Practice Exercises',
        description: 'Interactive exercises to test your knowledge',
        url: '#',
      },
      {
        id: 'resource-4',
        type: 'video',
        title: 'Advanced Phrasal Verbs',
        description: 'Explore complex phrasal verb combinations',
        duration: '18:45',
        url: 'https://www.youtube.com/embed/jNQXAC9IVRw',
      },
    ],
  },
]

export const getSourceById = (id: string) => sources.find(s => s.id === id)
export const getLessonById = (id: string) => lessonMaterials.find(l => l.id === id)

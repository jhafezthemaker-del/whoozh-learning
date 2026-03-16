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
  },
]

export const getSourceById = (id: string) => sources.find(s => s.id === id)
export const getLessonById = (id: string) => lessonMaterials.find(l => l.id === id)

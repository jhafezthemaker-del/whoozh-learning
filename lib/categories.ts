export interface Category {
  id: string
  name: string
  icon: string
  description: string
  color: string
  topics: SubTopic[]
}

export interface SubTopic {
  id: string
  name: string
  icon: string
  description: string
  courseCount: number
}

export const categories: Category[] = [
  {
    id: 'math',
    name: 'Mathematics',
    icon: '📐',
    description: 'Master numbers, equations, and advanced mathematical concepts',
    color: 'from-blue-500 to-cyan-500',
    topics: [
      {
        id: 'algebra',
        name: 'Algebra',
        icon: '🔢',
        description: 'Master algebraic equations and polynomial functions',
        courseCount: 8,
      },
      {
        id: 'calculus',
        name: 'Calculus',
        icon: '∫',
        description: 'Learn limits, derivatives, and integral calculus',
        courseCount: 6,
      },
      {
        id: 'geometry',
        name: 'Geometry',
        icon: '⬛',
        description: 'Understand shapes, proofs, and spatial reasoning',
        courseCount: 6,
      },
      {
        id: 'trigonometry',
        name: 'Trigonometry',
        icon: '📐',
        description: 'Master angles, triangles, and periodic functions',
        courseCount: 5,
      },
      {
        id: 'statistics',
        name: 'Statistics',
        icon: '📊',
        description: 'Explore probability and data analysis',
        courseCount: 7,
      },
      {
        id: 'topology',
        name: 'Topology',
        icon: '🌀',
        description: 'Explore advanced geometric structures and properties',
        courseCount: 4,
      },
    ],
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    description: 'Explore physics, chemistry, biology, and more',
    color: 'from-green-500 to-emerald-500',
    topics: [
      {
        id: 'physics',
        name: 'Physics',
        icon: '⚛️',
        description: 'Fundamental principles of motion, energy, and matter',
        courseCount: 7,
      },
      {
        id: 'chemistry',
        name: 'Chemistry',
        icon: '🧪',
        description: 'Chemical reactions, bonding, and molecular structures',
        courseCount: 8,
      },
      {
        id: 'biology',
        name: 'Biology',
        icon: '🧬',
        description: 'Life sciences, cells, genetics, and ecosystems',
        courseCount: 9,
      },
      {
        id: 'astronomy',
        name: 'Astronomy',
        icon: '🌌',
        description: 'Stars, planets, galaxies, and the cosmos',
        courseCount: 5,
      },
      {
        id: 'environmental',
        name: 'Environmental Science',
        icon: '🌍',
        description: 'Ecosystems, climate, and sustainability',
        courseCount: 6,
      },
    ],
  },
  {
    id: 'programming',
    name: 'Programming',
    icon: '💻',
    description: 'Learn coding languages and software development',
    color: 'from-purple-500 to-pink-500',
    topics: [
      {
        id: 'python',
        name: 'Python',
        icon: '🐍',
        description: 'Versatile programming language for all skill levels',
        courseCount: 8,
      },
      {
        id: 'javascript',
        name: 'JavaScript',
        icon: '⚡',
        description: 'Web development with modern JS and frameworks',
        courseCount: 10,
      },
      {
        id: 'webdev',
        name: 'Web Development',
        icon: '🌐',
        description: 'HTML, CSS, React, Node.js, and full-stack development',
        courseCount: 12,
      },
      {
        id: 'datascience',
        name: 'Data Science',
        icon: '📈',
        description: 'Machine learning, analytics, and big data',
        courseCount: 7,
      },
      {
        id: 'mobile',
        name: 'Mobile Development',
        icon: '📱',
        description: 'iOS, Android, and cross-platform apps',
        courseCount: 6,
      },
    ],
  },
  {
    id: 'language',
    name: 'Languages',
    icon: '🌐',
    description: 'Learn to speak and write in world languages',
    color: 'from-red-500 to-orange-500',
    topics: [
      {
        id: 'spanish',
        name: 'Spanish',
        icon: '🇪🇸',
        description: 'Beginner to advanced Spanish conversation and grammar',
        courseCount: 9,
      },
      {
        id: 'french',
        name: 'French',
        icon: '🇫🇷',
        description: 'Master French language and culture',
        courseCount: 7,
      },
      {
        id: 'german',
        name: 'German',
        icon: '🇩🇪',
        description: 'German language fundamentals and advanced topics',
        courseCount: 6,
      },
      {
        id: 'mandarin',
        name: 'Mandarin Chinese',
        icon: '🇨🇳',
        description: 'Characters, tones, and conversational fluency',
        courseCount: 8,
      },
      {
        id: 'english',
        name: 'English',
        icon: '🇺🇸',
        description: 'English fluency, writing, and communication',
        courseCount: 7,
      },
    ],
  },
  {
    id: 'finance',
    name: 'Finance & Business',
    icon: '💰',
    description: 'Investing, trading, and business management',
    color: 'from-yellow-500 to-amber-500',
    topics: [
      {
        id: 'personalfinance',
        name: 'Personal Finance',
        icon: '💳',
        description: 'Budgeting, savings, and personal money management',
        courseCount: 8,
      },
      {
        id: 'investing',
        name: 'Investing',
        icon: '📈',
        description: 'Stock market, bonds, and portfolio management',
        courseCount: 9,
      },
      {
        id: 'crypto',
        name: 'Cryptocurrency',
        icon: '₿',
        description: 'Digital assets, blockchain, and Web3 technologies',
        courseCount: 6,
      },
      {
        id: 'business',
        name: 'Business',
        icon: '🏢',
        description: 'Entrepreneurship, management, and strategy',
        courseCount: 7,
      },
      {
        id: 'accounting',
        name: 'Accounting',
        icon: '📊',
        description: 'Financial statements, tax, and auditing',
        courseCount: 5,
      },
    ],
  },
  {
    id: 'history',
    name: 'History',
    icon: '📚',
    description: 'Explore the past and understand the world',
    color: 'from-amber-600 to-orange-600',
    topics: [
      {
        id: 'ancient',
        name: 'Ancient Civilizations',
        icon: '🏛️',
        description: 'Egypt, Greece, Rome, and ancient Asia',
        courseCount: 8,
      },
      {
        id: 'medieval',
        name: 'Medieval History',
        icon: '🏰',
        description: 'Medieval Europe, kingdoms, and culture',
        courseCount: 6,
      },
      {
        id: 'modern',
        name: 'Modern History',
        icon: '🕰️',
        description: 'Industrial revolution to 20th century',
        courseCount: 9,
      },
      {
        id: 'world',
        name: 'World Cultures',
        icon: '🗺️',
        description: 'Civilizations, traditions, and global perspectives',
        courseCount: 10,
      },
      {
        id: 'military',
        name: 'Military History',
        icon: '⚔️',
        description: 'Wars, conflicts, and military strategy',
        courseCount: 7,
      },
    ],
  },
]

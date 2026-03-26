'use client'

import { Category } from '@/lib/categories'
import { ChevronRight } from 'lucide-react'

interface CategoryCardProps {
  category: Category
  isSelected: boolean
  onClick: () => void
}

export default function CategoryCard({ category, isSelected, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-6 transition-all duration-300 border-2 group ${
        isSelected
          ? `bg-gradient-to-br ${category.color} border-primary shadow-xl text-white`
          : 'bg-card border-border hover:border-primary/30 hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className={`text-4xl mb-3 ${isSelected ? '' : 'group-hover:scale-110 transition-transform'}`}>
            {category.icon}
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-foreground group-hover:text-primary transition-colors'}`}>
            {category.name}
          </h3>
          <p className={`text-sm line-clamp-2 ${isSelected ? 'text-white/90' : 'text-muted-foreground'}`}>
            {category.description}
          </p>
        </div>
        {isSelected && (
          <ChevronRight className="w-6 h-6 flex-shrink-0 animate-pulse" />
        )}
      </div>
    </button>
  )
}

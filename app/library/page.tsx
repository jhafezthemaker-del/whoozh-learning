import { getAllRoadmapsAction } from '@/app/actions/roadmap'
import Header from '@/components/header'
import { categories } from '@/lib/categories'
import Link from 'next/link'
import { BookOpen, Calendar, ChevronRight, Clock, ArrowRight, LibraryBig } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function LibraryPage() {
  const roadmaps = await getAllRoadmapsAction()

  const getSubjectDetails = (subjectId: string) => {
    // Check if it's a category
    const category = categories.find(c => c.id === subjectId)
    if (category) {
      return {
        name: category.name,
        icon: category.icon,
        description: category.description,
        isCategory: true,
        parentCategoryId: category.id,
      }
    }

    // Check if it's a subtopic
    for (const cat of categories) {
      const subtopic = cat.topics.find(t => t.id === subjectId)
      if (subtopic) {
        return {
          name: subtopic.name,
          icon: subtopic.icon,
          description: subtopic.description,
          isCategory: false,
          parentCategoryId: cat.id,
        }
      }
    }

    // Fallback if not found
    return {
      name: subjectId,
      icon: '📚',
      description: 'Your saved custom roadmap.',
      isCategory: false,
      parentCategoryId: 'unknown',
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <LibraryBig className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Your Library</h1>
            <p className="text-muted-foreground mt-1 text-lg">Pick up from where you left off</p>
          </div>
        </div>

        {roadmaps.length === 0 ? (
          <div className="text-center py-20 bg-secondary/30 rounded-3xl border-2 border-dashed border-border mt-12">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <BookOpen className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">No roadmaps saved yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Explore our topics, generate an AI-powered roadmap, and save it to access it easily from your library.
            </p>
            <Link href="/">
              <Button size="lg" className="gap-2">
                Explore Topics <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmaps.map((roadmap) => {
              const subjectDetails = getSubjectDetails(roadmap.subject_id)
              const totalWeeks = roadmap.data?.weeks?.length || 0
              
              // Count total sessions
              let totalSessions = 0
              if (roadmap.data?.weeks) {
                roadmap.data.weeks.forEach((week: any) => {
                  if (week.days) {
                    week.days.forEach((day: any) => {
                      if (day.sessions) {
                        totalSessions += day.sessions.length
                      }
                    })
                  }
                })
              }

              // Build URL based on whether it's a category or subtopic
              // Assuming if it's saved from topic view it goes to `/topic/[id]`, if subtopic `/topic/[catId]/[subid]`
              const linkUrl = `/learninglab?id=${roadmap.id}`

              return (
                <Link href={linkUrl} key={roadmap.id} className="block group">
                  <div className="bg-card border border-border rounded-2xl p-6 h-full hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500" />
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300 transform origin-bottom-left">
                        {subjectDetails.icon}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>

                    <h3 className="font-bold text-foreground text-xl mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {subjectDetails.name} Roadmap
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2 flex-grow">
                      {subjectDetails.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto pt-4 border-t border-border/50">
                      <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                        <Calendar className="w-4 h-4 text-primary/70" />
                        <span className="font-medium">{totalWeeks} Weeks</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                        <Clock className="w-4 h-4 text-primary/70" />
                        <span className="font-medium">{totalSessions} Sessions</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

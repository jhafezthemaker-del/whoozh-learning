'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { getSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Session } from 'next-auth'

export default function LandingPage() {
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadSession = async () => {
      const currentSession = await getSession()
      setSession(currentSession)
      if (currentSession) {
        router.push('/')
      }
    }
    loadSession()
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-3xl">🧠</span>
            <span className="text-2xl font-bold text-primary hidden sm:inline">Whoozh</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Sign in</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-6xl font-bold text-foreground text-balance">
            Learn anything, master everything
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Whoozh is your gateway to unlimited knowledge. From mathematics to languages, explore thousands of courses designed to help you succeed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Learning Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="text-center space-y-3">
            <div className="text-5xl">📚</div>
            <h3 className="text-xl font-bold text-foreground">Diverse Courses</h3>
            <p className="text-muted-foreground">Access thousands of courses across various subjects and skill levels.</p>
          </div>
          <div className="text-center space-y-3">
            <div className="text-5xl">🎯</div>
            <h3 className="text-xl font-bold text-foreground">Learn at Your Pace</h3>
            <p className="text-muted-foreground">Study whenever and wherever you want with our flexible learning platform.</p>
          </div>
          <div className="text-center space-y-3">
            <div className="text-5xl">✨</div>
            <h3 className="text-xl font-bold text-foreground">Expert Instructors</h3>
            <p className="text-muted-foreground">Learn from industry experts and passionate educators worldwide.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

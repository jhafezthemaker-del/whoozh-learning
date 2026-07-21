'use client'

import Link from 'next/link'
import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useState } from 'react'
import { logoutAction } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: sessionData, status } = useSession()
  const router = useRouter()

  const session = sessionData?.user ?? null

  const isLoading = status === 'loading'
  console.log('Header session:', status)
  const handleLogout = async () => {
    await logoutAction()
    router.push('/auth/login')
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 flex items-center justify-center text-primary text-lg font-bold">
              🧠
            </div>
            <span className="text-xl font-bold text-primary hidden sm:inline">
              Whoozh
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link href="/library" className="text-foreground hover:text-primary transition-colors font-medium">
              Library
            </Link>
            <Link href="/library/quizzes" className="text-foreground hover:text-primary transition-colors font-medium">
              Quizzes
            </Link>
            <Link href="/learning" className="text-foreground hover:text-primary transition-colors font-medium">
              Learning
            </Link>
            <Link href="/resources" className="text-foreground hover:text-primary transition-colors font-medium">
              Resources
            </Link>
          </nav>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            ) : session ? (
              <>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground leading-none">{session.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{session.email}</p>
                </div>
                <Link href="/profile">
                  <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/60 ring-0 hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer">
                    <AvatarImage src={session.image || undefined} alt={session.name ?? 'User avatar'} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {session.name?.charAt(0)?.toUpperCase() || session.email?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button> 
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Sign in</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-3 border-t border-border pt-4">
            {/* Mobile user info with avatar */}
            {session && (
              <Link
                href="/profile"
                className="flex items-center gap-3 pb-3 border-b border-border"
                onClick={() => setIsMenuOpen(false)}
              >
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={session.image || undefined} alt={session.name ?? 'User avatar'} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {session.name?.charAt(0)?.toUpperCase() || session.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-none">{session.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{session.email}</p>
                </div>
              </Link>
            )}

            <Link href="/" className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link href="/library" className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
              Library
            </Link>
            <Link href="/library/quizzes" className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
              Quizzes
            </Link>
            <Link href="/learning" className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
              Learning
            </Link>
            <Link href="/resources" className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
              Resources
            </Link>
            <Link href="/profile" className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
              Profile
            </Link>

            {session && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium pt-2 border-t border-border"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
            {!session && !isLoading && (
              <>
                <Link href="/auth/login" className="text-foreground hover:text-primary transition-colors font-medium pt-2 border-t border-border" onClick={() => setIsMenuOpen(false)}>
                  Sign in
                </Link>
                <Link href="/auth/register" className="text-foreground hover:text-primary transition-colors font-medium pt-2 border-t border-border" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}

'use client'

import Link from 'next/link'
import { Menu, LogOut, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useState, useEffect } from 'react'
import { logoutAction } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'
import { Session } from '@/lib/auth-types'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        setSession(data.session)
      } catch (error) {
        console.error('[v0] Failed to load session:', error)
      }
    }
    loadSession()
  }, [])

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
            <Link href="/learning" className="text-foreground hover:text-primary transition-colors font-medium">
              Learning
            </Link>
            <Link href="/profile" className="text-foreground hover:text-primary transition-colors font-medium">
              Profile
            </Link>
          </nav>

          {/* User Section */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground leading-none">{session.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{session.email}</p>
                </div>
                <Link href="/profile">
                  <Avatar className="h-9 w-9 border border-border hover:opacity-80 transition-opacity">
                    <AvatarImage src={session.image || undefined} />
                    <AvatarFallback>
                      {session.name?.charAt(0) || session.email?.charAt(0)}
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
              <Link href="/auth/register">
                <Button variant="outline" size="sm">
                  Sign up
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  Sign in
                </Button>
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
            <Link href="/" className="text-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link href="/library" className="text-foreground hover:text-primary transition-colors font-medium">
              Library
            </Link>
            <Link href="/learning" className="text-foreground hover:text-primary transition-colors font-medium">
              Learning
            </Link>
            <Link href="/profile" className="text-foreground hover:text-primary transition-colors font-medium">
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
            {!session && (
              <>
              <Link href="/auth/register" className="text-foreground hover:text-primary transition-colors font-medium pt-2 border-t border-border">
                Sign Up
              </Link>
              <Link href="/auth/login" className="text-foreground hover:text-primary transition-colors font-medium pt-2 border-t border-border">
                Sign in
              </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}

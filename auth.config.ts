import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/auth/login',
  },
  providers: [],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt({ token, user, trigger, session }: any) {
      console.log('JWT callback - user:', user ? 'exists' : 'null', 'token.user_id:', token.user_id)
      if (user) {
        token.user_id = (user as any).user_id
        token.image = user.image
        console.log('JWT callback - setting token.user_id to:', token.user_id)
      }
      if (trigger === "update" && session) {
        token.name = session.user.name
        token.image = session.user.image
      }
      return token
    },
    session({ session, token }: any) {
      console.log('Session callback - token.user_id:', token?.user_id)
      if (token && session.user) {
        (session.user as any).user_id = token.user_id as string
        session.user.image = token.image as string
        console.log('Session callback - setting session.user.user_id to:', (session.user as any).user_id)
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }: any) {
      const isLoggedIn = !!auth?.user
      const isProtectedRoute = 
        nextUrl.pathname.startsWith('/course') ||
        nextUrl.pathname.startsWith('/learning') ||
        nextUrl.pathname.startsWith('/topic') ||
        nextUrl.pathname.startsWith('/profile') ||
        nextUrl.pathname === '/dashboard'

      if (isProtectedRoute) {
        if (isLoggedIn) return true
        return false // Redirect to /auth/login
      } else if (isLoggedIn) {
        const isAuthRoute = nextUrl.pathname.startsWith('/auth')
        if (isAuthRoute) {
          return Response.redirect(new URL('/learning', nextUrl))
        }
      }
      return true
    },
  },
} satisfies NextAuthConfig

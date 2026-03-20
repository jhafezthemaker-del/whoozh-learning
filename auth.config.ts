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
      if (user) {
        token.id = user.id
        token.image = user.image
      }
      if (trigger === "update" && session) {
        token.name = session.user.name
        token.image = session.user.image
      }
      return token
    },
    session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.image = token.image as string
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

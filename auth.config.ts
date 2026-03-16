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
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtectedRoute = 
        nextUrl.pathname.startsWith('/course') ||
        nextUrl.pathname.startsWith('/learning') ||
        nextUrl.pathname.startsWith('/topic') ||
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

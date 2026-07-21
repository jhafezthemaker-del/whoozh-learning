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
        token.user_id = (user as any).user_id
        token.id = (user as any).id
        token.image = user.image
        token.name = user.name
        token.email = user.email
      }
      if (trigger === "update" && session) {
        token.name = session.user.name
        token.image = session.user.image
      }
      console.log('JWT callback:', token) // Log the token object
      return token
    },
    session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string
        (session.user as any).user_id = token.user_id as string
        session.user.image = token.image as string
        session.user.name = token.name as string
        session.user.email = token.email as string
      }
      console.log('Session callback:', session) // Log the session object
      return session
    },
    authorized({ auth, request: { nextUrl } }: any) {
      const isLoggedIn = !!auth?.user
      console.log('Authorized callback - isLoggedIn:', isLoggedIn, 'nextUrl:', nextUrl.pathname) // Log the login status and requested URL
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
          return Response.redirect(new URL('/', nextUrl))
        }
      }
      return true
    },
  },
} satisfies NextAuthConfig

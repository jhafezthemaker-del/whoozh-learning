import { auth } from '@/auth'
import { getSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { encode } from 'next-auth/jwt'
import { cookies } from 'next/headers'

export async function GET() {
  const session = await getSession()
  return NextResponse.json({ session })
}

/**
 * PATCH /api/auth/session
 * Called by NextAuth's useSession().update() to refresh the JWT cookie
 * with updated session data (e.g. new name or profile image).
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { user: updatedUser } = body

    // Build the updated session by merging current session with incoming changes
    const updatedSession = {
      ...session,
      user: {
        ...session.user,
        name: updatedUser?.name ?? session.user.name,
        image: updatedUser?.image ?? session.user.image,
      },
    }

    // Encode a new JWT with the updated session data
    const secret = process.env.AUTH_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const newToken = await encode({
      token: {
        ...(session as any),
        user_id: (session.user as any).user_id,
        name: updatedSession.user.name,
        image: updatedSession.user.image,
        email: session.user.email,
      },
      secret,
      salt: process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
    })

    // Write the new session cookie
    const cookieName = process.env.NODE_ENV === 'production'
      ? '__Secure-authjs.session-token'
      : 'authjs.session-token'

    const cookieStore = await cookies()
    cookieStore.set(cookieName, newToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error('PATCH /api/auth/session error:', error)
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 })
  }
}

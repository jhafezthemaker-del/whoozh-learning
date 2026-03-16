import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/lib/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcryptjs from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          }
        })

        if (!user || !user.password) {
          return null
        }

        const passwordsMatch = await bcryptjs.compare(
          credentials.password as string,
          user.password
        )

        if (passwordsMatch) {
          return user
        }

        return null
      }
    })
  ]
})

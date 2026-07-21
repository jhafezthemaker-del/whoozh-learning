import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { auth } from '@/auth'
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Learnify - Modern Learning Platform',
  description: 'Discover and master topics with our modern learning platform',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

import { Toaster } from '@/components/ui/sonner'
import AuthSessionProvider from '@/components/session-provider'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
   const session = await auth()
  return (
    <html lang="en">
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthSessionProvider session={session}>
          {children}
        </AuthSessionProvider>
        <Toaster />
      </body>
    </html>
  )
}

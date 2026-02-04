import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import Navbar from './components/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mixtape Battle',
  description: 'Head-to-head song ranking for your band',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Navbar />
          <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}

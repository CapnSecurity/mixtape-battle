"use client";
import { SessionProvider } from 'next-auth/react'
import Navbar from './components/Navbar'

export default function RootLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        {children}
      </main>
    </SessionProvider>
  )
}

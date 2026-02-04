import type { Metadata } from 'next'
import RootLayoutContent from './layout-content'
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
        <RootLayoutContent>{children}</RootLayoutContent>
      </body>
    </html>
  )
}

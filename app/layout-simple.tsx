import { Metadata } from 'next'
import './globals.css'
import { IBM_Plex_Sans_Arabic } from 'next/font/google'
import { cn } from '@/lib/utils'

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-arabic',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'صحيفة سبق الإلكترونية',
  description: 'أخبار السعودية والعالم',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script src="/devtools-fix.js" />
      </head>
      <body className={cn(
        ibmPlexSansArabic.variable,
        "font-sans antialiased min-h-screen w-full"
      )} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
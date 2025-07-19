import { Metadata } from 'next'
import './globals.css'
import { IBM_Plex_Sans_Arabic } from 'next/font/google'
import { Providers } from './providers-minimal'

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-ibm-plex-arabic',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'صحيفة سبق الإلكترونية',
  description: 'موقع إخباري سعودي',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={ibmPlexSansArabic.variable}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

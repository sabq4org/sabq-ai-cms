import { Metadata } from 'next'
import './globals.css'
import { IBM_Plex_Sans_Arabic } from 'next/font/google'
import { Providers } from './providers'

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
    <html lang="ar" dir="rtl" className="font-arabic">
      <head>
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;700&display=swap" 
          as="style" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${ibmPlexSansArabic.variable} font-arabic antialiased`} style={{ fontFamily: 'var(--font-ibm-plex-arabic), IBM Plex Sans Arabic, system-ui, sans-serif' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

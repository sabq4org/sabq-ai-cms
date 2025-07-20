import { Metadata } from 'next'
import './globals.css'
import '../styles/versioned-breaking-news.css'
import '../styles/mobile-dashboard.css'
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
  description: 'موقع إخباري سعودي - أحدث الأخبار والمقالات من المملكة العربية السعودية والعالم العربي',
  keywords: ['أخبار', 'السعودية', 'صحيفة سبق', 'أخبار عربية', 'أخبار محلية'],
  authors: [{ name: 'فريق التحرير' }],
  
  // Open Graph tags للصفحة الرئيسية
  openGraph: {
    title: 'صحيفة سبق الإلكترونية',
    description: 'موقع إخباري سعودي - أحدث الأخبار والمقالات من المملكة العربية السعودية والعالم العربي',
    url: 'https://sabq.org',
    siteName: 'صحيفة سبق الإلكترونية',
    locale: 'ar_SA',
    type: 'website',
    images: [
      {
        url: 'https://sabq.org/images/sabq-logo-social.jpg',
        width: 1200,
        height: 630,
        alt: 'شعار صحيفة سبق الإلكترونية',
      }
    ],
  },

  // Twitter Card tags
  twitter: {
    card: 'summary_large_image',
    title: 'صحيفة سبق الإلكترونية',
    description: 'موقع إخباري سعودي - أحدث الأخبار والمقالات من المملكة العربية السعودية والعالم العربي',
    images: ['https://sabq.org/images/sabq-logo-social.jpg'],
    site: '@sabqorg',
  },

  // Additional SEO tags
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification tags (أضف codes الخاصة بك)
  verification: {
    // google: 'your-google-verification-code',
    // other: 'your-other-verification-codes',
  },
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

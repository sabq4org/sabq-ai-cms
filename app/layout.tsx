import type { Metadata } from 'next'
import { Noto_Sans_Arabic } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-arabic',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'صحيفة سبق الإلكترونية',
  description: 'صحيفة سبق الإلكترونية - آخر الأخبار والتقارير من المملكة العربية السعودية والعالم',
  keywords: 'سبق, أخبار, السعودية, عاجل, سياسة, اقتصاد, رياضة, تقنية',
  authors: [{ name: 'صحيفة سبق' }],
  creator: 'صحيفة سبق',
  publisher: 'صحيفة سبق',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'صحيفة سبق الإلكترونية',
    description: 'آخر الأخبار والتقارير من المملكة العربية السعودية والعالم',
    url: 'https://sabq.org',
    siteName: 'صحيفة سبق',
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'صحيفة سبق الإلكترونية',
    description: 'آخر الأخبار والتقارير من المملكة العربية السعودية والعالم',
    creator: '@sabqorg',
  },
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${notoSansArabic.variable} font-sans antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
} 
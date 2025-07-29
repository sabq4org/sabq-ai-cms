import '../styles/globals.css';
import '../styles/tailwind-overrides.css';
import '../styles/no-focus-outline.css';
import '../styles/smart-recommendations.css';
import '../styles/minimal-fix.css';
import '../styles/enhanced-mobile-stats.css';
import '../styles/compact-stats.css';
import '../styles/mobile-news.css';
import '../styles/responsive-ui.css';
import '../styles/enhanced-dark-mode-mobile.css';
import '../styles/theme-manager.css';
import '../styles/mobile.css';
import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import { Providers } from './providers';
import Header from '../components/Header';
import ErrorBoundary from '../components/ErrorBoundary';
import GlobalErrorHandler from '../components/GlobalErrorHandler';
import ConditionalHeader from '../components/ConditionalHeader';
import ContentWrapper from '../components/layout/ContentWrapper';

const ibmPlexArabic = IBM_Plex_Sans_Arabic({ 
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-arabic',
});

export const metadata: Metadata = {
  title: 'صحيفة سبق الالكترونية AI',
  description: 'صحيفة سبق الإلكترونية - أخبار ومقالات بتقنية الذكاء الاصطناعي',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#ffffff',
  applicationName: 'صحيفة سبق',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'صحيفة سبق',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Preconnect لتحسين الأداء */}
        <link rel="preconnect" href="https://sabq-cms-content.s3.amazonaws.com" />
        <link rel="preconnect" href="https://sabq-cms-content.s3.us-east-1.amazonaws.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://sabq-cms-content.s3.amazonaws.com" />
        <link rel="dns-prefetch" href="https://sabq-cms-content.s3.us-east-1.amazonaws.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className={`${ibmPlexArabic.variable} font-arabic`} suppressHydrationWarning>
        <ErrorBoundary>
          <Providers>
            <GlobalErrorHandler />
            <ConditionalHeader />
            <ContentWrapper>
              {children}
            </ContentWrapper>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
} 
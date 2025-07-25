import '../styles/globals.css';
import '../styles/smart-recommendations.css';
import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import { Providers } from './providers';
import Header from '../components/Header';
import ErrorBoundary from '../components/ErrorBoundary';
import GlobalErrorHandler from '../components/GlobalErrorHandler';

const ibmPlexArabic = IBM_Plex_Sans_Arabic({ 
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-arabic',
});

export const metadata: Metadata = {
  title: 'سبق AI CMS',
  description: 'نظام إدارة المحتوى بالذكاء الاصطناعي',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${ibmPlexArabic.variable} font-arabic`}>
        <ErrorBoundary>
          <Providers>
            <GlobalErrorHandler />
            <Header />
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
} 
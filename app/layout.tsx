import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import UserHeader from "@/components/user/UserHeader";
import Footer from "@/components/Footer";
import { Providers } from "./providers";
import "./globals.css";
import "../styles/news-card-desktop.css";
import "../styles/theme-manager.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap"
});

export const metadata: Metadata = {
  title: "صحيفة سبق الذكية - أخبار المملكة والعالم",
  description: "صحيفة سبق الذكية - آخر الأخبار والتحليلات من المملكة العربية السعودية والعالم",
  keywords: "أخبار, السعودية, سبق, صحيفة, أخبار عاجلة, تحليلات",
  authors: [{ name: "فريق سبق الذكية" }],
  openGraph: {
    title: "صحيفة سبق الذكية",
    description: "آخر الأخبار والتحليلات من المملكة العربية السعودية والعالم",
    url: "https://sabq.ai",
    siteName: "صحيفة سبق الذكية",
    locale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "صحيفة سبق الذكية",
    description: "آخر الأخبار والتحليلات من المملكة العربية السعودية والعالم",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={ibmPlexArabic.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="stylesheet" href="/manus-ui.css" />
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            font-family: ${ibmPlexArabic.style.fontFamily}, Arial, sans-serif;
          }
          .social-link:hover {
            background: #0066cc !important;
            color: white !important;
            border-color: #0066cc !important;
          }
          .footer-link:hover {
            color: #0066cc !important;
          }
        `}} />
      </head>
      <body className={`${ibmPlexArabic.className} antialiased`} suppressHydrationWarning>
        <Providers>
          <div style={{ 
            minHeight: '100vh',
            background: '#f5f5f5',
            paddingTop: '72px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 1
          }}>
            <UserHeader />
            <main style={{
              flex: 1,
              padding: '16px',
              maxWidth: '1400px',
              margin: '0 auto',
              width: '100%',
              background: 'transparent'
            }}>
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
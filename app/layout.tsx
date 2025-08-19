import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import ResponsiveLayout from "@/components/responsive/ResponsiveLayout";
import Footer from "@/components/Footer";
import { Providers } from "./providers";
import "./globals.css";
import "../styles/news-card-desktop.css";
import "../styles/theme-manager.css";
import "../styles/muqtarab-cards.css";

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
          
          /* Category pill styles - inline to ensure it loads */
          .category-pill {
            display: inline-flex !important;
            align-items: center !important;
            border-radius: 9999px !important;
            padding: 0.25rem 0.625rem !important;
            font-size: 0.75rem !important;
            font-weight: 500 !important;
            background-color: rgba(var(--theme-primary-rgb, 59 130 246), 0.1) !important;
            color: var(--theme-primary, hsl(212 90% 50%)) !important;
            border: 1px solid rgba(var(--theme-primary-rgb, 59 130 246), 0.2) !important;
            transition: all 0.3s ease !important;
          }
          
          .category-pill:hover {
            background-color: rgba(var(--theme-primary-rgb, 59 130 246), 0.2) !important;
            border-color: rgba(var(--theme-primary-rgb, 59 130 246), 0.3) !important;
          }
        `}} />
      </head>
      <body className={`${ibmPlexArabic.className} antialiased`} suppressHydrationWarning>
        <Providers>
          <ResponsiveLayout>
            {children}
          </ResponsiveLayout>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
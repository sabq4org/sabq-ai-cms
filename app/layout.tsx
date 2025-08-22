import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import ResponsiveLayout from "@/components/responsive/ResponsiveLayout";
import Footer from "@/components/Footer";
import FooterGate from "@/components/layout/FooterGate";
import { Providers } from "./providers";
import "./globals.css";
import "../styles/news-card-desktop.css";
import "../styles/theme-manager.css";
import "../styles/muqtarab-cards.css";
import "../styles/responsive-ui.css";
import "./old-style-demo/old-style.css";
import "../styles/compact-stats.css";
import "../styles/enhanced-mobile-stats.css";

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
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="stylesheet" href="/manus-ui.css" />
      </head>
      <body className={`${ibmPlexArabic.className} antialiased`} suppressHydrationWarning>
        <Providers>
          <ResponsiveLayout>
            <main className="flex-1">
              {children}
            </main>
            <FooterGate>
              <Footer />
            </FooterGate>
          </ResponsiveLayout>
        </Providers>
      </body>
    </html>
  );
}
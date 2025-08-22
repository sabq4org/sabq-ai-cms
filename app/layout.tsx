"use client";

import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { usePathname } from "next/navigation";
import ResponsiveLayout from "@/components/responsive/ResponsiveLayout";
import Footer from "@/components/Footer";
import FooterGate from "@/components/layout/FooterGate";
import { Providers } from "./providers";

// CSS خاص بالموقع فقط
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // إذا كان مسار الإدارة، اتركه للـ admin layout يتعامل معه بدون أي تدخل
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <html lang="ar" dir="rtl" className={ibmPlexArabic.variable} style={{ backgroundColor: '#f8f8f7' }}>
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="stylesheet" href="/manus-ui.css" />
        <style>{`
          /* خلفية موحدة للموقع فقط */
          html, body {
            background-color: #f8f8f7 !important;
            background-image: none !important;
          }
          
          /* الوضع الداكن */
          html.dark, body.dark, .dark html, .dark body {
            background-color: #111827 !important;
          }
        `}</style>
      </head>
      <body className={`${ibmPlexArabic.className} antialiased`} style={{ backgroundColor: '#f8f8f7', minHeight: '100vh' }} suppressHydrationWarning>
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
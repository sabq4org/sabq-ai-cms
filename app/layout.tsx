import type { Metadata } from "next";
import { Noto_Kufi_Arabic } from "next/font/google";
import UserHeader from "@/components/user/UserHeader";
import UserFooter from "@/components/user/UserFooter";
import { Providers } from "./providers";
import "./globals.css";

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-kufi-arabic",
  display: "swap",
  preload: true,
  fallback: ["Arial", "sans-serif"]
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
    <html lang="ar" dir="rtl" className={notoKufiArabic.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="stylesheet" href="/manus-ui.css" />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-noto-kufi-arabic: ${notoKufiArabic.style.fontFamily};
          }
          body {
            font-family: var(--font-noto-kufi-arabic), -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Arial', sans-serif;
          }
          .social-link:hover {
            background: hsl(var(--accent)) !important;
            color: white !important;
            border-color: hsl(var(--accent)) !important;
          }
          .footer-link:hover {
            color: hsl(var(--accent)) !important;
          }
        `}} />
      </head>
      <body className={`${notoKufiArabic.className} antialiased`} suppressHydrationWarning>
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
            <UserFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
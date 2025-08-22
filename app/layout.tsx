import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
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
    <html lang="ar" dir="rtl" className={ibmPlexArabic.variable} style={{ backgroundColor: '#f8f8f7' }}>
      <head>
        <meta name="theme-color" content="#f8f8f7" />
        <meta name="msapplication-TileColor" content="#f8f8f7" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="stylesheet" href="/manus-ui.css" />
        <style>{`
          /* خلفية موحدة للموقع - بأولوية قصوى */
          html {
            background: #f8f8f7 !important;
            background-color: #f8f8f7 !important;
            background-image: none !important;
            min-height: 100vh !important;
          }
          
          body {
            background: #f8f8f7 !important;
            background-color: #f8f8f7 !important;
            background-image: none !important;
            min-height: 100vh !important;
          }
          
          /* الوضع الداكن */
          html.dark, body.dark, .dark html, .dark body {
            background: #111827 !important;
            background-color: #111827 !important;
          }
          
          /* شفافية المكونات الرئيسية */
          .homepage-wrapper,
          .page-wrapper,
          main,
          #__next,
          [data-device="mobile"],
          [data-device="desktop"] {
            background: transparent !important;
            background-color: transparent !important;
          }
          
          /* تطبيق فوري عبر JavaScript */
          * {
            --site-bg: #f8f8f7;
          }
        `}</style>
        <script dangerouslySetInnerHTML={{ __html: `
          // تطبيق فوري للخلفية
          document.documentElement.style.backgroundColor = '#f8f8f7';
          document.documentElement.style.backgroundImage = 'none';
          document.body.style.backgroundColor = '#f8f8f7';
          document.body.style.backgroundImage = 'none';
          
          // عند تحميل الصفحة
          window.addEventListener('DOMContentLoaded', function() {
            document.documentElement.style.setProperty('background-color', '#f8f8f7', 'important');
            document.body.style.setProperty('background-color', '#f8f8f7', 'important');
          });
        ` }} />
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
import type { Metadata } from "next";
import { Suspense } from "react";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { ToastContainer } from "@/components/ui/toast";
import { getServerUser } from "@/lib/getServerUser";
import { getSiteUrl } from "@/lib/url-builder";
import "./globals.css";
import "@/styles/unified-font-system.css";
import "@/styles/force-arabic-font.css";
import "@/app/old-style-demo/old-style.css";
// color-softening.css removed for performance
import "@/styles/notification-fixes.css";
import "@/styles/notification-modern-ui.css";
import "@/styles/notification-light-header.css";
import "@/styles/lite-stats-bar-sticky.css";
import "@/styles/recent-news-badge.css";
import "@/styles/dark-mode-overlay-fix.css";
import "@/styles/remove-featured-image-effects.css";
import "@/styles/soft-read-more-button.css";
import "@/styles/article-light-theme-fixes.css";
import "@/styles/enhanced-reading-mode.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
  preload: true,
  fallback: ["Tajawal", "Noto Sans Arabic", "system-ui", "sans-serif"]
});

const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  title: "صحيفة سبق الذكية - أخبار المملكة والعالم",
  description: "صحيفة سبق الذكية - آخر الأخبار والتحليلات من المملكة العربية السعودية والعالم",
  keywords: "أخبار, السعودية, سبق, صحيفة, أخبار عاجلة, تحليلات",
  authors: [{ name: "فريق سبق الذكية" }],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "صحيفة سبق الذكية",
    description: "آخر الأخبار والتحليلات من المملكة العربية السعودية والعالم",
    url: SITE_URL,
    siteName: "صحيفة سبق الذكية",
    locale: "ar_SA",
    type: "website",
    images: [
      `${SITE_URL}/images/sabq-logo-social.svg`
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@sabqorg",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // تحميل المستخدم من الخادم (مع التعامل مع static rendering)
  let initialUser = null;
  
  try {
    // تجنب استخدام getServerUser في بيئة الـ static generation
    const isStaticGeneration = process.env.VERCEL_ENV === 'preview' || 
                              process.env.VERCEL || 
                              process.env.NODE_ENV === 'production';
                              
    if (!isStaticGeneration) {
      initialUser = await getServerUser();
    }
  } catch (error) {
    // في حالة static generation، تجاهل الخطأ
    if (error && typeof error === 'object' && 'digest' in error && error.digest === 'DYNAMIC_SERVER_USAGE') {
      console.log('🔍 [RootLayout] تجاهل getServerUser في static generation');
    } else {
      console.warn('⚠️ [RootLayout] فشل جلب المستخدم:', error);
    }
  }
  
  if (initialUser) {
    console.log('✅ [RootLayout] تم جلب المستخدم:', initialUser.email);
  } else {
    console.log('🔍 [RootLayout] لا يوجد مستخدم في الخادم');
  }

  return (
    <html lang="ar" dir="rtl" className={ibmPlexArabic.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        {/* تمت إزالة سكربتات إصلاحات الإنتاج لمنع أخطاء التنفيذ في المتصفح */}
        {/* تمرير بيانات المستخدم إلى العميل */}
        {initialUser && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__INITIAL_USER__ = ${JSON.stringify(initialUser)};`
            }}
          />
        )}
      </head>
      <body className={`${ibmPlexArabic.className} font-arabic antialiased`} suppressHydrationWarning>
        <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#f8f8f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-3 text-gray-600">جاري التحميل...</p>
          </div>
        </div>}>
          <ConditionalLayout initialUser={initialUser}>
            {children}
          </ConditionalLayout>
        </Suspense>
        <ToastContainer />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
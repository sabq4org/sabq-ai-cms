import type { Metadata } from "next";
import { Suspense } from "react";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { ToastContainer } from "@/components/ui/toast";
import { getServerUser } from "@/lib/getServerUser";
import { getSiteUrl } from "@/lib/url-builder";
import "./globals.css";
import "@/styles/unified-font-system.css";
import "@/styles/force-arabic-font.css";
import "@/app/old-style-demo/old-style.css";
import "@/styles/lite-stats-bar-sticky.css";
import "@/styles/recent-news-badge.css";
import "@/styles/dark-mode-overlay-fix.css";
// نقل CSS غير الحرج إلى public والتحميل غير الحاجب عبر preload+onload
import "@/styles/article-light-theme-fixes.css";
// تحميل غير حاجب لوضع القراءة (يُحقن عبر preload+onload أدناه)

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
        {/* DNS prefetch to speed up first connections */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        <link rel="dns-prefetch" href="https://cdn.sabq.org" />
        <link rel="dns-prefetch" href="https://sabq-prod.imgix.net" />
        <link rel="dns-prefetch" href="https://sabq-cms-content.s3.amazonaws.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://ui-avatars.com" />
        <link rel="dns-prefetch" href="https://d2kdkzp4dtcikk.cloudfront.net" />
        {/* Preconnect to the most common image CDNs for faster LCP */}
        <link rel="preconnect" href="https://cdn.sabq.org" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://sabq-prod.imgix.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://sabq-cms-content.s3.amazonaws.com" crossOrigin="anonymous" />
        {/* ملاحظة: إزالة preload لطلبات API لتفادي تزاحم الشبكة على المحمول وتحسين FCP */}
        {/* إصلاحات إنتاج عامة وCSS */}
        <script src="/production-error-fixes.js" defer></script>
        <script src="/fix-cors-auth.js" defer></script>
        {/* Web Vitals RUM - لا يؤثر على التصميم */}
        <script src="/rum-web-vitals.js" defer></script>
        {/* CSS غير حرج: وضع القراءة - preload ثم onload للتحويل إلى stylesheet مع noscript */}
        <link rel="preload" href="/styles/enhanced-reading-mode.css" as="style" onLoad={"this.onload=null;this.rel='stylesheet'"} />
        <noscript><link rel="stylesheet" href="/styles/enhanced-reading-mode.css" /></noscript>
        {/* CSS غير حرج إضافي */}
        <link rel="preload" href="/styles/color-softening.css" as="style" onLoad={"this.onload=null;this.rel='stylesheet'"} />
        <noscript><link rel="stylesheet" href="/styles/color-softening.css" /></noscript>
        <link rel="preload" href="/styles/notification-fixes.css" as="style" onLoad={"this.onload=null;this.rel='stylesheet'"} />
        <noscript><link rel="stylesheet" href="/styles/notification-fixes.css" /></noscript>
        <link rel="preload" href="/styles/notification-modern-ui.css" as="style" onLoad={"this.onload=null;this.rel='stylesheet'"} />
        <noscript><link rel="stylesheet" href="/styles/notification-modern-ui.css" /></noscript>
        <link rel="preload" href="/styles/notification-light-header.css" as="style" onLoad={"this.onload=null;this.rel='stylesheet'"} />
        <noscript><link rel="stylesheet" href="/styles/notification-light-header.css" /></noscript>
        <link rel="preload" href="/styles/remove-featured-image-effects.css" as="style" onLoad={"this.onload=null;this.rel='stylesheet'"} />
        <noscript><link rel="stylesheet" href="/styles/remove-featured-image-effects.css" /></noscript>
        <link rel="preload" href="/styles/soft-read-more-button.css" as="style" onLoad={"this.onload=null;this.rel='stylesheet'"} />
        <noscript><link rel="stylesheet" href="/styles/soft-read-more-button.css" /></noscript>
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
      </body>
    </html>
  );
}
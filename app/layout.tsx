import type { Metadata } from "next";
import { Suspense } from "react";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
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
import "@/styles/article-light-theme-fixes.css";
// تحميل غير حاجب لوضع القراءة (يُحقن عبر preload+onload أدناه)

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
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
        {/* Preconnect to the most common image CDNs for faster LCP */}
        <link rel="preconnect" href="https://cdn.sabq.org" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://sabq-prod.imgix.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://sabq-cms-content.s3.amazonaws.com" crossOrigin="anonymous" />
        {/* إضافة preconnect لمزوّد صور Cloudinary والمجالات النشطة لتحسين LCP */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://ui-avatars.com" crossOrigin="anonymous" />
        {/* ملاحظة: إزالة preload لطلبات API لتفادي تزاحم الشبكة على المحمول وتحسين FCP */}
        {/* إصلاحات إنتاج عامة وCSS */}
        <Script src="/enhanced-error-handler.js" strategy="beforeInteractive" />
        <Script src="/css-error-handler.js" strategy="afterInteractive" />
        <Script src="/production-error-fixes.js" strategy="afterInteractive" />
        <Script src="/fix-cors-auth.js" strategy="afterInteractive" />
        {/* Web Vitals RUM - نسخة محلية بالكامل */}
        <Script src="/web-vitals-local.js" strategy="afterInteractive" />
        {/* تسجيل Service Worker للصور فقط - لا يؤثر على الواجهة */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(){});
                });
              }
            `
          }}
        />
        {/* تأجيل تحميل CSS غير الحرج إلى أوقات الخمول لتحسين FCP/LCP على المحمول */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var cssList = [
                  '/styles/enhanced-reading-mode.css',
                  '/styles/color-softening.css',
                  '/styles/notification-fixes.css',
                  '/styles/notification-modern-ui.css',
                  '/styles/notification-light-header.css',
                  '/styles/remove-featured-image-effects.css',
                  '/styles/soft-read-more-button.css'
                ];
                function loadCSS(href){
                  var l = document.createElement('link');
                  l.rel='stylesheet'; l.href=href; l.media='print';
                  l.onload=function(){ this.media='all'; };
                  document.head.appendChild(l);
                }
                var schedule = window.requestIdleCallback || function(cb){ return setTimeout(cb, 200); };
                schedule(function(){ cssList.forEach(loadCSS); });
              })();
            `,
          }}
        />
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
        {/* مراقبة المهام الطويلة لتشخيص انفجار الخيط الرئيسي في البيئات غير الإنتاجية */}
        {process.env.NODE_ENV !== 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                try{
                  if ('PerformanceObserver' in window) {
                    const po = new PerformanceObserver((list) => {
                      for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                          console.warn('[LongTask]', Math.round(entry.duration)+'ms', 'start:', Math.round(entry.startTime));
                        }
                      }
                    });
                    // @ts-ignore
                    po.observe({entryTypes:['longtask']});
                  }
                }catch(e){}
              `
            }}
          />
        )}
        <ConditionalLayout initialUser={initialUser}>
          {children}
        </ConditionalLayout>
        <ToastContainer />
        <SpeedInsights />
      </body>
    </html>
  );
}
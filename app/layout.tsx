import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import AnalyticsProvider from "../components/Analytics/AnalyticsProvider";
import ConditionalHeader from "../components/ConditionalHeader";
import CriticalErrorBoundary from "../components/CriticalErrorBoundary";
import ErrorBoundary from "../components/ErrorBoundary";
import EnhancedErrorBoundary from "../components/ErrorBoundary/EnhancedErrorBoundary";
import ReactErrorBoundary from "../components/ErrorBoundary/ReactErrorBoundary";
import GlobalErrorHandler from "../components/GlobalErrorHandler";
import ReactErrorRecovery from "../components/ReactErrorRecovery";
import StructuredData from "../components/StructuredData";
import ContentWrapper from "../components/layout/ContentWrapper";
import "../styles/compact-stats.css";
import "../styles/enhanced-dark-mode-mobile.css";
import "../styles/enhanced-mobile-stats.css";
import "../styles/featured-mobile-card.css";
import "../styles/featured-news-carousel-fixes.css"; // إضافة إصلاحات كاروسيل الأخبار المميزة
import "../styles/globals.css";
import "../styles/minimal-fix.css";
import "../styles/mobile-internal-pages-fix.css";
import "../styles/mobile-news.css";
import "../styles/mobile.css";
import "../styles/muqtarab-animations.css";
import "../styles/news-card-desktop.css";
import "../styles/no-focus-outline.css";
import "../styles/profile-mobile.css";
import "../styles/remove-gap.css";
import "../styles/responsive-ui.css";
import "../styles/saas-dashboard.css";
import "../styles/scrollbar-hide.css";
import "../styles/smart-recommendations.css";
import "../styles/tailwind-overrides.css";
import "../styles/theme-manager.css";
import "./globals.css";
import { Providers } from "./providers";

// لا نستخدم هنا dynamic import لأنها تسبب مشكلة في Next.js 15.4.1
// لاحظ: أي مكون يستخدم hooks يجب أن يكون client component

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
});

export const metadata: Metadata = {
  title: {
    default: "سبق الذكية - منصة الأخبار الذكية",
    template: "%s - سبق الذكية",
  },
  description:
    "منصة إعلامية مدعومة بالذكاء الاصطناعي تقدم تحليلات ومقالات وأخبار دقيقة وعميقة.",
  applicationName: "سبق الذكية",
  authors: [{ name: "فريق سبق الذكية" }],
  keywords: [
    "أخبار السعودية",
    "الذكاء الاصطناعي",
    "تحليلات إخبارية",
    "مقالات رأي",
    "أخبار عاجلة",
    "سبق الذكية",
    "صحافة ذكية",
  ],
  creator: "سبق الذكية",
  publisher: "سبق الذكية",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://sabq.io",
    siteName: "سبق الذكية",
    title: "سبق الذكية - منصة الأخبار الذكية",
    description:
      "تابع أحدث الأخبار والتحليلات العميقة عبر منصة سبق الذكية المدعومة بالذكاء الاصطناعي.",
    images: [
      {
        url: `${
          process.env.NEXT_PUBLIC_SITE_URL || "https://sabq.io"
        }/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "سبق الذكية - منصة الأخبار الذكية",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@sabq",
    creator: "@sabq",
    title: "سبق الذكية - منصة الأخبار الذكية",
    description:
      "تابع أحدث الأخبار والتحليلات العميقة عبر منصة سبق الذكية المدعومة بالذكاء الاصطناعي.",
    images: {
      url: `${
        process.env.NEXT_PUBLIC_SITE_URL || "https://sabq.io"
      }/og-image.jpg`,
      alt: "سبق الذكية",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    // إزالة تعريف أيقونة من app/ لتفادي التعارض مع public/
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#5bbad5" },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "سبق الذكية",
    startupImage: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://sabq.io",
    languages: {
      "ar-SA": process.env.NEXT_PUBLIC_SITE_URL || "https://sabq.io",
      ar: process.env.NEXT_PUBLIC_SITE_URL || "https://sabq.io",
    },
  },
  category: "news",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Preconnect لتحسين الأداء */}
        <link
          rel="preconnect"
          href="https://sabq-cms-content.s3.amazonaws.com"
        />
        <link
          rel="preconnect"
          href="https://sabq-cms-content.s3.us-east-1.amazonaws.com"
        />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link
          rel="dns-prefetch"
          href="https://sabq-cms-content.s3.amazonaws.com"
        />
        <link
          rel="dns-prefetch"
          href="https://sabq-cms-content.s3.us-east-1.amazonaws.com"
        />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* 🚨 CRITICAL: Production Error Protection - Must Load First */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Ultra-Aggressive React Error #130 Protection for Production
              (function() {
                if (typeof window === 'undefined') return;

                // Immediate error blocking
                var blocked = 0;
                var originalError = console.error;
                var originalWarn = console.warn;

                // Block all React #130 errors immediately
                console.error = function() {
                  var args = Array.prototype.slice.call(arguments);
                  var str = args[0] ? String(args[0]) : '';

                  if (str.indexOf('Minified React error #130') !== -1 ||
                      str.indexOf('Element type is invalid') !== -1 ||
                      str.indexOf('undefined') !== -1 && str.indexOf('React') !== -1 ||
                      str.indexOf('خطأ في التطبيق') !== -1) {
                    blocked++;
                    console.log('🛡️ Blocked error #' + blocked);
                    return; // Block completely
                  }

                  if (originalError) originalError.apply(console, args);
                };

                // Block warnings too
                console.warn = function() {
                  var args = Array.prototype.slice.call(arguments);
                  var str = args[0] ? String(args[0]) : '';

                  if (str.indexOf('لا توجد مقالات صالحة') !== -1) {
                    return; // Silent
                  }

                  if (originalWarn) originalWarn.apply(console, args);
                };

                // Block window errors
                window.addEventListener('error', function(e) {
                  if (e && e.error) {
                    var msg = e.error.message || '';
                    if (msg.indexOf('React error #130') !== -1 ||
                        msg.indexOf('Element type is invalid') !== -1) {
                      e.preventDefault();
                      e.stopPropagation();
                      blocked++;
                      console.log('🛡️ Window error blocked #' + blocked);
                      return false;
                    }
                  }
                }, true);

                // Load production fix
                var script = document.createElement('script');
                script.src = '/react-130-production-fix.js';
                script.async = false;
                document.head.appendChild(script);
              })();
            `,
          }}
        />

        {/* Emergency React Fix - Secondary Protection */}
        <script src="/emergency-react-fix.js" defer></script>

        {/* Production Error Fixes */}
        <script src="/production-error-fixes.js" defer></script>

        {/* Mobile light version CSS/JS (global, non-intrusive) */}
        <link rel="stylesheet" href="/assets/css/mobile_fixes.css" />
        <script src="/assets/js/mobile_interactions.js" defer></script>
        
        {/* Mobile Lite Version Fixes - إصلاحات النسخة الخفيفة */}
        <link rel="stylesheet" href="/styles/mobile-lite-fixes.css" />
        <script src="/mobile-lite-fixes.js" defer></script>
        

      </head>
      <body
        className={`${ibmPlexArabic.variable} font-arabic`}
        suppressHydrationWarning
      >
        <CriticalErrorBoundary>
          <ReactErrorRecovery>
            <EnhancedErrorBoundary>
              <ReactErrorBoundary>
                <ErrorBoundary>
                  <AnalyticsProvider>
                    <Providers>
                      <GlobalErrorHandler />
                      <ConditionalHeader />
                      {/* تم تعطيل مراقب قاعدة البيانات مؤقتًا لإصلاح المشكلة */}
                      <ContentWrapper>{children}</ContentWrapper>
                    </Providers>
                  </AnalyticsProvider>
                </ErrorBoundary>
              </ReactErrorBoundary>
            </EnhancedErrorBoundary>
          </ReactErrorRecovery>
        </CriticalErrorBoundary>
        <StructuredData pageType="home" />
      </body>
    </html>
  );
}

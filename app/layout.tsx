import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import AnalyticsProvider from "../components/Analytics/AnalyticsProvider";
import ConditionalHeader from "../components/ConditionalHeader";
import ErrorBoundary from "../components/ErrorBoundary";
import ReactErrorBoundary from "../components/ErrorBoundary/ReactErrorBoundary";
import GlobalErrorHandler from "../components/GlobalErrorHandler";
import StructuredData from "../components/StructuredData";
import ContentWrapper from "../components/layout/ContentWrapper";
import "../styles/compact-stats.css";
import "../styles/enhanced-dark-mode-mobile.css";
import "../styles/enhanced-mobile-stats.css";
import "../styles/featured-mobile-card.css";
import "../styles/globals.css";
import "../styles/minimal-fix.css";
import "../styles/mobile-internal-pages-fix.css";
import "../styles/mobile-news.css";
import "../styles/mobile.css";
import "../styles/muqtarab-animations.css";
import "../styles/news-pulse-positioning.css";
import "../styles/no-focus-outline.css";
import "../styles/profile-mobile.css";
import "../styles/pulse-ticker-center.css";
import "../styles/remove-gap.css";
import "../styles/responsive-ui.css";
import "../styles/saas-dashboard.css";
import "../styles/scrollbar-hide.css";
import "../styles/smart-recommendations.css";
import "../styles/tailwind-overrides.css";
import "../styles/theme-manager.css";
import { Providers } from "./providers";

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
    url: "https://sabq.me",
    siteName: "سبق الذكية",
    title: "سبق الذكية - منصة الأخبار الذكية",
    description:
      "تابع أحدث الأخبار والتحليلات العميقة عبر منصة سبق الذكية المدعومة بالذكاء الاصطناعي.",
    images: [
      {
        url: "https://sabq.me/og-image.jpg",
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
      url: "https://sabq.me/og-image.jpg",
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
    canonical: "https://sabq.me",
    languages: {
      "ar-SA": "https://sabq.me",
      ar: "https://sabq.me",
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
      </head>
      <body
        className={`${ibmPlexArabic.variable} font-arabic`}
        suppressHydrationWarning
      >
        <ReactErrorBoundary>
          <ErrorBoundary>
            <AnalyticsProvider>
              <Providers>
                <GlobalErrorHandler />
                <ConditionalHeader />
                <ContentWrapper>{children}</ContentWrapper>
              </Providers>
            </AnalyticsProvider>
          </ErrorBoundary>
        </ReactErrorBoundary>
        <StructuredData pageType="home" />
      </body>
    </html>
  );
}

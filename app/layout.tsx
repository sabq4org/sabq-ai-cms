import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import ResponsiveLayout from "@/components/responsive/ResponsiveLayout";
import Footer from "@/components/Footer";
import FooterGate from "@/components/layout/FooterGate";
import { usePathname } from "next/navigation";
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
  // ملاحظة: hook لا يمكن استخدامه هنا لأنه ملف سيرفري. سنستخدم فحصاً بسيطاً داخل ResponsiveLayout.
  return (
    <html lang="ar" dir="rtl" className={ibmPlexArabic.variable} style={{ backgroundColor: '#f8f8f7' }}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          // تطبيق فوري قبل أي شيء
          document.documentElement.style.backgroundColor = '#f8f8f7';
        ` }} />
        <meta name="theme-color" content="#f8f8f7" />
        <meta name="msapplication-TileColor" content="#f8f8f7" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="stylesheet" href="/background-override.css" />
        <link rel="stylesheet" href="/manus-ui.css" />
        <style dangerouslySetInnerHTML={{ __html: `
          /* إعدادات الخلفية الأساسية - بأولوية قصوى */
          html {
            background: #f8f8f7 !important;
            background-color: #f8f8f7 !important;
            min-height: 100vh !important;
          }
          
          body {
            font-family: ${ibmPlexArabic.style.fontFamily}, Arial, sans-serif;
            background: #f8f8f7 !important;
            background-color: #f8f8f7 !important;
            min-height: 100vh;
          }
          
          /* إلغاء أي خلفيات من manus-ui.css */
          body {
            background: #f8f8f7 !important;
          }
          
          /* الوضع الداكن */
          html.dark,
          body.dark,
          .dark body {
            background: #111827 !important;
            background-color: #111827 !important;
          }
          
          .homepage-wrapper {
            background: transparent !important;
          }
          
          /* إزالة أي طبقات pseudo */
          *::before,
          *::after {
            background: transparent !important;
          }
          
          /* استثناء للعناصر التي تحتاج pseudo elements */
          .muqtarab-home-section::before,
          .muqtarab-home-section::after {
            background: initial !important;
          }
          
          /* خلفية فورية لصفحة مقترب - أعلى أولوية */
          body:has([data-page="muqtarab"]),
          body:has([data-muqtarab="true"]),
          html:has([data-page="muqtarab"]) body {
            background: #f8f8f7 !important;
            background-color: #f8f8f7 !important;
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
      <body className={`${ibmPlexArabic.className} antialiased`} style={{ backgroundColor: '#f8f8f7', minHeight: '100vh' }} suppressHydrationWarning>
        <style dangerouslySetInnerHTML={{ __html: `
          html, body { 
            background: #f8f8f7 !important; 
            background-color: #f8f8f7 !important; 
            background-image: none !important;
          }
          .dark html, .dark body, html.dark, body.dark { 
            background: #111827 !important; 
            background-color: #111827 !important; 
          }
        ` }} />
        <script dangerouslySetInnerHTML={{ __html: `
          // تطبيق فوري للخلفية
          document.documentElement.style.backgroundColor = '#f8f8f7';
          document.body.style.backgroundColor = '#f8f8f7';
          
          // التحقق من الوضع الداكن
          if (document.documentElement.classList.contains('dark') || 
              document.body.classList.contains('dark')) {
            document.documentElement.style.backgroundColor = '#111827';
            document.body.style.backgroundColor = '#111827';
          }
          
          // تطبيق مرة أخرى بعد تحميل DOM
          window.addEventListener('DOMContentLoaded', function() {
            document.documentElement.style.backgroundColor = '#f8f8f7';
            document.body.style.backgroundColor = '#f8f8f7';
            
            // إزالة أي خلفيات من العناصر الرئيسية
            const wrapper = document.querySelector('.homepage-wrapper');
            if (wrapper) wrapper.style.backgroundColor = 'transparent';
            
            const pageWrapper = document.querySelector('.page-wrapper');
            if (pageWrapper) pageWrapper.style.backgroundColor = 'transparent';
            
            const main = document.querySelector('main');
            if (main) main.style.backgroundColor = 'transparent';
          });
          
          // تأكد من تطبيق الخلفية حتى بعد أي تحديثات ديناميكية
          setInterval(function() {
            if (document.body.style.backgroundColor !== '#f8f8f7' && 
                !document.documentElement.classList.contains('dark')) {
              document.body.style.backgroundColor = '#f8f8f7';
              document.documentElement.style.backgroundColor = '#f8f8f7';
            }
            
            // إزالة أي طبقات مغطية
            var overlays = document.querySelectorAll('.mobile-overlay, .manus-layout::before, [class*="overlay"]:not(.muqtarab-home-section)');
            overlays.forEach(function(el) {
              el.style.display = 'none';
            });
            
            // فحص جميع العناصر وإزالة الخلفيات البيضاء
            var allElements = document.querySelectorAll('body > div, body > div > div');
            allElements.forEach(function(el) {
              var computedStyle = window.getComputedStyle(el);
              var bgColor = computedStyle.backgroundColor;
              
              // إذا كانت الخلفية بيضاء أو شبه بيضاء
              if (bgColor === 'rgb(255, 255, 255)' || 
                  bgColor === 'rgba(255, 255, 255, 1)' ||
                  bgColor === 'white' ||
                  bgColor === '#ffffff' ||
                  bgColor === '#fff') {
                // تحقق من أن العنصر ليس بطاقة
                if (!el.classList.contains('card') && 
                    !el.className.includes('card') &&
                    !el.tagName.toLowerCase() === 'article') {
                  el.style.backgroundColor = 'transparent';
                  el.style.background = 'transparent';
                }
              }
            });
          }, 100);
        ` }} />
        <Providers>
          <ResponsiveLayout>
            {children}
          </ResponsiveLayout>
          {/* إخفاء فوتر واجهة الموقع تلقائيًا في مسارات /admin/** وأيضًا /login و /register */}
          <FooterGate>
            <Footer />
          </FooterGate>
        </Providers>
      </body>
    </html>
  );
}
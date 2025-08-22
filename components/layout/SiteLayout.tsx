"use client";

import Footer from "@/components/Footer";
import FooterGate from "@/components/layout/FooterGate";
import LightHeader from "@/components/layout/LightHeader";
import UserHeader from "@/components/user/UserHeader";
import { Providers } from "../../app/providers";
import { useEffect, useState, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";

// CSS خاص بالموقع فقط
import "../../app/globals.css";
import "../../styles/news-card-desktop.css";
import "../../styles/theme-manager.css";
import "../../styles/muqtarab-cards.css";
import "../../styles/responsive-ui.css";
import "../../app/old-style-demo/old-style.css";
import "../../styles/compact-stats.css";
import "../../styles/enhanced-mobile-stats.css";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isUserAuthPage = pathname === "/login" || pathname === "/register";
  const isCategoryPage = pathname?.startsWith("/categories/") || pathname?.startsWith("/news/category/");

  // فحص الجهاز
  const checkDevice = useCallback(() => {
    const width = window.innerWidth;
    const newIsMobile = width < 768;
    setIsMobile(prev => prev !== newIsMobile ? newIsMobile : prev);
  }, []);

  useEffect(() => {
    setMounted(true);
    checkDevice();

    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkDevice, 100);
    };

    window.addEventListener('resize', debouncedResize, { passive: true });

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [checkDevice]);
  
  // تطبيق الخلفية فور التحميل
  useEffect(() => {
    // تطبيق فوري للخلفية
    document.documentElement.style.backgroundColor = '#f8f8f7';
    document.documentElement.style.backgroundImage = 'none';
    document.body.style.backgroundColor = '#f8f8f7';
    document.body.style.backgroundImage = 'none';
    
    // إضافة CSS مباشر للرأس
    const style = document.createElement('style');
    style.textContent = `
      html, body {
        background-color: #f8f8f7 !important;
        background-image: none !important;
        min-height: 100vh !important;
      }
      
      .dark html, .dark body {
        background-color: #111827 !important;
      }
      
      .homepage-wrapper,
      .page-wrapper,
      main,
      #__next,
      [data-device="mobile"],
      [data-device="desktop"] {
        background: transparent !important;
        background-color: transparent !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  // Loading state
  if (!mounted) {
    return (
      <div style={{ backgroundColor: '#f8f8f7', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  // صفحات الدخول للأعضاء (لا هيدر/فوتر)
  if (isUserAuthPage) {
    return (
      <div style={{ backgroundColor: '#f8f8f7', minHeight: '100vh' }}>
        <Providers>
          {children}
        </Providers>
      </div>
    );
  }

  // النسخة الخفيفة للهواتف والتابلت
  if (isMobile) {
    return (
      <div style={{ backgroundColor: '#f8f8f7', minHeight: '100vh' }}>
        <Providers>
          <LightHeader />
          <main 
            style={{ 
              maxWidth: isCategoryPage ? '1400px' : '72rem',
              margin: '0 auto',
              padding: isCategoryPage ? '4px' : '16px 24px 24px 24px'
            }}
          >
            {children}
          </main>
          <FooterGate>
            <Footer />
          </FooterGate>
        </Providers>
      </div>
    );
  }

  // النسخة الكاملة للديسكتوب واللابتوب
  return (
    <div style={{ 
      backgroundColor: '#f8f8f7', 
      minHeight: '100vh',
      paddingTop: '72px',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 1
    }}>
      <Providers>
        <UserHeader />
        <main style={{
          flex: 1,
          padding: isCategoryPage ? '0 8px' : '16px 24px',
          maxWidth: isCategoryPage ? '1400px' : '72rem',
          margin: '0 auto',
          width: '100%'
        }}>
          {children}
        </main>
        <FooterGate>
          <Footer />
        </FooterGate>
      </Providers>
    </div>
  );
}

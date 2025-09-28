"use client";

import Footer from "@/components/Footer";
import FooterGate from "@/components/layout/FooterGate";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import LightHeader from "@/components/layout/LightHeader";
import DesktopCategoryBar from "@/components/navigation/DesktopCategoryBar";
import { Providers } from "../../app/providers";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/stores/userStore";

// CSS ضروري للتنسيق
import "../../app/globals.css";
import "../../styles/news-card-desktop.css";
import "../../styles/muqtarab-cards.css";
import "../../styles/responsive-ui.css";
import "../../styles/compact-stats.css";
import "../../styles/enhanced-mobile-stats.css";
import "../../styles/unified-mobile-news.css";
import "../../styles/smart-content-cards.css";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user } = useUserStore();
  
  const isUserAuthPage = pathname === "/login" || pathname === "/register";
  const isCategoryPage = pathname?.startsWith("/categories/") || pathname?.startsWith("/news/category/");
  const isExperimentalArticle = pathname?.startsWith("/news/");
  const useLightHeader = pathname?.includes("/light") || pathname?.includes("/lite");

  // فحص بسيط للجهاز
  useEffect(() => {
    setMounted(true);
    
    // فحص واحد فقط
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkDevice();
    
    // استخدام ResizeObserver بدلاً من addEventListener للأداء الأفضل
    const resizeObserver = new ResizeObserver(() => {
      checkDevice();
    });
    
    resizeObserver.observe(document.body);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  // تطبيق خلفية بسيط ومحسن
  useEffect(() => {
    document.documentElement.style.backgroundColor = '#f8f8f7';
    document.body.style.backgroundColor = '#f8f8f7';
  }, []);

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

  return (
    <div style={{ backgroundColor: '#f8f8f7', minHeight: '100vh' }}>
      <Providers>
        {/* الهيدر + إزاحة المحتوى حسب نوع الجهاز */}
        {isMobile ? (
          <div style={{ paddingTop: 'calc(var(--light-header-height, 56px) + env(safe-area-inset-top, 0px))' }}>
            {useLightHeader ? (
              <LightHeader />
            ) : (
              <UnifiedHeader />
            )}
            {/* المحتوى الرئيسي للموبايل مع الإزاحة الصحيحة */}
            <main style={{
              maxWidth: isExperimentalArticle ? '100%' : (isCategoryPage ? '1400px' : '72rem'),
              margin: '0 auto',
              padding: isExperimentalArticle ? '0' : (isCategoryPage ? '4px' : '16px 24px 24px 24px'),
              minHeight: 'calc(100vh - 200px)'
            }}>
              {children}
            </main>
          </div>
        ) : (
          <>
            <div style={{ paddingTop: '72px', position: 'relative' }}>
              {useLightHeader ? (
                <LightHeader />
              ) : (
                <UnifiedHeader />
              )}
            </div>
            {/* شريط التصنيفات أسفل الهيدر - ديسكتوب فقط */}
            {!useLightHeader && (
              <div className="hidden md:block">
                <DesktopCategoryBar />
              </div>
            )}
            {/* المحتوى الرئيسي للديسكتوب */}
            <main style={{
              maxWidth: isExperimentalArticle ? '100%' : (isCategoryPage ? '1400px' : '72rem'),
              margin: '0 auto',
              padding: isExperimentalArticle ? '0' : (isCategoryPage ? '0 8px' : '16px 24px'),
              minHeight: 'calc(100vh - 200px)',
              paddingTop: '16px'
            }}>
              {children}
            </main>
          </>
        )}
        
        {/* فوتر واحد فقط */}
        <FooterGate>
          <Footer />
        </FooterGate>
      </Providers>
    </div>
  );
}

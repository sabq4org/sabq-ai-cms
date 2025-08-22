"use client";

import ResponsiveLayout from "@/components/responsive/ResponsiveLayout";
import Footer from "@/components/Footer";
import FooterGate from "@/components/layout/FooterGate";
import { Providers } from "../../app/providers";
import { useEffect } from "react";

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

  return (
    <div style={{ backgroundColor: '#f8f8f7', minHeight: '100vh' }}>
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
    </div>
  );
}

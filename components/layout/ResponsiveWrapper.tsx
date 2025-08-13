"use client";

import React, { useEffect, useState } from "react";
import ImprovedMobileLayout from "../mobile/ImprovedMobileLayout";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export default function ResponsiveWrapper({
  children,
  showHeader = true,
  showFooter = false,
}: ResponsiveWrapperProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkDevice();
    window.addEventListener("resize", checkDevice);
    
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // تجنب مشاكل SSR
  if (!mounted) {
    return <div className="min-h-screen">{children}</div>;
  }

  // استخدام التصميم المحسن للموبايل
  if (isMobile) {
    return (
      <ImprovedMobileLayout
        showHeader={showHeader}
        showFooter={showFooter}
      >
        {children}
      </ImprovedMobileLayout>
    );
  }

  // التصميم العادي للديسكتوب
  return <div className="min-h-screen">{children}</div>;
}

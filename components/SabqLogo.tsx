"use client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useThemeContext } from "@/contexts/ThemeContext";

interface SabqLogoProps {
  className?: string;
  width?: number;
  height?: number;
  isWhite?: boolean;
}

export default function SabqLogo({
  className,
  width = 120,
  height = 40,
  isWhite = false,
}: SabqLogoProps) {
  const [imageError, setImageError] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { logoUrl, logoDarkUrl } = useSiteSettings();
  const { theme } = useThemeContext();

  // مراقبة تغيير الوضع الليلي بشكل ديناميكي
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    // مراقبة التغييرات في class الـ html
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // استخدام الشعار من الإعدادات أو الافتراضي أو من الثيم
  const themedLogo = theme?.logo_url || null;
  const baseLogo = (isDarkMode && logoDarkUrl ? logoDarkUrl : logoUrl) || "/logo.png";
  const src = imageError ? "/logo.png" : (themedLogo || baseLogo);

  // شعار نصي احتياطي
  if (imageError) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span
          className={`text-2xl font-bold ${
            isWhite
              ? "text-white"
              : "text-gray-900 dark:text-gray-100"
          }`}
        >
          سبق
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className || ""}`} style={className ? {} : { width, height }}>
      <Image
        src={src}
        alt="شعار صحيفة سبق"
        width={width}
        height={height}
        sizes={`${width}px`}
        className={`${className || "object-contain"} ${isWhite ? "brightness-0 invert" : ""} ${isDarkMode && !logoDarkUrl && !isWhite ? "dark:invert dark:brightness-0" : ""}`}
        priority={false}
        loading="lazy"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

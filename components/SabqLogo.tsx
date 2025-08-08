"use client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Image from "next/image";
import { useState } from "react";

interface SabqLogoProps {
  className?: string;
  width?: number;
  height?: number;
  isWhite?: boolean;
}

export default function SabqLogo({
  className = "",
  width = 120,
  height = 40,
  isWhite = false,
}: SabqLogoProps) {
  const [imageError, setImageError] = useState(false);
  const { logoUrl } = useSiteSettings();

  // التحقق من الوضع الليلي
  const isDarkMode =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");

  // استخدام الشعار من الإعدادات أو الافتراضي
  const src = imageError ? "/logo.png" : logoUrl || "/logo.png";

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
              : isDarkMode
              ? "text-gray-100"
              : "text-gray-900"
          }`}
        >
          سبق
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={src}
        alt="سبق"
        width={width}
        height={height}
        className="object-contain"
        priority
        unoptimized={src.startsWith("http")} // للروابط الخارجية
        onError={() => setImageError(true)}
      />
    </div>
  );
}

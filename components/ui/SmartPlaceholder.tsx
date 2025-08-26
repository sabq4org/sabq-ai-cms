"use client";

import Image from "next/image";
import React from "react";

interface SmartPlaceholderProps {
  darkMode?: boolean;
  type?: "article" | "featured" | "default";
  className?: string;
  priority?: boolean;
}

export default function SmartPlaceholder({ 
  darkMode = false, 
  type = "article", 
  className = "",
  priority = false 
}: SmartPlaceholderProps) {
  const getPlaceholderSrc = () => {
    if (type === "article" || type === "featured") {
      return darkMode 
        ? "/images/news-placeholder-dark.svg" 
        : "/images/news-placeholder-lite.svg";
    }
    return "/images/placeholder-featured.jpg";
  };

  return (
    <Image
      src={getPlaceholderSrc()}
      alt="صورة غير متاحة"
      fill
      className={`object-cover ${className}`}
      priority={priority}
      unoptimized
    />
  );
}

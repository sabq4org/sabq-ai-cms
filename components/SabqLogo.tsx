import React from 'react';

interface SabqLogoProps {
  className?: string;
  width?: number;
  height?: number;
  isWhite?: boolean;
}

export default function SabqLogo({ className = "", width = 80, height = 32, isWhite = false }: SabqLogoProps) {
  // التحقق من الوضع الليلي
  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 80 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* النص العربي "سبق" - أولاً ليكون في الجهة اليمنى */}
      <text 
        x="78" 
        y="22" 
        fontFamily="Arial, sans-serif" 
        fontSize="20" 
        fontWeight="bold" 
        fill={isWhite ? "#FFFFFF" : (isDarkMode ? "#E5E7EB" : "#1F2937")}
        textAnchor="end"
        className="select-none"
      >
        سبق
      </text>
      
      {/* الأعمدة - تصميم عصري في الجهة اليسرى */}
      <g transform="translate(2, 4)">
        {/* العمود الأول */}
        <rect x="0" y="10" width="4" height="14" rx="2" fill={isDarkMode ? "#60A5FA" : "#3B82F6"} opacity="0.6"/>
        
        {/* العمود الثاني */}
        <rect x="6" y="6" width="4" height="18" rx="2" fill={isDarkMode ? "#60A5FA" : "#3B82F6"} opacity="0.7"/>
        
        {/* العمود الثالث */}
        <rect x="12" y="2" width="4" height="22" rx="2" fill={isDarkMode ? "#60A5FA" : "#3B82F6"} opacity="0.85"/>
        
        {/* العمود الرابع - الأطول */}
        <rect x="18" y="0" width="4" height="24" rx="2" fill={isDarkMode ? "#60A5FA" : "#3B82F6"}/>
        
        {/* نقطة زخرفية */}
        <circle cx="26" cy="12" r="2" fill={isDarkMode ? "#60A5FA" : "#3B82F6"}/>
      </g>
    </svg>
  );
} 
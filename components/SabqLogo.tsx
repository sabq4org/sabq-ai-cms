import React from 'react';

interface SabqLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function SabqLogo({ className = "", width = 140, height = 50 }: SabqLogoProps) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 140 50" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* الخلفية */}
      <rect width="140" height="50" rx="0" fill="transparent"/>
      
      {/* الأعمدة - تصميم يشبه الشعار الأصلي */}
      {/* العمود الأول - رمادي */}
      <path d="M10 15 L10 25 L18 25 L18 15 Z" fill="#9CA3AF"/>
      <path d="M10 28 L10 38 L18 38 L18 28 Z" fill="#3B82F6"/>
      
      {/* العمود الثاني - أزرق */}
      <path d="M22 10 L22 20 L30 20 L30 10 Z" fill="#9CA3AF"/>
      <path d="M22 23 L22 38 L30 38 L30 23 Z" fill="#60A5FA"/>
      
      {/* العمود الثالث - أزرق داكن */}
      <path d="M34 18 L34 38 L42 38 L42 18 Z" fill="#3B82F6"/>
      
      {/* العمود الرابع - أزرق فاتح */}
      <path d="M46 15 L46 38 L54 38 L54 15 Z" fill="#60A5FA"/>
      
      {/* العمود الخامس - أزرق */}
      <path d="M58 5 L58 38 L66 38 L66 5 Z" fill="#3B82F6"/>
      
      {/* النص العربي "سبق" */}
      <text 
        x="75" 
        y="28" 
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif" 
        fontSize="20" 
        fontWeight="700" 
        fill="#1F2937"
      >
        سبق
      </text>
      
      {/* النص الإنجليزي */}
      <text 
        x="75" 
        y="38" 
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif" 
        fontSize="10" 
        fontWeight="400" 
        fill="#6B7280"
        letterSpacing="1"
      >
        SABQ
      </text>
      
      {/* النص الوصفي بالعربية */}
      <text 
        x="105" 
        y="38" 
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif" 
        fontSize="8" 
        fill="#9CA3AF"
        textAnchor="end"
      >
        صحيفة سبق الإلكترونية
      </text>
    </svg>
  );
} 
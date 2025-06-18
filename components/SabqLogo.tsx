import React from 'react';

interface SabqLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function SabqLogo({ className = "", width = 100, height = 36 }: SabqLogoProps) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 100 36" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* خلفية بيضاء للوضوح */}
      <rect width="100" height="36" rx="8" fill="white"/>
      
      {/* الأعمدة - تصميم عصري */}
      <g transform="translate(8, 6)">
        {/* العمود الأول */}
        <rect x="0" y="8" width="6" height="6" rx="1" fill="#94A3B8"/>
        <rect x="0" y="16" width="6" height="8" rx="1" fill="#3B82F6"/>
        
        {/* العمود الثاني */}
        <rect x="8" y="4" width="6" height="6" rx="1" fill="#94A3B8"/>
        <rect x="8" y="12" width="6" height="12" rx="1" fill="#60A5FA"/>
        
        {/* العمود الثالث */}
        <rect x="16" y="10" width="6" height="14" rx="1" fill="#3B82F6"/>
        
        {/* العمود الرابع */}
        <rect x="24" y="8" width="6" height="16" rx="1" fill="#60A5FA"/>
        
        {/* العمود الخامس */}
        <rect x="32" y="0" width="6" height="24" rx="1" fill="#3B82F6"/>
      </g>
      
      {/* النص العربي "سبق" */}
      <text 
        x="52" 
        y="24" 
        fontFamily="Arial, sans-serif" 
        fontSize="20" 
        fontWeight="bold" 
        fill="#1F2937"
      >
        سبق
      </text>
    </svg>
  );
} 
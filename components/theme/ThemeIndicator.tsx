'use client';

import React from 'react';
import { useCurrentTheme } from '@/contexts/ThemeManagerContext';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeIndicatorProps {
  className?: string;
}

export default function ThemeIndicator({ className = '' }: ThemeIndicatorProps) {
  const { scheme, colors } = useCurrentTheme();
  const { resolvedTheme } = useTheme();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* مؤشر الثيم الحالي */}
      <div className="flex items-center gap-1">
        <div 
          className="w-3 h-3 rounded-full border border-gray-300"
          style={{ backgroundColor: colors.primary }}
          title={`الثيم: ${scheme.displayName}`}
        />
        <div 
          className="w-3 h-3 rounded-full border border-gray-300"
          style={{ backgroundColor: colors.secondary }}
        />
        <div 
          className="w-3 h-3 rounded-full border border-gray-300"
          style={{ backgroundColor: colors.accent }}
        />
      </div>
      
      {/* مؤشر الوضع */}
      <div className="text-xs text-gray-500 font-medium">
        {resolvedTheme === 'dark' ? '🌙' : '☀️'}
      </div>
    </div>
  );
}

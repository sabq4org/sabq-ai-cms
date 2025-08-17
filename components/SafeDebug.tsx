'use client';

import React, { useEffect, useState } from 'react';

interface SafeDebugProps {
  name: string;
  data?: any;
  showInProduction?: boolean;
}

export default function SafeDebug({ 
  name, 
  data = {}, 
  showInProduction = false 
}: SafeDebugProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // لا تعرض في الإنتاج إلا إذا كان مسموحاً
  if (!showInProduction && process.env.NODE_ENV === 'production') {
    return null;
  }

  // لا تعرض حتى يتم التحميل في العميل
  if (!isClient) {
    return null;
  }

  try {
    console.log(`[SafeDebug] ${name}:`, data);
  } catch (error) {
    console.error(`[SafeDebug] Error in ${name}:`, error);
  }

  return null;
}

// Hook للتصحيح الآمن
export function useSafeDebug(name: string) {
  return (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log(`[${name}] ${message}`, data || '');
      } catch (error) {
        console.error(`[${name}] Debug error:`, error);
      }
    }
  };
} 
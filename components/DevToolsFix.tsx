'use client';

import { useEffect } from 'react';
import { NextDevToolsFix } from '@/lib/fixes/NextDevToolsFix';

const DevToolsFix: React.FC = () => {
  useEffect(() => {
    // تطبيق الإصلاح فور تحميل المكون
    const fix = NextDevToolsFix.getInstance();
    
    // في وضع التطوير، عرض معلومات الإصلاح
    if (process.env.NODE_ENV === 'development') {
      const status = fix.getStatus();
      console.log('🔧 DevTools Fix Status:', status);
      
      // إضافة واجهة للتحكم في DevTools
      (window as any).devToolsFix = {
        enable: NextDevToolsFix.enableDevTools,
        disable: () => fix.getStatus(),
        status: () => fix.getStatus()
      };
    }
  }, []);

  return null; // هذا المكون لا يعرض أي شيء
};

export default DevToolsFix;
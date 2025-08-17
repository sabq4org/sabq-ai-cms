'use client';

import { useEffect } from 'react';
import { ReactServerComponentsFix } from '@/lib/fixes/ReactServerComponentsFix';

const ReactServerComponentsFixComponent: React.FC = () => {
  useEffect(() => {
    // تطبيق الإصلاح فور تحميل المكون
    const fix = ReactServerComponentsFix.getInstance();
    
    // في وضع التطوير، عرض معلومات الإصلاح
    if (process.env.NODE_ENV === 'development') {
      const status = fix.getStatus();
      console.log('🔧 React Server Components Fix Status:', status);
      
      // إضافة واجهة للتحكم
      (window as any).rscFix = {
        reset: () => fix.reset(),
        status: () => fix.getStatus()
      };
    }
  }, []);

  return null; // هذا المكون لا يعرض أي شيء
};

export default ReactServerComponentsFixComponent;
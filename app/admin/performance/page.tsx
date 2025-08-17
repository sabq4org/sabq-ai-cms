/**
 * إعادة توجيه لصفحة تحسين الأداء
 * Performance Optimization Page Redirect
 */

import { redirect } from 'next/navigation';

export default function PerformancePage() {
  // إعادة توجيه إلى صفحة تحسين الأداء الموجودة
  redirect('/admin/performance-optimization');
}

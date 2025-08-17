/**
 * صفحة التحليلات - المسار القديم
 * Analytics Page - Legacy Route
 */

import { redirect } from 'next/navigation';

export default function AnalyticsPage() {
  // إعادة توجيه إلى الصفحة الحديثة
  redirect('/admin/modern/analytics');
}

/**
 * صفحة لوحة التحكم الرئيسية
 * Main Admin Dashboard Redirect
 */

import { redirect } from 'next/navigation';

export default function AdminDashboard() {
  // إعادة توجيه إلى لوحة التحكم الحديثة
  redirect('/admin/modern');
}

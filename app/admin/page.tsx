/**
 * صفحة لوحة التحكم الرئيسية
 * Main Admin Dashboard Redirect
 */

import { redirect } from 'next/navigation';

export default function AdminDashboard() {
  // إذا لا يوجد جلسة سيُعاد توجيهه من middleware إلى /admin/login
  redirect('/admin/modern');
}

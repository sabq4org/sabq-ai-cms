/**
 * صفحة لوحة التحكم الرئيسية
 * Main Admin Dashboard Redirect
 * 
 * ملاحظة: هذه الصفحة تعيد التوجيه مباشرة إلى /admin/modern
 * بدون التحقق من المصادقة لتجنب حلقة إعادة التوجيه اللانهائية.
 * التحقق من المصادقة يتم في /admin/modern نفسه.
 */

import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  // إعادة توجيه مباشرة إلى /admin/modern
  // التحقق من المصادقة يتم في /admin/modern
  redirect("/admin/modern");
}


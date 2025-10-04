/**
 * صفحة لوحة التحكم الرئيسية
 * Main Admin Dashboard Redirect
 */

import { redirect } from "next/navigation";
import { cookies } from 'next/headers';
import { getAuthenticatedUser } from '@/lib/getAuthenticatedUser';

export default async function AdminDashboard() {
  // تحقّق خادمي سريع قبل إعادة التوجيه
  const cookieStore = await cookies();
  const token = cookieStore.get('__Host-sabq-access-token')?.value
    || cookieStore.get('sabq-access-token')?.value
    || cookieStore.get('sabq_at')?.value
    || cookieStore.get('auth-token')?.value
    || cookieStore.get('access_token')?.value;
  if (!token) {
    redirect(`/admin/login?next=${encodeURIComponent('/admin')}`);
  }
  const mockReq = { headers: new Headers({ 'Authorization': `Bearer ${token}` }), cookies: cookieStore } as any;
  const auth = await getAuthenticatedUser(mockReq);
  if (auth.reason !== 'ok' || !auth.user) {
    redirect(`/admin/login?next=${encodeURIComponent('/admin')}`);
  }
  const user = auth.user as any;
  const isAdmin = user.is_admin === true || ['admin','system_admin','editor','author'].includes(user.role);
  if (!isAdmin) {
    redirect(`/admin/login?denied=1&next=${encodeURIComponent('/admin')}`);
  }
  redirect("/admin/modern");
}

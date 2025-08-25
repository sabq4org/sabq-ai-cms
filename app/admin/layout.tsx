import { ReactNode } from 'react';

// تعطيل static rendering لجميع صفحات الـ admin
export const dynamic = 'force-dynamic';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}

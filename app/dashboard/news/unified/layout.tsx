import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إنشاء خبر جديد - لوحة التحكم',
  description: 'إنشاء وتحرير الأخبار في منصة سبق الذكية',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: 'no',
  themeColor: '#1a202c',
};

export default function UnifiedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
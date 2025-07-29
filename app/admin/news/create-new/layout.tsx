import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إنشاء خبر جديد - لوحة الإدارة',
  description: 'إنشاء خبر جديد في منصة سبق الذكية',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: 'no',
  themeColor: '#1a202c',
};

export default function CreateNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
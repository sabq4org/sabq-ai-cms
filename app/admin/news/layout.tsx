import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إدارة الأخبار - لوحة الإدارة',
  description: 'إدارة وتحرير الأخبار في منصة سبق الذكية',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: 'no',
  themeColor: '#1a202c',
};

export default function AdminNewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
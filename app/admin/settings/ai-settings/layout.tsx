import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إعدادات الذكاء الاصطناعي - لوحة الإدارة',
  description: 'تكوين وإدارة إعدادات أنظمة الذكاء الاصطناعي',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: 'no',
  themeColor: '#1a202c',
};

export default function AISettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
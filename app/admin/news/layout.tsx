import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إدارة الأخبار - لوحة الإدارة',
  description: 'منصة متكاملة لإدارة ونشر المحتوى الإخباري مع أدوات تحليل الأداء وتتبع التفاعل',
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
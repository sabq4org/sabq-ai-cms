/**
 * صفحة إدارة الأخبار في لوحة الإدارة
 */

import React from 'react';
import NewsPage from '@/app/dashboard/news/page';

export default function AdminNewsPage() {
  return <NewsPage />;
}

export const metadata = {
  title: 'إدارة الأخبار - لوحة الإدارة',
  description: 'منصة متكاملة لإدارة ونشر المحتوى الإخباري مع أدوات تحليل الأداء وتتبع التفاعل'
};

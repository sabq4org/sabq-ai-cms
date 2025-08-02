/**
 * صفحة أخبار واس في لوحة الإدارة
 */

import React from 'react';
import WasNewsPage from '@/app/dashboard/was-news/page';

export default function AdminWasNewsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">أخبار واس</h1>
        <p className="text-gray-600 dark:text-gray-400">إدارة أخبار وكالة الأنباء السعودية</p>
      </div>
      <WasNewsPage />
    </div>
  );
}

export const metadata = {
  title: 'أخبار واس - لوحة الإدارة',
  description: 'إدارة أخبار وكالة الأنباء السعودية'
};

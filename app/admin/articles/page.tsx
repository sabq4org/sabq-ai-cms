/**
 * صفحة إدارة المقالات مع تحسين الأداء
 */

import React from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import ArticleList from '@/components/admin/articles/ArticleList';

export default function AdminArticlesPage() {
  return (
    <DashboardLayout
      pageTitle="إدارة المقالات"
      pageDescription="إدارة ونشر المقالات والمحتوى"
    >
      <ArticleList
        searchable={true}
        filterable={true}
        showActions={true}
        pageSize={10}
      />
    </DashboardLayout>
  );
}

export const metadata = {
  title: 'إدارة المقالات - لوحة الإدارة',
  description: 'إدارة ونشر المقالات والمحتوى'
};

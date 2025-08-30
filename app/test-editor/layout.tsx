/**
 * صفحة اختبار شاملة للمحرر المتقدم مع ميزات الصور والإيموجي
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'اختبار المحرر المتقدم | سبق الإخباري',
  description: 'صفحة لاختبار ميزات المحرر المتقدم مع رفع الصور والإيموجي',
}

export default function EditorTestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-4">
        {children}
      </div>
    </div>
  )
}

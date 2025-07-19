'use client';

import SimpleDashboardLayout from '@/components/layout/SimpleDashboardLayout';

export default function TestLayoutPage() {
  return (
    <SimpleDashboardLayout pageName="اختبار التخطيط">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">اختبار SimpleDashboardLayout</h1>
        <p>إذا كنت ترى هذا النص، فإن SimpleDashboardLayout يعمل بشكل صحيح.</p>
        <div className="mt-4 p-4 bg-green-100 rounded">
          <p>✅ التخطيط يعمل بنجاح!</p>
        </div>
      </div>
    </SimpleDashboardLayout>
  );
}
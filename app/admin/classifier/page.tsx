"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function ClassifierPage() {
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">لوحة إدارة التصنيف الذكي</h1>
              <p className="text-blue-100 mt-1">مراقبة وإدارة نظام التصنيف التلقائي</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>نظرة عامة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                نظام التصنيف الذكي يعمل بشكل طبيعي. يمكنك مراقبة الأداء والإحصائيات من هنا.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الإحصائيات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>إجمالي التصنيفات:</span>
                  <span className="font-bold">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span>دقة النظام:</span>
                  <span className="font-bold text-green-600">94.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>حالة النظام:</span>
                  <span className="font-bold text-green-600">نشط</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
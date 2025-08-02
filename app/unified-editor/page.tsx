/**
 * صفحة المحرر الذكي الموحد
 * Unified Smart Editor Page
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Brain,
    Camera,
    CheckCircle,
    FileText,
    Sparkles,
    Users
} from 'lucide-react';
import React, { useState } from 'react';
import SafeUnifiedSmartEditor from '../../components/Editor/UnifiedSmartEditor';

const UnifiedEditorPage: React.FC = () => {
  const [savedData, setSavedData] = useState<any>(null);

  const handleSave = async (content: any, metadata: any) => {
    console.log('Saving content:', content);
    console.log('Article metadata:', metadata);
    setSavedData({ content, metadata });
    return Promise.resolve();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* الهيدر */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl font-bold">المحرر الذكي الموحد</h1>
          <p className="text-xl text-gray-600">
            كل الميزات في صفحة واحدة - بدون تبويبات
          </p>

          {/* عرض الميزات */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Badge variant="secondary" className="text-sm py-2 px-4">
              <FileText className="w-4 h-4 ml-1" />
              العناوين والملخص
            </Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">
              <Users className="w-4 h-4 ml-1" />
              إدارة المراسلين
            </Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">
              <Brain className="w-4 h-4 ml-1" />
              الموجز الذكي
            </Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">
              <Camera className="w-4 h-4 ml-1" />
              رفع الصور
            </Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">
              <Sparkles className="w-4 h-4 ml-1" />
              توليد بالذكاء الاصطناعي
            </Badge>
          </div>
        </div>

        {/* المحرر */}
        <Card className="shadow-xl">
          <CardContent className="p-6">
            <SafeUnifiedSmartEditor
              initialContent=""
              onSave={handleSave}
              readOnly={false}
            />
          </CardContent>
        </Card>

        {/* عرض البيانات المحفوظة للاختبار */}
        {savedData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                البيانات المحفوظة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">معلومات المقال</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>العنوان:</strong> {savedData.metadata.title || 'غير محدد'}</p>
                    <p><strong>العنوان الفرعي:</strong> {savedData.metadata.subtitle || 'غير محدد'}</p>
                    <p><strong>الملخص:</strong> {savedData.metadata.summary || 'غير محدد'}</p>
                    <p><strong>التصنيف:</strong> {savedData.metadata.category || 'غير محدد'}</p>
                    <p><strong>الكلمات المفتاحية:</strong> {savedData.metadata.tags.join(', ') || 'لا توجد'}</p>
                    <p><strong>عدد الكلمات:</strong> {savedData.metadata.wordCount}</p>
                    <p><strong>وقت القراءة:</strong> {savedData.metadata.readingTime} دقيقة</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">معلومات إضافية</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>المراسل:</strong> {savedData.metadata.reporter?.name || 'غير محدد'}</p>
                    {savedData.metadata.reporter && (
                      <>
                        <p><strong>بريد المراسل:</strong> {savedData.metadata.reporter.email}</p>
                        <p><strong>موقع المراسل:</strong> {savedData.metadata.reporter.location}</p>
                      </>
                    )}
                    <p><strong>موقع الحدث:</strong> {savedData.metadata.location || 'غير محدد'}</p>
                    <p><strong>الأولوية:</strong> {savedData.metadata.priority}</p>
                    <p><strong>الحالة:</strong> {savedData.metadata.status}</p>
                    <p><strong>عدد الصور:</strong> {savedData.metadata.images.length}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">محتوى المقال (JSON)</h3>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-xs">
                  {JSON.stringify(savedData.content, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UnifiedEditorPage;

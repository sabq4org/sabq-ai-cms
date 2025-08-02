/**
 * صفحة عرض المحرر الذكي بجميع الميزات
 * Smart Editor Demo Page with All Features
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertCircle,
    Brain,
    Camera,
    CheckCircle,
    FileText,
    Sparkles,
    Star,
    Users
} from 'lucide-react';
import React, { useState } from 'react';
import SafeSimpleAdvancedEditor from '../../components/Editor/SimpleAdvancedEditor';

const features = [
  {
    id: 'subtitle',
    title: 'العنوان الفرعي',
    description: 'إدارة كاملة للعناوين الرئيسية والفرعية',
    icon: <FileText className="w-5 h-5" />,
    status: 'complete',
    color: 'text-blue-600'
  },
  {
    id: 'reporters',
    title: 'المراسلين',
    description: 'نظام شامل لإدارة واختيار المراسلين مع معلومات كاملة',
    icon: <Users className="w-5 h-5" />,
    status: 'complete',
    color: 'text-purple-600'
  },
  {
    id: 'smart-summary',
    title: 'الموجز الذكي',
    description: 'تحليل ذكي للمحتوى مع اقتراحات وإحصائيات',
    icon: <Brain className="w-5 h-5" />,
    status: 'complete',
    color: 'text-green-600'
  },
  {
    id: 'image-upload',
    title: 'رفع الصورة',
    description: 'رفع وإدارة الصور المتعددة مع معاينة',
    icon: <Camera className="w-5 h-5" />,
    status: 'complete',
    color: 'text-orange-600'
  },
  {
    id: 'ai-generation',
    title: 'التوليد الذكي',
    description: 'أدوات ذكاء اصطناعي شاملة لتوليد المحتوى',
    icon: <Sparkles className="w-5 h-5" />,
    status: 'complete',
    color: 'text-pink-600'
  }
];

const SmartEditorDemoPage: React.FC = () => {
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState<any>(null);

  const handleSave = async (editorContent: any, articleMetadata: any) => {
    console.log('Saving content:', editorContent);
    console.log('Article metadata:', articleMetadata);
    setContent(JSON.stringify(editorContent, null, 2));
    setMetadata(articleMetadata);
    return Promise.resolve();
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* رأس الصفحة */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          المحرر الذكي الشامل
        </h1>
        <p className="text-xl text-gray-600">
          محرر متطور بخمس ميزات متقدمة لتجربة كتابة استثنائية
        </p>
      </div>

      {/* عرض الميزات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            الميزات المتوفرة
          </CardTitle>
          <CardDescription>
            جميع الميزات المطلوبة متوفرة وتعمل بكامل طاقتها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="flex items-start gap-3 p-4 border rounded-lg bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-shadow"
              >
                <div className={`p-2 rounded-lg bg-white shadow-sm ${feature.color}`}>
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{feature.title}</h3>
                    <Badge variant="default" className="bg-green-500 text-xs">
                      <CheckCircle className="w-3 h-3 ml-1" />
                      متوفر
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* تعليمات الاستخدام */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>كيفية استخدام المحرر:</strong>
          <ul className="mt-2 mr-6 space-y-1 list-disc">
            <li>انقر على تبويب "البيانات" لإدارة العنوان الرئيسي والفرعي</li>
            <li>انقر على تبويب "المراسلين" لاختيار أو إضافة مراسل</li>
            <li>انقر على تبويب "الموجز الذكي" لتوليد ملخص ذكي للمحتوى</li>
            <li>استخدم زر "رفع صورة" في شريط الأدوات لإضافة الصور</li>
            <li>انقر على تبويب "الذكاء الاصطناعي" لتوليد محتوى بالذكاء الاصطناعي</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* المحرر الذكي */}
      <Card className="shadow-xl">
        <CardContent className="p-0">
          <SafeSimpleAdvancedEditor
            documentId="demo-doc-1"
            currentUser={{
              id: 'user-1',
              name: 'محمد أحمد',
              email: 'mohammed@example.com',
              color: '#3B82F6',
              role: 'محرر'
            }}
            initialContent=""
            onSave={handleSave}
            enableAI={true}
            readOnly={false}
          />
        </CardContent>
      </Card>

      {/* عرض البيانات المحفوظة */}
      {metadata && (
        <Card>
          <CardHeader>
            <CardTitle>البيانات المحفوظة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">معلومات المقال:</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>العنوان:</strong> {metadata.title || 'غير محدد'}</p>
                  <p><strong>العنوان الفرعي:</strong> {metadata.subtitle || 'غير محدد'}</p>
                  <p><strong>الملخص:</strong> {metadata.summary || 'غير محدد'}</p>
                  <p><strong>التصنيف:</strong> {metadata.category || 'غير محدد'}</p>
                  <p><strong>الحالة:</strong> {metadata.status || 'مسودة'}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">معلومات إضافية:</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>المراسل:</strong> {metadata.reporter?.name || 'غير محدد'}</p>
                  <p><strong>الموقع:</strong> {metadata.location || 'غير محدد'}</p>
                  <p><strong>عدد الصور:</strong> {metadata.images?.length || 0}</p>
                  <p><strong>الكلمات المفتاحية:</strong> {metadata.tags?.join(', ') || 'لا توجد'}</p>
                  <p><strong>الأولوية:</strong> {metadata.priority || 'عادي'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartEditorDemoPage;

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// تحميل المحرر الذكي ديناميكياً
const TiptapEditorWithSmartLinks = dynamic(
  () => import('@/components/Editor/TiptapEditorWithSmartLinks'), 
  { 
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-96 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">تحميل المحرر الذكي...</div>
      </div>
    )
  }
);

export default function TestSmartEditorPage() {
  const [content, setContent] = useState(`
    <h2>مرحباً بك في المحرر الذكي لـ سبق</h2>
    
    <p>هذا اختبار لنظام الروابط الذكية. سيقوم النظام بتحليل النص التالي وإيجاد كيانات قابلة للربط:</p>
    
    <p>أعلن ولي العهد السعودي الأمير محمد بن سلمان عن إطلاق مشروع نيوم الجديد في منطقة تبوك، والذي يأتي ضمن رؤية السعودية 2030 لتنويع الاقتصاد وتقليل الاعتماد على النفط. المشروع الذي يقع في شمال غرب المملكة سيضم مدينة ذا لاين المستقبلية.</p>
    
    <p>من جانب آخر، أعلن وزير المالية محمد الجدعان أن الناتج المحلي الإجمالي للمملكة سجل نمواً قوياً خلال الربع الثالث من العام. وأشار إلى أن صندوق الاستثمارات العامة يواصل استثماراته في مشروع القدية وشركة أرامكو السعودية.</p>
    
    <p>كما زار الملك سلمان مدينة الرياض وجدة لافتتاح عدة مشاريع تنموية جديدة ضمن إطار التنمية المستدامة.</p>
  `);

  const [showAnalytics, setShowAnalytics] = useState(false);

  const handleContentChange = (html: string, json: any) => {
    setContent(html);
    console.log('محتوى محدث:', { html, json });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* العنوان */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🧠 اختبار المحرر الذكي
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            محرر متطور مع نظام الروابط الذكية باستخدام الذكاء الاصطناعي
          </p>
        </div>

        {/* شريط المعلومات */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">11</div>
              <div className="text-sm text-gray-600">كيانات متاحة</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">2</div>
              <div className="text-sm text-gray-600">مصطلحات</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">6</div>
              <div className="text-sm text-gray-600">أنواع كيانات</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">AI</div>
              <div className="text-sm text-gray-600">مدعوم بالذكاء الاصطناعي</div>
            </CardContent>
          </Card>
        </div>

        {/* أنواع الكيانات المدعومة */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>أنواع الكيانات المدعومة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                👤 شخصيات (3)
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                🏢 مؤسسات (3)
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                🏗️ مشاريع (3)
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                📍 مواقع (2)
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                📅 أحداث (0)
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                📖 مصطلحات (2)
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* التحكم في المحرر */}
        <div className="mb-4 flex gap-4">
          <Button
            variant="outline"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            {showAnalytics ? 'إخفاء' : 'عرض'} التحليلات
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(content);
              alert('تم نسخ المحتوى!');
            }}
          >
            📋 نسخ المحتوى
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              console.log('Current content:', content);
              alert('تحقق من console للمحتوى الكامل');
            }}
          >
            🔍 فحص المحتوى
          </Button>
        </div>

        {/* المحرر الذكي */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1">
          <TiptapEditorWithSmartLinks
            content={content}
            onChange={handleContentChange}
            placeholder="اكتب هنا لاختبار الروابط الذكية..."
            showSmartLinksPanel={true}
            autoAnalyze={true}
            debounceDelay={3000}
          />
        </div>

        {/* التحليلات */}
        {showAnalytics && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>📊 تحليلات المحتوى</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">إحصائيات النص</h4>
                  <ul className="text-sm space-y-1">
                    <li>عدد الكلمات: {content.replace(/<[^>]*>/g, '').split(' ').length}</li>
                    <li>عدد الأحرف: {content.replace(/<[^>]*>/g, '').length}</li>
                    <li>عدد الفقرات: {(content.match(/<p>/g) || []).length}</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">آخر تحديث</h4>
                  <p className="text-sm text-gray-600">
                    {new Date().toLocaleString('ar-SA')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* تعليمات الاستخدام */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📋 تعليمات الاستخدام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">1.</span>
                <div>
                  <strong>الكتابة:</strong> اكتب أو عدّل النص في المحرر. سيتم تحليل النص تلقائياً بعد 3 ثوانٍ من التوقف.
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">2.</span>
                <div>
                  <strong>التحليل:</strong> استخدم زر "تحليل النص" في اللوحة الجانبية لتحليل فوري.
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">3.</span>
                <div>
                  <strong>تطبيق الروابط:</strong> اضغط "تطبيق" لإضافة رابط ذكي أو "رفض" لتجاهله.
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">4.</span>
                <div>
                  <strong>التفاعل:</strong> انقر على الروابط الذكية في النص للحصول على معلومات إضافية.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
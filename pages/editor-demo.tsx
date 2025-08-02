/**
 * صفحة تجريب المحرر الذكي الشامل
 * Smart Editor Demo Page
 */

'use client';

import SimpleAdvancedEditor from '@/components/Editor/SimpleAdvancedEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Brain, FileText, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function EditorDemoPage() {
  const [content, setContent] = useState('');

  const mockUser = {
    id: '1',
    name: 'محرر الأخبار',
    email: 'editor@sabq.com',
    color: '#3B82F6'
  };

  const handleSave = async (content: string) => {
    console.log('حفظ المحتوى:', content);
    // هنا يمكن إضافة منطق الحفظ الحقيقي
    return Promise.resolve();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* الهيدر */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 ml-1" />
                  العودة للرئيسية
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">المحرر الذكي الشامل</h1>
                <p className="text-gray-600 mt-1">محرر متقدم مع ذكاء اصطناعي وجميع الميزات المطلوبة</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500">
                المستخدم: {mockUser.name}
              </div>
            </div>
          </div>
        </div>

        {/* شريط الميزات */}
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="flex items-center gap-3 text-green-700">
                <FileText className="w-6 h-6" />
                <div>
                  <div className="font-semibold">العنوان الفرعي ✓</div>
                  <div className="text-sm">إدارة العناوين الفرعية</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-blue-700">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold">👥</div>
                <div>
                  <div className="font-semibold">المراسلين ✓</div>
                  <div className="text-sm">إدارة وتحديد المراسلين</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-purple-700">
                <Brain className="w-6 h-6" />
                <div>
                  <div className="font-semibold">الموجز الذكي ✓</div>
                  <div className="text-sm">تحليل وتلخيص المحتوى</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-orange-700">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold">📷</div>
                <div>
                  <div className="font-semibold">رفع الصور ✓</div>
                  <div className="text-sm">إدارة الصور والوسائط</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-indigo-700">
                <Sparkles className="w-6 h-6" />
                <div>
                  <div className="font-semibold">التوليد الذكي ✓</div>
                  <div className="text-sm">إنشاء المحتوى بالذكاء الاصطناعي</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* المحرر الذكي */}
        <SimpleAdvancedEditor
          documentId="demo-article-1"
          currentUser={mockUser}
          initialContent={content}
          onSave={(content, metadata) => {
            console.log('حفظ المحتوى:', content);
            console.log('البيانات الوصفية:', metadata);
            return Promise.resolve();
          }}
          className="bg-white rounded-lg shadow-lg"
          enableAI={true}
        />

        {/* معلومات إضافية */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              الميزات المتاحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🎯 إدارة البيانات الوصفية</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• العنوان الرئيسي والفرعي</li>
                  <li>• الملخص والوصف</li>
                  <li>• الموقع والتصنيف</li>
                  <li>• الكلمات المفتاحية</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">👥 نظام المراسلين</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• قائمة المراسلين المعتمدين</li>
                  <li>• معلومات الاتصال الكاملة</li>
                  <li>• تقييمات الأداء</li>
                  <li>• إضافة مراسلين جدد</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🧠 الذكاء الاصطناعي</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• توليد المحتوى التلقائي</li>
                  <li>• الموجز الذكي</li>
                  <li>• اقتراح العناوين</li>
                  <li>• التدقيق النحوي</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">📊 التحليلات المتقدمة</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• إحصائيات المحتوى</li>
                  <li>• مؤشر جودة المحتوى</li>
                  <li>• وقت القراءة المتوقع</li>
                  <li>• تحليل المشاعر</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">🖼️ إدارة الوسائط</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• رفع الصور المتعددة</li>
                  <li>• معاينة فورية</li>
                  <li>• إدارة المعرض</li>
                  <li>• ضغط تلقائي</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">⚙️ إعدادات النشر</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• مستويات الأولوية</li>
                  <li>• حالة المقال</li>
                  <li>• جدولة النشر</li>
                  <li>• إعدادات SEO</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

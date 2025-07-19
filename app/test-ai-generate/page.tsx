'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wand2 } from 'lucide-react';

export default function TestAIGeneratePage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const testAPI = async () => {
    if (!content.trim() || content.trim().length < 50) {
      setError('يرجى إدخال محتوى لا يقل عن 50 حرف');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('🔥 اختبار API:', '/api/news/ai-generate');
      
      const response = await fetch('/api/news/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      console.log('📡 استجابة الخادم:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ خطأ في الاستجابة:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      console.log('✅ النتيجة:', data);
      setResult(data);

    } catch (error) {
      console.error('❌ خطأ في الطلب:', error);
      setError(error instanceof Error ? error.message : 'خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🧪 اختبار API التوليد التلقائي</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الإدخال */}
        <Card>
          <CardHeader>
            <CardTitle>المحتوى المدخل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب محتوى الخبر هنا... (50 حرف على الأقل)"
              rows={8}
              className="w-full"
            />
            
            <div className="flex justify-between text-sm text-gray-500">
              <span>عدد الأحرف: {content.length}</span>
              <span className={content.length >= 50 ? 'text-green-600' : 'text-red-600'}>
                {content.length >= 50 ? '✅ جاهز' : '❌ يحتاج 50 حرف على الأقل'}
              </span>
            </div>

            <Button
              onClick={testAPI}
              disabled={loading || content.trim().length < 50}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  جاري التوليد...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  🤖 توليد تلقائي
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* النتائج */}
        <Card>
          <CardHeader>
            <CardTitle>النتائج</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  ❌ {error}
                </AlertDescription>
              </Alert>
            )}

            {result && (
              <div className="space-y-4">
                {result.demo_mode && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertDescription className="text-yellow-800">
                      ⚠️ وضع تجريبي - النتائج مولدة محلياً
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-green-700">📰 العنوان الرئيسي:</h4>
                    <p className="bg-green-50 p-3 rounded-lg">{result.title}</p>
                  </div>

                  {result.subtitle && (
                    <div>
                      <h4 className="font-semibold text-blue-700">📝 العنوان الفرعي:</h4>
                      <p className="bg-blue-50 p-3 rounded-lg">{result.subtitle}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-purple-700">📄 الموجز:</h4>
                    <p className="bg-purple-50 p-3 rounded-lg">{result.summary}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-orange-700">🏷️ الكلمات المفتاحية:</h4>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      {result.keywords?.map((keyword: string, index: number) => (
                        <span
                          key={index}
                          className="inline-block bg-orange-200 text-orange-800 px-2 py-1 rounded-full text-sm mr-2 mb-1"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {result.metadata && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-semibold mb-2">📊 معلومات إضافية:</h4>
                      <p><strong>النموذج:</strong> {result.metadata.model}</p>
                      <p><strong>تم التوليد:</strong> {new Date(result.metadata.generatedAt).toLocaleString('ar-SA')}</p>
                      {result.metadata.tokensUsed && (
                        <p><strong>Tokens المستخدمة:</strong> {result.metadata.tokensUsed}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!result && !error && !loading && (
              <div className="text-center text-gray-500 py-8">
                اكتب محتوى واضغط "توليد تلقائي" لرؤية النتائج
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* محتوى تجريبي */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📝 محتوى تجريبي للاختبار</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setContent('أعلنت وزارة التعليم السعودية اليوم عن إطلاق برنامج جديد لتطوير التعليم الرقمي في جميع مدارس المملكة العربية السعودية. يهدف البرنامج إلى تحسين جودة التعليم وتعزيز استخدام التقنيات الحديثة في العملية التعليمية، مع التركيز على تطوير مهارات الطلاب في التقنيات المتقدمة. وسيستفيد من البرنامج أكثر من مليون طالب وطالبة في جميع أنحاء المملكة، كما سيتم تدريب 50 ألف معلم ومعلمة على استخدام هذه التقنيات الجديدة في التدريس.')}
            variant="outline"
            className="mr-2"
          >
            استخدم محتوى تجريبي - تعليم
          </Button>
          
          <Button
            onClick={() => setContent('أعلنت وزارة الصحة السعودية عن تسجيل انخفاض كبير في معدلات الإصابة بالأمراض المزمنة في المملكة خلال العام الماضي. وأشارت الإحصائيات الرسمية إلى أن معدلات الإصابة بأمراض القلب انخفضت بنسبة 15% مقارنة بالعام السابق، فيما انخفضت معدلات الإصابة بمرض السكري بنسبة 12%. وأرجعت الوزارة هذا التحسن إلى البرامج الوقائية والحملات التوعوية التي نفذتها في جميع مناطق المملكة.')}
            variant="outline"
          >
            استخدم محتوى تجريبي - صحة
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 
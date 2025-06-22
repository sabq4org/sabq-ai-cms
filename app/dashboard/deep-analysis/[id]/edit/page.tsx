'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save,
  Send,
  Loader2,
  AlertCircle,
  RefreshCw,
  Brain
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const Editor = dynamic(() => import('@/components/Editor/Editor'), { ssr: false });

interface DeepAnalysis {
  id: string;
  title: string;
  summary: string;
  content: string;
  status: 'published' | 'draft' | 'editing' | 'analyzing';
  source: 'manual' | 'gpt' | 'hybrid';
  categories: string[];
  articleId?: string;
  analysisMetadata?: {
    angle: string;
    depthLevel: number;
  };
}

// بيانات تجريبية
const mockAnalysis: DeepAnalysis = {
  id: '1',
  title: 'تحليل تأثير الذكاء الاصطناعي على سوق العمل السعودي',
  summary: 'دراسة معمقة حول كيفية تأثير تقنيات الذكاء الاصطناعي على فرص العمل والمهارات المطلوبة في السوق السعودي.',
  content: `<h2>المقدمة</h2><p>يشهد العالم ثورة تقنية غير مسبوقة...</p>`,
  status: 'published',
  source: 'gpt',
  categories: ['تقنية', 'اقتصاد'],
  articleId: 'article-123',
  analysisMetadata: {
    angle: 'economic',
    depthLevel: 4
  }
};

export default function EditDeepAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [analysis, setAnalysis] = useState<DeepAnalysis | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    categories: [] as string[],
    content: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // في الإنتاج، سيتم جلب البيانات من API
    // fetchAnalysis();
    setAnalysis(mockAnalysis);
    setFormData({
      title: mockAnalysis.title,
      summary: mockAnalysis.summary,
      categories: mockAnalysis.categories,
      content: mockAnalysis.content
    });
    setLoading(false);
  }, [params.id]);

  const handleCategoryToggle = (category: string) => {
    if (formData.categories.includes(category)) {
      setFormData({
        ...formData,
        categories: formData.categories.filter(c => c !== category)
      });
    } else {
      setFormData({
        ...formData,
        categories: [...formData.categories, category]
      });
    }
  };

  const handleRegenerate = async () => {
    if (!analysis || analysis.source !== 'gpt') return;

    setRegenerating(true);
    try {
      const response = await fetch('/api/ai/deep-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          articleId: analysis.articleId,
          analysisAngle: analysis.analysisMetadata?.angle || 'general',
          depthLevel: analysis.analysisMetadata?.depthLevel || 3,
          categories: formData.categories
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          ...formData,
          content: data.content,
          summary: data.summary || formData.summary
        });
      }
    } catch (error) {
      console.error('خطأ في إعادة توليد التحليل:', error);
      setErrors({ general: 'حدث خطأ في إعادة توليد التحليل' });
    } finally {
      setRegenerating(false);
    }
  };

  const handleSubmit = async (publish = false) => {
    // التحقق من المدخلات
    const newErrors: Record<string, string> = {};
    
    if (!formData.title) newErrors.title = 'العنوان مطلوب';
    if (!formData.content) newErrors.content = 'المحتوى مطلوب';
    if (formData.categories.length === 0) newErrors.categories = 'اختر تصنيف واحد على الأقل';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      // في الإنتاج، سيتم إرسال البيانات إلى API
      // const response = await fetch(`/api/deep-analysis/${params.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...formData,
      //     status: publish ? 'published' : analysis?.status
      //   })
      // });

      // محاكاة النجاح
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push(`/dashboard/deep-analysis/${params.id}`);
    } catch (error) {
      console.error('خطأ في حفظ التحليل:', error);
      setErrors({ general: 'حدث خطأ في حفظ التحليل' });
    } finally {
      setSaving(false);
    }
  };

  const categories = ['سياسة', 'اقتصاد', 'تقنية', 'رياضة', 'ثقافة', 'صحة', 'بيئة', 'مجتمع'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل التحليل...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">التحليل غير موجود</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            رجوع
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              تحرير التحليل
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              قم بتحديث وتحسين التحليل العميق
            </p>
          </div>
        </div>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="text-red-700 dark:text-red-300">{errors.general}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* معلومات أساسية */}
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  عنوان التحليل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    setErrors({ ...errors, title: '' });
                  }}
                  className={cn(
                    "w-full px-4 py-2 border rounded-lg",
                    "bg-white dark:bg-gray-800 dark:border-gray-700",
                    errors.title && "border-red-500"
                  )}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  الملخص
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  التصنيفات <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={formData.categories.includes(category) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleCategoryToggle(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
                {errors.categories && (
                  <p className="text-red-500 text-sm mt-1">{errors.categories}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* محرر المحتوى */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>محتوى التحليل</CardTitle>
              {analysis.source === 'gpt' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="flex items-center gap-2"
                >
                  {regenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري إعادة التوليد...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      إعادة توليد بالذكاء الاصطناعي
                    </>
                  )}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] border rounded-lg p-4 bg-white dark:bg-gray-800">
                <Editor
                  content={formData.content}
                  onChange={(content) => {
                    setFormData({ ...formData, content });
                    setErrors({ ...errors, content: '' });
                  }}
                />
              </div>
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* الشريط الجانبي */}
        <div className="space-y-6">
          {/* معلومات التحليل */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات التحليل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">المصدر:</span>
                  <Badge variant="outline">
                    {analysis.source === 'manual' && 'يدوي'}
                    {analysis.source === 'gpt' && 'ذكاء اصطناعي'}
                    {analysis.source === 'hybrid' && 'مزيج'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">الحالة:</span>
                  <Badge variant={analysis.status === 'published' ? 'default' : 'secondary'}>
                    {analysis.status === 'published' && 'منشور'}
                    {analysis.status === 'draft' && 'مسودة'}
                    {analysis.status === 'editing' && 'تحت التحرير'}
                    {analysis.status === 'analyzing' && 'قيد التحليل'}
                  </Badge>
                </div>
                {analysis.analysisMetadata && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">زاوية التحليل:</span>
                      <span className="font-medium">
                        {analysis.analysisMetadata.angle === 'economic' && 'اقتصادي'}
                        {analysis.analysisMetadata.angle === 'social' && 'اجتماعي'}
                        {analysis.analysisMetadata.angle === 'political' && 'سياسي'}
                        {analysis.analysisMetadata.angle === 'environmental' && 'بيئي'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">مستوى العمق:</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-4 h-1 rounded",
                              i < analysis.analysisMetadata!.depthLevel
                                ? "bg-blue-500"
                                : "bg-gray-200 dark:bg-gray-700"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* إجراءات الحفظ */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات الحفظ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleSubmit(false)}
                disabled={saving || regenerating}
                variant="outline"
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التغييرات
                  </>
                )}
              </Button>
              
              {analysis.status !== 'published' && (
                <Button
                  onClick={() => handleSubmit(true)}
                  disabled={saving || regenerating}
                  className="w-full"
                >
                  <Send className="w-4 h-4 ml-2" />
                  حفظ ونشر
                </Button>
              )}
            </CardContent>
          </Card>

          {/* نصائح التحرير */}
          <Card>
            <CardHeader>
              <CardTitle>نصائح التحرير</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>تأكد من وضوح العنوان ودقته</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>راجع المحتوى للتأكد من الدقة والشمولية</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>أضف المصادر والمراجع إن وجدت</span>
                </li>
                {analysis.source === 'gpt' && (
                  <li className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-purple-500 mt-0.5" />
                    <span>يمكنك إعادة توليد المحتوى بالذكاء الاصطناعي</span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
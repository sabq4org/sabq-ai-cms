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
  Brain,
  X
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { DeepAnalysis } from '@/types/deep-analysis';
import toast from 'react-hot-toast';

const Editor = dynamic(() => import('@/components/Editor/Editor'), { ssr: false });

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
    tags: [] as string[],
    content: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    fetchAnalysis();
  }, [params.id]);

  const fetchAnalysis = async () => {
    try {
      const response = await fetch(`/api/deep-analyses/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch analysis');
      
      const data: DeepAnalysis = await response.json();
      setAnalysis(data);
      
      // استخدام rawContent إذا كان موجوداً، أو تحويل الأقسام إلى HTML
      let content = data.rawContent;
      
      if (!content && data.content && data.content.sections) {
        // تحويل الأقسام إلى HTML منسق
        content = formatSectionsToHTML(data.content);
      }
      
      setFormData({
        title: data.title,
        summary: data.summary,
        categories: data.categories,
        tags: data.tags || [],
        content: content || ''
      });
    } catch (error) {
      console.error('Error fetching analysis:', error);
      toast.error('فشل في تحميل التحليل');
    } finally {
      setLoading(false);
    }
  };

  // دالة تحويل الأقسام إلى HTML
  const formatSectionsToHTML = (content: any): string => {
    const parts: string[] = [];

    // الفهرس
    if (content.tableOfContents?.length) {
      parts.push('<h2>الفهرس</h2>');
      parts.push('<ul>');
      content.tableOfContents.forEach((item: string) => {
        parts.push(`<li>${item}</li>`);
      });
      parts.push('</ul>');
    }

    // الأقسام
    if (content.sections?.length) {
      content.sections.forEach((section: any) => {
        if (section.title) {
          parts.push(`<h2>${section.title}</h2>`);
        }
        if (section.content) {
          // تقسيم المحتوى إلى فقرات
          const paragraphs = section.content.split('\n\n').filter((p: string) => p.trim());
          paragraphs.forEach((p: string) => {
            if (p.trim().startsWith('- ') || p.trim().startsWith('• ')) {
              // قائمة
              const items = p.split('\n').filter((item: string) => item.trim());
              parts.push('<ul>');
              items.forEach((item: string) => {
                parts.push(`<li>${item.replace(/^[-•]\s*/, '')}</li>`);
              });
              parts.push('</ul>');
            } else {
              parts.push(`<p>${p}</p>`);
            }
          });
        }
        if (section.points?.length) {
          parts.push('<ul>');
          section.points.forEach((point: string) => {
            parts.push(`<li>${point}</li>`);
          });
          parts.push('</ul>');
        }
      });
    }

    // الرؤى
    if (content.keyInsights?.length) {
      parts.push('<h2>أبرز الرؤى</h2>');
      parts.push('<ul>');
      content.keyInsights.forEach((insight: string) => {
        parts.push(`<li>${insight}</li>`);
      });
      parts.push('</ul>');
    }

    // التوصيات
    if (content.recommendations?.length) {
      parts.push('<h2>التوصيات</h2>');
      parts.push('<ul>');
      content.recommendations.forEach((rec: string) => {
        parts.push(`<li>${rec}</li>`);
      });
      parts.push('</ul>');
    }

    return parts.join('\n');
  };

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
    if (!analysis || analysis.sourceType !== 'gpt') return;

    setRegenerating(true);
    try {
      // الحصول على مفتاح OpenAI من localStorage
      const openaiApiKey = localStorage.getItem('openai_api_key');
      
      const response = await fetch('/api/deep-analyses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          sourceType: 'topic',
          topic: formData.title,
          category: formData.categories[0],
          openaiApiKey
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // استخدام المحتوى المنسق مباشرة من الاستجابة
        setFormData({
          ...formData,
          content: data.content, // هذا الآن HTML منسق جاهز للمحرر
          summary: data.summary || formData.summary
        });
        
        toast.success('تم إعادة توليد المحتوى بنجاح');
      } else {
        const error = await response.json();
        toast.error(error.error || 'فشل في إعادة توليد المحتوى');
      }
    } catch (error) {
      console.error('خطأ في إعادة توليد التحليل:', error);
      toast.error('حدث خطأ في إعادة توليد التحليل');
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
      const response = await fetch(`/api/deep-analyses/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: publish ? 'published' : analysis?.status
        })
      });

      if (response.ok) {
        toast.success(publish ? 'تم نشر التحليل بنجاح' : 'تم حفظ التغييرات بنجاح');
        router.push(`/dashboard/deep-analysis`);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('خطأ في حفظ التحليل:', error);
      toast.error('حدث خطأ في حفظ التحليل');
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
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryToggle(category)}
                      className="focus:outline-none"
                    >
                      <Badge
                        variant={formData.categories.includes(category) ? "default" : "outline"}
                        className="cursor-pointer"
                      >
                        {category}
                      </Badge>
                    </button>
                  ))}
                </div>
                {errors.categories && (
                  <p className="text-red-500 text-sm mt-1">{errors.categories}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  الوسوم
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (currentTag && !formData.tags.includes(currentTag)) {
                            setFormData({
                              ...formData,
                              tags: [...formData.tags, currentTag]
                            });
                            setCurrentTag('');
                          }
                        }
                      }}
                      placeholder="أدخل وسم واضغط Enter"
                      className="flex-1 px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (currentTag && !formData.tags.includes(currentTag)) {
                          setFormData({
                            ...formData,
                            tags: [...formData.tags, currentTag]
                          });
                          setCurrentTag('');
                        }
                      }}
                    >
                      إضافة
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            tags: formData.tags.filter(t => t !== tag)
                          })}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* محرر المحتوى */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>محتوى التحليل</CardTitle>
              {(analysis.sourceType === 'gpt' || analysis.sourceType === 'hybrid') && (
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
                    // حفظ HTML المنسق
                    const htmlContent = typeof content === 'string' ? content : content.html;
                    setFormData({ ...formData, content: htmlContent });
                    setErrors({ ...errors, content: '' });
                  }}
                  autoSaveKey={`deep-analysis-draft-${params.id}`}
                  autoSaveInterval={15000} // حفظ كل 15 ثانية
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
                    {analysis.sourceType === 'manual' && 'يدوي'}
                    {analysis.sourceType === 'gpt' && 'ذكاء اصطناعي'}
                    {analysis.sourceType === 'hybrid' && 'مزيج'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">الحالة:</span>
                  <Badge variant={analysis.status === 'published' ? 'default' : 'secondary'}>
                    {analysis.status === 'published' && 'منشور'}
                    {analysis.status === 'draft' && 'مسودة'}
                    {analysis.status === 'archived' && 'مؤرشف'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">المشاهدات:</span>
                  <span className="font-medium">{analysis.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">جودة المحتوى:</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-4 h-1 rounded",
                          i < Math.round(analysis.qualityScore * 5)
                            ? "bg-blue-500"
                            : "bg-gray-200 dark:bg-gray-700"
                        )}
                      />
                    ))}
                  </div>
                </div>
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
                {(analysis.sourceType === 'gpt' || analysis.sourceType === 'hybrid') && (
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
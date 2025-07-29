'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { Badge } from '@/components/ui/badge';
import Editor from '@/components/Editor/Editor';
import FeaturedImageUpload from '@/components/FeaturedImageUpload';
import { toast } from 'react-hot-toast';
import { ArrowRight, Save, Sparkles, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface DeepAnalysis {
  id: string;
  ai_summary: string;
  key_topics: string[];
  tags: string[];
  sentiment: string;
  engagement_score: number;
  metadata: {
    title: string;
    summary: string;
    content?: string;
    authorName: string;
    categories: string[];
    sourceType: string;
    status: string;
    qualityScore: number;
    featuredImage?: string;
  };
}

export default function EditDeepAnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { theme: darkMode } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState<DeepAnalysis | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [sourceType, setSourceType] = useState('original');
  const [sentiment, setSentiment] = useState('neutral');
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [qualityScore, setQualityScore] = useState(85);

  // Fetch analysis data
  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!params?.id) return;
      
      try {
        const response = await fetch(`/api/deep-analyses/${params.id}`);
        if (!response.ok) throw new Error('فشل جلب البيانات');
        
        const data = await response.json();
        // Handle both wrapped and direct response
        const analysisData = data.analysis || data;
        
        if (analysisData && analysisData.id) {
          setAnalysis(analysisData);
          
          // Set form values
          setTitle(analysisData.metadata?.title || '');
          setSummary(analysisData.metadata?.summary || analysisData.ai_summary || '');
          setContent(analysisData.metadata?.content || '');
          setAuthorName(analysisData.metadata?.authorName || '');
          setSourceType(analysisData.metadata?.sourceType || 'original');
          setSentiment(analysisData.sentiment || 'neutral');
          setCategories(analysisData.metadata?.categories || []);
          setTags(analysisData.tags || []);
          setImagePreview(analysisData.metadata?.featuredImage || '/images/deep-analysis-default.svg');
          setQualityScore(analysisData.metadata?.qualityScore || analysisData.engagement_score || 85);
        } else {
          throw new Error('بيانات التحليل غير صحيحة');
        }
      } catch (error) {
        console.error('Error fetching analysis:', error);
        toast.error('فشل في جلب بيانات التحليل');
        router.push('/dashboard/deep-analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [params?.id, router]);

  const handleSave = async () => {
    if (!title || !summary) {
      toast.error('يرجى ملء العنوان والملخص على الأقل');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/deep-analyses/${params?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_summary: summary,
          key_topics: tags,
          tags: tags,
          sentiment: sentiment,
          engagement_score: qualityScore,
          metadata: {
            ...analysis?.metadata,
            title,
            summary,
            content,
            authorName,
            categories,
            sourceType,
            qualityScore,
            featuredImage: imagePreview,
            lastEditedBy: user?.email,
            lastEditedAt: new Date().toISOString()
          }
        })
      });

      if (!response.ok) throw new Error('فشل حفظ التحليل');
      
      toast.success('تم حفظ التحليل بنجاح');
      router.push('/dashboard/deep-analysis');
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast.error('فشل في حفظ التحليل');
    } finally {
      setSaving(false);
    }
  };

  const generateAISummary = async () => {
    if (!content && !title) {
      toast.error('يرجى إضافة محتوى أو عنوان أولاً');
      return;
    }

    const loadingToast = toast.loading('جارٍ توليد الملخص...');
    try {
      const response = await fetch('/api/deep-analyses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content || title,
          type: 'summary'
        })
      });

      const data = await response.json();
      toast.dismiss(loadingToast);
      
      if (response.ok && data.result) {
        setSummary(data.result);
        toast.success('تم توليد الملخص بنجاح');
      } else {
        toast.error(data.error || 'فشل توليد الملخص');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('حدث خطأ أثناء توليد الملخص');
    }
  };

  const generateKeywords = async () => {
    if (!content && !summary) {
      toast.error('يرجى كتابة المحتوى أو الملخص أولاً');
      return;
    }

    const loadingToast = toast.loading('جارٍ توليد الكلمات المفتاحية...');
    try {
      const response = await fetch('/api/ai/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: content || summary,
          title: title || '',
          categoryId: categories[0] || ''
        })
      });

      const data = await response.json();
      toast.dismiss(loadingToast);
      
      if (response.ok && data.keywords) {
        const keywords = data.keywords
          .split(/[,،]/)
          .map((k: string) => k.trim())
          .filter((k: string) => k.length > 0)
          .slice(0, 8);
        setTags(keywords);
        toast.success(`تم توليد ${keywords.length} كلمة مفتاحية`);
      } else {
        toast.error(data.error || 'فشل توليد الكلمات المفتاحية');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('حدث خطأ أثناء توليد الكلمات المفتاحية');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}>
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}>
        <p>التحليل غير موجود</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 ${
      darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">تعديل التحليل العميق</h1>
          <Button
            onClick={() => router.push('/dashboard/deep-analysis')}
            variant="outline"
            size="sm"
          >
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للقائمة
          </Button>
        </div>

        {/* Main Form */}
        <div className="grid gap-6">
          {/* Title and Basic Info */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">العنوان *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="عنوان التحليل"
                  className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
                />
              </div>

              <div>
                <Label htmlFor="authorName">الكاتب</Label>
                <Input
                  id="authorName"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="اسم الكاتب"
                  className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sourceType">نوع المصدر</Label>
                  <select
                    id="sourceType"
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 text-sm ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="original">محتوى أصلي</option>
                    <option value="article">من مقال</option>
                    <option value="gpt">بالذكاء الاصطناعي</option>
                    <option value="mixed">مختلط</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="sentiment">التحليل العاطفي</Label>
                  <select
                    id="sentiment"
                    value={sentiment}
                    onChange={(e) => setSentiment(e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 text-sm ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="positive">إيجابي</option>
                    <option value="neutral">محايد</option>
                    <option value="negative">سلبي</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle>الملخص</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="summary">ملخص التحليل *</Label>
                  <Button
                    onClick={generateAISummary}
                    variant="outline"
                    size="sm"
                    disabled={!content && !title}
                  >
                    <Sparkles className="h-4 w-4 ml-2" />
                    توليد بالذكاء الاصطناعي
                  </Button>
                </div>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="ملخص التحليل العميق"
                  rows={4}
                  className={darkMode ? 'bg-gray-700 border-gray-600' : ''}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle>المحتوى التفصيلي</CardTitle>
            </CardHeader>
            <CardContent>
              <Editor
                content={content}
                onChange={setContent}
                placeholder="اكتب المحتوى التفصيلي للتحليل هنا..."
              />
            </CardContent>
          </Card>

          {/* Image */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle>الصورة البارزة</CardTitle>
            </CardHeader>
            <CardContent>
              <FeaturedImageUpload
                value={imagePreview}
                onChange={setImagePreview}
                darkMode={darkMode === 'dark'}
              />
            </CardContent>
          </Card>

          {/* Keywords */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle>الكلمات المفتاحية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={generateKeywords}
                  variant="outline"
                  className="w-full"
                  disabled={!content && !summary}
                >
                  <Sparkles className="w-4 h-4 ml-2" />
                  توليد كلمات مفتاحية من المحتوى
                </Button>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {tag}
                        <button
                          onClick={() => setTags(tags.filter(t => t !== tag))}
                          className="mr-2 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quality Score */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardHeader>
              <CardTitle>جودة التحليل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>نقاط الجودة: {qualityScore}%</Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={qualityScore}
                  onChange={(e) => setQualityScore(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/deep-analysis')}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !title || !summary}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جارٍ الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 
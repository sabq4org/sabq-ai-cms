'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  Link2,
  Brain,
  Layers,
  Save,
  Send,
  Loader2,
  X,
  Plus,
  Tag,
  ChevronDown,
  ChevronUp,
  Settings,
  PenTool,
  BookOpen,
  Zap,
  Activity,
  FileCheck,
  RefreshCw,
  CheckCircle,
  Eye,
  Edit,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateAnalysisRequest, SourceType, CreationType, DisplayPosition } from '@/types/deep-analysis';
import toast from 'react-hot-toast';

const CreateDeepAnalysisPage = () => {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // حقول النموذج
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [sourceType, setSourceType] = useState<SourceType>('manual');
  const [creationType, setCreationType] = useState<CreationType>('new');
  const [externalLink, setExternalLink] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [gptPrompt, setGptPrompt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayPosition, setDisplayPosition] = useState<DisplayPosition>('middle');
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const mainCategories = [
    'الاقتصاد', 'التقنية', 'رؤية 2030', 'الأمن السيبراني', 
    'التعليم', 'الصحة', 'البيئة', 'السياسة', 'الرياضة', 
    'الثقافة', 'السياحة', 'الطاقة'
  ];

  // استرجاع حالة الوضع الليلي من localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // جلب المقالات
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles?status=published&limit=10&sort=published_at&order=desc');
      const data = await response.json();
      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  // إضافة تصنيف
  const addCategory = () => {
    if (currentCategory && !categories.includes(currentCategory)) {
      setCategories([...categories, currentCategory]);
      setCurrentCategory('');
    }
  };

  // إضافة وسم
  const addTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag]);
      setCurrentTag('');
    }
  };

  // معالجة رفع الصورة
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('حجم الملف يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('الرجاء اختيار ملف صورة صالح');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // رفع الصورة
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('فشل رفع الصورة');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('حدث خطأ أثناء رفع الصورة');
      return null;
    }
  };

  // توليد المحتوى بالذكاء الاصطناعي
  const generateWithGPT = async () => {
    if (!gptPrompt) {
      toast.error('يرجى كتابة وصف للمحتوى المطلوب');
      return;
    }

    setGenerating(true);
    try {
      // الحصول على مفتاح OpenAI من الإعدادات المحفوظة
      const savedAiSettings = localStorage.getItem('settings_ai');
      let openaiKey = '';
      
      if (savedAiSettings) {
        const aiSettings = JSON.parse(savedAiSettings);
        openaiKey = aiSettings.openaiKey;
      }
      
      if (!openaiKey) {
        toast.error('يرجى إضافة مفتاح OpenAI من إعدادات الذكاء الاصطناعي');
        setGenerating(false);
        return;
      }
      
      const response = await fetch('/api/deep-analyses/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: gptPrompt,
          sourceArticleId: selectedArticle?.id,
          categories,
          openaiKey, // إرسال المفتاح مع الطلب
          title: title || 'تحليل عميق',
          creationType: sourceType === 'article' ? 'from_article' : 'topic',
          articleUrl: selectedArticle?.id
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setTitle(data.title || 'تحليل عميق');
        setSummary(data.summary || '');
        // المحتوى الآن يأتي منسقاً من الخادم
        setContent(data.content || '');
        setTags(data.tags || []);
        
        // إضافة رسالة نجاح مع معلومات إضافية
        if (data.qualityScore) {
          toast.success(`تم توليد المحتوى بنجاح (جودة: ${data.qualityScore}%)`);
        } else {
          toast.success('تم توليد المحتوى بنجاح');
        }
      } else {
        toast.error(data.error || 'فشل توليد المحتوى');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('حدث خطأ أثناء توليد المحتوى');
    } finally {
      setGenerating(false);
    }
  };

  // حفظ التحليل
  const handleSubmit = async (status: 'draft' | 'published' = 'published') => {
    if (!title || !summary) {
      toast.error('يرجى ملء العنوان والملخص على الأقل');
      return;
    }

    setLoading(true);
    try {
      // رفع الصورة إذا كانت موجودة
      let uploadedImageUrl = featuredImage;
      if (imageFile) {
        uploadedImageUrl = await uploadImage();
      }
      // الحصول على مفتاح OpenAI من localStorage
      const openaiKey = localStorage.getItem('openai_api_key');
      
      // تحديد ما إذا كان يجب استخدام GPT
      const shouldUseGPT = (creationType === 'gpt' || creationType === 'mixed') && !content;
      
      const analysisData: CreateAnalysisRequest = {
        title,
        summary,
        content,
        sourceType,
        creationType,
        categories,
        tags,
        authorName,
        isActive,
        isFeatured,
        displayPosition,
        status: status === 'published' ? 'published' : 'draft',
        sourceArticleId: selectedArticle?.id,
        externalLink: sourceType === 'external' ? externalLink : undefined,
        generateWithGPT: shouldUseGPT,
        gptPrompt: shouldUseGPT ? (gptPrompt || title) : undefined,
        openaiApiKey: openaiKey || undefined,
        featuredImage: uploadedImageUrl
      };

      console.log('Submitting analysis with data:', {
        ...analysisData,
        openaiApiKey: analysisData.openaiApiKey ? 'PROVIDED' : 'NOT PROVIDED'
      });

      const response = await fetch('/api/deep-analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisData)
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(status === 'published' ? 'تم نشر التحليل بنجاح' : 'تم حفظ المسودة بنجاح');
        router.push('/dashboard/deep-analysis');
      } else {
        console.error('Error response:', data);
        toast.error(data.error || 'فشل حفظ التحليل');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('حدث خطأ أثناء حفظ التحليل');
    } finally {
      setLoading(false);
    }
  };

  // مكون بطاقة النوع
  const TypeCard = ({ 
    type, 
    title, 
    description, 
    icon: Icon, 
    isSelected, 
    onClick,
    color = 'blue'
  }: {
    type: string;
    title: string;
    description: string;
    icon: any;
    isSelected: boolean;
    onClick: () => void;
    color?: string;
  }) => (
    <button
      onClick={onClick}
      className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 text-right ${
        isSelected
          ? `bg-${color}-500 text-white shadow-md border-b-4 border-${color}-600`
          : darkMode
            ? 'text-gray-300 hover:bg-gray-700 border-gray-700 hover:border-gray-600'
            : 'text-gray-600 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isSelected
            ? 'bg-white/20'
            : darkMode
              ? 'bg-gray-700 text-gray-400'
              : 'bg-gray-100 text-gray-600'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">{title}</h3>
          <p className={`text-sm ${isSelected ? 'text-white/90' : ''}`}>{description}</p>
        </div>
      </div>
    </button>
  );

  return (
    <div className={`p-8 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : ''
    }`} dir="rtl">
      {/* عنوان وتعريف الصفحة */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>إنشاء تحليل عميق جديد</h1>
            <p className={`transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>أضف تحليلاً عميقاً جديداً بمحتوى غني ومفصل</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/deep-analysis')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Button>
        </div>
      </div>

      {/* قسم نظام التحليل العميق */}
      <div className="mb-8">
        <div className={`rounded-2xl p-6 border transition-colors duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-purple-700' 
            : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>نظام التحليل العميق المتقدم</h2>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>إنشاء محتوى تحليلي عميق بالذكاء الاصطناعي أو يدوياً</p>
            </div>
            <div className="mr-auto">
              <button
                onClick={fetchArticles}
                className={`p-2 rounded-lg shadow-sm transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <RefreshCw className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* أنواع الإنشاء */}
      <div className={`rounded-2xl p-6 shadow-sm border mb-8 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <Layers className="w-5 h-5 text-purple-600" />
          طريقة الإنشاء
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <TypeCard
            type="manual"
            title="يدوي"
            description="كتابة التحليل بشكل كامل يدوياً"
            icon={PenTool}
            isSelected={creationType === 'manual'}
            onClick={() => setCreationType('manual')}
            color="blue"
          />
          <TypeCard
            type="gpt"
            title="ذكاء اصطناعي"
            description="توليد التحليل بواسطة GPT-4"
            icon={Sparkles}
            isSelected={creationType === 'gpt'}
            onClick={() => setCreationType('gpt')}
            color="purple"
          />
          <TypeCard
            type="mixed"
            title="مختلط"
            description="دمج الكتابة اليدوية مع الذكاء الاصطناعي"
            icon={Zap}
            isSelected={creationType === 'mixed'}
            onClick={() => setCreationType('mixed')}
            color="orange"
          />
        </div>
      </div>

      {/* نوع المصدر */}
      <div className={`rounded-2xl p-6 shadow-sm border mb-8 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <FileText className="w-5 h-5 text-blue-600" />
          نوع المصدر
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <TypeCard
            type="original"
            title="محتوى أصلي"
            description="تحليل جديد تماماً بدون مصدر"
            icon={BookOpen}
            isSelected={sourceType === 'original'}
            onClick={() => setSourceType('original')}
            color="green"
          />
          <TypeCard
            type="article"
            title="من مقال"
            description="تحليل مبني على مقال موجود"
            icon={FileText}
            isSelected={sourceType === 'article'}
            onClick={() => setSourceType('article')}
            color="indigo"
          />
        </div>
      </div>

      {/* اختيار المقال */}
      {sourceType === 'article' && (
        <div className={`rounded-2xl p-6 shadow-sm border mb-8 transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <Label>اختر المقال المصدر</Label>
          <select
            value={selectedArticle?.id || ''}
            onChange={(e) => {
              const article = articles.find(a => a.id === e.target.value);
              setSelectedArticle(article);
            }}
            className={`w-full mt-2 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-300 ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                : 'bg-white border-gray-200 text-gray-800'
            }`}
          >
            <option value="">اختر مقالاً...</option>
            {articles.map((article) => (
              <option key={article.id} value={article.id}>
                {article.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* محتوى GPT */}
      {(creationType === 'gpt' || creationType === 'mixed') && (
        <div className={`rounded-2xl p-6 shadow-sm border mb-8 transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="space-y-4">
            <div>
              <Label>وصف المحتوى المطلوب من GPT</Label>
              <Textarea
                placeholder="اكتب وصفاً تفصيلياً للتحليل المطلوب..."
                value={gptPrompt}
                onChange={(e) => setGptPrompt(e.target.value)}
                rows={4}
                className={`mt-2 transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-200'
                }`}
              />
            </div>
            <Button
              onClick={generateWithGPT}
              disabled={generating || !gptPrompt}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جارٍ التوليد...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 ml-2" />
                  توليد بـ GPT
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* محتوى التحليل */}
      <div className={`rounded-2xl p-6 shadow-sm border mb-8 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          <FileCheck className="w-5 h-5 text-green-600" />
          محتوى التحليل
        </h3>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="title">عنوان التحليل *</Label>
            <Input
              id="title"
              placeholder="أدخل عنوان التحليل العميق..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`mt-2 transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-200'
              }`}
            />
          </div>

          <div>
            <Label htmlFor="summary">الملخص *</Label>
            <Textarea
              id="summary"
              placeholder="ملخص قصير للتحليل..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className={`mt-2 transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-white border-gray-200'
              }`}
            />
          </div>

          {/* صورة مميزة */}
          <div>
            <Label htmlFor="featuredImage">الصورة المميزة</Label>
            <div className={`mt-2 space-y-4`}>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="معاينة الصورة"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      setFeaturedImage(null);
                    }}
                    className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${
                  darkMode 
                    ? 'border-gray-600 hover:border-gray-500' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}>
                  <input
                    type="file"
                    id="featuredImage"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="featuredImage"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <Upload className={`w-8 h-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        اضغط لرفع صورة
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        PNG, JPG, GIF حتى 5 ميجابايت
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="content">المحتوى التفصيلي</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                {showPreview ? (
                  <>
                    <Edit className="w-4 h-4" />
                    تحرير
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    معاينة
                  </>
                )}
              </Button>
            </div>
            {showPreview ? (
              <div className={`mt-2 p-4 rounded-lg border min-h-[300px] overflow-auto transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="prose prose-lg max-w-none" dir="rtl">
                  {content.split('\n').map((line, index) => {
                    if (line.startsWith('## ')) {
                      return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(3)}</h2>;
                    } else if (line.startsWith('### ')) {
                      return <h3 key={index} className="text-lg font-semibold mt-3 mb-2">{line.substring(4)}</h3>;
                    } else if (line.startsWith('- ')) {
                      const text = line.substring(2);
                      const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      return (
                        <li key={index} className="mr-6 mb-1" 
                            dangerouslySetInnerHTML={{ __html: formattedText }} />
                      );
                    } else if (line.trim() === '') {
                      return <br key={index} />;
                    } else {
                      const formattedText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      return (
                        <p key={index} className="mb-2" 
                           dangerouslySetInnerHTML={{ __html: formattedText }} />
                      );
                    }
                  })}
                </div>
              </div>
            ) : (
              <Textarea
                id="content"
                placeholder="المحتوى الكامل للتحليل..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className={`mt-2 transition-colors duration-300 font-mono ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-200'
                }`}
              />
            )}
          </div>

          {/* التصنيفات */}
          <div>
            <Label>التصنيفات</Label>
            <div className="flex gap-2 mt-2">
              <select
                value={currentCategory}
                onChange={(e) => setCurrentCategory(e.target.value)}
                className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-200 text-gray-800'
                }`}
              >
                <option value="">اختر تصنيفاً...</option>
                {mainCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Button
                onClick={addCategory}
                disabled={!currentCategory}
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  variant="secondary"
                  className="px-3 py-1"
                >
                  {cat}
                  <button
                    onClick={() => setCategories(categories.filter(c => c !== cat))}
                    className="mr-2 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* الوسوم */}
          <div>
            <Label>الوسوم</Label>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="أضف وسماً..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className={`flex-1 transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-200'
                }`}
              />
              <Button
                onClick={addTag}
                disabled={!currentTag}
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="px-3 py-1"
                >
                  #{tag}
                  <button
                    onClick={() => setTags(tags.filter(t => t !== tag))}
                    className="mr-2 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* الإعدادات المتقدمة */}
      <div className={`rounded-2xl p-6 shadow-sm border mb-8 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-100'
      }`}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`w-full flex items-center justify-between text-lg font-bold transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}
        >
          <span className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-600" />
            الإعدادات المتقدمة
          </span>
          {showAdvanced ? <ChevronUp /> : <ChevronDown />}
        </button>

        {showAdvanced && (
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="author">اسم الكاتب</Label>
              <Input
                id="author"
                placeholder="اسم كاتب التحليل..."
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className={`mt-2 transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-200'
                }`}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                  نشط
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
                  مميز
                </span>
              </label>
            </div>

            <div>
              <Label>موضع العرض</Label>
              <select
                value={displayPosition}
                onChange={(e) => setDisplayPosition(e.target.value as DisplayPosition)}
                className={`w-full mt-2 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-200 text-gray-800'
                }`}
              >
                <option value="normal">عادي</option>
                <option value="featured">مميز</option>
                <option value="top">أعلى الصفحة</option>
                <option value="sidebar">الشريط الجانبي</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* أزرار الإجراءات */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/deep-analysis')}
          className={darkMode ? 'border-gray-600 hover:bg-gray-800' : ''}
        >
          إلغاء
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSubmit('draft')}
          disabled={loading}
          className={darkMode ? 'bg-gray-700 hover:bg-gray-600' : ''}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              جارٍ الحفظ...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 ml-2" />
              حفظ كمسودة
            </>
          )}
        </Button>
        <Button
          onClick={() => handleSubmit('published')}
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-sm hover:shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              جارٍ النشر...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 ml-2" />
              نشر التحليل
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CreateDeepAnalysisPage; 
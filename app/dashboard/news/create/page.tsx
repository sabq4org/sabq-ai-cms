'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, Eye, Send, AlertTriangle, Image, Video,
  Sparkles, Brain, Globe, Settings, Hash, FileText, CheckCircle,
  XCircle, Lightbulb, Target, RefreshCw, Upload,
  Wand2, PenTool, BarChart3, Rocket, ArrowLeft, Loader2, X, Plus,
  ImageIcon
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useDarkModeContext } from '@/contexts/DarkModeContext';

// Dynamic imports
const ContentEditorWithBlocks = dynamic(() => import('@/components/ContentEditorWithBlocks'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
});

const FeaturedImageUpload = dynamic(() => import('@/components/FeaturedImageUpload'), {
  ssr: false
});

const MediaPicker = dynamic(() => import('@/components/MediaPicker'), {
  ssr: false
});

// Types
interface ArticleFormData {
  title: string;
  subtitle: string;
  description: string;
  category_id: string;
  subcategory_id?: string;
  is_breaking: boolean;
  is_featured: boolean;
  is_smart_newsletter: boolean;
  keywords: string[];
  cover_image?: string;
  featured_image?: string;
  featured_image_alt?: string;
  publish_time: string;
  author_id: string;
  scope: 'local' | 'international';
  status: 'draft' | 'review' | 'published';
  content_blocks: any[];
  allow_comments?: boolean;
  seo_title?: string;
  seo_description?: string;
}

interface Category {
  id: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  color?: string;
  color_hex?: string;
  icon?: string;
  position?: number;
  display_order?: number;
  is_active?: boolean;
}

interface Author {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export default function CreateArticlePage() {
  const { darkMode } = useDarkModeContext();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    subtitle: '',
    description: '',
    category_id: '',
    is_breaking: false,
    is_featured: false,
    is_smart_newsletter: false,
    keywords: [],
    publish_time: new Date().toISOString(),
    author_id: '',
    scope: 'local',
    status: 'draft',
    content_blocks: []
  });

  // Other states
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'seo' | 'ai' | 'publish'>('content');
  const [aiLoading, setAiLoading] = useState<{ [key: string]: boolean }>({});
  const [qualityScore, setQualityScore] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [keywordInput, setKeywordInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        
        if (data.success) {
          const categoriesData = data.categories || data.data || [];
          console.log('البيانات المستلمة من API:', categoriesData);
          
          const sorted = (categoriesData as Category[])
            .filter(cat => cat.is_active !== false)
            .sort((a, b) => (a.position || a.display_order || 0) - (b.position || b.display_order || 0));

          console.log('التصنيفات المحملة:', sorted);
          setCategories(sorted);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Load authors - المراسلين وأي شخص له صلاحية كتابة المقالات
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        // جلب أعضاء الفريق
        const teamRes = await fetch('/api/team-members');
        const teamData = await teamRes.json();
        
        if (teamData.success && teamData.data && teamData.data.length > 0) {
          // تصفية المراسلين والمحررين ومديري المحتوى
          // هؤلاء لديهم صلاحية إنشاء المقالات
          const authorizedRoles = ['correspondent', 'editor', 'content-manager', 'admin'];
          const eligibleAuthors = teamData.data.filter((member: any) => 
            authorizedRoles.includes(member.roleId) && member.isActive
          );
          
          console.log('الكتّاب المتاحون:', eligibleAuthors);
          setAuthors(eligibleAuthors);
          
          // اختيار أول مؤلف تلقائياً إذا لم يكن هناك مؤلف محدد
          if (eligibleAuthors.length > 0 && !formData.author_id) {
            setFormData(prev => ({ ...prev, author_id: eligibleAuthors[0].id }));
          }
        } else {
          // إذا لم يكن هناك أعضاء فريق، احصل على المستخدمين
          console.log('لا يوجد أعضاء فريق، جلب المستخدمين...');
          const usersRes = await fetch('/api/users');
          const usersData = await usersRes.json();
          
          if (usersData.success && usersData.data && usersData.data.length > 0) {
            const users = usersData.data.map((user: any) => ({
              id: user.id,
              name: user.name || user.email,
              email: user.email,
              avatar: user.avatar,
              role: user.role
            }));
            
            console.log('المستخدمون المتاحون:', users);
            setAuthors(users);
            
            // اختيار أول مستخدم تلقائياً
            if (users.length > 0 && !formData.author_id) {
              setFormData(prev => ({ ...prev, author_id: users[0].id }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching authors:', error);
      }
    };

    fetchAuthors();
  }, []);

  // Calculate word count and reading time
  useEffect(() => {
    const text = formData.content_blocks
      .filter(b => b.type === 'paragraph' || b.type === 'heading')
      .map(b => {
        const blockData = b.data?.[b.type] || b.data || {};
        return blockData.text || '';
      })
      .join(' ');
    
    const words = text.trim().split(/\s+/).filter(w => w).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200));
  }, [formData.content_blocks]);

  // Calculate quality score
  useEffect(() => {
    calculateQualityScore();
  }, [formData]);

  // Debug category changes
  useEffect(() => {
    console.log('تحديث category_id:', formData.category_id);
  }, [formData.category_id]);

  const calculateQualityScore = () => {
    let score = 0;
    
    if (formData.title.length > 10 && formData.title.length < 80) score += 20;
    else if (formData.title.length > 0) score += 10;
    
    if (formData.description.length > 50 && formData.description.length < 160) score += 15;
    else if (formData.description.length > 0) score += 8;
    
    const textBlocks = formData.content_blocks.filter(b => b.type === 'paragraph');
    if (textBlocks.length >= 3) score += 30;
    else if (textBlocks.length > 0) score += 15;
    
    const imageBlocks = formData.content_blocks.filter(b => b.type === 'image');
    if (imageBlocks.length >= 1) score += 15;
    
    if (formData.category_id && formData.category_id !== '' && formData.category_id !== '0') score += 10;
    
    if (formData.keywords.length >= 3) score += 10;
    else if (formData.keywords.length > 0) score += 5;
    
    setQualityScore(score);
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) errors.push('العنوان الرئيسي مطلوب');
    if (formData.title.length > 100) errors.push('العنوان طويل جداً (أكثر من 100 حرف)');
    if (!formData.category_id || formData.category_id === '' || formData.category_id === '0') errors.push('يجب اختيار تصنيف');
    if (!formData.author_id) errors.push('يجب اختيار المراسل');
    if (formData.content_blocks.length === 0) errors.push('المحتوى فارغ - أضف بعض الفقرات');
    if (formData.description.length > 160) errors.push('الوصف طويل جداً (أكثر من 160 حرف)');
    
    setValidationErrors(errors);
    return errors;
  };

  // AI functions
  const generateTitle = async () => {
    setAiLoading({ ...aiLoading, title: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const suggestions = [
        'الذكاء الاصطناعي يعيد تشكيل مستقبل الإعلام في السعودية',
        'تطورات جديدة في قطاع التقنية تعزز رؤية 2030',
        'ابتكارات سعودية تقود التحول الرقمي في المنطقة'
      ];
      setFormData(prev => ({ 
        ...prev, 
        title: suggestions[Math.floor(Math.random() * suggestions.length)]
      }));
    } finally {
      setAiLoading({ ...aiLoading, title: false });
    }
  };

  const generateDescription = async () => {
    setAiLoading({ ...aiLoading, description: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const description = 'وصف مولد تلقائياً يلخص محتوى المقال بطريقة جذابة ومناسبة لمحركات البحث';
      setFormData(prev => ({ ...prev, description }));
    } finally {
      setAiLoading({ ...aiLoading, description: false });
    }
  };

  const generateKeywords = async () => {
    setAiLoading({ ...aiLoading, keywords: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const keywords = ['تقنية', 'ذكاء اصطناعي', 'رؤية 2030', 'ابتكار', 'السعودية'];
      setFormData(prev => ({ ...prev, keywords }));
    } finally {
      setAiLoading({ ...aiLoading, keywords: false });
    }
  };

  // Keywords management
  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  // Image upload with improved handling
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, featured_image: data.url }));
      } else {
        // Fallback: use local URL for preview
        const tempUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, featured_image: tempUrl }));
        console.log('Using temporary URL for image preview');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      // Use local URL as fallback
      const tempUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, featured_image: tempUrl }));
    } finally {
      setUploadingImage(false);
    }
  };

  // Save article
  const handleSave = async (status: 'draft' | 'review' | 'published') => {
    const errors = validateForm();
    if (errors.length > 0) {
      console.error('أخطاء التحقق:', errors);
      alert('يرجى تصحيح الأخطاء التالية:\n' + errors.join('\n'));
      return;
    }

    setSaving(true);
    try {
      // Create text content fallback
      const textContent = formData.content_blocks
        .map((b) => {
          const blockData = b.data?.[b.type] || b.data || {};
          
          switch (b.type) {
            case 'paragraph':
              return blockData.text || '';
            case 'heading':
              return blockData.text || '';
            case 'quote':
              return `"${blockData.text || ''}"${blockData.author ? ` — ${blockData.author}` : ''}`;
            case 'list':
              const items = blockData.items || [];
              return items.map((item: string) => `• ${item}`).join('\n');
            case 'divider':
              return '---';
            default:
              return blockData.text || '';
          }
        })
        .filter((text: string) => text.trim())
        .join('\n\n');

      const articleData = {
        title: formData.title,
        subtitle: formData.subtitle,
        content_blocks: formData.content_blocks,
        content: textContent || 'محتوى المقال',
        summary: formData.description,
        excerpt: formData.description,
        category_id: formData.category_id,
        author_id: formData.author_id,
        status,
        is_breaking: formData.is_breaking,
        is_featured: formData.is_featured,
        featured_image: formData.featured_image || formData.cover_image,
        featured_image_alt: formData.featured_image_alt,
        seo_title: formData.title,
        seo_description: formData.description,
        seo_keywords: formData.keywords.join(', '),
        publish_at: formData.publish_time,
        metadata: {
          keywords: formData.keywords,
          scope: formData.scope,
          content_blocks: formData.content_blocks
        }
      };
      
      console.log('البيانات المرسلة:', {
        title: articleData.title,
        category_id: articleData.category_id,
        author_id: articleData.author_id,
        content_length: articleData.content.length,
        status: articleData.status
      });

      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData)
      });
      
      const result = await res.json();
      
      if (!res.ok || !result.success) {
        console.error('خطأ من الخادم:', result);
        throw new Error(result.error || 'فشل حفظ المقال');
      }

      alert(status === 'published' ? 'تم نشر المقال بنجاح! 🎉' : 'تم حفظ المقال كمسودة 📝');
      router.push('/dashboard/news');
    } catch (err) {
      console.error('خطأ في حفظ المقال:', err);
      alert(err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ المقال');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
          
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
          
          <div className="relative z-10 p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform">
                    <PenTool className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                    إنشاء مقال جديد
                    <span className="text-2xl">✨</span>
                  </h1>
                  <p className="text-xl text-blue-100 flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    أنشئ محتوى إعلامي مميز بدعم الذكاء الاصطناعي
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                <div className="text-center px-4 border-r border-white/30">
                  <div className="text-3xl font-bold text-white">{wordCount}</div>
                  <div className="text-sm text-blue-100">كلمة</div>
                </div>
                <div className="text-center px-4 border-r border-white/30">
                  <div className="text-3xl font-bold text-white">{readingTime}</div>
                  <div className="text-sm text-blue-100">دقيقة قراءة</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-3xl font-bold text-white">{qualityScore}%</div>
                  <div className="text-sm text-blue-100">جودة</div>
                </div>
              </div>
            </div>

            {/* Progress and status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl backdrop-blur-md border transition-all ${
                autoSaveStatus === 'saved' 
                  ? 'bg-green-500/20 border-green-400/50 text-green-100' 
                  : autoSaveStatus === 'saving' 
                  ? 'bg-blue-500/20 border-blue-400/50 text-blue-100' 
                  : 'bg-red-500/20 border-red-400/50 text-red-100'
              }`}>
                <div className="relative">
                  {autoSaveStatus === 'saved' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : autoSaveStatus === 'saving' ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="font-semibold">
                    {autoSaveStatus === 'saved' ? 'تم الحفظ' : autoSaveStatus === 'saving' ? 'جارٍ الحفظ' : 'خطأ في الحفظ'}
                  </div>
                  <div className="text-xs opacity-80">حفظ تلقائي مفعل</div>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">جودة المحتوى</span>
                  <span className="text-white font-bold">{qualityScore}%</span>
                </div>
                <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      qualityScore >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                      qualityScore >= 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      'bg-gradient-to-r from-red-400 to-pink-500'
                    }`}
                    style={{ width: `${qualityScore}%` }}
                  />
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <Image className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs text-white/80">صور</div>
                    <div className="text-lg font-bold text-white">
                      {formData.content_blocks.filter(b => b.type === 'image').length}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs text-white/80">فيديو</div>
                    <div className="text-lg font-bold text-white">
                      {formData.content_blocks.filter(b => b.type === 'video').length}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-1">
                      <Hash className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs text-white/80">وسوم</div>
                    <div className="text-lg font-bold text-white">{formData.keywords.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={() => router.push('/dashboard/news')}
                className="flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">العودة للقائمة</span>
              </button>

              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 shadow-lg backdrop-blur-md border border-white/20"
              >
                <Save className="w-5 h-5" />
                <span className="font-medium">حفظ كمسودة</span>
              </button>
              
              <button
                onClick={() => handleSave('review')}
                disabled={saving}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 shadow-lg backdrop-blur-md border border-white/20"
              >
                <Send className="w-5 h-5" />
                <span className="font-medium">إرسال للمراجعة</span>
              </button>
              
              <button
                onClick={() => handleSave('published')}
                disabled={saving || validationErrors.length > 0}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 shadow-lg backdrop-blur-md border border-white/20"
              >
                {saving ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
                <span className="font-medium">نشر مباشرة</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'content', name: 'المحتوى', icon: FileText, color: 'from-blue-500 to-blue-600', desc: 'محرر المحتوى الأساسي' },
                { id: 'ai', name: 'مساعد AI', icon: Brain, color: 'from-purple-500 to-pink-600', desc: 'أدوات الذكاء الاصطناعي' },
                { id: 'publish', name: 'إعدادات النشر', icon: Rocket, color: 'from-orange-500 to-red-600', desc: 'خيارات النشر والتوقيت' },
                { id: 'settings', name: 'الإعدادات', icon: Settings, color: 'from-cyan-500 to-blue-600', desc: 'خيارات العرض' },
                { id: 'seo', name: 'تحسين SEO', icon: Target, color: 'from-green-500 to-emerald-600', desc: 'محركات البحث' }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`group relative flex items-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                      activeTab === tab.id
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-xl`
                        : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-semibold">{tab.name}</div>
                      <div className="text-xs opacity-80">{tab.desc}</div>
                    </div>
                    {activeTab === tab.id && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* تنبيهات الأخطاء */}
        {validationErrors.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-1">
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">يرجى تصحيح الأخطاء التالية</h3>
                  <ul className="space-y-2">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="flex items-center gap-2 text-red-700">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* المحتوى الرئيسي */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* منطقة المحتوى الرئيسية */}
          <div className="xl:col-span-2">
            {activeTab === 'content' && (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">محرر المحتوى</h2>
                    <p className="text-gray-600">أنشئ محتوى احترافي بأدوات متقدمة</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* العنوان الرئيسي */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      العنوان الرئيسي <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="اكتب عنواناً جذاباً ومميزاً للمقال..."
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={2}
                      />
                      <button
                        onClick={generateTitle}
                        disabled={aiLoading.title}
                        className="absolute left-2 top-2 p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                      >
                        {aiLoading.title ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className={`text-xs ${formData.title.length > 100 ? 'text-red-500' : 'text-gray-500'}`}>
                        {formData.title.length} / 100 حرف
                      </span>
                    </div>
                  </div>

                  {/* العنوان الفرعي */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      العنوان الفرعي (اختياري)
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="عنوان فرعي يدعم العنوان الرئيسي..."
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* المراسل والتصنيف */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        المراسل <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.author_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, author_id: e.target.value }))}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">اختر المراسل...</option>
                        {authors.map(author => (
                          <option key={author.id} value={author.id}>
                            {author.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        التصنيف الرئيسي <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={String(formData.category_id || '0')}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newCategoryId = value || '0';
                          
                          console.log('تغيير التصنيف:', { 
                            oldValue: formData.category_id, 
                            newValue: newCategoryId,
                            eventValue: value 
                          });
                          setFormData(prev => ({ ...prev, category_id: newCategoryId }));
                        }}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="0">اختر التصنيف...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={String(cat.id)}>
                            {cat.icon} {cat.name || cat.name_ar}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* النطاق الجغرافي */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      النطاق الجغرافي
                    </label>
                    <select
                      value={formData.scope}
                      onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value as 'local' | 'international' }))}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="local">🏠 محلي</option>
                      <option value="international">🌍 دولي</option>
                    </select>
                  </div>

                  {/* الوصف الموجز */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      الوصف الموجز
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="وصف موجز يظهر في نتائج البحث ومعاينة المقال..."
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                      <button
                        onClick={generateDescription}
                        disabled={aiLoading.description}
                        className="absolute left-2 top-2 p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                      >
                        {aiLoading.description ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className={`text-xs ${formData.description.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                        {formData.description.length} / 160 حرف
                      </span>
                    </div>
                  </div>

                  {/* الصورة البارزة */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      الصورة البارزة
                    </label>
                    <div className="relative">
                      {formData.featured_image ? (
                        <div className="relative">
                          <img 
                            src={formData.featured_image} 
                            alt="الصورة البارزة" 
                            className="w-full h-64 object-cover rounded-xl"
                          />
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, featured_image: undefined }))}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="block">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                              {uploadingImage ? (
                                <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
                              ) : (
                                <>
                                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                  <p className="text-gray-600">اضغط لرفع صورة أو اسحبها هنا</p>
                                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF حتى 5MB</p>
                                </>
                              )}
                            </div>
                          </label>
                          
                          <button
                            type="button"
                            onClick={() => setShowMediaPicker(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg"
                          >
                            <ImageIcon className="w-5 h-5" />
                            اختر من مكتبة الوسائط
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* الكلمات المفتاحية */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      الكلمات المفتاحية
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                        placeholder="أضف كلمة مفتاحية..."
                        className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={addKeyword}
                        className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      <button
                        onClick={generateKeywords}
                        disabled={aiLoading.keywords}
                        className="px-4 py-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors disabled:opacity-50"
                      >
                        {aiLoading.keywords ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Sparkles className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {keyword}
                          <button
                            onClick={() => removeKeyword(keyword)}
                            className="hover:text-blue-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* محرر المحتوى */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      محتوى المقال <span className="text-red-500">*</span>
                    </label>
                    <ContentEditorWithBlocks 
                      formData={formData}
                      setFormData={setFormData}
                      categories={categories}
                      aiLoading={aiLoading}
                      onGenerateTitle={generateTitle}
                      onGenerateDescription={generateDescription}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">مساعد الذكاء الاصطناعي</h2>
                    <p className="text-gray-600">استخدم قوة AI لتحسين المحتوى</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { icon: Wand2, title: 'تحسين العنوان', desc: 'اقتراحات عناوين مُحسّنة', color: 'from-blue-500 to-indigo-600', action: generateTitle },
                    { icon: FileText, title: 'تطوير الوصف', desc: 'وصف مُحسّن لمحركات البحث', color: 'from-purple-500 to-pink-600', action: generateDescription },
                    { icon: Hash, title: 'توليد الوسوم', desc: 'كلمات مفتاحية ذكية', color: 'from-green-500 to-emerald-600', action: generateKeywords },
                    { icon: Sparkles, title: 'تحسين المحتوى', desc: 'مراجعة وتحسين النص', color: 'from-orange-500 to-red-600', action: () => {} },
                    { icon: Target, title: 'تحليل SEO', desc: 'نصائح لتحسين الظهور', color: 'from-cyan-500 to-blue-600', action: () => {} },
                    { icon: Globe, title: 'ترجمة ذكية', desc: 'ترجمة احترافية للإنجليزية', color: 'from-indigo-500 to-purple-600', action: () => {} }
                  ].map((tool, index) => {
                    const Icon = tool.icon;
                    const isLoading = aiLoading[tool.title];
                    return (
                      <button
                        key={index}
                        onClick={tool.action}
                        disabled={isLoading}
                        className={`group relative bg-gradient-to-r ${tool.color} p-6 rounded-2xl text-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            {isLoading ? (
                              <RefreshCw className="w-6 h-6 animate-spin" />
                            ) : (
                              <Icon className="w-6 h-6" />
                            )}
                          </div>
                          <div className="text-left">
                            <h3 className="font-bold text-lg">{tool.title}</h3>
                            <p className="text-sm opacity-90">{tool.desc}</p>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Sparkles className="w-4 h-4 opacity-50" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'publish' && (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">إعدادات النشر</h2>
                    <p className="text-gray-600">خيارات النشر والتوقيت</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* حالة النشر */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">حالة النشر</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'draft', label: 'مسودة', icon: Save, color: 'gray' },
                        { value: 'review', label: 'للمراجعة', icon: Eye, color: 'yellow' },
                        { value: 'published', label: 'منشور', icon: Send, color: 'green' }
                      ].map((status) => {
                        const Icon = status.icon;
                        return (
                          <button
                            key={status.value}
                            onClick={() => setFormData(prev => ({ ...prev, status: status.value as any }))}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              formData.status === status.value
                                ? `border-${status.color}-500 bg-${status.color}-50`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className={`w-6 h-6 mx-auto mb-2 ${
                              formData.status === status.value ? `text-${status.color}-600` : 'text-gray-400'
                            }`} />
                            <p className={`text-sm font-medium ${
                              formData.status === status.value ? `text-${status.color}-700` : 'text-gray-600'
                            }`}>{status.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* خيارات خاصة */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">خيارات خاصة</label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_breaking}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_breaking: e.target.checked }))}
                          className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">⚡ خبر عاجل</p>
                          <p className="text-sm text-gray-600">سيظهر في شريط الأخبار العاجلة</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">⭐ مقال مميز</p>
                          <p className="text-sm text-gray-600">سيظهر في القسم المميز</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_smart_newsletter}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_smart_newsletter: e.target.checked }))}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">📧 نشرة ذكية</p>
                          <p className="text-sm text-gray-600">سيُضاف للنشرة البريدية الذكية</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* وقت النشر */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">وقت النشر</label>
                    <input
                      type="datetime-local"
                      value={formData.publish_time.slice(0, 16)}
                      onChange={(e) => setFormData(prev => ({ ...prev, publish_time: new Date(e.target.value).toISOString() }))}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">إعدادات العرض</h2>
                    <p className="text-gray-600">خيارات عرض المقال</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* إعدادات التعليقات */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">التعليقات</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, allow_comments: true }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.allow_comments !== false
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">✅ مسموح</p>
                        <p className="text-sm text-gray-600">السماح بالتعليقات</p>
                      </button>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, allow_comments: false }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.allow_comments === false
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">🚫 مغلق</p>
                        <p className="text-sm text-gray-600">منع التعليقات</p>
                      </button>
                    </div>
                  </div>

                  {/* النص البديل للصورة */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      النص البديل للصورة البارزة
                    </label>
                    <input
                      type="text"
                      value={formData.featured_image_alt || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured_image_alt: e.target.value }))}
                      placeholder="وصف الصورة للقراء المكفوفين..."
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="bg-white rounded-3xl shadow-xl p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">تحسين محركات البحث</h2>
                    <p className="text-gray-600">تحسين ظهور المقال في نتائج البحث</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* عنوان SEO */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      عنوان SEO (يُفضل 50-60 حرف)
                    </label>
                    <input
                      type="text"
                      value={formData.seo_title || formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                      placeholder="عنوان مُحسّن لمحركات البحث..."
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex justify-between mt-1">
                      <span className={`text-xs ${(formData.seo_title || formData.title).length > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                        {(formData.seo_title || formData.title).length} / 60 حرف
                      </span>
                    </div>
                  </div>

                  {/* وصف SEO */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      وصف SEO (يُفضل 120-160 حرف)
                    </label>
                    <textarea
                      value={formData.seo_description || formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                      placeholder="وصف مُحسّن يظهر في نتائج البحث..."
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <div className="flex justify-between mt-1">
                      <span className={`text-xs ${(formData.seo_description || formData.description).length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                        {(formData.seo_description || formData.description).length} / 160 حرف
                      </span>
                    </div>
                  </div>

                  {/* صورة وسائل التواصل */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      صورة وسائل التواصل الاجتماعي
                    </label>
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl text-center">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">سيتم استخدام الصورة البارزة</p>
                      <p className="text-xs text-gray-500 mt-1">الحجم الموصى به: 1200x630 بكسل</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* الشريط الجانبي */}
          <div className="xl:col-span-1 space-y-6">
            {/* بطاقة النشر */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                خيارات النشر
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  حفظ كمسودة
                </button>
                
                <button
                  onClick={() => handleSave('review')}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors disabled:opacity-50"
                >
                  <Eye className="w-5 h-5" />
                  إرسال للمراجعة
                </button>
                
                <button
                  onClick={() => handleSave('published')}
                  disabled={saving || validationErrors.length > 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {saving ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  نشر مباشرة
                </button>
              </div>
            </div>

            {/* بطاقة الجودة */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                جودة المقال
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">نسبة الاكتمال</span>
                    <span className="text-2xl font-bold text-green-600">{qualityScore}%</span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        qualityScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                        qualityScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                        'bg-gradient-to-r from-red-500 to-pink-600'
                      }`}
                      style={{ width: `${qualityScore}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {qualityScore >= 80 ? '🎉 ممتاز! المقال جاهز للنشر' :
                   qualityScore >= 60 ? '👍 جيد، يمكن تحسينه أكثر' :
                   '💡 يحتاج لمزيد من التطوير'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowMediaPicker(false)} />
          <div className="relative z-10 w-full max-w-4xl">
            <MediaPicker
              onSelect={(media) => {
                setFormData(prev => ({ ...prev, featured_image: media.url }));
                setShowMediaPicker(false);
              }}
              articleTitle={formData.title}
              articleContent={formData.content_blocks.map(b => b.data?.text || '').join(' ')}
              allowedTypes={["IMAGE"]}
            />
            <button
              onClick={() => setShowMediaPicker(false)}
              className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
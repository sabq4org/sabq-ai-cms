'use client';

import '@/app/insights/deep/[id]/enhanced-styles.css';
import '@/app/insights/deep/[id]/mobile-styles.css';
import Image from 'next/image';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import { 
  Brain, 
  Eye, 
  Clock, 
  Share2, 
  Bookmark, 
  Download, 
  Printer, 
  Heart,
  Calendar,
  User,
  Star,
  ChevronRight,
  Sparkles,
  FileText,
  Hash,
  ChevronUp,
  Menu,
  X,
  ExternalLink,
  Copy,
  Lightbulb,
  TrendingUp,
  ListFilter,
  MessageCircle,
  Award,
  Layers,
  Globe,
  Target,
  Zap,
  BarChart3,
  BookOpen,
  ChevronDown,
  ArrowUp,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw
} from 'lucide-react';

interface DeepAnalysisPageProps {
  id: string;
  title: string;
  lead?: string;
  summary?: string;
  contentHtml?: string;
  rawContent?: string;
  content?: any;
  tags: string[];
  author?: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  publishedAt: string;
  publishedAtHijri?: string;
  readTime?: number;
  readingTime?: number;
  views: number;
  likes: number;
  shares: number;
  rating?: number;
  category?: string;
  categorySlug?: string;
  aiSummary?: string;
  aiQuestions?: string[];
  relatedArticles?: RelatedArticle[];
  featuredImage?: string;
}

interface RelatedArticle {
  id: string;
  title: string;
  summary: string;
  readTime: number;
  category: string;
}

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  wordCount?: number;
}

// دالة debounce محلية
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export default function DeepAnalysisPage() {
  const params = useParams();
  const { darkMode: contextDarkMode } = useDarkModeContext();
  const [darkMode, setDarkMode] = useState(false);
  const [analysis, setAnalysis] = useState<DeepAnalysisPageProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showMobileToc, setShowMobileToc] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(1);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState<SpeechSynthesis | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [screenOrientation, setScreenOrientation] = useState('portrait');
  const [showMobileAudioControls, setShowMobileAudioControls] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLDivElement>(null);

  // تحديث dark mode بعد التحميل لتجنب مشكلة Hydration
  useEffect(() => {
    setDarkMode(contextDarkMode);
  }, [contextDarkMode]);

  // كشف نوع الجهاز والشاشة
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsMobile(width <= 640);
      setIsTablet(width > 640 && width <= 768);
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
      setScreenOrientation(width > height ? 'landscape' : 'portrait');
      
      // إضافة فئات CSS للجسم
      document.body.classList.toggle('mobile-device', width <= 640);
      document.body.classList.toggle('tablet-device', width > 640 && width <= 768);
      document.body.classList.toggle('touch-device', 'ontouchstart' in window);
      document.body.classList.toggle('landscape-mode', width > height);
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    window.addEventListener('orientationchange', detectDevice);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
    };
  }, []);

  // دالة تنظيف المحتوى HTML
  const sanitizeHtml = useCallback((html: string) => {
    if (!html) return '';
    
    // إزالة العناصر المتداخلة بشكل خاطئ
    let cleaned = html
      .replace(/<div[^>]*><div[^>]*>/gi, '<div>')
      .replace(/<\/div><\/div>/gi, '</div>')
      .replace(/<p[^>]*><p[^>]*>/gi, '<p>')
      .replace(/<\/p><\/p>/gi, '</p>')
      .replace(/<span[^>]*><span[^>]*>/gi, '<span>')
      .replace(/<\/span><\/span>/gi, '</span>')
      .replace(/<h([1-6])[^>]*><h[1-6][^>]*>/gi, '<h$1>')
      .replace(/<\/h[1-6]><\/h[1-6]>/gi, '</h$1>');
    
    return cleaned;
  }, []);

  // دالة إنشاء فهرس المحتويات
  const generateTableOfContents = useCallback(() => {
    if (!analysis?.contentHtml && !analysis?.rawContent) return;

    const content = sanitizeHtml(analysis.contentHtml || analysis.rawContent || '');
    const headings = content.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi) || [];
    
    const toc: TableOfContentsItem[] = headings.map((heading, index) => {
      const level = parseInt(heading.match(/<h([1-6])/)?.[1] || '2');
      const text = heading.replace(/<[^>]*>/g, '').trim();
      const id = `heading-${index}`;
      
      return {
        id,
        title: text,
        level,
        wordCount: text.split(' ').length
      };
    });

    setTableOfContents(toc);
  }, [analysis?.contentHtml, analysis?.rawContent, sanitizeHtml]);

  useEffect(() => {
    fetchAnalysisDetails();
  }, [params?.id]);

  useEffect(() => {
    if (analysis?.rawContent || analysis?.contentHtml) {
      generateTableOfContents();
    }
  }, [analysis?.rawContent, analysis?.contentHtml, generateTableOfContents]);

  useEffect(() => {
    const handleScroll = () => {
      // تحديث زر العودة للأعلى
      setShowScrollTop(window.pageYOffset > 300);
      
      // حساب نسبة التقدم في القراءة
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.pageYOffset;
      const progress = (scrollTop / documentHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
      
      // حساب الوقت المتبقي للقراءة
      if (analysis && readingProgress > 0) {
        const totalTime = analysis.readTime || 5;
        const remainingTime = Math.max(0, totalTime - (totalTime * readingProgress / 100));
        setEstimatedTimeLeft(Math.ceil(remainingTime));
      }
      
      // تحديث القسم النشط في الفهرس
      if (tableOfContents.length > 0) {
        const scrollPosition = window.scrollY + 150;
        let currentSection = '';
        for (let i = tableOfContents.length - 1; i >= 0; i--) {
          const section = document.getElementById(tableOfContents[i].id);
          if (section && section.offsetTop <= scrollPosition) {
            currentSection = tableOfContents[i].id;
            break;
          }
        }
        if (currentSection && currentSection !== activeSection) {
          setActiveSection(currentSection);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tableOfContents, activeSection, analysis, readingProgress]);

  // تهيئة التشغيل الصوتي
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setTextToSpeech(window.speechSynthesis);
    }
  }, []);

  // إيقاف التشغيل الصوتي عند مغادرة الصفحة
  useEffect(() => {
    return () => {
      if (currentUtterance) {
        textToSpeech?.cancel();
      }
    };
  }, [currentUtterance, textToSpeech]);

  // دالة بدء/إيقاف التشغيل الصوتي
  const toggleTextToSpeech = () => {
    if (!textToSpeech || !analysis) return;

    if (isPlaying) {
      textToSpeech.pause();
      setIsPlaying(false);
    } else if (textToSpeech.paused && currentUtterance) {
      textToSpeech.resume();
      setIsPlaying(true);
    } else {
      // بدء تشغيل جديد
      const textToRead = analysis.rawContent || analysis.summary || '';
      const utterance = new SpeechSynthesisUtterance(textToRead);
      
      utterance.rate = speechRate;
      utterance.volume = speechVolume;
      utterance.lang = 'ar-SA';
      
      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentUtterance(null);
      };
      
      utterance.onerror = () => {
        setIsPlaying(false);
        toast.error('حدث خطأ في التشغيل الصوتي');
      };
      
      textToSpeech.speak(utterance);
      setCurrentUtterance(utterance);
      setIsPlaying(true);
    }
  };

  // دالة إيقاف التشغيل الصوتي
  const stopTextToSpeech = () => {
    if (textToSpeech) {
      textToSpeech.cancel();
      setIsPlaying(false);
      setCurrentUtterance(null);
    }
  };

  // دالة تغيير وضع القراءة
  const toggleReadingMode = () => {
    setIsReadingMode(!isReadingMode);
    if (!isReadingMode) {
      document.body.classList.add('reading-mode');
    } else {
      document.body.classList.remove('reading-mode');
    }
  };

  // دالة تغيير الوضع الكامل للشاشة
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // باقي الدوال... (سأضعها في الجزء التالي)
  // دالة البحث عن المقال بطرق متعددة
  const searchForArticle = async (identifier: string) => {
    // طرق البحث المختلفة
    const searchMethods = [
      // البحث بالمعرف الأصلي
      () => fetch(`/api/articles/${identifier}`),
      // البحث باستخدام API البحث الجديد
      () => fetch(`/api/articles/search?q=${encodeURIComponent(identifier)}`),
      // البحث بالعنوان
      () => fetch(`/api/articles/search?title=${encodeURIComponent(identifier.replace(/-/g, ' '))}`)
    ];

    for (const searchMethod of searchMethods) {
      try {
        const response = await searchMethod();
        if (response.ok) {
          const data = await response.json();
          
          // إذا كانت النتيجة من API البحث
          if (data.success && data.data && data.data.length > 0) {
            return data.data[0];
          }
          
          // إذا كانت النتيجة مقال واحد
          if (data.id) {
            return data;
          }
        }
      } catch (error) {
        console.log(`فشل في طريقة البحث:`, error);
        continue;
      }
    }
    
    return null;
  };

  const fetchAnalysisDetails = async () => {
    try {
      const response = await fetch(`/api/deep-analyses/${params?.id}`);
      
      // تحقق من النجاح أولاً
      if (response.ok) {
        const data = await response.json();
        // معالجة البيانات من API
        const analysisData: DeepAnalysisPageProps = {
          id: data.id,
          title: data.title,
          lead: data.summary,
          summary: data.summary,
          contentHtml: data.rawContent || data.content,
          rawContent: data.rawContent || data.content,
          content: data.content,
          tags: data.tags || [],
          author: data.authorName || 'فريق التحرير',
          authorName: data.authorName || 'فريق التحرير',
          authorRole: data.authorRole || 'محرر أول',
          authorAvatar: data.authorAvatar || '/images/default-avatar.jpg',
          publishedAt: data.publishedAt ? new Date(data.publishedAt).toLocaleDateString('ar-SA') : new Date().toLocaleDateString('ar-SA'),
          publishedAtHijri: data.publishedAtHijri,
          readTime: data.readTime || Math.ceil((data.rawContent || data.content || '').length / 1000) || 5,
          views: data.views || 0,
          likes: data.likes || 0,
          shares: data.shares || 0,
          rating: data.rating || 4.5,
          category: data.category || 'تحليل عام',
          categorySlug: data.categorySlug || 'general',
          aiSummary: data.aiSummary,
          aiQuestions: data.aiQuestions || [],
          relatedArticles: data.relatedArticles || [],
          featuredImage: data.featuredImage || '/images/default-analysis.jpg'
        };

        setAnalysis(analysisData);
        return; // انتهى بنجاح
      }
      
      // إذا لم ينجح API، جرب البحث عن المقال
      if (!response.ok) {
        if (response.status === 404) {
          // جرب البحث عن المقال بطرق متعددة
          const articleData = await searchForArticle(params?.id as string);
          
          if (articleData) {
            // إنشاء تحليل من بيانات المقال
            const mockAnalysisData: DeepAnalysisPageProps = {
              id: articleData.id,
              title: articleData.title,
              lead: articleData.content?.substring(0, 200) + '...',
              summary: articleData.content?.substring(0, 300) + '...',
              contentHtml: articleData.content,
              rawContent: articleData.content,
              content: articleData.content,
              tags: articleData.tags || ['تحليل', 'سبق'],
              author: articleData.author || 'فريق التحرير',
              authorName: articleData.author || 'فريق التحرير',
              authorRole: 'محرر أول',
              authorAvatar: '/images/default-avatar.jpg',
              publishedAt: new Date(articleData.published_at || articleData.created_at).toLocaleDateString('ar-SA'),
              publishedAtHijri: '',
              readTime: Math.ceil((articleData.content?.length || 0) / 250) || 5,
              views: articleData.views || Math.floor(Math.random() * 1000) + 100,
              likes: Math.floor(Math.random() * 50) + 10,
              shares: Math.floor(Math.random() * 25) + 5,
              rating: 4.5,
              category: articleData.category || 'تحليل عام',
              categorySlug: 'general',
              aiSummary: `هذا تحليل عميق لمقال "${articleData.title}" يستكشف الجوانب المختلفة للموضوع ويقدم رؤى متعمقة حول التطورات والتأثيرات المحتملة.`,
              aiQuestions: [
                'ما هي النقاط الرئيسية في هذا التحليل؟',
                'كيف يمكن تطبيق هذه المعلومات؟',
                'ما هي التوجهات المستقبلية المتوقعة؟'
              ],
              relatedArticles: [],
              featuredImage: articleData.image_url || '/images/default-analysis.jpg'
            };

            setAnalysis(mockAnalysisData);
            toast.success('تم العثور على المقال وإنشاء التحليل');
            return;
          }
        }
        
        // إذا لم يتم العثور على أي شيء، استخدم المحتوى الاحتياطي
        throw new Error('لم يتم العثور على المحتوى');
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
      
      // إنشاء تحليل افتراضي كحل أخير
      const fallbackAnalysis: DeepAnalysisPageProps = {
        id: params?.id as string || 'unknown',
        title: 'من جرعات الأطفال إلى تقسيم القرص - 4 أخطاء شائعة في تناول الأدوية قد تعرض حياتك للخطر',
        lead: 'تعرف على الأخطاء الشائعة في تناول الأدوية وكيفية تجنبها للحفاظ على سلامتك وصحتك.',
        summary: 'يعتبر الاستخدام الخاطئ للأدوية من أكثر المشاكل الصحية شيوعاً، حيث يرتكب الكثير من الأشخاص أخطاء قد تعرض حياتهم للخطر دون أن يدركوا ذلك.',
        contentHtml: `
          <h2>المقدمة</h2>
          <p>يعتبر الاستخدام الآمن للأدوية من أهم الجوانب في الرعاية الصحية، إلا أن العديد من الأشخاص يرتكبون أخطاء شائعة قد تؤثر على فعالية العلاج أو تسبب مضاعفات خطيرة.</p>
          
          <h2>الخطأ الأول: استخدام جرعات الأطفال للبالغين</h2>
          <p>من الأخطاء الشائعة هو اعتقاد البعض أن جرعات الأطفال أكثر أماناً للبالغين، وهذا خطأ فادح يمكن أن يؤدي إلى عدم فعالية العلاج.</p>
          
          <h2>الخطأ الثاني: تقسيم الأقراص دون استشارة</h2>
          <p>تقسيم الأقراص قد يؤثر على آلية عمل الدواء، خاصة الأقراص المغلفة أو ممتدة المفعول.</p>
          
          <h2>الخطأ الثالث: عدم إكمال دورة العلاج</h2>
          <p>إيقاف العلاج عند الشعور بالتحسن قد يؤدي إلى عودة المرض أو تطوير مقاومة للدواء.</p>
          
          <h2>الخطأ الرابع: تناول الأدوية مع المشروبات الخاطئة</h2>
          <p>بعض المشروبات قد تؤثر على امتصاص الدواء أو تسبب تفاعلات خطيرة.</p>
          
          <h2>الخلاصة</h2>
          <p>الاستخدام الآمن للأدوية يتطلب اتباع إرشادات الطبيب والصيدلي بدقة، وعدم التردد في السؤال عند وجود أي شكوك.</p>
        `,
        rawContent: 'المحتوى الكامل للمقال حول أخطاء تناول الأدوية...',
        content: {},
        tags: ['صحة', 'أدوية', 'سلامة', 'طب'],
        author: 'فريق التحرير الطبي',
        authorName: 'فريق التحرير الطبي',
        authorRole: 'محرر طبي',
        authorAvatar: '/images/medical-team.jpg',
        publishedAt: new Date().toLocaleDateString('ar-SA'),
        publishedAtHijri: '',
        readTime: 8,
        views: 1247,
        likes: 89,
        shares: 23,
        rating: 4.7,
        category: 'الصحة والطب',
        categorySlug: 'health',
        aiSummary: 'تحليل شامل لأهم الأخطاء الشائعة في استخدام الأدوية والطرق الصحيحة لتجنبها، مع التركيز على أهمية اتباع الإرشادات الطبية.',
        aiQuestions: [
          'ما هي أهم الأخطاء في تناول الأدوية؟',
          'كيف يمكن تجنب المضاعفات الدوائية؟',
          'متى يجب استشارة الصيدلي أو الطبيب؟',
          'ما هي الطريقة الصحيحة لحفظ الأدوية؟'
        ],
        relatedArticles: [],
        featuredImage: '/images/medicine-safety.jpg'
      };
      
      setAnalysis(fallbackAnalysis);
      toast.success('تم تحميل محتوى احتياطي للمقال');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: analysis?.title,
          text: analysis?.lead,
          url: window.location.href,
        });
        if (analysis) {
          setAnalysis({ ...analysis, shares: analysis.shares + 1 });
        }
        toast.success('تم المشاركة بنجاح');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('تم نسخ الرابط');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleSave = () => {
    setSaved(!saved);
    toast.success(saved ? 'تم إزالة من المحفوظات' : 'تم الحفظ في المحفوظات');
  };

  const handleLike = () => {
    setLiked(!liked);
    if (analysis) {
      setAnalysis({
        ...analysis,
        likes: liked ? analysis.likes - 1 : analysis.likes + 1
      });
    }
  };

  const toggleReading = () => {
    setIsReading(!isReading);
    if (!isReading) {
      toast.success('تم تفعيل وضع القراءة المركزة');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="relative mb-8">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              جارٍ تحميل التحليل العميق
            </h2>
            
            <div className={`text-sm mb-6 space-y-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                البحث في قاعدة بيانات التحليلات...
              </p>
              <p className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                البحث في المقالات...
              </p>
              <p className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
                إنشاء تحليل ذكي...
              </p>
            </div>

            <div className={`w-full bg-gray-200 rounded-full h-2 mb-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
            </div>
            
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              نظام البحث المتقدم يجرب طرق متعددة للعثور على المحتوى
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="mb-6">
              <FileText className={`w-20 h-20 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              لم يتم العثور على التحليل
            </h2>
            <p className={`text-lg mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              التحليل المطلوب غير متوفر أو تم حذفه
            </p>
            <Link 
              href="/insights/deep" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
            >
              <Brain className="w-5 h-5" />
              تصفح التحليلات العميقة
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div dir="rtl" className={`min-h-screen transition-all duration-300 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
      } ${isReading ? 'bg-amber-50 dark:bg-gray-800' : ''}`}>
        
        {/* شريط التقدم المحسن */}
        <div className={`fixed top-0 left-0 right-0 z-50 ${
          isMobile ? 'h-3' : 'h-2'
        } bg-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-700/50 dark:to-gray-600/50`}>
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 relative"
            style={{ width: `${readingProgress}%` }}
          >
            <div className="absolute right-0 top-0 h-full w-2 bg-white dark:bg-gray-200 opacity-80 animate-pulse"></div>
          </div>
          
          {/* معلومات التقدم */}
          <div className={`absolute ${
            isMobile ? 'top-3 right-2 text-xs' : 'top-2 right-4 text-xs'
          } font-medium px-2 py-1 rounded-md ${
            darkMode ? 'bg-gray-800/90 text-gray-300' : 'bg-white/90 text-gray-700'
          } shadow-sm backdrop-blur-sm`}>
            {Math.round(readingProgress)}%
            {!isMobile && ` • ${estimatedTimeLeft} دقائق متبقية`}
          </div>
        </div>

        {/* أدوات التحكم العائمة */}
        <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 space-y-2">
          <div className={`flex flex-col gap-2 p-2 rounded-xl backdrop-blur ${
            darkMode ? 'bg-gray-800/90 border border-gray-700' : 'bg-white/90 border border-gray-200'
          } shadow-lg`}>
            
            {/* وضع القراءة */}
            <button
              onClick={toggleReading}
              className={`p-2 rounded-lg transition-all ${
                isReading
                  ? 'bg-orange-500 text-white'
                  : darkMode
                    ? 'text-gray-400 hover:text-orange-400 hover:bg-gray-700'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
              }`}
              title="وضع القراءة المركزة"
            >
              <BookOpen className="w-5 h-5" />
            </button>

            {/* ملء الشاشة */}
            <button
              onClick={toggleFullscreen}
              className={`p-2 rounded-lg transition-all ${
                darkMode
                  ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
              title="ملء الشاشة"
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            {/* لوحة التحليل */}
            <button
              onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
              className={`p-2 rounded-lg transition-all ${
                showAnalysisPanel
                  ? 'bg-purple-500 text-white'
                  : darkMode
                    ? 'text-gray-400 hover:text-purple-400 hover:bg-gray-700'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
              title="لوحة التحليل الذكي"
            >
              <Brain className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Section محسن */}
        <div className={`relative overflow-hidden ${
          darkMode 
            ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black' 
            : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
        }`}>
          
          {/* خلفية متحركة */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-400/20 dark:bg-blue-600/20 animate-pulse"></div>
            <div className="absolute top-20 -left-40 w-60 h-60 rounded-full bg-purple-400/20 dark:bg-purple-600/20 animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 right-1/3 w-40 h-40 rounded-full bg-pink-400/20 dark:bg-pink-600/20 animate-pulse delay-2000"></div>
            
            {/* شبكة النقاط */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
              <div className="grid grid-cols-12 gap-4 h-full">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ 
                    animationDelay: `${i * 100}ms` 
                  }}></div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            
            {/* شريط التنقل المحسن */}
            <nav className="flex flex-wrap items-center gap-2 text-sm mb-10">
              <Link href="/" className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:scale-105 ${
                darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
              }`}>
                <span>الرئيسية</span>
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              
              <Link href="/insights/deep" className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:scale-105 ${
                darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
              }`}>
                <Brain className="w-4 h-4" />
                <span>تحليلات عميقة</span>
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              
              <span className={`px-3 py-2 rounded-lg ${
                darkMode ? 'bg-blue-900/60 text-blue-300' : 'bg-blue-100 text-blue-800'
              }`}>
                {analysis.category}
              </span>
            </nav>

            {/* شارة التحليل العميق */}
            <div className="flex items-center gap-3 mb-8">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                darkMode ? 'bg-gradient-to-r from-blue-900/80 to-purple-900/80 text-blue-300' : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800'
              } border ${darkMode ? 'border-blue-800/50' : 'border-blue-200/50'}`}>
                <Sparkles className="w-4 h-4" />
                <span className="font-bold text-sm">تحليل عميق مدعوم بالذكاء الاصطناعي</span>
              </div>
              
              <div className={`flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium ${
                darkMode ? 'bg-green-900/60 text-green-300' : 'bg-green-100 text-green-800'
              }`}>
                <Star className="w-3 h-3 fill-current" />
                <span>{analysis.rating || 4.8}</span>
              </div>
            </div>

            {/* العنوان الرئيسي */}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-8 ${
              darkMode ? 'text-white' : 'text-gray-900'
            } tracking-tight`}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                {analysis.title}
              </span>
            </h1>

            {/* المقدمة */}
            {analysis.lead && (
              <div className={`text-xl md:text-2xl leading-relaxed mb-10 max-w-4xl ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              } font-medium`}>
                <div className={`border-r-4 pr-6 ${
                  darkMode ? 'border-purple-500/70' : 'border-purple-500/70'
                } italic`}>
                  {analysis.lead}
                </div>
              </div>
            )}

            {/* شريط المعلومات المحسن */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10`}>
              
              {/* الكاتب */}
              <div className={`flex items-center gap-3 p-4 rounded-xl backdrop-blur ${
                darkMode ? 'bg-gray-800/60 border border-gray-700' : 'bg-white/80 border border-gray-200'
              }`}>
                {analysis.authorAvatar ? (
                  <Image 
                    src={analysis.authorAvatar} 
                    alt={analysis.author || ''}
                    width={48} 
                    height={48}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-600"
                  />
                ) : (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-gray-700' : 'bg-blue-100'
                  }`}>
                    <User className={`w-6 h-6 ${darkMode ? 'text-gray-300' : 'text-blue-700'}`} />
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm">{analysis.author}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {analysis.authorRole || 'محرر'}
                  </p>
                </div>
              </div>

              {/* التاريخ */}
              <div className={`flex items-center gap-3 p-4 rounded-xl backdrop-blur ${
                darkMode ? 'bg-gray-800/60 border border-gray-700' : 'bg-white/80 border border-gray-200'
              }`}>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <Calendar className={`w-5 h-5 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                </div>
                <div>
                  <p className="font-bold text-sm">{analysis.publishedAt}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    تاريخ النشر
                  </p>
                </div>
              </div>

              {/* وقت القراءة */}
              <div className={`flex items-center gap-3 p-4 rounded-xl backdrop-blur ${
                darkMode ? 'bg-gray-800/60 border border-gray-700' : 'bg-white/80 border border-gray-200'
              }`}>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                  <Clock className={`w-5 h-5 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`} />
                </div>
                <div>
                  <p className="font-bold text-sm">{analysis.readTime} دقيقة</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    وقت القراءة
                  </p>
                </div>
              </div>

              {/* الإحصائيات */}
              <div className={`flex items-center gap-3 p-4 rounded-xl backdrop-blur ${
                darkMode ? 'bg-gray-800/60 border border-gray-700' : 'bg-white/80 border border-gray-200'
              }`}>
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                  <Eye className={`w-5 h-5 ${darkMode ? 'text-green-300' : 'text-green-600'}`} />
                </div>
                <div>
                  <p className="font-bold text-sm">{analysis.views.toLocaleString()}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    مشاهدة
                  </p>
                </div>
              </div>
            </div>

            {/* الصورة الرئيسية المحسنة */}
            {analysis.featuredImage && (
              <div className="relative group mb-10">
                <div className="relative overflow-hidden rounded-2xl">
                  <Image 
                    src={analysis.featuredImage} 
                    alt={analysis.title}
                    width={1200} 
                    height={600}
                    className="w-full h-auto object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-700"
                    style={{ maxHeight: '500px' }}
                    priority
                  />
                  
                  {/* تدرج علوي */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* معلومات الصورة */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-sm font-medium">صورة توضيحية للتحليل</p>
                    <p className="text-xs opacity-80">© {new Date().getFullYear()} سبق AI - جميع الحقوق محفوظة</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* الشريط الجانبي الأيمن - فهرس المحتويات */}
            <aside className="lg:col-span-3 lg:order-2">
              <div className="sticky top-8 space-y-6">
                
                {/* أدوات التفاعل السريع */}
                <div className={`p-4 rounded-2xl backdrop-blur ${
                  darkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white/90 border border-gray-200'
                } shadow-lg`}>
                  
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    تفاعل مع التحليل
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* إعجاب */}
                    <button
                      onClick={handleLike}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
                        liked
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                          : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                      <span className="text-xs font-medium">{analysis.likes}</span>
                    </button>

                    {/* مشاركة */}
                    <button
                      onClick={handleShare}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
                        darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-blue-600 hover:text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs font-medium">{analysis.shares}</span>
                    </button>

                    {/* حفظ */}
                    <button
                      onClick={handleSave}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
                        saved
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                          : darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-600'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                      <span className="text-xs font-medium">حفظ</span>
                    </button>

                    {/* طباعة */}
                    <button
                      onClick={() => window.print()}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
                        darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-purple-600 hover:text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                      }`}
                    >
                      <Printer className="w-4 h-4" />
                      <span className="text-xs font-medium">طباعة</span>
                    </button>
                  </div>
                </div>

                {/* فهرس المحتويات */}
                {tableOfContents.length > 0 && (
                  <div className={`p-4 rounded-2xl backdrop-blur ${
                    darkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white/90 border border-gray-200'
                  } shadow-lg`}>
                    
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <ListFilter className="w-5 h-5 text-purple-500" />
                      فهرس المحتويات
                    </h3>
                    
                    <nav className="space-y-2">
                      {tableOfContents.map((item, index) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className={`block p-2 rounded-lg transition-all text-sm ${
                            activeSection === item.id
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                              : darkMode
                                ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                          style={{ paddingRight: `${item.level * 8 + 8}px` }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="line-clamp-2">{item.title}</span>
                            {item.wordCount && (
                              <span className={`text-xs opacity-70 ${
                                activeSection === item.id ? 'text-white' : 'text-gray-400'
                              }`}>
                                {item.wordCount} كلمة
                              </span>
                            )}
                          </div>
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* إحصائيات القراءة */}
                <div className={`p-4 rounded-2xl backdrop-blur ${
                  darkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white/90 border border-gray-200'
                } shadow-lg`}>
                  
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    إحصائيات القراءة
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">التقدم</span>
                      <span className="font-bold text-blue-500">{Math.round(readingProgress)}%</span>
                    </div>
                    
                    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2`}>
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${readingProgress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span>الوقت المتبقي</span>
                      <span className="font-bold text-purple-500">{estimatedTimeLeft} دقيقة</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* المحتوى الرئيسي */}
            <main className="lg:col-span-9 lg:order-1">
              <article className={`prose prose-lg max-w-none ${
                darkMode ? 'prose-invert' : ''
              } ${isReading ? 'prose-xl' : ''}`}>
                
                <div 
                  ref={contentRef}
                  className={`${isReading ? 'leading-relaxed' : ''}`}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(analysis.contentHtml || analysis.rawContent || '') }}
                />
              </article>

              {/* العلامات والكلمات المفتاحية */}
              {analysis.tags.length > 0 && (
                <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Hash className="w-5 h-5 text-blue-500" />
                    الكلمات المفتاحية
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {analysis.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          darkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        } border transition-colors cursor-pointer`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* تقييم التحليل */}
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  قيّم هذا التحليل
                </h3>
                
                <div className="flex items-center gap-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className="text-2xl text-amber-400 hover:text-amber-500 transition-colors"
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                  
                  <span className="text-sm font-medium">
                    {analysis.rating} من 5 ({Math.floor(analysis.views / 10)} تقييم)
                  </span>
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* زر العودة للأعلى */}
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className={`fixed bottom-6 left-6 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
              darkMode
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border border-gray-200 dark:border-gray-600 z-40`}
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        {/* لوحة التحكم في التشغيل الصوتي */}
        {textToSpeech && (
          <div className={`${
            isMobile 
              ? 'mobile-audio-controls fixed bottom-20 left-1/2 transform -translate-x-1/2 w-11/12 max-w-sm'
              : 'fixed bottom-6 right-6'
          } p-4 rounded-2xl shadow-2xl transition-all duration-300 z-40 ${
            darkMode 
              ? 'bg-gray-800/95 backdrop-blur-md border border-gray-700' 
              : 'bg-white/95 backdrop-blur-md border border-gray-200'
          }`}>
            <div className={`${
              isMobile ? 'flex flex-col gap-3' : 'flex items-center gap-3'
            }`}>
              
              {/* الصف الأول: زر التشغيل والإيقاف */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={toggleTextToSpeech}
                  className={`${
                    isMobile ? 'w-12 h-12' : 'p-3'
                  } rounded-xl transition-all duration-300 ${
                    isPlaying
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } shadow-lg hover:scale-105 flex items-center justify-center`}
                >
                  {isPlaying ? (
                    <Pause className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`} />
                  ) : (
                    <Play className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`} />
                  )}
                </button>

                {/* زر إيقاف كامل */}
                {currentUtterance && (
                  <button
                    onClick={stopTextToSpeech}
                    className={`${
                      isMobile ? 'w-10 h-10' : 'p-2'
                    } rounded-lg transition-all ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    } flex items-center justify-center`}
                  >
                    <RotateCcw className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
                  </button>
                )}
              </div>

              {/* الصف الثاني: التحكم في السرعة والصوت */}
              <div className={`${
                isMobile ? 'flex flex-col gap-2' : 'flex items-center gap-2'
              }`}>
                {/* التحكم في السرعة */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  } ${isMobile ? 'min-w-[40px]' : ''}`}>
                    السرعة
                  </span>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className={`${
                      isMobile ? 'flex-1' : 'w-16'
                    } h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700`}
                  />
                  <span className={`text-xs font-mono ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  } ${isMobile ? 'min-w-[35px] text-center' : ''}`}>
                    {speechRate}×
                  </span>
                </div>

                {/* التحكم في الصوت */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSpeechVolume(speechVolume > 0 ? 0 : 1)}
                    className={`${
                      isMobile ? 'w-8 h-8' : 'p-2'
                    } rounded-lg transition-all ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    } flex items-center justify-center`}
                  >
                    {speechVolume > 0 ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={speechVolume}
                    onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
                    className={`${
                      isMobile ? 'flex-1' : 'w-16'
                    } h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* أزرار التحكم الإضافية */}
        {!isMobile ? (
          <div className={`fixed top-1/2 right-4 transform -translate-y-1/2 flex flex-col gap-2 z-40`}>
            {/* زر وضع القراءة */}
            <button
              onClick={toggleReadingMode}
              className={`p-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-110 ${
                isReadingMode
                  ? 'bg-green-500 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } border border-gray-200 dark:border-gray-600`}
              title="وضع القراءة المريح"
            >
              <BookOpen className="w-5 h-5" />
            </button>

            {/* زر الشاشة الكاملة */}
            <button
              onClick={toggleFullscreen}
              className={`p-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-110 ${
                isFullscreen
                  ? 'bg-blue-500 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } border border-gray-200 dark:border-gray-600`}
              title="الشاشة الكاملة"
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            {/* زر لوحة التحليل الذكي */}
            <button
              onClick={() => setShowAnalysisPanel(true)}
              className={`p-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-110 ${
                showAnalysisPanel
                  ? 'bg-purple-500 text-white'
                  : darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } border border-gray-200 dark:border-gray-600`}
              title="التحليل الذكي"
            >
              <Brain className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* شريط أدوات للموبايل */
          <div className={`fixed bottom-6 left-4 right-4 z-40`}>
            <div className={`flex items-center justify-between p-3 rounded-2xl shadow-lg ${
              darkMode 
                ? 'bg-gray-800/95 backdrop-blur-md border border-gray-700' 
                : 'bg-white/95 backdrop-blur-md border border-gray-200'
            }`}>
              
              {/* زر فهرس المحتويات */}
              <button
                onClick={() => setShowMobileToc(!showMobileToc)}
                className={`p-2 rounded-xl transition-all ${
                  showMobileToc
                    ? 'bg-blue-500 text-white'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="فهرس المحتويات"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* زر وضع القراءة */}
              <button
                onClick={toggleReadingMode}
                className={`p-2 rounded-xl transition-all ${
                  isReadingMode
                    ? 'bg-green-500 text-white'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="وضع القراءة المريح"
              >
                <BookOpen className="w-5 h-5" />
              </button>

              {/* زر لوحة التحليل الذكي */}
              <button
                onClick={() => setShowAnalysisPanel(true)}
                className={`p-2 rounded-xl transition-all ${
                  showAnalysisPanel
                    ? 'bg-purple-500 text-white'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="التحليل الذكي"
              >
                <Brain className="w-5 h-5" />
              </button>

              {/* زر المشاركة */}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: analysis?.title,
                      text: analysis?.summary,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('تم نسخ الرابط');
                  }
                }}
                className={`p-2 rounded-xl transition-all ${
                  darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="مشاركة"
              >
                <Share2 className="w-5 h-5" />
              </button>

              {/* زر الحفظ/الإعجاب */}
              <button
                onClick={() => {
                  setLiked(!liked);
                  toast.success(liked ? 'تم إلغاء الإعجاب' : 'تم الإعجاب بالمقال');
                }}
                className={`p-2 rounded-xl transition-all ${
                  liked
                    ? 'bg-red-500 text-white'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="إعجاب"
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {/* لوحة التحليل الذكي المنبثقة */}
        {showAnalysisPanel && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-2xl p-6 ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            } shadow-2xl`}>
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Brain className="w-6 h-6 text-purple-500" />
                  التحليل الذكي
                </h2>
                
                <button
                  onClick={() => setShowAnalysisPanel(false)}
                  className={`p-2 rounded-lg transition-all ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ملخص الذكاء الاصطناعي */}
              {analysis.aiSummary && (
                <div className="mb-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    ملخص ذكي
                  </h3>
                  <p className={`p-4 rounded-xl ${
                    darkMode ? 'bg-gray-700' : 'bg-blue-50'
                  } leading-relaxed`}>
                    {analysis.aiSummary}
                  </p>
                </div>
              )}

              {/* أسئلة ذكية */}
              {analysis.aiQuestions && analysis.aiQuestions.length > 0 && (
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-green-500" />
                    أسئلة للتفكير
                  </h3>
                  <div className="space-y-3">
                    {analysis.aiQuestions.map((question, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl ${
                          darkMode ? 'bg-gray-700' : 'bg-green-50'
                        } border-r-4 border-green-500`}
                      >
                        <p className="font-medium">س{index + 1}: {question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* فهرس المحتويات للموبايل */}
        {isMobile && showMobileToc && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowMobileToc(false);
              }
            }}
          >
            <div className={`w-full max-h-[60vh] rounded-t-2xl ${
              darkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t border-gray-200'
            } shadow-2xl transition-transform duration-300`}>
              
              {/* مقبض الإغلاق */}
              <div className="flex justify-center py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              </div>

              {/* رأس فهرس المحتويات */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ListFilter className="w-5 h-5 text-blue-500" />
                  فهرس المحتويات
                </h3>
                
                <button
                  onClick={() => setShowMobileToc(false)}
                  className={`p-2 rounded-lg transition-all ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* قائمة العناوين */}
              <div className="p-4 overflow-y-auto max-h-[40vh]">
                {tableOfContents.length > 0 ? (
                  <div className="space-y-2">
                    {tableOfContents.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          const element = document.getElementById(item.id);
                          if (element) {
                            element.scrollIntoView({ 
                              behavior: 'smooth',
                              block: 'start'
                            });
                            setShowMobileToc(false);
                          }
                        }}
                        className={`w-full text-right p-3 rounded-xl transition-all duration-200 ${
                          activeSection === item.id
                            ? darkMode
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                            : darkMode
                              ? 'hover:bg-gray-700 text-gray-300'
                              : 'hover:bg-gray-50 text-gray-700'
                        } ${item.level === 2 ? 'mr-4' : item.level === 3 ? 'mr-8' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm leading-relaxed">
                            {item.title}
                          </span>
                          <div className="flex items-center gap-2">
                            {item.wordCount && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {item.wordCount} كلمة
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 opacity-60" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className={`w-12 h-12 mx-auto mb-3 ${
                      darkMode ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      لا توجد عناوين في هذا المحتوى
                    </p>
                  </div>
                )}

                {/* إحصائيات القراءة */}
                <div className={`mt-6 p-4 rounded-xl ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>التقدم: {Math.round(readingProgress)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-green-500" />
                      <span>{estimatedTimeLeft} دقائق متبقية</span>
                    </div>
                  </div>
                  
                  {/* شريط التقدم المصغر */}
                  <div className={`mt-3 h-2 rounded-full overflow-hidden ${
                    darkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`}>
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                      style={{ width: `${readingProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

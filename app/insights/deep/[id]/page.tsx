'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Brain, 
  Eye, 
  Clock3, 
  Share2, 
  Bookmark, 
  Download, 
  Printer, 
  Heart,
  MessageSquare,
  Calendar,
  User,
  Award,
  TrendingUp,
  RefreshCw,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  FileText,
  Target,
  BarChart3,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  ArrowUp
} from 'lucide-react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface DeepAnalysis {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  authorRole?: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt?: string;
  readTime: number;
  views: number;
  likes: number;
  shares: number;
  rating: number;
  status: 'published' | 'draft' | 'updated';
  aiConfidence?: number;
  tags: string[];
  category: string;
  type: 'AI' | 'تحرير بشري' | 'مختلط';
  analysisAngle: string; // زاوية التحليل
  keyInsights: string[]; // النقاط الرئيسية
  sources?: string[]; // المصادر
  relatedAnalyses?: RelatedAnalysis[];
}

interface RelatedAnalysis {
  id: string;
  title: string;
  summary: string;
  readTime: number;
  category: string;
  type: 'AI' | 'تحرير بشري';
}

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

export default function DeepAnalysisDetailPage() {
  const params = useParams();
  const { darkMode } = useDarkModeContext();
  const [analysis, setAnalysis] = useState<DeepAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAnalysisDetails();
  }, [params?.id]);

  useEffect(() => {
    if (analysis?.content) {
      generateTableOfContents();
    }
  }, [analysis?.content]);

  useEffect(() => {
    // مراقبة التمرير لتحديد القسم النشط وإظهار زر العودة للأعلى
    const handleScroll = () => {
      // إظهار زر العودة للأعلى
      setShowScrollTop(window.scrollY > 300);
      
      if (!contentRef.current) return;
      
      const sections = contentRef.current.querySelectorAll('h2, h3');
      const scrollPosition = window.scrollY + 100;
      
      sections.forEach((section) => {
        const element = section as HTMLElement;
        const { offsetTop, offsetHeight } = element;
        
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveSection(element.id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchAnalysisDetails = async () => {
    try {
      // محاكاة جلب البيانات
      setTimeout(() => {
        setAnalysis({
          id: (params?.id as string) || '1',
          title: "الذكاء الاصطناعي والمستقبل الاقتصادي للمملكة: رؤية شاملة للتحول التقني",
          summary: "تحليل معمق لدور الذكاء الاصطناعي في تحقيق رؤية 2030، وكيف تستفيد المملكة من هذه التقنية لبناء اقتصاد رقمي متطور. يستعرض التحليل الفرص والتحديات والاستراتيجيات المطلوبة لتحقيق التحول الرقمي الشامل.",
          content: `
# المقدمة

يشهد العالم اليوم ثورة تقنية غير مسبوقة، يقودها الذكاء الاصطناعي بوصفه المحرك الرئيسي للابتكار والتطور. وفي قلب هذا التحول، تبرز المملكة العربية السعودية كلاعب رئيسي يسعى لترسيخ مكانته في خارطة الذكاء الاصطناعي العالمية.

## السياق العالمي والمحلي

### التطورات العالمية
- نمو سوق الذكاء الاصطناعي بمعدل سنوي يتجاوز 35%
- استثمارات عالمية تقدر بـ 500 مليار دولار بحلول 2025
- تسابق الدول الكبرى على قيادة هذا القطاع الحيوي

### الموقف السعودي
تتميز المملكة بموقف استراتيجي فريد يمكّنها من الاستفادة من هذه الثورة:
- رؤية 2030 كإطار شامل للتحول الرقمي
- استثمارات ضخمة في البنية التحتية الرقمية
- شراكات استراتيجية مع عمالقة التقنية العالمية

## الفرص الاقتصادية

### 1. تنويع الاقتصاد
الذكاء الاصطناعي يفتح آفاقاً جديدة لتنويع الاقتصاد السعودي:

**القطاعات الواعدة:**
- الخدمات المالية الرقمية
- الصحة الذكية
- التعليم التفاعلي
- السياحة الذكية
- الزراعة الدقيقة

### 2. خلق فرص العمل
رغم المخاوف من الأتمتة، يُتوقع أن يخلق الذكاء الاصطناعي:
- 2.3 مليون وظيفة جديدة بحلول 2030
- تحول في طبيعة الوظائف نحو المهارات المتقدمة
- نمو في قطاع ريادة الأعمال التقنية

### 3. تحسين الإنتاجية
> "يمكن للذكاء الاصطناعي أن يرفع إنتاجية الاقتصاد السعودي بنسبة تصل إلى 40% في القطاعات الرئيسية" - تقرير ماكينزي 2024

## التحديات والحلول

### التحديات الرئيسية

#### 1. الفجوة في المهارات
- نقص الكوادر المتخصصة في الذكاء الاصطناعي
- الحاجة لإعادة تأهيل القوى العاملة الحالية

#### 2. البنية التحتية
- ضرورة تطوير مراكز البيانات المتقدمة
- تحسين شبكات الاتصال فائقة السرعة

#### 3. التحديات التنظيمية
- وضع أطر قانونية مرنة
- معالجة قضايا الخصوصية والأمان

### الحلول المقترحة

**1. الاستثمار في التعليم:**
- برامج متخصصة في الجامعات
- شراكات مع المؤسسات التعليمية العالمية
- منح دراسية في مجال الذكاء الاصطناعي

**2. تطوير البنية التحتية:**
- مشروع نيوم كنموذج للمدن الذكية
- الاستثمار في مراكز البيانات السحابية
- شبكات 5G و6G المستقبلية

**3. الإطار التنظيمي:**
- هيئة البيانات والذكاء الاصطناعي
- قوانين حماية البيانات المتوازنة
- معايير أخلاقية للذكاء الاصطناعي

## الاستراتيجية الوطنية

### الركائز الأساسية

1. **البحث والتطوير**
   - مراكز أبحاث متخصصة
   - تمويل المشاريع الابتكارية
   - براءات اختراع في مجال الذكاء الاصطناعي

2. **الشراكات الدولية**
   - تعاون مع Google وMicrosoft وAmazon
   - نقل التقنية والمعرفة
   - مشاريع مشتركة في التطوير

3. **التطبيقات الحكومية**
   - الخدمات الحكومية الذكية
   - تحسين كفاءة القطاع العام
   - اتخاذ القرارات المبنية على البيانات

## النتائج المتوقعة

### على المدى القصير (2025-2027)
- نمو قطاع التقنية بنسبة 50%
- توظيف 500,000 شخص في وظائف تقنية
- تحسين ترتيب المملكة في مؤشرات الابتكار

### على المدى المتوسط (2028-2030)
- المملكة ضمن أفضل 10 دول في الذكاء الاصطناعي
- مساهمة التقنية بـ 15% من الناتج المحلي
- تصدير الحلول التقنية للمنطقة

### على المدى الطويل (ما بعد 2030)
- مركز إقليمي للذكاء الاصطناعي
- اقتصاد معرفي متطور
- نموذج يُحتذى به في التحول الرقمي

## التوصيات

### للقطاع الحكومي
1. تسريع برامج التحول الرقمي
2. زيادة الاستثمار في البحث والتطوير
3. تسهيل إجراءات الأعمال للشركات التقنية

### للقطاع الخاص
1. الاستثمار في تدريب الموظفين
2. تبني حلول الذكاء الاصطناعي
3. التعاون مع الجامعات ومراكز الأبحاث

### للأفراد
1. تطوير المهارات الرقمية
2. التعلم المستمر في مجال التقنية
3. المشاركة في برامج التدريب المتخصصة

## الخلاصة

الذكاء الاصطناعي ليس مجرد تقنية، بل هو مستقبل الاقتصاد السعودي. النجاح في هذا التحول يتطلب رؤية واضحة، واستثمارات ذكية، وتعاوناً بين جميع القطاعات. المملكة تمتلك جميع المقومات لتكون رائدة في هذا المجال، والسنوات القادمة ستشهد تحولاً جذرياً في الاقتصاد السعودي بفضل الذكاء الاصطناعي.

---

*هذا التحليل يستند إلى أحدث البيانات والدراسات المتاحة حتى ديسمبر 2024*
          `,
          author: "فريق الذكاء الصحفي",
          authorRole: "محلل استراتيجي",
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          readTime: 15,
          views: 15420,
          likes: 892,
          shares: 234,
          rating: 4.8,
          status: 'published',
          aiConfidence: 94,
          tags: ["الذكاء الاصطناعي", "رؤية 2030", "الاقتصاد الرقمي", "التحول الرقمي"],
          category: "تقنية",
          type: 'AI',
          analysisAngle: "تحليل استراتيجي اقتصادي",
          keyInsights: [
            "الذكاء الاصطناعي سيساهم بـ 15% من الناتج المحلي بحلول 2030",
            "خلق 2.3 مليون وظيفة جديدة في القطاع التقني",
            "المملكة ستصبح مركزاً إقليمياً للذكاء الاصطناعي",
            "استثمارات تتجاوز 100 مليار ريال في البنية التحتية الرقمية"
          ],
          sources: [
            "تقرير ماكينزي للذكاء الاصطناعي 2024",
            "الهيئة السعودية للبيانات والذكاء الاصطناعي",
            "منتدى الاقتصاد العالمي - تقرير التنافسية الرقمية"
          ],
          relatedAnalyses: [
            {
              id: "2",
              title: "التحول الرقمي في القطاع المصرفي السعودي",
              summary: "دراسة شاملة للتحديات والفرص في رقمنة الخدمات المالية",
              readTime: 10,
              category: "اقتصاد",
              type: "تحرير بشري"
            },
            {
              id: "3",
              title: "مستقبل التعليم الذكي في المملكة",
              summary: "كيف يغير الذكاء الاصطناعي منظومة التعليم السعودية",
              readTime: 8,
              category: "تعليم",
              type: "AI"
            }
          ]
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      toast.error('حدث خطأ في تحميل التحليل');
      setLoading(false);
    }
  };

  const generateTableOfContents = () => {
    if (!contentRef.current) return;
    
    const headings = contentRef.current.querySelectorAll('h2, h3');
    const toc: TableOfContentsItem[] = [];
    
    headings.forEach((heading, index) => {
      const id = `section-${index}`;
      heading.id = id;
      
      toc.push({
        id,
        title: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1))
      });
    });
    
    setTableOfContents(toc);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100; // للتعويض عن الهيدر الثابت
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: analysis?.title,
          text: analysis?.summary,
          url: window.location.href,
        });
        
        // تحديث عدد المشاركات
        if (analysis) {
          setAnalysis({ ...analysis, shares: analysis.shares + 1 });
        }
        toast.success('تم المشاركة بنجاح');
      } else {
        // Fallback to copying link
        await navigator.clipboard.writeText(window.location.href);
        toast.success('تم نسخ الرابط');
      }
    } catch (err) {
      // في حالة إلغاء المشاركة أو حدوث خطأ
      if ((err as Error).name !== 'AbortError') {
        navigator.clipboard.writeText(window.location.href);
        toast.success('تم نسخ الرابط');
      }
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
    toast.success(liked ? 'تم إلغاء الإعجاب' : 'تم الإعجاب');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // في الإنتاج، سيتم تحويل المحتوى إلى PDF
    toast.success('جاري تحضير ملف PDF...');
  };

  const handleUpdateAnalysis = () => {
    toast.success('جاري تحديث التحليل بأحدث البيانات...');
    // في الإنتاج، سيتم إعادة توليد التحليل عبر AI
  };

  const renderContent = (content: string) => {
    // تحويل Markdown إلى HTML
    const lines = content.split('\n');
    const html: React.ReactElement[] = [];
    let currentList: string[] = [];
    let isInList = false;

    lines.forEach((line, index) => {
      // العناوين
      if (line.startsWith('# ')) {
        html.push(
          <h1 key={index} className={`text-3xl font-bold mb-6 mt-8 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        html.push(
          <h2 key={index} className={`text-2xl font-bold mb-4 mt-6 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        html.push(
          <h3 key={index} className={`text-xl font-bold mb-3 mt-4 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        html.push(
          <h4 key={index} className={`text-lg font-bold mb-2 mt-3 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {line.substring(5)}
          </h4>
        );
      }
      // القوائم
      else if (line.startsWith('- ')) {
        if (!isInList) {
          isInList = true;
          currentList = [];
        }
        currentList.push(line.substring(2));
      } else {
        // إنهاء القائمة إذا كانت موجودة
        if (isInList && currentList.length > 0) {
          html.push(
            <ul key={`list-${index}`} className={`list-disc list-inside mb-4 space-y-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {currentList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          );
          currentList = [];
          isInList = false;
        }
        
        // الاقتباسات
        if (line.startsWith('> ')) {
          html.push(
            <blockquote key={index} className={`border-r-4 border-blue-500 pr-4 my-4 italic ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {line.substring(2)}
            </blockquote>
          );
        }
        // الخط الأفقي
        else if (line.trim() === '---') {
          html.push(
            <hr key={index} className={`my-8 ${
              darkMode ? 'border-gray-700' : 'border-gray-300'
            }`} />
          );
        }
        // النص العادي
        else if (line.trim() !== '') {
          // معالجة النص الغامق والمائل
          let processedLine = line;
          processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
          
          html.push(
            <p key={index} className={`mb-4 leading-relaxed ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`} dangerouslySetInnerHTML={{ __html: processedLine }} />
          );
        }
      }
    });

    // إضافة آخر قائمة إذا انتهى المحتوى بقائمة
    if (isInList && currentList.length > 0) {
      html.push(
        <ul key="final-list" className={`list-disc list-inside mb-4 space-y-2 ${
          darkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {currentList.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }

    return html;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              جاري تحميل التحليل...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${
              darkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              لم يتم العثور على التحليل
            </p>
            <Link 
              href="/insights/deep" 
              className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              العودة للتحليلات
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      
      {/* Hero Section مع خلفية متدرجة */}
      <div className={`relative overflow-hidden ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/20' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50/50 to-indigo-50'
      }`}>
        {/* خلفية هندسية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500 rounded-full blur-3xl"></div>
        </div>



        {/* Hero Content */}
        <div className="relative container mx-auto px-4 py-12 max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            {/* الشارات */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <span className="inline-flex items-center px-6 py-3 rounded-full text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl">
                <Brain className="w-5 h-5 ml-2" />
                تحليل عميق
              </span>
              {analysis.type === 'AI' && (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 shadow-lg">
                  <Sparkles className="w-4 h-4 ml-1" />
                  بواسطة الذكاء الاصطناعي
                </span>
              )}
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-lg ${
                darkMode 
                  ? 'bg-gray-800 text-gray-300 border border-gray-700' 
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}>
                {analysis.category}
              </span>
            </div>

            {/* العنوان */}
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {analysis.title}
            </h1>

            {/* الملخص */}
            <p className={`text-xl md:text-2xl leading-relaxed mb-8 max-w-3xl mx-auto ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {analysis.summary}
            </p>

            {/* معلومات النشر */}
            <div className={`flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-base mb-8 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <User className="w-5 h-5" />
                {analysis.author}
              </span>
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Calendar className="w-5 h-5" />
                {new Date(analysis.createdAt).toLocaleDateString('ar-SA')}
              </span>
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock3 className="w-5 h-5" />
                {analysis.readTime} دقيقة قراءة
              </span>
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Eye className="w-5 h-5" />
                {analysis.views.toLocaleString()} مشاهدة
              </span>
            </div>

            {/* الوسوم */}
            <div className="flex flex-wrap justify-center gap-3">
              {analysis.tags.map((tag, index) => (
                <Link 
                  key={index}
                  href={`/insights/deep?tag=${encodeURIComponent(tag)}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${
                    darkMode 
                      ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-700' 
                      : 'bg-white/80 text-gray-700 hover:bg-white border border-gray-200'
                  } backdrop-blur-sm shadow-lg`}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* المحتوى */}
          <div className="lg:col-span-9 lg:order-1">
            <article className={`rounded-3xl p-8 shadow-xl ${
              darkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}>
              {/* النقاط الرئيسية */}
              {analysis.keyInsights && analysis.keyInsights.length > 0 && (
                <div className={`rounded-2xl p-6 mb-8 key-insights ${
                  darkMode 
                    ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/50' 
                    : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
                }`}>
                  <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <div className="p-2 rounded-lg bg-yellow-500/20">
                      <Lightbulb className="w-6 h-6 text-yellow-500" />
                    </div>
                    النقاط الرئيسية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.keyInsights.map((insight, index) => (
                      <div key={index} className={`flex items-start gap-3 p-4 rounded-xl ${
                        darkMode ? 'bg-gray-800/50' : 'bg-white/70'
                      }`}>
                        <div className="p-1 rounded-full bg-green-500/20">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        </div>
                        <span className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {insight}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* المحتوى */}
              <div 
                ref={contentRef}
                className={`deep-analysis-content prose prose-lg max-w-none ${
                  darkMode ? 'prose-invert' : ''
                } prose-headings:scroll-mt-32`}
              >
                {renderContent(analysis.content)}
              </div>

              {/* المصادر */}
              {analysis.sources && analysis.sources.length > 0 && (
                <div className={`mt-12 pt-8 border-t ${
                  darkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <h3 className={`text-xl font-bold mb-6 flex items-center gap-3 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                    المصادر والمراجع
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.sources.map((source, index) => (
                      <div key={index} className={`flex items-start gap-3 p-4 rounded-xl ${
                        darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                        <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {source}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </div>

          {/* الشريط الجانبي الأيمن */}
          <aside className="lg:col-span-3 lg:order-2">
            <div className="space-y-6">
              {/* بطاقة سريعة للإحصائيات */}
              <div className={`rounded-2xl p-6 shadow-xl ${
                darkMode 
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' 
                  : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  الإحصائيات
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {analysis.views.toLocaleString()}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      مشاهدة
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {analysis.likes.toLocaleString()}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      إعجاب
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {analysis.shares.toLocaleString()}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      مشاركة
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-lg ${i < Math.floor(analysis.rating) ? 'text-yellow-500' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      ({analysis.rating})
                    </div>
                  </div>
                </div>
              </div>

              {/* معلومات الكاتب المحسنة */}
              <div className={`rounded-2xl p-6 shadow-xl ${
                darkMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border border-gray-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  عن الكاتب
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                    analysis.type === 'AI' 
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                      : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                  }`}>
                    {analysis.type === 'AI' ? (
                      <Brain className="w-8 h-8 text-white" />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className={`font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {analysis.author}
                    </h4>
                    {analysis.authorRole && (
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {analysis.authorRole}
                      </p>
                    )}
                  </div>
                </div>
                {analysis.type === 'AI' && (
                  <div className={`p-4 rounded-xl ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-sm font-medium ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        مستوى الثقة
                      </span>
                      <span className={`text-lg font-bold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {analysis.aiConfidence}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 shadow-lg"
                        style={{ width: `${analysis.aiConfidence}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* زاوية التحليل المحسنة */}
              <div className={`rounded-2xl p-6 shadow-xl ${
                darkMode 
                  ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-800/50' 
                  : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200'
              }`}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-3 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Target className="w-5 h-5 text-purple-500" />
                  </div>
                  زاوية التحليل
                </h3>
                <p className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {analysis.analysisAngle}
                </p>
              </div>

              {/* الإجراءات المحسنة */}
              <div className={`rounded-2xl p-6 space-y-3 shadow-xl no-print ${
                darkMode 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border border-gray-200'
              }`}>
                {analysis.type === 'AI' && (
                  <button
                    onClick={handleUpdateAnalysis}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <RefreshCw className="w-5 h-5" />
                    تحديث التحليل
                  </button>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                  <button
                    onClick={handlePrint}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    <Printer className="w-4 h-4" />
                    طباعة
                  </button>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* تحليلات مشابهة */}
      {analysis.relatedAnalyses && analysis.relatedAnalyses.length > 0 && (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className={`rounded-3xl p-8 shadow-xl ${
            darkMode 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          }`}>
            <h2 className={`text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              <div className="p-3 rounded-lg bg-green-500/20">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              تحليلات مشابهة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysis.relatedAnalyses.map((related) => (
                <Link key={related.id} href={`/insights/deep/${related.id}`}>
                  <article className={`p-6 rounded-2xl transition-all duration-300 hover:transform hover:-translate-y-2 cursor-pointer group ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 border border-gray-600' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                  } hover:shadow-2xl`}>
                    <div className="flex items-center gap-2 mb-4">
                      {related.type === 'AI' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          <Brain className="w-3 h-3 ml-1" />
                          AI
                        </span>
                      )}
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {related.category}
                      </span>
                    </div>
                    <h3 className={`font-bold text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {related.title}
                    </h3>
                    <p className={`text-sm mb-4 line-clamp-3 leading-relaxed ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {related.summary}
                    </p>
                    <div className={`flex items-center justify-between text-sm ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      <span className="flex items-center gap-2">
                        <Clock3 className="w-4 h-4" />
                        {related.readTime} دقيقة قراءة
                      </span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* زر العودة للأعلى محسن */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 left-8 p-4 rounded-full shadow-xl transition-all no-print ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        } ${
          darkMode 
            ? 'bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white' 
            : 'bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 text-gray-900'
        } border-2 ${darkMode ? 'border-gray-600' : 'border-gray-200'} hover:scale-110`}
        aria-label="العودة للأعلى"
      >
        <ArrowUp className="w-6 h-6" />
      </button>

      <Footer />
    </div>
  );
} 
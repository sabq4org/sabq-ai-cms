'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowRight, Clock, Eye, Heart, Share2, Bookmark, 
  User, Calendar, Brain, Tag, TrendingUp, MessageSquare,
  Facebook, Twitter, Linkedin, Copy, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useDarkMode } from '@/hooks/useDarkMode';
import toast from 'react-hot-toast';
import Header from '@/components/Header';

interface DeepInsight {
  id: string;
  title: string;
  summary: string;
  content?: string;
  author: string;
  createdAt: string;
  readTime: number;
  views: number;
  aiConfidence: number;
  tags: string[];
  type: 'AI' | 'تحرير بشري';
  url: string;
  relatedInsights?: any[];
}

export default function DeepInsightPage() {
  const params = useParams();
  const router = useRouter();
  const { darkMode } = useDarkMode();
  const [insight, setInsight] = useState<DeepInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params?.id) {
      fetchInsight();
    }
  }, [params?.id]);

  const fetchInsight = async () => {
    try {
      // في الإنتاج، سيتم جلب البيانات من API
      // مؤقتاً، نستخدم بيانات تجريبية
      const mockInsight: DeepInsight = {
        id: params?.id as string || 'deep-001',
        title: "مستقبل التعليم في عصر الرقمنة: التجربة السعودية كنموذج عالمي",
        summary: "تحليل شامل للتحول الرقمي في قطاع التعليم السعودي وتأثيره على جودة التعليم ومخرجاته، مع دراسة مقارنة للتجارب العالمية الرائدة",
        content: `
## المقدمة

يشهد قطاع التعليم في المملكة العربية السعودية تحولاً جذرياً نحو الرقمنة، مدفوعاً برؤية 2030 والتطورات التقنية المتسارعة. هذا التحول ليس مجرد استجابة للظروف العالمية، بل استراتيجية طموحة لبناء جيل قادر على المنافسة في اقتصاد المعرفة العالمي.

## الوضع الراهن والسياق

### البنية التحتية الرقمية
استثمرت المملكة أكثر من 20 مليار ريال في تطوير البنية التحتية الرقمية للتعليم خلال السنوات الخمس الماضية. تشمل هذه الاستثمارات:

- **منصات التعلم الإلكتروني**: تطوير منصة مدرستي التي تخدم أكثر من 6 ملايين طالب
- **الفصول الذكية**: تجهيز 95% من المدارس الحكومية بتقنيات التعليم الحديثة
- **شبكات الإنترنت**: توفير اتصال عالي السرعة لجميع المؤسسات التعليمية

### الإحصائيات والأرقام
- **نسبة الرقمنة**: 87% من المناهج الدراسية متاحة رقمياً
- **معدل الاستخدام**: 4.2 مليون طالب يستخدمون المنصات الرقمية يومياً
- **رضا المستخدمين**: 78% من الطلاب وأولياء الأمور راضون عن التجربة الرقمية

## التحديات الرئيسية

### 1. الفجوة الرقمية
رغم التقدم المحرز، لا تزال هناك تحديات في الوصول المتكافئ للتقنية:
- تفاوت في جودة الإنترنت بين المناطق الحضرية والريفية
- اختلاف في مستوى امتلاك الأجهزة الذكية بين الأسر

### 2. التدريب والتأهيل
- حاجة 35% من المعلمين لتدريب متقدم على استخدام التقنيات الحديثة
- ضرورة تطوير المهارات الرقمية للطلاب بشكل مستمر

### 3. جودة المحتوى الرقمي
- التحدي في إنتاج محتوى تفاعلي عالي الجودة باللغة العربية
- الحاجة لمعايير موحدة لضمان جودة المحتوى التعليمي الرقمي

## الفرص المستقبلية والابتكارات

### الذكاء الاصطناعي في التعليم
- **التعلم التكيفي**: أنظمة تتكيف مع مستوى وسرعة تعلم كل طالب
- **المساعدون الافتراضيون**: دعم الطلاب على مدار الساعة
- **التقييم الذكي**: تحليل أداء الطلاب وتقديم توصيات مخصصة

### الواقع الافتراضي والمعزز
- **المختبرات الافتراضية**: توفير تجارب علمية آمنة وغير محدودة
- **الرحلات الميدانية الرقمية**: استكشاف العالم من داخل الفصل
- **التعلم التجريبي**: محاكاة بيئات العمل الحقيقية

## الأثر المتوقع

### على المدى القصير (1-3 سنوات)
- زيادة معدلات النجاح بنسبة 15%
- تحسين مهارات القرن 21 لدى الطلاب
- خفض تكاليف التعليم بنسبة 20%

### على المدى الطويل (5-10 سنوات)
- تخريج جيل متمكن رقمياً وقادر على الابتكار
- تحول المملكة لمركز إقليمي للتعليم الرقمي
- مساهمة قطاع التعليم التقني في الناتج المحلي بنسبة 5%

## دراسات الحالة والأمثلة

### نموذج جامعة الملك عبدالله للعلوم والتقنية (كاوست)
- رائدة في استخدام التقنيات المتقدمة في التعليم والبحث
- نموذج للتكامل بين التعليم التقليدي والرقمي
- معدل توظيف خريجين يصل إلى 95%

### تجربة مدارس الرياض الدولية
- تطبيق نظام التعلم الهجين بنجاح
- استخدام الذكاء الاصطناعي في تخصيص المسارات التعليمية
- تحقيق نتائج متميزة في الاختبارات الدولية

## التوصيات الاستراتيجية

### 1. تعزيز البنية التحتية
- استثمار إضافي بقيمة 10 مليار ريال في السنوات الثلاث القادمة
- توفير أجهزة ذكية مدعومة للأسر محدودة الدخل
- تطوير شبكة 5G في جميع المؤسسات التعليمية

### 2. تطوير الكوادر البشرية
- برنامج وطني لتدريب 100,000 معلم على التقنيات الحديثة
- إنشاء أكاديمية وطنية للتعليم الرقمي
- شراكات مع الجامعات العالمية لتبادل الخبرات

### 3. الابتكار في المحتوى
- مسابقة وطنية سنوية لأفضل محتوى تعليمي رقمي
- دعم الشركات الناشئة في مجال تقنيات التعليم
- تطوير منصة موحدة للموارد التعليمية المفتوحة

### 4. الحوكمة والتنظيم
- وضع معايير وطنية للتعليم الرقمي
- إنشاء هيئة مستقلة لضمان جودة التعليم الإلكتروني
- تحديث اللوائح لمواكبة التطورات التقنية

### 5. الشراكات الاستراتيجية
- التعاون مع عمالقة التقنية العالمية
- شراكات مع المؤسسات التعليمية الرائدة
- برامج تبادل المعرفة مع الدول المتقدمة

## الخلاصة والنظرة المستقبلية

التحول الرقمي في التعليم السعودي ليس مجرد ضرورة، بل فرصة ذهبية لبناء نظام تعليمي متقدم يضع المملكة في مقدمة الدول الرائدة تعليمياً. النجاح في هذا التحول يتطلب رؤية واضحة، واستثمارات مستدامة، وإرادة قوية للتغيير.

المملكة تمتلك جميع المقومات اللازمة للنجاح: الموارد المالية، والإرادة السياسية، والشباب الطموح. ما نحتاجه الآن هو التنفيذ الفعال والمتابعة المستمرة لضمان تحقيق الأهداف المرجوة.

بحلول عام 2030، نتوقع أن تكون المملكة نموذجاً يُحتذى به في التعليم الرقمي، ليس فقط على المستوى الإقليمي، بل على المستوى العالمي. هذا التحول سيساهم بشكل مباشر في تحقيق رؤية المملكة 2030 وبناء اقتصاد معرفي مزدهر.
        `,
        author: "فريق الذكاء الصحفي",
        createdAt: new Date().toISOString(),
        readTime: 8,
        views: 9650,
        aiConfidence: 94,
        tags: ["التعليم الرقمي", "جودة التعليم", "رؤية 2030"],
        type: "AI",
        url: `/insights/deep/${params?.id || 'deep-001'}`,
        relatedInsights: [
          {
            id: "deep-002",
            title: "التحول الاقتصادي في المملكة: من النفط إلى الاقتصاد المتنوع",
            type: "تحرير بشري"
          },
          {
            id: "deep-003",
            title: "الذكاء الاصطناعي في الصحافة: كيف تعيد التقنية تشكيل الإعلام؟",
            type: "تحرير بشري"
          }
        ]
      };

      setInsight(mockInsight);
    } catch (error) {
      console.error('Error fetching insight:', error);
      toast.error('حدث خطأ في تحميل التحليل');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    toast.success(liked ? 'تم إلغاء الإعجاب' : 'تم الإعجاب بالتحليل');
  };

  const handleSave = () => {
    setSaved(!saved);
    toast.success(saved ? 'تم إزالة التحليل من المحفوظات' : 'تم حفظ التحليل');
  };

  const handleShare = async (platform?: string) => {
    const url = window.location.href;
    const title = insight?.title || '';

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('تم نسخ الرابط');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error('فشل نسخ الرابط');
      }
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else {
      // Native share
      try {
        await navigator.share({
          title: title,
          text: insight?.summary,
          url: url,
        });
      } catch (err) {
        // Fallback to copy
        handleShare('copy');
      }
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!insight) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header />
        <div className="flex flex-col items-center justify-center h-96">
          <p className={`text-lg mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            لم يتم العثور على التحليل
          </p>
          <Button onClick={() => router.push('/dashboard/deep-analysis')}>
            العودة للتحليلات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      
      {/* Hero Section */}
      <section className={`relative py-12 ${
        darkMode 
          ? 'bg-gradient-to-b from-purple-900/20 to-gray-900' 
          : 'bg-gradient-to-b from-purple-50 to-gray-50'
      }`}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <ol className="flex items-center gap-2 text-sm">
                <li>
                  <a href="/" className={`hover:text-purple-600 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    الرئيسية
                  </a>
                </li>
                <li className={darkMode ? 'text-gray-600' : 'text-gray-400'}>/</li>
                <li>
                  <a href="/dashboard/deep-analysis" className={`hover:text-purple-600 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    التحليل العميق
                  </a>
                </li>
                <li className={darkMode ? 'text-gray-600' : 'text-gray-400'}>/</li>
                <li className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                  {insight.title.substring(0, 30)}...
                </li>
              </ol>
            </nav>

            {/* Header Info */}
            <div className="flex items-center gap-3 mb-4">
              <Badge 
                variant="secondary" 
                className={`flex items-center gap-1 ${
                  darkMode 
                    ? 'bg-purple-900/50 text-purple-300' 
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                <Brain className="w-3 h-3" />
                تحليل عميق
              </Badge>
              {insight.type === "AI" && (
                <Badge 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0"
                >
                  تم إنتاجه بالذكاء الاصطناعي
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className={`text-3xl md:text-4xl font-bold mb-4 leading-relaxed ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {insight.title}
            </h1>

            {/* Summary */}
            <p className={`text-lg mb-6 leading-relaxed ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {insight.summary}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm mb-8">
              <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <User className="w-4 h-4" />
                {insight.author}
              </span>
              <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Calendar className="w-4 h-4" />
                {new Date(insight.createdAt).toLocaleDateString('ar-SA')}
              </span>
              <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Clock className="w-4 h-4" />
                {insight.readTime} دقائق قراءة
              </span>
              <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Eye className="w-4 h-4" />
                {insight.views.toLocaleString()} مشاهدة
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                className={liked ? 'text-red-500 border-red-500' : ''}
              >
                <Heart className={`w-4 h-4 ml-1 ${liked ? 'fill-current' : ''}`} />
                {liked ? 'تم الإعجاب' : 'إعجاب'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                className={saved ? 'text-purple-600 border-purple-600' : ''}
              >
                <Bookmark className={`w-4 h-4 ml-1 ${saved ? 'fill-current' : ''}`} />
                {saved ? 'تم الحفظ' : 'حفظ'}
              </Button>
              <div className="relative group">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare()}
                >
                  <Share2 className="w-4 h-4 ml-1" />
                  مشاركة
                </Button>
                <div className={`absolute top-full left-0 mt-2 p-2 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
                  darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleShare('twitter')}
                      className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                      title="Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                      title="Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare('linkedin')}
                      className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                      title="نسخ الرابط"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className={`p-8 md:p-12 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              {/* AI Confidence Badge */}
              {insight.type === 'AI' && (
                <div className={`mb-8 p-4 rounded-lg ${
                  darkMode ? 'bg-purple-900/20' : 'bg-purple-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <span className={`text-sm font-medium ${
                        darkMode ? 'text-purple-300' : 'text-purple-700'
                      }`}>
                        تم إنتاج هذا التحليل بواسطة الذكاء الاصطناعي
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${
                        darkMode ? 'text-purple-400' : 'text-purple-600'
                      }`}>
                        مستوى الثقة:
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                            style={{ width: `${insight.aiConfidence}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-purple-600">
                          {insight.aiConfidence}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Article Content */}
              <div className={`prose prose-lg max-w-none ${
                darkMode ? 'prose-invert' : ''
              }`}>
                <div 
                  dangerouslySetInnerHTML={{ __html: insight.content?.replace(/\n/g, '<br>') || '' }}
                  className="leading-relaxed"
                />
              </div>

              {/* Tags */}
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className={`text-lg font-bold mb-4 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  الكلمات المفتاحية
                </h3>
                <div className="flex flex-wrap gap-2">
                  {insight.tags.map((tag, index) => (
                    <a
                      key={index}
                      href={`/dashboard/deep-analysis?tag=${encodeURIComponent(tag)}`}
                      className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm transition-colors ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </a>
                  ))}
                </div>
              </div>
            </Card>

            {/* Related Insights */}
            {insight.relatedInsights && insight.relatedInsights.length > 0 && (
              <div className="mt-12">
                <h2 className={`text-2xl font-bold mb-6 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  تحليلات ذات صلة
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {insight.relatedInsights.map((related) => (
                    <a
                      key={related.id}
                      href={`/insights/deep/${related.id}`}
                      className="group"
                    >
                      <Card className={`p-6 h-full transition-all duration-300 hover:shadow-lg ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <Badge 
                            variant="secondary"
                            className={`text-xs ${
                              related.type === 'AI'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                            }`}
                          >
                            {related.type}
                          </Badge>
                          <ArrowRight className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`} />
                        </div>
                        <h3 className={`font-bold text-lg group-hover:text-purple-600 transition-colors ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {related.title}
                        </h3>
                      </Card>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section Placeholder */}
            <div className="mt-12">
              <Card className={`p-8 text-center ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${
                  darkMode ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <h3 className={`text-lg font-bold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  التعليقات قريباً
                </h3>
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  نعمل على تطوير نظام التعليقات لتتمكن من مشاركة أفكارك
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 
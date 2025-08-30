'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import CommentsTrigger from '@/components/comments/CommentsTrigger'
// import PersonalizedTrigger from '@/components/personalized/PersonalizedTrigger' // 🔴 مُعطل مؤقتاً للقياس
import { 
  Clock, 
  Eye, 
  MessageCircle, 
  Sparkles, 
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  AlertCircle
} from 'lucide-react'

// محاكاة مقال للاختبار
const mockArticle = {
  id: 'test-article-123',
  title: 'السعودية تطلق مشروعاً رائداً في الذكاء الاصطناعي ضمن رؤية 2030',
  content: `
    <div class="prose prose-lg max-w-none">
      <p class="lead">أعلنت المملكة العربية السعودية اليوم عن إطلاق مشروع طموح في مجال الذكاء الاصطناعي كجزء من رؤية 2030، يهدف إلى تعزيز مكانة المملكة كمركز عالمي للتقنيات المتطورة.</p>
      
      <h2>أهداف المشروع</h2>
      <p>يسعى المشروع إلى تحقيق عدة أهداف استراتيجية منها:</p>
      <ul>
        <li>تطوير حلول ذكية للمدن السعودية</li>
        <li>تعزيز الكفاءة في القطاعات الحكومية</li>
        <li>خلق فرص عمل جديدة في مجال التقنية</li>
        <li>جذب الاستثمارات العالمية</li>
      </ul>

      <h2>التأثير المتوقع</h2>
      <p>من المتوقع أن يسهم هذا المشروع في تحويل الاقتصاد السعودي وتعزيز قدرته التنافسية على المستوى العالمي، خاصة في ظل التوجه نحو اقتصاد المعرفة.</p>

      <blockquote>
        "هذا المشروع يمثل خطوة مهمة نحو مستقبل تقني متطور يخدم المواطن والاقتصاد الوطني" - متحدث رسمي
      </blockquote>

      <p>وتأتي هذه الخطوة في إطار الجهود المستمرة لتحقيق أهداف رؤية 2030 وتنويع مصادر الدخل في المملكة.</p>
    </div>
  `,
  publishedAt: new Date(),
  author: 'محمد السعدي',
  category: 'تقنية',
  views: 1247,
  readTime: 5,
  commentsCount: 23
}

export default function OnDemandTestPageNoPersonalized() {
  const [stats, setStats] = useState({
    pageViews: 0,
    commentsOpened: 0,
    personalizedOpened: 0,
    engagementRate: 0,
    loadTime: 0
  })
  
  const [pageLoadStart] = useState(performance.now())
  const [pageLoadTime, setPageLoadTime] = useState(0)

  // قياس وقت تحميل الصفحة
  useEffect(() => {
    const loadTime = performance.now() - pageLoadStart
    setPageLoadTime(Math.round(loadTime))
    setStats(prev => ({ ...prev, loadTime: Math.round(loadTime) }))
  }, [pageLoadStart])

  // محاكاة إحصائيات
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        pageViews: prev.pageViews + Math.floor(Math.random() * 3) + 1
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleStatsUpdate = (event: string) => {
    setStats(prev => {
      const updated = { ...prev }
      if (event === 'open_comments') {
        updated.commentsOpened++
      }
      
      updated.engagementRate = updated.pageViews > 0 ? 
        Math.round((updated.commentsOpened / updated.pageViews) * 100) : 0
      
      return updated
    })
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          ⚡ اختبار الأداء: بدون المحتوى المخصص
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          قياس سرعة تحميل الصفحة بدون مكون المحتوى المخصص للمقارنة
        </p>
        <div className="flex justify-center gap-4">
          <Badge variant="outline" className="gap-1">
            <Zap className="h-3 w-3" />
            اختبار الأداء
          </Badge>
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            مكون مُعطل
          </Badge>
        </div>
      </div>

      {/* مؤشر وقت التحميل */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="font-medium">وقت تحميل الصفحة</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {pageLoadTime}ms
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            قياس فوري لسرعة التحميل بدون المحتوى المخصص
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* المحتوى الرئيسي */}
        <div className="lg:col-span-2 space-y-6">
          {/* المقال */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl leading-tight">
                    {mockArticle.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {mockArticle.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {mockArticle.readTime} دقائق
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {mockArticle.views} مشاهدة
                    </span>
                    <Badge variant="secondary">
                      {mockArticle.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-arabic max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: mockArticle.content }}
              />
            </CardContent>
          </Card>

          {/* التعليقات On-Demand */}
          <CommentsTrigger 
            articleId={mockArticle.id}
            initialCount={mockArticle.commentsCount}
          />

          {/* ملاحظة عن المكون المُعطل */}
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-300">
                    المحتوى المخصص معطل مؤقتاً
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    تم إخفاء مكون "مخصص لك بذكاء" لقياس تأثيره على سرعة التحميل. 
                    يمكن مقارنة الأرقام مع النسخة الكاملة لمعرفة الفرق الفعلي.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الشريط الجانبي - الإحصائيات */}
        <div className="space-y-6">
          {/* قياس الأداء الفوري */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-green-700">
                <TrendingUp className="h-5 w-5" />
                قياس الأداء الفوري
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">
                  {pageLoadTime}ms
                </div>
                <div className="text-sm text-green-700 mt-1">
                  وقت تحميل الصفحة
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>تحميل HTML:</span>
                  <span className="font-medium">~300-500ms</span>
                </div>
                <div className="flex justify-between">
                  <span>تحميل JavaScript:</span>
                  <span className="font-medium">~400-600ms</span>
                </div>
                <div className="flex justify-between">
                  <span>المحتوى المخصص:</span>
                  <span className="font-medium text-green-600">0ms ✅</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* إحصائيات عامة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                إحصائيات التفاعل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.pageViews}
                  </div>
                  <div className="text-xs text-gray-600">مشاهدة صفحة</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.commentsOpened}
                  </div>
                  <div className="text-xs text-gray-600">فتح تعليقات</div>
                </div>
              </div>
              
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200">
                <div className="text-xl font-bold text-red-600">
                  معطل
                </div>
                <div className="text-xs text-red-600">المحتوى المخصص</div>
              </div>
            </CardContent>
          </Card>

          {/* نتائج القياس */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-purple-500" />
                نتائج القياس
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="font-medium text-green-800 dark:text-green-300">
                  ✅ مزايا إخفاء المكون:
                </div>
                <ul className="mt-2 space-y-1 text-green-700 dark:text-green-400">
                  <li>• لا يتم تحميل API المحتوى المخصص</li>
                  <li>• لا يتم تحميل مكونات PersonalizedTrigger</li>
                  <li>• Bundle أصغر في التحميل الأولي</li>
                  <li>• ذاكرة أقل استخداماً</li>
                </ul>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="font-medium text-blue-800 dark:text-blue-300">
                  📊 للمقارنة:
                </div>
                <div className="mt-2 text-blue-700 dark:text-blue-400">
                  اختبر النسخة الكاملة في <code>/test-on-demand</code> وقارن الأوقات
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">
            🔬 اختبار مقارنة الأداء
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            هذه النسخة بدون المحتوى المخصص - قارن الأرقام مع النسخة الكاملة
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3 text-green-500" />
              وقت أقل: {pageLoadTime}ms
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3 text-blue-500" />
              Bundle أصغر
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

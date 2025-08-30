'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import CommentsTrigger from '@/components/comments/CommentsTrigger'
import PersonalizedTrigger from '@/components/personalized/PersonalizedTrigger'
import { 
  Clock, 
  Eye, 
  MessageCircle, 
  Sparkles, 
  TrendingUp,
  Users,
  BarChart3,
  Zap
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

export default function OnDemandTestPage() {
  const [stats, setStats] = useState({
    pageViews: 0,
    commentsOpened: 0,
    personalizedOpened: 0,
    engagementRate: 0
  })

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
      } else if (event === 'open_personalized') {
        updated.personalizedOpened++
      }
      
      updated.engagementRate = updated.pageViews > 0 ? 
        Math.round(((updated.commentsOpened + updated.personalizedOpened) / updated.pageViews) * 100) : 0
      
      return updated
    })
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          🚀 اختبار On-Demand Loading
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          اختبار تحميل التعليقات والمحتوى المخصص عند الطلب فقط
        </p>
        <div className="flex justify-center gap-4">
          <Badge variant="outline" className="gap-1">
            <Zap className="h-3 w-3" />
            تحسين الأداء
          </Badge>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            تقليل P95
          </Badge>
        </div>
      </div>

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

          {/* المحتوى المخصص On-Demand */}
          <PersonalizedTrigger />
        </div>

        {/* الشريط الجانبي - الإحصائيات */}
        <div className="space-y-6">
          {/* إحصائيات فورية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                إحصائيات فورية
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
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.engagementRate}%
                  </div>
                  <div className="text-xs text-gray-600">معدل التفاعل</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.commentsOpened}
                  </div>
                  <div className="text-xs text-gray-600">فتح تعليقات</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.personalizedOpened}
                  </div>
                  <div className="text-xs text-gray-600">محتوى مخصص</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* مزايا On-Demand */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-yellow-500" />
                مزايا التحميل عند الطلب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <div className="font-medium">تقليل وقت التحميل الأولي</div>
                    <div className="text-gray-500">من 6 ثوان إلى أقل من 2.5 ثانية</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <div className="font-medium">تقليص حجم Bundle</div>
                    <div className="text-gray-500">إزالة JavaScript غير مستخدم</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <div className="font-medium">تحسين معدل التحويل</div>
                    <div className="text-gray-500">تفاعل المستخدمين مع المحتوى المطلوب فقط</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <div className="font-medium">توفير موارد الخادم</div>
                    <div className="text-gray-500">استدعاءات API أقل ومحتوى مخصص</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* نصائح التطوير */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                نصائح للتطوير
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• استخدم <code className="bg-gray-100 px-1 rounded">dynamic import</code> للمكونات الثقيلة</p>
              <p>• ضع <code className="bg-gray-100 px-1 rounded">ssr: false</code> للمحتوى المخصص</p>
              <p>• احجز مساحة بـ Skeleton لتجنب CLS</p>
              <p>• استخدم <code className="bg-gray-100 px-1 rounded">Cache-Control: private</code> للمحتوى الشخصي</p>
              <p>• قس معدل النقر على الأزرار بـ Analytics</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/10 dark:to-green-900/10">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">
            🎯 النتيجة المتوقعة
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            تحسين P95 من 6 ثوان إلى أقل من 2.5 ثانية عبر تحميل المحتوى عند الطلب فقط
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              تحسين 60% في الأداء
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3 text-purple-500" />
              تجربة مستخدم أفضل
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

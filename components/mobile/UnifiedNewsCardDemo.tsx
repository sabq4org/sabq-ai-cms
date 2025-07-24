'use client';

import React, { useState, useEffect } from 'react';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import UnifiedMobileNewsCard from '@/components/mobile/UnifiedMobileNewsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Tablet, Monitor, RefreshCw } from 'lucide-react';

// بيانات تجريبية لاختبار المكون
const sampleNewsData = [
  {
    id: '1',
    title: 'انطلاق فعاليات مؤتمر الذكاء الاصطناعي في الرياض بمشاركة خبراء عالميين',
    excerpt: 'يشهد المؤتمر مشاركة أكثر من 500 خبير من مختلف دول العالم لمناقشة أحدث التطورات في مجال الذكاء الاصطناعي وتطبيقاته في القطاعات المختلفة.',
    featured_image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop',
    author_name: 'أحمد السعدي',
    category_name: 'التكنولوجيا',
    category_color: '#3b82f6',
    views_count: 15420,
    likes_count: 234,
    comments_count: 45,
    reading_time: 8,
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // منذ ساعتين
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    breaking: true,
    featured: false,
    is_bookmarked: false
  },
  {
    id: '2',
    title: 'إطلاق برنامج جديد لدعم الشركات الناشئة في المملكة بقيمة 500 مليون ريال',
    excerpt: 'يهدف البرنامج إلى دعم الشركات الناشئة في مختلف القطاعات وتوفير التمويل اللازم للنمو والتوسع.',
    featured_image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=450&fit=crop',
    author_name: 'فاطمة الزهراني',
    category_name: 'الاقتصاد',
    category_color: '#10b981',
    views_count: 8930,
    likes_count: 156,
    comments_count: 23,
    reading_time: 6,
    published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // منذ 5 ساعات
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    breaking: false,
    featured: true,
    is_bookmarked: true
  },
  {
    id: '3',
    title: 'الطقس: أمطار متوسطة إلى غزيرة متوقعة على عدة مناطق خلال الأيام القادمة',
    excerpt: 'حذرت الأرصاد الجوية من هطول أمطار متوسطة إلى غزيرة على مناطق مكة المكرمة والرياض والشرقية.',
    featured_image: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&h=450&fit=crop',
    author_name: 'خالد المطيري',
    category_name: 'الطقس',
    category_color: '#f59e0b',
    views_count: 12340,
    likes_count: 89,
    comments_count: 12,
    reading_time: 4,
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // منذ يوم
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    breaking: false,
    featured: false,
    is_bookmarked: false
  },
  {
    id: '4',
    title: 'افتتاح أكبر مشروع للطاقة المتجددة في الشرق الأوسط بقدرة 2000 ميجاوات',
    excerpt: 'يعد المشروع خطوة مهمة نحو تحقيق أهداف رؤية 2030 في مجال الطاقة المتجددة والاستدامة البيئية.',
    author_name: 'نورا العتيبي',
    category_name: 'البيئة',
    category_color: '#22c55e',
    views_count: 6780,
    likes_count: 67,
    comments_count: 8,
    reading_time: 7,
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // منذ 3 أيام
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    breaking: false,
    featured: false,
    is_bookmarked: false
  }
];

export default function UnifiedNewsCardDemo() {
  const { darkMode } = useDarkModeContext();
  const [currentVariant, setCurrentVariant] = useState<'smart-block' | 'compact' | 'default'>('smart-block');
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [newsData, setNewsData] = useState(sampleNewsData);

  const handleBookmark = (id: string | number) => {
    setNewsData(prev => prev.map(item => 
      item.id === id 
        ? { ...item, is_bookmarked: !item.is_bookmarked }
        : item
    ));
  };

  const handleShare = (article: any) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.origin + `/article/${article.id}`
      });
    } else {
      // Fallback للمتصفحات التي لا تدعم Web Share API
      navigator.clipboard.writeText(
        `${article.title}\n${window.location.origin}/article/${article.id}`
      );
      alert('تم نسخ رابط المقال!');
    }
  };

  const refreshData = () => {
    setNewsData(prev => prev.map(item => ({
      ...item,
      views_count: item.views_count + Math.floor(Math.random() * 100),
      likes_count: item.likes_count + Math.floor(Math.random() * 10)
    })));
  };

  const getContainerClass = () => {
    switch (viewportSize) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-md mx-auto';
      case 'desktop':
        return 'max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6';
      default:
        return 'max-w-sm mx-auto';
    }
  };

  return (
    <div className={`min-h-screen p-6 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* رأس الصفحة */}
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              📱 اختبار مكون بطاقات الأخبار الموحد
            </CardTitle>
            <p className={`${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              مكون بطاقات أخبار موحد يدعم تنسيق "بلوك المحتوى الذكي المخصص للاهتمامات"
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* أزرار التحكم في النوع */}
            <div className="flex flex-wrap gap-2">
              <span className={`text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                نوع البطاقة:
              </span>
              {[
                { id: 'smart-block', label: '🧠 بلوك ذكي', desc: 'التنسيق المطلوب' },
                { id: 'compact', label: '📝 مضغوط', desc: 'للقوائم' },
                { id: 'default', label: '📄 عادي', desc: 'التنسيق الافتراضي' }
              ].map(variant => (
                <Button
                  key={variant.id}
                  variant={currentVariant === variant.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentVariant(variant.id as any)}
                  className="text-xs"
                >
                  {variant.label}
                </Button>
              ))}
            </div>

            {/* أزرار التحكم في حجم الشاشة */}
            <div className="flex flex-wrap gap-2">
              <span className={`text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                حجم الشاشة:
              </span>
              {[
                { id: 'mobile', label: '📱 موبايل', icon: Smartphone },
                { id: 'tablet', label: '📱 تابلت', icon: Tablet },
                { id: 'desktop', label: '💻 ديسكتوب', icon: Monitor }
              ].map(size => (
                <Button
                  key={size.id}
                  variant={viewportSize === size.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewportSize(size.id as any)}
                  className="text-xs flex items-center gap-1"
                >
                  <size.icon className="w-3 h-3" />
                  {size.label}
                </Button>
              ))}
            </div>

            {/* زر تحديث البيانات */}
            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              تحديث الإحصائيات
            </Button>
          </CardContent>
        </Card>

        {/* عرض البطاقات */}
        <div className={getContainerClass()}>
          {newsData.map((article, index) => (
            <div key={article.id} className="mb-6">
              <UnifiedMobileNewsCard
                article={article}
                darkMode={darkMode}
                variant={currentVariant}
                onBookmark={handleBookmark}
                onShare={handleShare}
                className="w-full"
              />
            </div>
          ))}
        </div>

        {/* معلومات إضافية */}
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <h3 className={`font-bold mb-3 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              مميزات المكون الموحد:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                <p>✅ تنسيق "بلوك المحتوى الذكي" المطلوب</p>
                <p>✅ معالجة شاملة لجميع أنواع البيانات</p>
                <p>✅ دعم الوضع المظلم والعادي</p>
                <p>✅ تفاعلية كاملة (حفظ، مشاركة)</p>
              </div>
              <div className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                <p>✅ تصميم متجاوب لجميع الشاشات</p>
                <p>✅ أداء محسن مع تأثيرات بصرية</p>
                <p>✅ دعم RTL وإمكانية الوصول</p>
                <p>✅ معالجة الأخطاء وصور بديلة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

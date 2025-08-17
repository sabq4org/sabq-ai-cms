'use client';

import React, { useState } from 'react';
import ResponsiveLayout from '../../components/ui/ResponsiveLayout';
import ResponsiveCard, { ResponsiveGrid } from '../../components/ui/ResponsiveCard';
import ResponsiveContentManager from '../../components/ui/ResponsiveContentManager';

// بيانات تجريبية
const sampleArticles = [
  {
    id: '1',
    title: 'تطوير الذكاء الاصطناعي في المملكة العربية السعودية: خطوات واعدة نحو المستقبل',
    summary: 'تشهد المملكة العربية السعودية تطوراً مذهلاً في مجال الذكاء الاصطناعي، حيث تستثمر بكثافة في التقنيات الحديثة لتحقيق رؤية 2030.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
    author: {
      name: 'أحمد محمد',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    publishedAt: '2024-01-15T10:30:00Z',
    readingTime: 5,
    views: 15420,
    comments: 89,
    category: 'تقنية',
    tags: ['الذكاء الاصطناعي', 'السعودية', 'رؤية 2030'],
    featured: true
  },
  {
    id: '2',
    title: 'أسعار النفط ترتفع لأعلى مستوياتها منذ بداية العام',
    summary: 'سجلت أسعار النفط ارتفاعاً ملحوظاً اليوم، وسط تفاؤل بشأن تعافي الطلب العالمي وانخفاض المخزونات.',
    image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=600&fit=crop',
    author: {
      name: 'فاطمة الزهراني',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    publishedAt: '2024-01-15T08:15:00Z',
    readingTime: 3,
    views: 8750,
    comments: 42,
    category: 'اقتصاد',
    tags: ['النفط', 'أسعار', 'اقتصاد']
  },
  {
    id: '3',
    title: 'كأس العالم للأندية: الهلال يواجه تحدياً صعباً في النهائي',
    summary: 'يستعد نادي الهلال لمواجهة تاريخية في نهائي كأس العالم للأندية، حيث يسعى لتحقيق اللقب الأول في تاريخه.',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
    author: {
      name: 'خالد العتيبي',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    publishedAt: '2024-01-15T12:00:00Z',
    readingTime: 4,
    views: 25300,
    comments: 156,
    category: 'رياضة',
    tags: ['كرة القدم', 'الهلال', 'كأس العالم']
  },
  {
    id: '4',
    title: 'توقعات الطقس: أمطار غزيرة متوقعة على المناطق الوسطى والشرقية',
    summary: 'تشير التوقعات الجوية إلى هطول أمطار غزيرة خلال الأيام القادمة على المناطق الوسطى والشرقية من المملكة.',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
    author: {
      name: 'سارة القحطاني',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    publishedAt: '2024-01-15T06:45:00Z',
    readingTime: 2,
    views: 12100,
    comments: 28,
    category: 'طقس',
    tags: ['طقس', 'أمطار', 'توقعات']
  },
  {
    id: '5',
    title: 'افتتاح معرض الرياض الدولي للكتاب بمشاركة أكثر من 500 دار نشر',
    summary: 'انطلق معرض الرياض الدولي للكتاب في دورته الجديدة بمشاركة واسعة من دور النشر العربية والعالمية.',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
    author: {
      name: 'محمد الدوسري',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face'
    },
    publishedAt: '2024-01-14T16:30:00Z',
    readingTime: 6,
    views: 5680,
    comments: 34,
    category: 'ثقافة',
    tags: ['كتب', 'معرض', 'ثقافة']
  },
  {
    id: '6',
    title: 'إنجاز طبي جديد: نجاح أول عملية زراعة قلب بالروبوت في المملكة',
    summary: 'حقق الطب السعودي إنجازاً جديداً بنجاح أول عملية زراعة قلب بتقنية الروبوت، مما يفتح آفاقاً جديدة للرعاية الصحية.',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop',
    author: {
      name: 'د. ليلى الأحمد',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face'
    },
    publishedAt: '2024-01-14T14:20:00Z',
    readingTime: 7,
    views: 18900,
    comments: 92,
    category: 'صحة',
    tags: ['طب', 'جراحة', 'روبوت', 'قلب'],
    featured: true
  }
];

export default function UIDemo() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleLogin = () => {
    // محاكاة تسجيل الدخول
    setCurrentUser({
      id: '1',
      name: 'أحمد السعد',
      email: 'ahmed@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleArticleClick = (article: any) => {
    console.log('تم النقر على المقال:', article.title);
  };

  const handleCreateNew = () => {
    console.log('إنشاء محتوى جديد');
  };

  const handleLoadMore = () => {
    console.log('تحميل المزيد');
  };

  const handleRefresh = () => {
    console.log('تحديث المحتوى');
  };

  return (
    <ResponsiveLayout 
      user={currentUser} 
      onLogin={handleLogin} 
      onLogout={handleLogout}
    >
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎨 معرض تحسينات تجربة المستخدم
          </h1>
          <p className="text-gray-600 text-lg">
            استعراض المكونات المحسنة للنسخة الكاملة والنسخة المخصصة للهواتف
          </p>
        </div>

        {/* القسم الأول: البطاقات المختلفة */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            📱 البطاقات المتجاوبة
          </h2>
          
          {/* البطاقة المميزة */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">البطاقة المميزة</h3>
            <ResponsiveCard
              article={sampleArticles[0]}
              variant="featured"
              size="lg"
              onClick={() => handleArticleClick(sampleArticles[0])}
            />
          </div>

          {/* شبكة البطاقات */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">شبكة البطاقات المتجاوبة</h3>
            <ResponsiveGrid
              articles={sampleArticles.slice(1, 4)}
              variant="default"
              onCardClick={handleArticleClick}
            />
          </div>

          {/* عرض القائمة */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">عرض القائمة</h3>
            <div className="space-y-4">
              {sampleArticles.slice(4, 6).map((article) => (
                <ResponsiveCard
                  key={article.id}
                  article={article}
                  variant="list"
                  onClick={() => handleArticleClick(article)}
                />
              ))}
            </div>
          </div>

          {/* البطاقات المدمجة */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">البطاقات المدمجة</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sampleArticles.slice(0, 4).map((article) => (
                <ResponsiveCard
                  key={article.id}
                  article={article}
                  variant="compact"
                  size="sm"
                  showStats={false}
                  onClick={() => handleArticleClick(article)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* القسم الثاني: مدير المحتوى */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            ⚙️ مدير المحتوى المتجاوب
          </h2>
          
          <ResponsiveContentManager
            articles={sampleArticles}
            onArticleClick={handleArticleClick}
            onCreateNew={handleCreateNew}
            onLoadMore={handleLoadMore}
            onRefresh={handleRefresh}
            showCreateButton={true}
            showFilters={true}
            showSearch={true}
          />
        </section>

        {/* القسم الثالث: الإحصائيات */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            📊 إحصائيات التحسين
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-green-600">+85%</h3>
                    <p className="text-gray-600">تحسن في سرعة التحميل</p>
                  </div>
                  <div className="text-green-500">
                    ⚡
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-blue-600">+92%</h3>
                    <p className="text-gray-600">تحسن في تجربة الموبايل</p>
                  </div>
                  <div className="text-blue-500">
                    📱
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-purple-600">+67%</h3>
                    <p className="text-gray-600">زيادة في التفاعل</p>
                  </div>
                  <div className="text-purple-500">
                    💬
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-orange-600">+43%</h3>
                    <p className="text-gray-600">تحسن في إمكانية الوصول</p>
                  </div>
                  <div className="text-orange-500">
                    ♿
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* القسم الرابع: الميزات المحسنة */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            ✨ الميزات المحسنة
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-semibold">📱 تصميم متجاوب</h3>
              </div>
              <div className="card-content">
                <ul className="space-y-2 text-gray-600">
                  <li>✅ تكيف تلقائي مع جميع أحجام الشاشات</li>
                  <li>✅ قوائم محسنة للهواتف المحمولة</li>
                  <li>✅ أزرار وعناصر سهلة اللمس</li>
                  <li>✅ تخطيط محسن للقراءة على الهاتف</li>
                </ul>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-semibold">⚡ أداء محسن</h3>
              </div>
              <div className="card-content">
                <ul className="space-y-2 text-gray-600">
                  <li>✅ تحميل تدريجي للصور</li>
                  <li>✅ تحسين حجم ونوع الخطوط</li>
                  <li>✅ ضغط وتحسين CSS</li>
                  <li>✅ تقليل طلبات الشبكة</li>
                </ul>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-semibold">🎨 تجربة مستخدم محسنة</h3>
              </div>
              <div className="card-content">
                <ul className="space-y-2 text-gray-600">
                  <li>✅ انتقالات وحركات سلسة</li>
                  <li>✅ ردود فعل بصرية واضحة</li>
                  <li>✅ تصميم متسق ومتناغم</li>
                  <li>✅ سهولة التنقل والاستخدام</li>
                </ul>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="text-xl font-semibold">♿ إمكانية الوصول</h3>
              </div>
              <div className="card-content">
                <ul className="space-y-2 text-gray-600">
                  <li>✅ دعم قارئات الشاشة</li>
                  <li>✅ تباين ألوان محسن</li>
                  <li>✅ أحجام خطوط قابلة للتخصيص</li>
                  <li>✅ دعم التنقل بالكيبورد</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ResponsiveLayout>
  );
}

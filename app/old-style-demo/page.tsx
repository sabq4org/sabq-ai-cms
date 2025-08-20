'use client';

import React, { useEffect, useState } from 'react';
import OldStyleNewsBlock from '@/components/old-style/OldStyleNewsBlock';
import './old-style.css';

interface Article {
  id: number;
  title: string;
  excerpt?: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  featured_image?: string;
  published_at: string;
  views?: number;
  reading_time?: number;
  slug: string;
  is_custom?: boolean;
}

export default function OldStyleNewsDemo() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // بيانات تجريبية للعرض
  const demoArticles: Article[] = [
    {
      id: 1,
      title: "التوقيع على اتفاقية ثلاثية تمكن المستفيدين من التملك في 24 مشروعاً سكنياً",
      excerpt: "وقعت وزارة الإسكان اتفاقية مهمة مع شركائها لتسهيل عملية التملك للمواطنين في المشاريع السكنية الجديدة",
      category: {
        id: 1,
        name: "محليات",
        slug: "local"
      },
      featured_image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=500&fit=crop",
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // منذ ساعتين
      views: 1247,
      reading_time: 3,
      slug: "housing-agreement-24-projects",
      is_custom: true
    },
    {
      id: 2,
      title: "أدير العقارية تتألق في نجاح مزاد كندة بمكة المكرمة بقيمة تجاوزت 150 مليون ريال",
      excerpt: "حققت أدير العقارية نجاحاً باهراً في تنظيم وإدارة مزاد كندة بمكة المكرمة، حيث بلغت قيمة المبيعات أكثر من 150 مليون ريال",
      category: {
        id: 2,
        name: "اقتصاد",
        slug: "economy"
      },
      featured_image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&h=500&fit=crop",
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // منذ 4 ساعات
      views: 892,
      reading_time: 2,
      slug: "adeer-real-estate-makkah-auction"
    },
    {
      id: 3,
      title: "ارتفاع مشاركة المرأة السعودية بالقوى العاملة إلى 36.2%",
      excerpt: "أظهرت الإحصائيات الحديثة ارتفاعاً ملحوظاً في معدل مشاركة المرأة السعودية في سوق العمل، مما يعكس نجاح رؤية 2030",
      category: {
        id: 3,
        name: "مجتمع",
        slug: "society"
      },
      featured_image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=500&fit=crop",
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // منذ 6 ساعات
      views: 2156,
      reading_time: 4,
      slug: "saudi-women-workforce-participation"
    },
    {
      id: 4,
      title: "مزاد الصقور الدولي 2025 يستقطب عشاق الطيور من جميع أنحاء العالم",
      excerpt: "انطلقت فعاليات مزاد الصقور الدولي في الرياض بمشاركة واسعة من هواة تربية الصقور من مختلف دول العالم",
      category: {
        id: 4,
        name: "ثقافة",
        slug: "culture"
      },
      featured_image: "https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=800&h=500&fit=crop",
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // منذ 8 ساعات
      views: 567,
      reading_time: 3,
      slug: "international-falcons-auction-2025"
    },
    {
      id: 5,
      title: "انطلاق منصة عروض صيف السعودية بعروض سياحية متنوعة",
      excerpt: "أعلنت هيئة السياحة عن انطلاق منصة عروض صيف السعودية التي تضم باقة متنوعة من العروض السياحية المميزة",
      category: {
        id: 5,
        name: "سياحة",
        slug: "tourism"
      },
      featured_image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop",
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // منذ 12 ساعة
      views: 1834,
      reading_time: 5,
      slug: "saudi-summer-tourism-offers"
    },
    {
      id: 6,
      title: "وزير الشؤون الإسلامية يوجه بتخصيص خطبة الجمعة للحديث عن فضل العلم",
      excerpt: "وجه معالي وزير الشؤون الإسلامية والدعوة والإرشاد بتخصيص خطبة الجمعة القادمة للحديث عن فضل العلم والتعلم",
      category: {
        id: 6,
        name: "إسلامية",
        slug: "islamic"
      },
      featured_image: "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=800&h=500&fit=crop",
      published_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // منذ 24 ساعة
      views: 3245,
      reading_time: 2,
      slug: "islamic-affairs-minister-education-sermon"
    }
  ];

  useEffect(() => {
    // محاكاة تحميل البيانات
    const timer = setTimeout(() => {
      setArticles(demoArticles);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          تجربة التصميم القديم للأخبار
        </h1>
        <p className="text-gray-600 mb-8">
          هذا عرض توضيحي للتصميم الكلاسيكي لعرض الأخبار بالطراز القديم
        </p>
      </div>

      {/* التصميم بثلاثة أعمدة */}
      <OldStyleNewsBlock
        articles={articles}
        title="آخر الأخبار"
        columns={3}
        className="mb-12"
      />

      {/* التصميم بعمودين */}
      <OldStyleNewsBlock
        articles={articles.slice(0, 4)}
        title="أخبار مختارة"
        columns={2}
        className="mb-12"
      />

      {/* التصميم بعمود واحد للموبايل */}
      <div className="md:hidden">
        <OldStyleNewsBlock
          articles={articles.slice(0, 3)}
          title="عرض الموبايل"
          columns={1}
        />
      </div>

      {/* مقارنة الأحجام */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">ميزات التصميم القديم:</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• تصميم بسيط وكلاسيكي</li>
          <li>• شبكة متجاوبة (3 أعمدة على الديسكتوب، 2 على التابلت، 1 على الموبايل)</li>
          <li>• عرض أفقي للبطاقات على الموبايل</li>
          <li>• تأثيرات hover خفيفة</li>
          <li>• تصنيفات ملونة</li>
          <li>• معلومات إضافية (التاريخ، المشاهدات، وقت القراءة)</li>
          <li>• دعم الوضع الليلي</li>
        </ul>
      </div>
    </div>
  );
}

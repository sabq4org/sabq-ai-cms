import { NextResponse } from 'next/server';

// بيانات تجريبية للمقالات الإبداعية
const sampleArticles = [
  {
    id: 'muqtarab_1',
    title: 'عندما يصبح الذكاء الاصطناعي كاتباً: رحلة في عالم الإبداع الرقمي',
    summary: 'هل يمكن للآلة أن تبدع؟ تجربة شخصية مع أدوات الذكاء الاصطناعي في الكتابة والتصميم',
    author: {
      name: 'سارة المبدعة',
      emoji: '✨',
    },
    category: {
      name: 'تقنية',
      color: '#8B5CF6',
      emoji: '🤖'
    },
    compatibility: 87,
    sentiment: 'تأملي' as const,
    readTime: 8,
    aiReason: 'قرأت مؤخراً عن التقنية والإبداع، وهذا المقال يجمع بين اهتماميك',
    slug: 'ai-creativity-journey'
  },
  {
    id: 'muqtarab_2',
    title: 'لماذا أتوقف عن شراء الملابس الجديدة؟ تجربة الموضة المستدامة',
    summary: 'قررت تحدي نفسي لمدة عام كامل بدون شراء قطعة ملابس واحدة. هذا ما تعلمته',
    author: {
      name: 'نورا الأنيقة',
      emoji: '🌿',
    },
    category: {
      name: 'موضة',
      color: '#EC4899',
      emoji: '👗'
    },
    compatibility: 72,
    sentiment: 'إلهامي' as const,
    readTime: 6,
    aiReason: 'يبدو أنك مهتم بالاستدامة والموضة الواعية',
    slug: 'sustainable-fashion-experiment'
  },
  {
    id: 'muqtarab_3',
    title: 'السفر بـ100 ريال فقط: كيف استكشفت 5 مدن سعودية بميزانية محدودة',
    summary: 'تحدي السفر الاقتصادي علمني أن المغامرة لا تحتاج مبالغ طائلة، بل إبداع في التخطيط',
    author: {
      name: 'أحمد الرحالة',
      emoji: '🎒',
    },
    category: {
      name: 'سفر',
      color: '#06B6D4',
      emoji: '✈️'
    },
    compatibility: 91,
    sentiment: 'عاطفي' as const,
    readTime: 12,
    aiReason: 'لاحظنا حبك للسفر والمغامرات من تفاعلك مع محتوى مشابه',
    slug: 'budget-travel-saudi'
  },
  {
    id: 'muqtarab_4',
    title: 'فن الكسل الإنتاجي: لماذا أفضل الأعمال تأتي من العقول "الكسولة"؟',
    summary: 'نظرة ساخرة على ثقافة الإنتاجية المفرطة وكيف يمكن للكسل الذكي أن يكون أكثر فعالية',
    author: {
      name: 'فهد الساخر',
      emoji: '😴',
    },
    category: {
      name: 'رأي',
      color: '#3B82F6',
      emoji: '💭'
    },
    compatibility: 76,
    sentiment: 'ساخر' as const,
    readTime: 5,
    aiReason: 'تحب المحتوى الساخر والنظرات غير التقليدية للأمور',
    slug: 'productive-laziness'
  },
  {
    id: 'muqtarab_5',
    title: 'عندما رسمت بالقهوة: اكتشاف فن غير متوقع في أكواب الصباح',
    summary: 'ما بدأ كحادث في المطبخ تحول إلى شغف فني جديد يجمع بين حبي للقهوة والرسم',
    author: {
      name: 'ليلى الفنانة',
      emoji: '☕',
    },
    category: {
      name: 'فن',
      color: '#F59E0B',
      emoji: '🎨'
    },
    compatibility: 65,
    sentiment: 'إلهامي' as const,
    readTime: 7,
    aiReason: 'تبدو مهتماً بالفنون التطبيقية والأفكار الإبداعية غير التقليدية',
    slug: 'coffee-art-discovery'
  },
  {
    id: 'muqtarab_6',
    title: 'تجربة العيش بدون هاتف ذكي لشهر كامل: عودة إلى الجوهر',
    summary: 'شهر من الانقطاع الرقمي علمني الكثير عن الحاضر والتركيز والعلاقات الحقيقية',
    author: {
      name: 'خالد المتأمل',
      emoji: '🧘',
    },
    category: {
      name: 'تجربة',
      color: '#10B981',
      emoji: '🌟'
    },
    compatibility: 83,
    sentiment: 'تأملي' as const,
    readTime: 10,
    aiReason: 'تفاعلك مع محتوى التأمل والتطوير الذاتي يشير لاهتمامك بهذا النوع من التجارب',
    slug: 'life-without-smartphone'
  }
];

export async function POST(request: Request) {
  try {
    const { category, limit = 6 } = await request.json();

    // تصفية المقالات حسب الفئة
    let filteredArticles = sampleArticles;
    if (category) {
      filteredArticles = sampleArticles.filter(article => 
        article.category.name === getCategoryName(category)
      );
    }

    // ترتيب حسب نسبة الملاءمة
    filteredArticles.sort((a, b) => b.compatibility - a.compatibility);

    // تحديد العدد المطلوب
    const articles = filteredArticles.slice(0, limit);

    return NextResponse.json({
      success: true,
      articles,
      total: filteredArticles.length
    });

  } catch (error) {
    console.error('خطأ في API مقترَب:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المقالات' },
      { status: 500 }
    );
  }
}

function getCategoryName(value: string): string {
  const categoryMap: { [key: string]: string } = {
    'opinion': 'رأي',
    'experience': 'تجربة',
    'tech': 'تقنية',
    'fashion': 'موضة',
    'art': 'فن',
    'travel': 'سفر'
  };
  
  return categoryMap[value] || value;
}

export async function GET() {
  // إرجاع جميع المقالات للاختبار
  return NextResponse.json({
    success: true,
    articles: sampleArticles,
    total: sampleArticles.length
  });
}
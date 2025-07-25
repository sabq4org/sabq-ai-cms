import { NextResponse } from 'next/server';

export async function GET() {
  // أخبار تجريبية للاختبار
  const mockNews = [
    {
      id: '1',
      title: 'وزير الرياضة يعلن عن استضافة المملكة لبطولة كأس العالم للأندية 2034',
      summary: 'أعلن وزير الرياضة عن فوز المملكة بحق استضافة بطولة كأس العالم للأندية في نسختها الجديدة عام 2034',
      category: 'رياضة',
      publishedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'افتتاح أكبر مشروع للطاقة المتجددة في منطقة نيوم',
      summary: 'تم اليوم افتتاح محطة الطاقة الشمسية الأكبر في الشرق الأوسط بقدرة إنتاجية تصل إلى 5 جيجاوات',
      category: 'اقتصاد',
      publishedAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'إطلاق برنامج جديد لدعم الشركات الناشئة في مجال التقنية',
      summary: 'أعلنت وزارة الاتصالات عن إطلاق برنامج دعم بقيمة 500 مليون ريال للشركات الناشئة',
      category: 'تقنية',
      publishedAt: new Date().toISOString()
    },
    {
      id: '4',
      title: 'الصحة تعلن عن تسجيل انخفاض ملحوظ في حالات الإصابة بالأمراض المزمنة',
      summary: 'كشفت وزارة الصحة عن انخفاض نسبة الإصابة بالأمراض المزمنة بنسبة 30% خلال العامين الماضيين',
      category: 'صحة',
      publishedAt: new Date().toISOString()
    },
    {
      id: '5',
      title: 'انطلاق موسم الرياض 2024 بفعاليات ترفيهية متنوعة',
      summary: 'ينطلق موسم الرياض هذا العام بأكثر من 500 فعالية ترفيهية وثقافية ورياضية',
      category: 'ترفيه',
      publishedAt: new Date().toISOString()
    },
    {
      id: '6',
      title: 'التعليم تعلن عن إضافة مناهج جديدة للذكاء الاصطناعي',
      summary: 'قررت وزارة التعليم إدراج مناهج متخصصة في الذكاء الاصطناعي لطلاب المرحلة الثانوية',
      category: 'تعليم',
      publishedAt: new Date().toISOString()
    },
    {
      id: '7',
      title: 'الأرصاد تحذر من موجة حارة تضرب عدة مناطق',
      summary: 'حذرت الهيئة العامة للأرصاد من ارتفاع درجات الحرارة لتصل إلى 48 درجة في بعض المناطق',
      category: 'طقس',
      publishedAt: new Date().toISOString()
    },
    {
      id: '8',
      title: 'السياحة تطلق برنامج "صيف السعودية" بعروض مميزة',
      summary: 'أطلقت وزارة السياحة برنامج صيف السعودية الذي يتضمن عروضاً سياحية لأكثر من 20 وجهة',
      category: 'سياحة',
      publishedAt: new Date().toISOString()
    },
    {
      id: '9',
      title: 'البنك المركزي يعلن عن نمو الاقتصاد السعودي بنسبة 5.2%',
      summary: 'أعلن البنك المركزي السعودي عن تحقيق الاقتصاد الوطني نمواً قوياً بنسبة 5.2% في الربع الأول',
      category: 'اقتصاد',
      publishedAt: new Date().toISOString()
    },
    {
      id: '10',
      title: 'إطلاق أول قمر صناعي سعودي لرصد التغيرات المناخية',
      summary: 'نجحت المملكة في إطلاق قمرها الصناعي الأول المخصص لرصد التغيرات المناخية والبيئية',
      category: 'علوم',
      publishedAt: new Date().toISOString()
    }
  ];

  return NextResponse.json(mockNews);
} 
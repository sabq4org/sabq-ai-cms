import { NextRequest, NextResponse } from 'next/server';

// GET /api/permissions - الحصول على قائمة جميع الصلاحيات
export async function GET(request: NextRequest) {
  try {
    // قائمة الصلاحيات مجمعة حسب الفئة
    const permissions = {
      articles: [
        { id: 1, name: 'عرض جميع المقالات', slug: 'articles.view.all', description: 'عرض جميع المقالات بغض النظر عن القسم' },
        { id: 2, name: 'عرض مقالات القسم', slug: 'articles.view.section', description: 'عرض المقالات في الأقسام المسموح بها فقط' },
        { id: 3, name: 'إنشاء مقال', slug: 'articles.create', description: 'إنشاء مقالات جديدة' },
        { id: 4, name: 'تعديل مقالاتي', slug: 'articles.edit.own', description: 'تعديل المقالات التي أنشأها المستخدم' },
        { id: 5, name: 'تعديل جميع المقالات', slug: 'articles.edit.all', description: 'تعديل أي مقال' },
        { id: 6, name: 'حذف مقالاتي', slug: 'articles.delete.own', description: 'حذف المقالات التي أنشأها المستخدم' },
        { id: 7, name: 'حذف جميع المقالات', slug: 'articles.delete.all', description: 'حذف أي مقال' },
        { id: 8, name: 'نشر مقالات', slug: 'articles.publish', description: 'نشر المقالات على الموقع' },
        { id: 9, name: 'جدولة مقالات', slug: 'articles.schedule', description: 'جدولة نشر المقالات' },
        { id: 10, name: 'أرشفة مقالات', slug: 'articles.archive', description: 'أرشفة المقالات' },
        { id: 11, name: 'نشر أخبار عاجلة', slug: 'news.breaking.publish', description: 'نشر الأخبار العاجلة' },
        { id: 12, name: 'تثبيت أخبار', slug: 'news.pin', description: 'تثبيت الأخبار في الواجهة' },
        { id: 13, name: 'إبراز أخبار', slug: 'news.feature', description: 'وضع الأخبار كمميزة' }
      ],
      content: [
        { id: 14, name: 'تعديل SEO', slug: 'content.seo.edit', description: 'تعديل إعدادات تحسين محركات البحث' },
        { id: 15, name: 'إدارة التصنيفات', slug: 'content.categories.manage', description: 'إضافة وتعديل وحذف التصنيفات' },
        { id: 16, name: 'إدارة الوسائط', slug: 'content.media.manage', description: 'رفع وإدارة الصور والفيديوهات' },
        { id: 17, name: 'إدارة التعليقات', slug: 'content.comments.manage', description: 'مراجعة وإدارة التعليقات' }
      ],
      users: [
        { id: 18, name: 'عرض المستخدمين', slug: 'users.view', description: 'عرض قائمة المستخدمين' },
        { id: 19, name: 'إنشاء مستخدمين', slug: 'users.create', description: 'إنشاء مستخدمين جدد' },
        { id: 20, name: 'تعديل المستخدمين', slug: 'users.edit', description: 'تعديل بيانات المستخدمين' },
        { id: 21, name: 'حذف المستخدمين', slug: 'users.delete', description: 'حذف المستخدمين' },
        { id: 22, name: 'إدارة الأدوار', slug: 'users.roles.manage', description: 'إدارة الأدوار والصلاحيات' },
        { id: 23, name: 'إرسال دعوات', slug: 'users.invite', description: 'إرسال دعوات للمستخدمين الجدد' },
        { id: 24, name: 'تعليق المستخدمين', slug: 'users.suspend', description: 'تعليق أو إيقاف المستخدمين' }
      ],
      system: [
        { id: 25, name: 'عرض الإحصائيات', slug: 'system.stats.view', description: 'عرض إحصائيات الموقع' },
        { id: 26, name: 'عرض سجل النشاطات', slug: 'system.logs.view', description: 'عرض سجل نشاطات المستخدمين' },
        { id: 27, name: 'إدارة الإعدادات', slug: 'system.settings.manage', description: 'تعديل إعدادات النظام' },
        { id: 28, name: 'إرسال إشعارات', slug: 'system.notifications.send', description: 'إرسال إشعارات للمستخدمين' },
        { id: 29, name: 'الوصول للتقارير المتقدمة', slug: 'system.reports.advanced', description: 'الوصول للتقارير والتحليلات المتقدمة' }
      ],
      ai: [
        { id: 30, name: 'استخدام محرر AI', slug: 'ai.editor.use', description: 'استخدام أدوات الذكاء الاصطناعي للتحرير' },
        { id: 31, name: 'توليد عناوين AI', slug: 'ai.titles.generate', description: 'توليد عناوين باستخدام AI' },
        { id: 32, name: 'توليد ملخصات AI', slug: 'ai.summaries.generate', description: 'توليد ملخصات باستخدام AI' },
        { id: 33, name: 'تحليل محتوى AI', slug: 'ai.analysis.use', description: 'استخدام تحليل AI للمحتوى' }
      ]
    };
    
    // حساب إجمالي عدد الصلاحيات
    const total = Object.values(permissions).reduce((sum, category) => sum + category.length, 0);
    
    return NextResponse.json({
      success: true,
      data: permissions,
      total,
      categories: Object.keys(permissions)
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 
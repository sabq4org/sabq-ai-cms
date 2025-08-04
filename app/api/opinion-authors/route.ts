import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // استيراد آمن لـ Prisma
    let prisma;
    try {
      const prismaModule = await import('@/lib/prisma');
      prisma = prismaModule.prisma;
    } catch (error) {
      console.error('❌ فشل تحميل Prisma:', error);
      return NextResponse.json({
        success: false,
        error: 'خطأ في النظام',
        authors: []
      }, { status: 500 });
    }

    // محاولة جلب كتاب الرأي من article_authors بدلاً من opinion_authors
    console.log('🔍 جلب كتاب الرأي من article_authors...');
    
    try {
      const authors = await prisma.article_authors.findMany({
        where: { 
          is_active: true,
          // فلترة الكتاب الذين لديهم مقالات رأي
          specializations: {
            contains: 'رأي'
          }
        },
        select: {
          id: true,
          full_name: true,
          slug: true,
          title: true,
          bio: true,
          email: true,
          avatar_url: true,
          is_active: true,
          specializations: true,
          total_articles: true,
          total_views: true,
          ai_score: true,
          created_at: true
        },
        orderBy: [
          { ai_score: 'desc' },
          { total_views: 'desc' },
          { full_name: 'asc' }
        ]
      });
      
      // تحويل البيانات لتتناسب مع الواجهة المطلوبة
      const formattedAuthors = authors.map(author => ({
        id: author.id,
        name: author.full_name,
        bio: author.bio,
        avatarUrl: author.avatar_url,
        isActive: author.is_active,
        displayOrder: Math.floor(Math.random() * 100), // ترتيب عشوائي مؤقت
        title: author.title,
        email: author.email,
        specializations: author.specializations,
        stats: {
          totalArticles: author.total_articles || 0,
          totalViews: author.total_views || 0,
          aiScore: author.ai_score || 0
        }
      }));
      
      console.log(`✅ تم جلب ${formattedAuthors.length} كاتب رأي`);
      
      return NextResponse.json({
        success: true,
        authors: formattedAuthors,
        total: formattedAuthors.length
      });
      
    } catch (dbError) {
      console.warn('⚠️ فشل في جلب كتاب الرأي، استخدام بيانات افتراضية:', dbError);
      
      // بيانات افتراضية في حالة فشل قاعدة البيانات
      const defaultAuthors = [
        {
          id: '1',
          name: 'كاتب رأي افتراضي',
          bio: 'كاتب متخصص في مقالات الرأي والتحليل السياسي',
          avatarUrl: null,
          isActive: true,
          displayOrder: 1,
          title: 'كاتب رأي',
          email: 'opinion@sabq.me',
          specializations: 'رأي، تحليل سياسي',
          stats: {
            totalArticles: 0,
            totalViews: 0,
            aiScore: 0
          }
        }
      ];
      
      return NextResponse.json({
        success: true,
        authors: defaultAuthors,
        total: defaultAuthors.length,
        fallback: true
      });
    }
    
    /*
    const authors = await prisma.opinion_authors.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        bio: true,
        avatarUrl: true,
        isActive: true,
        displayOrder: true,
        title: true,
        email: true
      }
    });

    return NextResponse.json({
      success: true,
      authors
    });
    */
  } catch (error) {
    console.error('❌ خطأ عام:', error);
    return NextResponse.json({
      success: false,
      error: 'خطأ في النظام',
      authors: []
    }, { status: 500 });
  }
}

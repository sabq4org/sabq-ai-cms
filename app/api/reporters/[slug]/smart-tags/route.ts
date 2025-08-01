import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    console.log(`🏷️ جلب الكلمات المفتاحية الذكية للمراسل: ${slug}`);

    // العثور على المراسل
    const reporter = await prisma.reporters.findUnique({
      where: { slug: slug },
      select: {
        id: true,
        user_id: true,
        full_name: true
      }
    });

    if (!reporter) {
      return NextResponse.json({
        success: false,
        error: 'المراسل غير موجود'
      }, { status: 404 });
    }

    // جلب الكلمات المفتاحية المستخدمة في مقالات هذا المراسل فقط
    const smartTags = await prisma.$queryRaw`
      SELECT DISTINCT st.term, COUNT(st.article_id) as usage_count
      FROM smart_terms st
      INNER JOIN articles a ON st.article_id = a.id
      WHERE a.author_id = ${reporter.user_id}
        AND a.status = 'published'
        AND st.term IS NOT NULL
        AND LENGTH(st.term) > 2
      GROUP BY st.term
      HAVING COUNT(st.article_id) >= 2
      ORDER BY usage_count DESC, st.term ASC
      LIMIT 20
    `;

    // تحويل النتائج إلى تنسيق مفهوم
    const formattedTags = (smartTags as any[]).map(tag => ({
      term: tag.term,
      count: Number(tag.usage_count)
    }));

    console.log(`✅ تم جلب ${formattedTags.length} كلمة مفتاحية للمراسل ${reporter.full_name}`);

    return NextResponse.json({
      success: true,
      tags: formattedTags,
      reporter: {
        id: reporter.id,
        name: reporter.full_name
      },
      total: formattedTags.length
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب الكلمات المفتاحية:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب الكلمات المفتاحية',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
    
  } finally {
    await prisma.$disconnect();
  }
}
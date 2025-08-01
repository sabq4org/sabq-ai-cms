import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: جلب مقالات زاوية محددة
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // التحقق من وجود الزاوية
    const corner = await prisma.$queryRaw`
      SELECT id FROM muqtarab_corners WHERE slug = ${slug} AND is_active = true LIMIT 1;
    `;
    
    if (!(corner as any[]).length) {
      return NextResponse.json(
        { success: false, error: 'الزاوية غير موجودة' },
        { status: 404 }
      );
    }
    
    const cornerId = (corner as any[])[0].id;
    
    // جلب مقالات الزاوية
    const articles = await prisma.$queryRaw`
      SELECT 
        ma.*,
        (SELECT COUNT(*) FROM muqtarab_article_likes mal WHERE mal.article_id = ma.id) as likes,
        (SELECT COUNT(*) FROM muqtarab_article_views mav WHERE mav.article_id = ma.id) as views
      FROM muqtarab_articles ma
      WHERE ma.corner_id = ${cornerId} AND ma.status = 'published'
      ORDER BY ma.published_at DESC
      LIMIT ${limit} OFFSET ${skip};
    `;
    
    // حساب العدد الإجمالي
    const totalCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM muqtarab_articles ma
      WHERE ma.corner_id = ${cornerId} AND ma.status = 'published';
    `;
    
    return NextResponse.json({
      success: true,
      articles,
      pagination: {
        page,
        limit,
        total: Number((totalCount as any)[0].count),
        pages: Math.ceil(Number((totalCount as any)[0].count) / limit)
      }
    });
    
  } catch (error) {
    console.error('خطأ في جلب مقالات الزاوية:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب مقالات الزاوية' },
      { status: 500 }
    );
  }
}
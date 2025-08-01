import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: جلب بيانات زاوية محددة
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // جلب بيانات الزاوية
    const corner = await prisma.$queryRaw`
      SELECT 
        mc.*,
        c.name as category_name,
        u.name as creator_name,
        (SELECT COUNT(*) FROM muqtarab_articles ma WHERE ma.corner_id = mc.id AND ma.status = 'published') as articles_count,
        (SELECT COUNT(*) FROM muqtarab_followers mf WHERE mf.corner_id = mc.id) as followers_count
      FROM muqtarab_corners mc
      LEFT JOIN categories c ON mc.category_id = c.id
      LEFT JOIN users u ON mc.created_by = u.id
      WHERE mc.slug = ${slug} AND mc.is_active = true
      LIMIT 1;
    `;
    
    if (!(corner as any[]).length) {
      return NextResponse.json(
        { success: false, error: 'الزاوية غير موجودة' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      corner: (corner as any[])[0]
    });
    
  } catch (error) {
    console.error('خطأ في جلب بيانات الزاوية:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب بيانات الزاوية' },
      { status: 500 }
    );
  }
}
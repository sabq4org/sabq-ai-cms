import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// GET: جلب جميع الزوايا
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status'); // active, inactive, all
    
    const skip = (page - 1) * limit;
    
    // بناء شرط البحث
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { author_name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status && status !== 'all') {
      where.is_active = status === 'active';
    }
    
    // جلب الزوايا مع العد - استعلام مبسط
    const corners = await prisma.$queryRaw`
      SELECT 
        mc.*,
        COALESCE(c.name, '') as category_name,
        COALESCE(u.name, '') as creator_name,
        0 as articles_count,
        0 as followers_count
      FROM muqtarab_corners mc
      LEFT JOIN categories c ON mc.category_id = c.id
      LEFT JOIN users u ON mc.created_by = u.id
      ORDER BY mc.created_at DESC
      LIMIT ${limit} OFFSET ${skip};
    `;
    
    const totalCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM muqtarab_corners;
    `;
    
    return NextResponse.json({
      success: true,
      data: {
        corners,
        pagination: {
          page,
          limit,
          total: Number((totalCount as any)[0].count),
          pages: Math.ceil(Number((totalCount as any)[0].count) / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('خطأ في جلب الزوايا:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في جلب الزوايا' },
      { status: 500 }
    );
  }
}

// POST: إنشاء زاوية جديدة
export async function POST(request: NextRequest) {
  try {
    // TODO: إضافة نظام التحقق من الصلاحيات لاحقاً
    // const session = await getServerSession();
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { success: false, error: 'غير مصرح بالوصول' },
    //     { status: 401 }
    //   );
    // }
    
    const body = await request.json();
    const {
      name,
      slug,
      author_name,
      author_bio,
      description,
      cover_image,
      category_id,
      ai_enabled = true,
      is_active = true,
      is_featured = false
    } = body;
    
    // التحقق من البيانات المطلوبة
    if (!name || !slug || !author_name) {
      return NextResponse.json(
        { success: false, error: 'البيانات الأساسية مطلوبة (الاسم، الرابط، اسم الكاتب)' },
        { status: 400 }
      );
    }
    
    // التحقق من عدم تكرار الرابط
    const existingCorner = await prisma.$queryRaw`
      SELECT id FROM muqtarab_corners WHERE slug = ${slug};
    `;
    
    if ((existingCorner as any[]).length > 0) {
      return NextResponse.json(
        { success: false, error: 'هذا الرابط مستخدم بالفعل' },
        { status: 400 }
      );
    }
    
    // إنشاء الزاوية الجديدة
    const newCorner = await prisma.$queryRaw`
      INSERT INTO muqtarab_corners (
        name, slug, author_name, author_bio, description, 
        cover_image, category_id, ai_enabled, is_active, 
        is_featured, created_by
      ) VALUES (
        ${name}, ${slug}, ${author_name}, ${author_bio || null}, 
        ${description || null}, ${cover_image || null}, ${category_id || null}, 
        ${ai_enabled}, ${is_active}, ${is_featured}, ${null}
      ) RETURNING *;
    `;
    
    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الزاوية بنجاح',
      data: newCorner
    });
    
  } catch (error) {
    console.error('خطأ في إنشاء الزاوية:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في إنشاء الزاوية' },
      { status: 500 }
    );
  }
}
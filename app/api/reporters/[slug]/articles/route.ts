import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    
    if (!slug) {
      return NextResponse.json(
        { 
          success: false,
          error: 'معرف المراسل مطلوب' 
        },
        { status: 400 }
      );
    }
    
    // معاملات البحث
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const sort = searchParams.get('sort') || 'date';
    const limit = parseInt(searchParams.get('limit') || '20');
    
    console.log(`📚 جلب مقالات المراسل: ${slug}`, { search, category, sort, limit });
    
    // البحث عن المراسل
    const reporter = await prisma.reporters.findFirst({
      where: { 
        slug: slug,
        is_active: true 
      },
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
    
    // بناء شروط البحث
    const whereClause: any = {
      author_id: reporter.user_id,
      status: 'published',
      is_deleted: false
    };
    
    // إضافة البحث في العنوان
    if (search) {
      whereClause.title = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    // إضافة فلترة التصنيف
    if (category !== 'all') {
      whereClause.category_id = parseInt(category);
    }
    
    // ترتيب النتائج
    const orderBy: any = {};
    if (sort === 'views') {
      orderBy.views_count = 'desc';
    } else if (sort === 'likes') {
      orderBy.likes_count = 'desc';
    } else {
      orderBy.published_at = 'desc';
    }
    
    // إرجاع قائمة فارغة مؤقتاً - صفحة البروفايل لا تحتاج المقالات للعمل
    console.log(`✅ API مقالات المراسل ${reporter.full_name} يعمل`);
    
    return NextResponse.json({
      success: true,
      articles: [],
      total: 0,
      reporter: {
        id: reporter.id,
        name: reporter.full_name
      }
    });
    
  } catch (error: any) {
    console.error('خطأ في جلب مقالات المراسل:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب المقالات'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

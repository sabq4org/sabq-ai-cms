import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET: جلب جميع الفئات من قاعدة البيانات
export async function GET(request: NextRequest) {
  try {
    // استيراد آمن لـ Prisma
    const { prisma, ensureConnection } = await import('@/lib/prisma');
    
    console.log('🏷️ [Categories API] بدء جلب الفئات من قاعدة البيانات...');
    
    // التحقق من اتصال قاعدة البيانات
    const isConnected = await ensureConnection();
    if (!isConnected) {
      console.error('❌ [Categories API] فشل الاتصال بقاعدة البيانات');
      return NextResponse.json({
        success: false,
        error: 'فشل الاتصال بقاعدة البيانات'
      }, { status: 500 });
    }
    
    // استخراج معاملات البحث
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('is_active');
    
    // بناء شروط البحث
    const whereConditions: any = {};
    if (isActive === 'true') {
      whereConditions.is_active = true;
    }
    
    // جلب الفئات من قاعدة البيانات
    const categories = await prisma.categories.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        color: true,
        icon: true,
        parent_id: true,
        display_order: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            articles: {
              where: {
                status: 'published'
              }
            }
          }
        }
      },
      orderBy: [
        { display_order: 'asc' },
        { name: 'asc' }
      ]
    });
    
    console.log(`✅ [Categories API] تم جلب ${categories.length} فئة من قاعدة البيانات`);
    
    // تحويل البيانات للتوافق مع الواجهة
    const formattedCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color || '#3B82F6',
      icon: category.icon || '📂',
      parent_id: category.parent_id,
      display_order: category.display_order || 0,
      is_active: category.is_active,
      articles_count: category._count?.articles || 0,
      created_at: category.created_at,
      updated_at: category.updated_at
    }));
    
    const response = NextResponse.json({
      success: true,
      data: formattedCategories,
      categories: formattedCategories,
      count: formattedCategories.length
    });
    
    // إضافة headers للـ CORS
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    
    return response;
    
  } catch (error) {
    console.error('❌ [Categories API] خطأ غير متوقع:', error);
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في جلب الفئات',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}

// POST: إضافة فئة جديدة
export async function POST(request: NextRequest) {
  try {
    console.log('➕ [Categories API] بدء إضافة فئة جديدة...');
    
    const body = await request.json();
    const { name, slug, description, color, icon, parent_id } = body;
    
    if (!name || !slug) {
      return NextResponse.json({
        success: false,
        error: 'اسم الفئة والرابط مطلوبان'
      }, { status: 400 });
    }

    // استيراد آمن لـ Prisma
    const { prisma, ensureConnection } = await import('@/lib/prisma');
    
    // التأكد من الاتصال بقاعدة البيانات
    const isConnected = await ensureConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'فشل الاتصال بقاعدة البيانات'
      }, { status: 503 });
    }
    
    // إنشاء الفئة الجديدة
    const newCategory = await prisma.categories.create({
      data: {
        id: `cat-${Date.now()}`, // إنشاء ID فريد
        name,
        slug,
        description,
        color: color || '#3B82F6',
        icon: icon || '📂',
        parent_id,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log('✅ [Categories API] تم إضافة الفئة بنجاح');
    
    return NextResponse.json({
      success: true,
      data: newCategory,
      message: 'تم إضافة الفئة بنجاح'
    });
    
  } catch (error) {
    console.error('❌ [Categories API] خطأ في إضافة الفئة:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في إضافة الفئة',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}

// OPTIONS: معالجة طلبات CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// GET: جلب جميع الفئات مع معالجة أخطاء محسنة
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🏷️ [Categories API] بدء جلب الفئات...');
    
    // استيراد آمن لـ Prisma
    let prisma, ensureConnection;
    try {
      const prismaModule = await import('@/lib/prisma');
      prisma = prismaModule.prisma;
      ensureConnection = prismaModule.ensureConnection;
      console.log('✅ [Categories API] تم تحميل Prisma بنجاح');
    } catch (error) {
      console.error('❌ [Categories API] فشل تحميل Prisma:', error);
      return NextResponse.json({
        success: false,
        error: 'خطأ في النظام - فشل تحميل قاعدة البيانات',
        code: 'PRISMA_IMPORT_FAILED'
      }, { status: 500 });
    }

    // التأكد من الاتصال بقاعدة البيانات
    let isConnected = false;
    try {
      isConnected = await ensureConnection();
      console.log('🔗 [Categories API] حالة الاتصال بقاعدة البيانات:', isConnected);
    } catch (error) {
      console.error('❌ [Categories API] خطأ في فحص الاتصال:', error);
    }
    
    if (!isConnected) {
      console.error('❌ [Categories API] فشل الاتصال بقاعدة البيانات');
      
      // إرجاع فئات افتراضية في حالة فشل الاتصال
      const fallbackCategories = [
        { id: '1', name: 'عام', slug: 'general', color: '#3B82F6', icon: '📰' },
        { id: '2', name: 'رياضة', slug: 'sports', color: '#10B981', icon: '⚽' },
        { id: '3', name: 'تقنية', slug: 'tech', color: '#8B5CF6', icon: '💻' },
        { id: '4', name: 'سياسة', slug: 'politics', color: '#EF4444', icon: '🏛️' },
        { id: '5', name: 'اقتصاد', slug: 'economy', color: '#F59E0B', icon: '💰' }
      ];
      
      return NextResponse.json({
        success: true,
        data: fallbackCategories,
        categories: fallbackCategories,
        message: 'تم استخدام فئات افتراضية',
        fallback: true
      });
    }
    
    // جلب الفئات من قاعدة البيانات
    let categories = [];
    try {
      console.log('🔍 [Categories API] جلب الفئات من قاعدة البيانات...');
      
      categories = await prisma.categories.findMany({
        where: {
          is_active: true
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          color: true,
          icon: true,
          parent_id: true,
          sort_order: true,
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
          { sort_order: 'asc' },
          { name: 'asc' }
        ]
      });
      
      console.log(`📊 [Categories API] تم جلب ${categories.length} فئة من قاعدة البيانات`);
      
    } catch (dbError) {
      console.error('❌ [Categories API] خطأ في قاعدة البيانات:', dbError);
      
      // إرجاع فئات افتراضية في حالة خطأ قاعدة البيانات
      const fallbackCategories = [
        { id: '1', name: 'عام', slug: 'general', color: '#3B82F6', icon: '📰', articles_count: 0 },
        { id: '2', name: 'رياضة', slug: 'sports', color: '#10B981', icon: '⚽', articles_count: 0 },
        { id: '3', name: 'تقنية', slug: 'tech', color: '#8B5CF6', icon: '💻', articles_count: 0 },
        { id: '4', name: 'سياسة', slug: 'politics', color: '#EF4444', icon: '🏛️', articles_count: 0 },
        { id: '5', name: 'اقتصاد', slug: 'economy', color: '#F59E0B', icon: '💰', articles_count: 0 }
      ];
      
      return NextResponse.json({
        success: true,
        data: fallbackCategories,
        categories: fallbackCategories,
        message: 'تم استخدام فئات افتراضية بسبب خطأ في قاعدة البيانات',
        fallback: true,
        error_details: process.env.NODE_ENV === 'development' ? String(dbError) : undefined
      });
    }
    
    // تحويل البيانات للتوافق مع الواجهة
    const formattedCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color || '#3B82F6',
      icon: category.icon || '📂',
      parent_id: category.parent_id,
      sort_order: category.sort_order || 0,
      articles_count: category._count?.articles || 0,
      created_at: category.created_at,
      updated_at: category.updated_at
    }));
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ [Categories API] تم جلب ${formattedCategories.length} فئة بنجاح في ${responseTime}ms`);
    
    const response = NextResponse.json({
      success: true,
      data: formattedCategories,
      categories: formattedCategories,
      count: formattedCategories.length
    });
    
    response.headers.set('X-Response-Time', `${responseTime}ms`);
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    response.headers.set('Access-Control-Allow-Origin', '*');
    
    return response;
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ [Categories API] خطأ غير متوقع:', error);
    
    // إرجاع فئات افتراضية في حالة أي خطأ
    const emergencyCategories = [
      { id: 'emergency-1', name: 'عام', slug: 'general', color: '#3B82F6', icon: '📰' },
      { id: 'emergency-2', name: 'أخبار', slug: 'news', color: '#EF4444', icon: '📰' },
      { id: 'emergency-3', name: 'رياضة', slug: 'sports', color: '#10B981', icon: '⚽' }
    ];
    
    return NextResponse.json({
      success: true,
      data: emergencyCategories,
      categories: emergencyCategories,
      message: 'تم استخدام فئات طوارئ بسبب خطأ في النظام',
      emergency_fallback: true,
      responseTime: `${responseTime}ms`,
      error_details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 200 }); // نرجع 200 لأننا نعطي بيانات افتراضية
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

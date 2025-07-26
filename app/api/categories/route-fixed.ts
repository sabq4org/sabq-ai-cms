import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// دالة مساعدة لإضافة CORS headers
function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// GET: جلب جميع الفئات مع معالجة أخطاء محسنة
export async function GET(request: NextRequest) {
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
      
      // إرجاع فئات افتراضية في حالة فشل تحميل Prisma
      const fallbackCategories = [
        { id: '1', name: 'عام', slug: 'general', color: '#3B82F6', icon: '📰' },
        { id: '2', name: 'رياضة', slug: 'sports', color: '#10B981', icon: '⚽' },
        { id: '3', name: 'تقنية', slug: 'tech', color: '#8B5CF6', icon: '💻' },
        { id: '4', name: 'سياسة', slug: 'politics', color: '#EF4444', icon: '🏛️' },
        { id: '5', name: 'اقتصاد', slug: 'economy', color: '#F59E0B', icon: '💰' }
      ];
      
      const response = NextResponse.json({
        success: true,
        data: fallbackCategories,
        categories: fallbackCategories,
        message: 'تم استخدام فئات افتراضية - فشل تحميل النظام',
        fallback: true
      });
      
      return addCorsHeaders(response);
    }

    // التأكد من الاتصال بقاعدة البيانات
    let isConnected = false;
    try {
      isConnected = await ensureConnection();
      console.log('🔗 [Categories API] حالة الاتصال:', isConnected);
    } catch (error) {
      console.error('❌ [Categories API] خطأ في فحص الاتصال:', error);
    }
    
    if (!isConnected) {
      console.error('❌ [Categories API] فشل الاتصال بقاعدة البيانات');
      
      // إرجاع فئات افتراضية
      const fallbackCategories = [
        { id: '1', name: 'عام', slug: 'general', color: '#3B82F6', icon: '📰' },
        { id: '2', name: 'رياضة', slug: 'sports', color: '#10B981', icon: '⚽' },
        { id: '3', name: 'تقنية', slug: 'tech', color: '#8B5CF6', icon: '💻' },
        { id: '4', name: 'سياسة', slug: 'politics', color: '#EF4444', icon: '🏛️' },
        { id: '5', name: 'اقتصاد', slug: 'economy', color: '#F59E0B', icon: '💰' }
      ];
      
      const response = NextResponse.json({
        success: true,
        data: fallbackCategories,
        categories: fallbackCategories,
        message: 'تم استخدام فئات افتراضية - فشل اتصال قاعدة البيانات',
        fallback: true
      });
      
      return addCorsHeaders(response);
    }
    
    // جلب الفئات من قاعدة البيانات
    let categories = [];
    try {
      console.log('🔍 [Categories API] جلب الفئات من قاعدة البيانات...');
      
      categories = await prisma.categories.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          color: true,
          icon: true,
          created_at: true,
          updated_at: true
        },
        orderBy: {
          name: 'asc'
        }
      });
      
      console.log(`📊 [Categories API] تم جلب ${categories.length} فئة`);
      
    } catch (dbError) {
      console.error('❌ [Categories API] خطأ في قاعدة البيانات:', dbError);
      
      // إرجاع فئات افتراضية في حالة خطأ قاعدة البيانات
      const fallbackCategories = [
        { id: '1', name: 'عام', slug: 'general', color: '#3B82F6', icon: '📰' },
        { id: '2', name: 'رياضة', slug: 'sports', color: '#10B981', icon: '⚽' },
        { id: '3', name: 'تقنية', slug: 'tech', color: '#8B5CF6', icon: '💻' },
        { id: '4', name: 'سياسة', slug: 'politics', color: '#EF4444', icon: '🏛️' },
        { id: '5', name: 'اقتصاد', slug: 'economy', color: '#F59E0B', icon: '💰' }
      ];
      
      const response = NextResponse.json({
        success: true,
        data: fallbackCategories,
        categories: fallbackCategories,
        message: 'تم استخدام فئات افتراضية - خطأ في قاعدة البيانات',
        fallback: true
      });
      
      return addCorsHeaders(response);
    }
    
    // تحويل البيانات للتوافق مع الواجهة
    const formattedCategories = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '#3B82F6',
      icon: category.icon || '📂',
      created_at: category.created_at,
      updated_at: category.updated_at
    }));
    
    console.log(`✅ [Categories API] تم جلب ${formattedCategories.length} فئة بنجاح`);
    
    const response = NextResponse.json({
      success: true,
      data: formattedCategories,
      categories: formattedCategories,
      count: formattedCategories.length
    });
    
    response.headers.set('Cache-Control', 'public, max-age=300');
    return addCorsHeaders(response);
    
  } catch (error) {
    console.error('❌ [Categories API] خطأ غير متوقع:', error);
    
    // إرجاع فئات طوارئ في حالة أي خطأ
    const emergencyCategories = [
      { id: 'emergency-1', name: 'عام', slug: 'general', color: '#3B82F6', icon: '📰' },
      { id: 'emergency-2', name: 'أخبار', slug: 'news', color: '#EF4444', icon: '📰' }
    ];
    
    const response = NextResponse.json({
      success: true,
      data: emergencyCategories,
      categories: emergencyCategories,
      message: 'تم استخدام فئات طوارئ - خطأ في النظام',
      emergency: true
    });
    
    return addCorsHeaders(response);
  }
}

// POST: إضافة فئة جديدة
export async function POST(request: NextRequest) {
  try {
    console.log('➕ [Categories API] بدء إضافة فئة...');
    
    const body = await request.json();
    const { name, slug, description, color, icon } = body;
    
    if (!name || !slug) {
      const response = NextResponse.json({
        success: false,
        error: 'اسم الفئة والرابط مطلوبان'
      }, { status: 400 });
      
      return addCorsHeaders(response);
    }

    // استيراد آمن لـ Prisma
    const { prisma, ensureConnection } = await import('@/lib/prisma');
    
    // التأكد من الاتصال بقاعدة البيانات
    const isConnected = await ensureConnection();
    if (!isConnected) {
      const response = NextResponse.json({
        success: false,
        error: 'فشل الاتصال بقاعدة البيانات'
      }, { status: 503 });
      
      return addCorsHeaders(response);
    }
    
    // إنشاء الفئة الجديدة
    const newCategory = await prisma.categories.create({
      data: {
        name,
        slug,
        description: description || '',
        color: color || '#3B82F6',
        icon: icon || '📂'
      }
    });
    
    console.log('✅ [Categories API] تم إضافة الفئة بنجاح');
    
    const response = NextResponse.json({
      success: true,
      data: newCategory,
      message: 'تم إضافة الفئة بنجاح'
    });
    
    return addCorsHeaders(response);
    
  } catch (error) {
    console.error('❌ [Categories API] خطأ في إضافة الفئة:', error);
    
    const response = NextResponse.json({
      success: false,
      error: 'فشل في إضافة الفئة'
    }, { status: 500 });
    
    return addCorsHeaders(response);
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

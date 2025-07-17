import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// تم إزالة الـ imports المدمرة للـ mapping
// import { normalizeUserInterests, categorySlugToId, getCategoryInfo } from '@/lib/interests-mapping';

// دالة مساعدة لإضافة CORS headers
function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// دالة لإنشاء response مع CORS headers
function corsResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  return addCorsHeaders(response);
}

// معالجة طلبات OPTIONS للـ CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization, Accept',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// GET: جلب التصنيفات المحفوظة للمستخدم
export async function GET(request: NextRequest) {
  try {
    // التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return corsResponse({
        success: false,
        error: 'معرف المستخدم مطلوب'
      }, 400);
    }

    console.log('🔍 جلب التصنيفات المحفوظة للمستخدم:', userId);

    // للمستخدمين الضيوف
    if (userId.startsWith('guest-')) {
      console.log('👤 مستخدم ضيف - إرجاع قائمة فارغة');
      return corsResponse({
        success: true,
        categoryIds: [],
        source: 'guest'
      });
    }

    // جلب التفضيلات من جدول user_preferences
    const preference = await prisma.user_preferences.findUnique({
      where: {
        user_id_key: {
          user_id: userId,
          key: 'interests'
        }
      }
    });

    if (preference) {
      const preferenceData = preference.value as any || {};
      const categoryIds = preferenceData.interests || [];
      
      // استخدام البيانات المحفوظة مباشرة بدون تحويل مدمر
      console.log('✅ تم العثور على التفضيلات المحفوظة:', {
        categoryIds: categoryIds,
        source: 'user_preferences'
      });
      
      return corsResponse({
        success: true,
        categoryIds: categoryIds,
        source: 'user_preferences'
      });
    }

    console.log('❌ لم يتم العثور على تفضيلات للمستخدم');

    return corsResponse({
      success: true,
      categoryIds: [],
      source: 'none'
    });

  } catch (error) {
    console.error('خطأ في جلب التصنيفات المحفوظة:', error);
    return corsResponse({
      success: false,
      error: 'حدث خطأ في جلب التصنيفات المحفوظة'
    }, 500);
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper function للاستجابة مع CORS
function corsResponse(data: any, status: number = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// GET: جلب اهتمامات المستخدم
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return corsResponse({
        success: false,
        error: 'معرف المستخدم مطلوب'
      }, 400);
    }

    // جلب اهتمامات المستخدم من user_preferences
    const userPreference = await prisma.user_preferences.findUnique({
      where: {
        user_id_key: {
          user_id: userId,
          key: 'interests'
        }
      }
    });

    let categoryIds: number[] = [];

    if (userPreference && userPreference.value) {
      const preferenceData = userPreference.value as any;
      
             // التعامل مع صيغ مختلفة للبيانات
       if (Array.isArray(preferenceData)) {
         categoryIds = preferenceData.map((id: any) => parseInt(String(id))).filter((id: number) => !isNaN(id));
       } else if (preferenceData.interests && Array.isArray(preferenceData.interests)) {
         categoryIds = preferenceData.interests.map((id: any) => parseInt(String(id))).filter((id: number) => !isNaN(id));
       } else if (preferenceData.categoryIds && Array.isArray(preferenceData.categoryIds)) {
         categoryIds = preferenceData.categoryIds.map((id: any) => parseInt(String(id))).filter((id: number) => !isNaN(id));
       }
    }

    // جلب معلومات التصنيفات
    let categories: any[] = [];
    if (categoryIds.length > 0) {
      try {
        // محاولة جلب من قاعدة البيانات أولاً
                 const dbCategories = await prisma.categories.findMany({
           where: {
             id: { in: categoryIds.map((id: number) => String(id)) },
             is_active: true
           },
           orderBy: { display_order: 'asc' }
         });

        if (dbCategories.length > 0) {
          categories = dbCategories.map((cat: any) => ({
            id: parseInt(cat.id) || cat.id,
            name: cat.name,
            name_ar: cat.name,
            name_en: cat.name_en || '',
            slug: cat.slug,
            description: cat.description || '',
            color: cat.color || '#6B7280',
            color_hex: cat.color || '#6B7280',
            icon: cat.icon || '📁',
            position: cat.display_order || 0
          }));
        } else {
          // إذا لم نجد في قاعدة البيانات، نجلب من ملف JSON
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/data/categories.json`);
          const data = await response.json();
          
          if (data.categories) {
            categories = data.categories
              .filter((cat: any) => categoryIds.includes(cat.id) && cat.is_active)
              .map((cat: any) => ({
                id: cat.id,
                name: cat.name_ar,
                name_ar: cat.name_ar,
                name_en: cat.name_en || '',
                slug: cat.slug,
                description: cat.description || '',
                color: cat.color_hex || '#6B7280',
                color_hex: cat.color_hex || '#6B7280',
                icon: cat.icon || '📁',
                position: cat.position || 0
              }));
          }
        }
      } catch (dbError) {
        console.error('خطأ في جلب التصنيفات:', dbError);
                 // إرجاع معرفات فقط في حالة الخطأ
         categories = categoryIds.map((id: number) => ({ id, name: `تصنيف ${id}` }));
      }
    }

    return corsResponse({
      success: true,
      data: {
        categoryIds,
        categories,
        count: categoryIds.length
      }
    });

  } catch (error) {
    console.error('خطأ في جلب الاهتمامات:', error);
    return corsResponse({
      success: false,
      error: 'حدث خطأ في جلب الاهتمامات'
    }, 500);
  }
}

// POST: حفظ اهتمامات المستخدم
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, categoryIds, source = 'manual' } = body;

    if (!userId) {
      return corsResponse({
        success: false,
        error: 'معرف المستخدم مطلوب'
      }, 400);
    }

    if (!categoryIds || !Array.isArray(categoryIds)) {
      return corsResponse({
        success: false,
        error: 'قائمة التصنيفات مطلوبة'
      }, 400);
    }

         // تحويل جميع المعرفات إلى أرقام
     const numericCategoryIds = categoryIds.map((id: any) => parseInt(String(id))).filter((id: number) => !isNaN(id));

    if (numericCategoryIds.length === 0) {
      return corsResponse({
        success: false,
        error: 'يجب اختيار تصنيف واحد على الأقل'
      }, 400);
    }

    if (numericCategoryIds.length > 5) {
      return corsResponse({
        success: false,
        error: 'لا يمكن اختيار أكثر من 5 تصنيفات'
      }, 400);
    }

    try {
      // للمستخدمين الضيوف، نحفظ في localStorage فقط
      if (userId.startsWith('guest-')) {
        console.log('💾 حفظ تفضيلات الضيف:', { userId, categoryIds: numericCategoryIds });
        return corsResponse({
          success: true,
          message: 'تم حفظ التفضيلات للمستخدم الضيف',
          data: {
            userId,
            categoryIds: numericCategoryIds,
            source
          }
        });
      }

      // للمستخدمين المسجلين، نحفظ في قاعدة البيانات
      const preferenceData = {
        interests: numericCategoryIds,
        categoryIds: numericCategoryIds,
        interests_updated_at: new Date().toISOString(),
        interests_source: source
      };

      await prisma.user_preferences.upsert({
        where: {
          user_id_key: {
            user_id: userId,
            key: 'interests'
          }
        },
        update: {
          value: preferenceData,
          updated_at: new Date()
        },
        create: {
          id: `pref-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: userId,
          key: 'interests',
          value: preferenceData,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      console.log('✅ تم حفظ تفضيلات المستخدم:', { userId, categoryIds: numericCategoryIds });

      // حفظ نشاط في سجل النشاطات
      try {
        await prisma.activity_logs.create({
          data: {
            id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            user_id: userId,
            action: 'update_interests',
            metadata: {
              categoryIds: numericCategoryIds,
              count: numericCategoryIds.length,
              source
            },
            created_at: new Date()
          }
        });
      } catch (logError) {
        console.error('خطأ في حفظ سجل النشاط:', logError);
        // نتجاهل خطأ السجل ونستمر
      }

      return corsResponse({
        success: true,
        message: 'تم حفظ الاهتمامات بنجاح',
        data: {
          userId,
          categoryIds: numericCategoryIds,
          source,
          count: numericCategoryIds.length
        }
      });

    } catch (dbError) {
      console.error('خطأ في قاعدة البيانات:', dbError);
      
      // في حالة فشل قاعدة البيانات، نستمر بدون خطأ للضيوف
      if (userId.startsWith('guest-')) {
        return corsResponse({
          success: true,
          message: 'تم حفظ التفضيلات محلياً',
          data: { userId, categoryIds: numericCategoryIds, source }
        });
      }
      
      return corsResponse({
        success: false,
        error: 'حدث خطأ في حفظ الاهتمامات في قاعدة البيانات'
      }, 500);
    }

  } catch (error) {
    console.error('خطأ في معالجة الطلب:', error);
    return corsResponse({
      success: false,
      error: 'حدث خطأ في معالجة الطلب'
    }, 500);
  }
}

// PUT: تحديث اهتمامات المستخدم (نفس POST)
export async function PUT(request: NextRequest) {
  return POST(request);
}

// OPTIONS: للـ CORS
export async function OPTIONS() {
  return corsResponse({}, 200);
} 
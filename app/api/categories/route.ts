import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';










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

// دالة لمعالجة طلبات OPTIONS
function handleOptions(): NextResponse {
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

// معالجة طلبات OPTIONS للـ CORS
export async function OPTIONS() {
  return handleOptions();
}

export const runtime = 'nodejs';

// ===============================
// وظائف مساعدة
// ===============================

// توليد slug من الاسم
function generateSlug(name: string): string {
  if (!name || typeof name !== 'string') {
    return 'category-' + Date.now();
  }
  
  return name
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') // إزالة الشرطات من البداية والنهاية
    .trim() || 'category-' + Date.now(); // إذا كان النص فارغاً بعد التنظيف
}

// دالة لتطبيع البيانات المزدوجة (عندما يكون parsedData.ar عبارة عن JSON كنص)
function normalizeMetadata(md: any): any {
  if (!md || typeof md !== 'object') return md;
  
  // نسخة جديدة من الكائن
  let result = { ...md };
  
  // إذا كان ar يحتوي على JSON كنص
  if (result.ar && typeof result.ar === 'string') {
    const str = result.ar.trim();
    if (str.startsWith('{') && str.endsWith('}')) {
      try {
        const nested = JSON.parse(str);
        // دمج البيانات المتداخلة
        result = { ...result, ...nested };
        // حذف ar إذا كان يحتوي على JSON فقط
        if (Object.keys(nested).length > 0) {
          delete result.ar;
        }
      } catch (_) {
        // تجاهل إذا فشل التحويل
      }
    }
  }
  
  return result;
}

// ===============================
// معالجات API
// ===============================

// GET: جلب جميع الفئات
export async function GET(request: NextRequest) {
  try {
    // =================================================
    // تشخيص المشكلة: استخدام استعلام بسيط جدًا
    // =================================================
    const categories = await prisma.categories.findMany({
      take: 10, // جلب 10 فقط للاختبار
    });

    return corsResponse({
      success: true,
      message: "Test query successful",
      data: categories,
    });
    // =================================================
    // نهاية كود التشخيص - الكود الأصلي أدناه معطل
    // =================================================
/*
    const { searchParams } = new URL(request.url);
    
// ... (الكود الأصلي معطل بالكامل)
*/
  } catch (error) {
    console.error('خطأ في جلب الفئات:', error);
    return corsResponse({
      success: false,
      error: 'حدث خطأ في جلب الفئات'
    }, 500);
  }
}

// POST: إنشاء فئة جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // التحقق من البيانات المطلوبة - قبول name أو name_ar
    const categoryName = body.name || body.name_ar;
    const categorySlug = body.slug;
    
    if (!categoryName || !categorySlug) {
      return corsResponse({
        success: false,
        error: 'الاسم والمعرف (slug) مطلوبان'
      }, 400);
    }

    // التحقق من صحة الاسم - يجب أن يكون نصاً صحيحاً
    if (typeof categoryName !== 'string' || categoryName.trim().length === 0) {
      return corsResponse({
        success: false,
        error: 'الاسم يجب أن يكون نصاً صحيحاً'
      }, 400);
    }

    // التحقق من صحة الـ slug - يجب أن يكون نصاً صحيحاً
    if (typeof categorySlug !== 'string' || categorySlug.trim().length === 0) {
      return corsResponse({
        success: false,
        error: 'المعرف (slug) يجب أن يكون نصاً صحيحاً'
      }, 400);
    }
    
    // التحقق من عدم تكرار الـ slug
    const existingCategory = await prisma.categories.findFirst({
      where: { slug: categorySlug }
    });
    
    if (existingCategory) {
      return corsResponse({
        success: false,
        error: 'يوجد فئة أخرى بنفس المعرف (slug)'
      }, 400);
    }
    
    // إنشاء الفئة الجديدة
    const newCategory = await prisma.categories.create({
      data: {
        id: generateSlug(categoryName) + '-' + Date.now(),
        name: categoryName.trim(),
        slug: categorySlug.trim(),
        description: body.description || '',
        color: body.color || body.color_hex || '#6B7280',
        icon: body.icon || '📁',
        name_en: body.name_en || '',
        metadata: {
          ar: body.description || '',
          en: body.description_en || '',
          name_ar: categoryName.trim(),
          name_en: body.name_en || '',
          color_hex: body.color || body.color_hex || '#6B7280',
          icon: body.icon || '📁',
          meta_title: body.meta_title || '',
          meta_description: body.meta_description || '',
          og_image_url: body.og_image_url || '',
          canonical_url: body.canonical_url || '',
          noindex: body.noindex || false,
          og_type: body.og_type || 'website',
          cover_image: body.cover_image || ''
        },
        parent_id: body.parent_id || null,
        display_order: body.order_index || body.position || 0,
        is_active: body.is_active !== false,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    return corsResponse({
      success: true,
      data: newCategory,
      message: 'تم إنشاء الفئة بنجاح'
    }, 201);
    
  } catch (error) {
    console.error('خطأ في إنشاء الفئة:', error);
    
    // معالجة أخطاء Prisma بشكل أفضل
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return corsResponse({
          success: false,
          error: 'يوجد فئة أخرى بنفس الاسم أو المعرف'
        }, 400);
      }
      
      if (error.message.includes('Invalid value')) {
        return corsResponse({
          success: false,
          error: 'البيانات المرسلة غير صحيحة'
        }, 400);
      }
    }
    
    return corsResponse({
      success: false,
      error: 'فشل في إنشاء الفئة',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, 500);
  }
}

// PUT: تحديث فئة
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 PUT request received with body:', body);
    console.log('🖼️ Cover image in request:', body.cover_image);
    
    if (!body.id) {
      return corsResponse({
        success: false,
        error: 'معرف الفئة مطلوب'
      }, 400);
    }

    // التحقق من صحة المعرف
    if (typeof body.id !== 'string' || body.id.trim().length === 0) {
      return corsResponse({
        success: false,
        error: 'معرف الفئة يجب أن يكون نصاً صحيحاً'
      }, 400);
    }
    
    // التحقق من وجود الفئة
    const existingCategory = await prisma.categories.findUnique({
      where: { id: body.id }
    });
    
    if (!existingCategory) {
      return corsResponse({
        success: false,
        error: 'الفئة غير موجودة'
      }, 404);
    }
    
    // معالجة البيانات الموجودة
    let existingMetadata: any = {};
    if (existingCategory.description) {
      try {
        existingMetadata = normalizeMetadata(JSON.parse(existingCategory.description));
      } catch (e) {
        // إذا فشل التحليل، استخدم قيم افتراضية
        console.warn('فشل في تحليل البيانات الموجودة:', e);
      }
    }
    
    // التحقق من صحة البيانات الجديدة
    const categoryName = body.name || body.name_ar || existingCategory.name;
    if (typeof categoryName !== 'string' || categoryName.trim().length === 0) {
      return corsResponse({
        success: false,
        error: 'اسم الفئة يجب أن يكون نصاً صحيحاً'
      }, 400);
    }
    
    // دمج البيانات الجديدة مع القديمة
    const updatedMetadata = {
      ...existingMetadata,
      ar: body.description !== undefined ? (body.description || '') : (typeof existingMetadata.ar === 'string' && existingMetadata.ar.startsWith('{')) ? '' : existingMetadata.ar,
      en: body.description_en !== undefined ? (body.description_en || '') : existingMetadata.en,
      name_ar: categoryName.trim(),
      name_en: body.name_en !== undefined ? (body.name_en || '') : existingMetadata.name_en,
      color_hex: body.color || body.color_hex || existingMetadata.color_hex || '#6B7280',
      icon: body.icon !== undefined ? (body.icon || '📁') : existingMetadata.icon || '📁',
      meta_title: body.meta_title !== undefined ? (body.meta_title || '') : existingMetadata.meta_title,
      meta_description: body.meta_description !== undefined ? (body.meta_description || '') : existingMetadata.meta_description,
      og_image_url: body.og_image_url !== undefined ? (body.og_image_url || '') : existingMetadata.og_image_url,
      canonical_url: body.canonical_url !== undefined ? (body.canonical_url || '') : existingMetadata.canonical_url,
      noindex: body.noindex !== undefined ? (body.noindex || false) : existingMetadata.noindex,
      og_type: body.og_type !== undefined ? (body.og_type || 'website') : existingMetadata.og_type || 'website',
      cover_image: body.cover_image !== undefined ? (body.cover_image || '') : existingMetadata.cover_image
    };
    
    // Log للتحقق من cover_image
    console.log('Updating category with cover_image:', {
      categoryId: body.id,
      oldCoverImage: existingMetadata.cover_image,
      newCoverImage: body.cover_image,
      finalCoverImage: updatedMetadata.cover_image
    });
    
    // تحديث الفئة
    const updatedCategory = await prisma.categories.update({
      where: { id: body.id },
      data: {
        name: categoryName.trim(),
        description: body.description !== undefined ? (body.description || '') : (existingMetadata.ar || ''),
        color: updatedMetadata.color_hex || '#6B7280',
        icon: updatedMetadata.icon || '📁',
        name_en: updatedMetadata.name_en || '',
        metadata: updatedMetadata,
        parent_id: body.parent_id !== undefined ? (body.parent_id || null) : existingCategory.parent_id,
        display_order: body.order_index ?? body.position ?? existingCategory.display_order,
        is_active: body.is_active ?? existingCategory.is_active,
        updated_at: new Date()
      }
    });
    
    console.log('✅ Category updated successfully');
    console.log('📷 Saved metadata:', updatedCategory.metadata);
    
    // إرجاع البيانات مع cover_image من metadata
    const responseData = {
      ...updatedCategory,
      cover_image: (updatedCategory.metadata as any)?.cover_image || '',
      name_ar: updatedCategory.name,
      name_en: (updatedCategory.metadata as any)?.name_en || updatedCategory.name_en || '',
      description: (updatedCategory.metadata as any)?.ar || updatedCategory.description || '',
      description_en: (updatedCategory.metadata as any)?.en || '',
      color: updatedCategory.color || (updatedCategory.metadata as any)?.color_hex || '#6B7280',
      color_hex: updatedCategory.color || (updatedCategory.metadata as any)?.color_hex || '#6B7280',
      icon: updatedCategory.icon || (updatedCategory.metadata as any)?.icon || '📁',
      articles_count: 0
    };
    
    console.log('�� Returning category with cover_image:', responseData.cover_image);
    
    return corsResponse({
      success: true,
      data: responseData,
      message: 'تم تحديث الفئة بنجاح'
    });
    
  } catch (error) {
    console.error('خطأ في تحديث الفئة:', error);
    
    // معالجة أخطاء Prisma بشكل أفضل
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return corsResponse({
          success: false,
          error: 'يوجد فئة أخرى بنفس الاسم'
        }, 400);
      }
      
      if (error.message.includes('Invalid value')) {
        return corsResponse({
          success: false,
          error: 'البيانات المرسلة غير صحيحة'
        }, 400);
      }
      
      if (error.message.includes('Record to update not found')) {
        return corsResponse({
          success: false,
          error: 'الفئة غير موجودة'
        }, 404);
      }
    }
    
    return corsResponse({
      success: false,
      error: 'فشل في تحديث الفئة',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, 500);
  }
}

// DELETE: حذف فئة
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const ids = body.ids || [];
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return corsResponse({
        success: false,
        error: 'معرفات الفئات مطلوبة'
      }, 400);
    }
    
    // التحقق من وجود مقالات مرتبطة
    const articlesCount = await prisma.articles.count({
      where: {
        category_id: { in: ids }
      }
    });
    
    if (articlesCount > 0) {
      return corsResponse({
        success: false,
        error: 'لا يمكن حذف الفئات لوجود مقالات مرتبطة بها',
        articles_count: articlesCount
      }, 400);
    }
    
    // حذف الفئات
    const result = await prisma.categories.deleteMany({
      where: {
        id: { in: ids }
      }
    });
    
    return corsResponse({
      success: true,
      affected: result.count,
      message: `تم حذف ${result.count} فئة/فئات بنجاح`
    });
    
  } catch (error) {
    console.error('خطأ في حذف الفئات:', error);
    return corsResponse({
      success: false,
      error: 'فشل في حذف الفئات',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, 500);
  }
} 
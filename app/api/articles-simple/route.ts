import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// معرفات افتراضية للاختبار
const DEFAULT_ADMIN_ID = "user-1750236579398-3h4rt6gu7"; // علي عبده
const DEFAULT_CATEGORY_ID = "cat-001"; // محليات

// دالة مساعدة لتوليد ID
function generateId() {
  return `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// دالة لتوليد slug
function generateSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF-]/g, '') // إزالة الأحرف الخاصة مع الحفاظ على العربية
    .replace(/\s+/g, '-') // استبدال المسافات بـ -
    .replace(/-+/g, '-') // إزالة - المتكررة
    .replace(/^-+|-+$/g, '') // إزالة - من البداية والنهاية
    || `article-${Date.now()}`; // fallback إذا كان العنوان فارغ
}

// إنشاء مقال جديد - مبسط
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/articles-simple - بداية معالجة الطلب');
    
    const data = await request.json();
    console.log('📦 البيانات المستلمة:', JSON.stringify(data, null, 2));
    
    // التحقق من البيانات المطلوبة
    if (!data.title || !data.content) {
      return NextResponse.json({
        success: false,
        error: 'العنوان والمحتوى مطلوبان'
      }, { status: 400 });
    }
    
    // استخدام القيم الافتراضية إذا لم تُرسل
    const author_id = data.author_id || DEFAULT_ADMIN_ID;
    const category_id = data.category_id || DEFAULT_CATEGORY_ID;
    
    // تنقية البيانات للتأكد من مطابقتها لنموذج articles
    const articleData = {
      id: data.id || generateId(),
      title: data.title,
      slug: data.slug || generateSlug(data.title),
      content: data.content,
      excerpt: data.excerpt || data.summary || null,
      author_id: author_id,
      category_id: category_id,
      status: data.status || 'draft',
      featured: data.featured || false,
      breaking: data.breaking || false,
      featured_image: data.featured_image || null,
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      seo_keywords: data.seo_keywords || null,
      published_at: data.status === 'published' ? new Date() : null,
      updated_at: new Date()
    };
    
    console.log('📝 بيانات المقال المنقاة:', articleData);
    
    // إنشاء المقال مباشرة
    const article = await prisma.articles.create({
      data: articleData
    });
    
    console.log('✅ تم إنشاء المقال بنجاح:', article.id);
    
    return NextResponse.json({
      success: true,
      article,
      message: data.status === 'published' ? 'تم نشر المقال بنجاح' : 'تم حفظ المسودة بنجاح'
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في إنشاء المقال:', error);
    console.error('Stack trace:', error.stack);
    
    // معالجة أخطاء Prisma الشائعة
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'المقال موجود مسبقاً',
        details: 'يوجد مقال بنفس العنوان أو المعرف'
      }, { status: 409 });
    }
    
    if (error.code === 'P2003') {
      const field = error.meta?.field_name || 'unknown';
      let message = 'خطأ في البيانات المرجعية';
      let details = 'التصنيف أو المؤلف غير موجود';
      
      if (field.includes('author')) {
        message = 'المستخدم المحدد غير موجود';
        details = `معرف المستخدم: ${data.author_id}`;
      } else if (field.includes('category')) {
        message = 'التصنيف المحدد غير موجود';
        details = `معرف التصنيف: ${data.category_id}`;
      }
      
      return NextResponse.json({
        success: false,
        error: message,
        details,
        debug: {
          field,
          received_data: { error: 'البيانات غير متاحة في معالج الخطأ' }
        }
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء المقال',
      details: error.message || 'خطأ غير معروف',
      code: error.code
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// تحديث مقال - مبسط
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 PUT /api/articles-simple - بداية معالجة الطلب');
    
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'معرف المقال مطلوب'
      }, { status: 400 });
    }
    
    // التحقق من وجود المقال
    const existingArticle = await prisma.articles.findUnique({
      where: { id }
    });
    
    if (!existingArticle) {
      return NextResponse.json({
        success: false,
        error: 'المقال غير موجود'
      }, { status: 404 });
    }
    
    // إعداد بيانات التحديث
    const updatePayload: any = {
      updated_at: new Date()
    };
    
    // تحديث الحقول المرسلة فقط
    if (updateData.title) updatePayload.title = updateData.title;
    if (updateData.content) updatePayload.content = updateData.content;
    if (updateData.excerpt !== undefined) updatePayload.excerpt = updateData.excerpt;
    if (updateData.status) {
      updatePayload.status = updateData.status;
      if (updateData.status === 'published' && !existingArticle.published_at) {
        updatePayload.published_at = new Date();
      }
    }
    if (updateData.featured !== undefined) updatePayload.featured = updateData.featured;
    if (updateData.breaking !== undefined) updatePayload.breaking = updateData.breaking;
    if (updateData.featured_image !== undefined) updatePayload.featured_image = updateData.featured_image;
    if (updateData.category_id) updatePayload.category_id = updateData.category_id;
    if (updateData.slug) updatePayload.slug = updateData.slug;
    
    // تحديث المقال
    const updatedArticle = await prisma.articles.update({
      where: { id },
      data: updatePayload
    });
    
    console.log('✅ تم تحديث المقال بنجاح:', updatedArticle.id);
    
    return NextResponse.json({
      success: true,
      article: updatedArticle,
      message: 'تم تحديث المقال بنجاح'
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في تحديث المقال:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في تحديث المقال',
      details: error.message || 'خطأ غير معروف'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
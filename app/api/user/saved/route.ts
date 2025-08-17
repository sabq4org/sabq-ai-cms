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

// GET: جلب المقالات المحفوظة
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!userId) {
      return corsResponse({
        success: false,
        error: 'معرف المستخدم مطلوب'
      }, 400);
    }

    try {
      // جلب المحفوظات من قاعدة البيانات (مبسط)
      const saved = await prisma.interactions.findMany({
        where: {
          user_id: userId,
          type: 'save'
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      });

      // حساب العدد الكلي
      const totalCount = await prisma.interactions.count({
        where: {
          user_id: userId,
          type: 'save'
        }
      });

      const hasMore = skip + saved.length < totalCount;

      // جلب تفاصيل المقالات منفصلة
      const savedWithArticles = await Promise.all(
        saved.map(async (save) => {
          try {
            // محاولة جلب تفاصيل المقال من API
            const articleResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/articles/${save.article_id}`);
            if (articleResponse.ok) {
              const articleData = await articleResponse.json();
              return {
                id: save.id,
                articleId: save.article_id,
                savedAt: save.created_at,
                article: articleData.success ? articleData.data : null
              };
            }
          } catch (error) {
            console.error('فشل في جلب تفاصيل المقال:', error);
          }
          
          // إرجاع بيانات أساسية إذا فشل جلب تفاصيل المقال
          return {
            id: save.id,
            articleId: save.article_id,
            savedAt: save.created_at,
            article: {
              id: save.article_id,
              title: `مقال محفوظ ${save.article_id}`,
              slug: `article-${save.article_id}`,
              excerpt: 'لم يتم تحميل تفاصيل المقال...',
              authorName: 'غير محدد',
              publishedAt: save.created_at,
              featuredImage: null,
              categoryId: '1',
              readingTime: 5
            }
          };
        })
      );

      return corsResponse({
        success: true,
        data: {
          saved: savedWithArticles.filter(save => save.article !== null),
          pagination: {
            page,
            limit,
            total: totalCount,
            hasMore
          }
        }
      });

    } catch (dbError) {
      console.error('خطأ في قاعدة البيانات:', dbError);
      
      // fallback للبيانات الافتراضية
      const mockSaved = [
        {
          id: 'save-1',
          articleId: 'article-1',
          savedAt: new Date(),
          article: {
            id: 'article-1',
            title: 'مقال محفوظ تجريبي',
            slug: 'test-saved-article-1',
            excerpt: 'هذا مقال تجريبي لاختبار عرض المحفوظات...',
            authorName: 'كاتب تجريبي',
            publishedAt: new Date(),
            featuredImage: null,
            categoryId: '1',
            readingTime: 8
          }
        }
      ];

      return corsResponse({
        success: true,
        data: {
          saved: mockSaved,
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            hasMore: false
          }
        },
        note: 'بيانات تجريبية - تم استخدامها بسبب خطأ في قاعدة البيانات'
      });
    }

  } catch (error) {
    console.error('خطأ في جلب المحفوظات:', error);
    return corsResponse({
      success: false,
      error: 'حدث خطأ في جلب المحفوظات'
    }, 500);
  }
}

// POST: إضافة مقال للمحفوظات
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, articleId } = body;

    if (!userId || !articleId) {
      return corsResponse({
        success: false,
        error: 'معرف المستخدم ومعرف المقال مطلوبان'
      }, 400);
    }

    try {
      // التحقق من وجود الحفظ مسبقاً
      const existingSave = await prisma.interactions.findFirst({
        where: {
          user_id: userId,
          article_id: articleId,
          type: 'save'
        }
      });

      if (existingSave) {
        return corsResponse({
          success: false,
          error: 'تم حفظ المقال مسبقاً'
        }, 409);
      }

      // إضافة الحفظ
      await prisma.interactions.create({
        data: {
          id: `save-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: userId,
          article_id: articleId,
          type: 'save',
          created_at: new Date()
        }
      });

      console.log(`✅ تم حفظ مقال جديد: ${userId} -> ${articleId}`);

      return corsResponse({
        success: true,
        message: 'تم حفظ المقال بنجاح'
      });

    } catch (dbError) {
      console.error('خطأ في قاعدة البيانات:', dbError);
      return corsResponse({
        success: false,
        error: 'حدث خطأ في حفظ المقال'
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

// DELETE: إزالة مقال من المحفوظات
export async function DELETE(request: NextRequest) {
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
    const articleId = searchParams.get('articleId');

    if (!userId || !articleId) {
      return corsResponse({
        success: false,
        error: 'معرف المستخدم ومعرف المقال مطلوبان'
      }, 400);
    }

    try {
      // إزالة الحفظ
      const deletedSave = await prisma.interactions.deleteMany({
        where: {
          user_id: userId,
          article_id: articleId,
          type: 'save'
        }
      });

      if (deletedSave.count === 0) {
        return corsResponse({
          success: false,
          error: 'لم يتم العثور على المقال المحفوظ'
        }, 404);
      }

      console.log(`✅ تم حذف المقال المحفوظ: ${userId} -> ${articleId}`);

      return corsResponse({
        success: true,
        message: 'تم إزالة المقال من المحفوظات بنجاح'
      });

    } catch (dbError) {
      console.error('خطأ في قاعدة البيانات:', dbError);
      return corsResponse({
        success: false,
        error: 'حدث خطأ في إزالة المقال من المحفوظات'
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

// OPTIONS: للـ CORS
export async function OPTIONS() {
  return corsResponse({}, 200);
} 
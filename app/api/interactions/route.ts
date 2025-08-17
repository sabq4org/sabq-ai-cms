import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// دالة لإضافة CORS headers
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
    },
  });
}

// GET - جلب التفاعلات للمقال أو المستخدم
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('article_id');
    const userId = searchParams.get('user_id');
    const type = searchParams.get('type');

    if (!articleId && !userId) {
      return corsResponse({
        success: false,
        error: 'يجب تحديد article_id أو user_id'
      }, 400);
    }

    // بناء شروط البحث
    const where: any = {};
    if (articleId) where.article_id = articleId;
    if (userId) where.user_id = userId;
    if (type) where.type = type;

    // جلب التفاعلات
    const interactions = await prisma.interactions.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        articles: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // إحصائيات التفاعل للمقال
    if (articleId && !userId && !type) {
      const stats = await prisma.interactions.groupBy({
        by: ['type'],
        where: { article_id: articleId },
        _count: true
      });

      const formattedStats = stats.reduce((acc: any, stat) => {
        acc[stat.type] = stat._count;
        return acc;
      }, {});

      // تحديث عدد التفاعلات في جدول المقالات
      const totalLikes = formattedStats.like || 0;
      const totalSaves = formattedStats.save || 0;
      const totalShares = formattedStats.share || 0;

      await prisma.articles.update({
        where: { id: articleId },
        data: {
          likes: totalLikes,
          saves: totalSaves,
          shares: totalShares
        }
      });

      return corsResponse({
        success: true,
        interactions,
        stats: formattedStats,
        total: interactions.length
      });
    }

    return corsResponse({
      success: true,
      interactions,
      total: interactions.length
    });

  } catch (error) {
    console.error('خطأ في جلب التفاعلات:', error);
    return corsResponse({
      success: false,
      error: 'فشل في جلب التفاعلات',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, 500);
  }
}

// POST - إضافة تفاعل جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, article_id, type, metadata } = body;

    // التحقق من البيانات المطلوبة
    if (!user_id || !article_id || !type) {
      return corsResponse({
        success: false,
        error: 'جميع الحقول مطلوبة: user_id, article_id, type'
      }, 400);
    }

    // التحقق من نوع التفاعل
    const validTypes = ['like', 'save', 'share', 'comment', 'view', 'reading_session'];
    if (!validTypes.includes(type)) {
      return corsResponse({
        success: false,
        error: `نوع التفاعل غير صالح. الأنواع المسموحة: ${validTypes.join(', ')}`
      }, 400);
    }

    // التحقق من وجود المستخدم والمقال
    const [user, article] = await Promise.all([
      prisma.users.findUnique({ where: { id: user_id } }),
      prisma.articles.findUnique({ where: { id: article_id } })
    ]);

    if (!user || !article) {
      return corsResponse({
        success: false,
        error: 'المستخدم أو المقال غير موجود'
      }, 404);
    }

    // للتفاعلات القابلة للتبديل (like, save)
    if (['like', 'save'].includes(type)) {
      // التحقق من وجود تفاعل سابق
      const existingInteraction = await prisma.interactions.findUnique({
        where: {
          user_id_article_id_type: {
            user_id,
            article_id,
            type
          }
        }
      });

      if (existingInteraction) {
        // حذف التفاعل الموجود (إلغاء الإعجاب/الحفظ)
        await prisma.interactions.delete({
          where: { id: existingInteraction.id }
        });

        // تحديث عدد التفاعلات في المقال
        const updateData: any = {};
        if (type === 'like') updateData.likes = { decrement: 1 };
        if (type === 'save') updateData.saves = { decrement: 1 };

        await prisma.articles.update({
          where: { id: article_id },
          data: updateData
        });

        return corsResponse({
          success: true,
          action: 'removed',
          message: `تم إلغاء ${type === 'like' ? 'الإعجاب' : 'الحفظ'}`
        });
      }
    }

    // إنشاء تفاعل جديد
    const interaction = await prisma.interactions.create({
      data: {
        id: uuidv4(),
        user_id,
        article_id,
        type,
        created_at: new Date()
      }
    });

    // تحديث إحصائيات المقال
    const updateData: any = {};
    if (type === 'like') updateData.likes = { increment: 1 };
    if (type === 'save') updateData.saves = { increment: 1 };
    if (type === 'share') updateData.shares = { increment: 1 };
    if (type === 'view') updateData.views = { increment: 1 };

    await prisma.articles.update({
      where: { id: article_id },
      data: updateData
    });

    // إضافة نقاط ولاء للمستخدم
    const pointsMap: any = {
      like: 1,
      save: 2,
      share: 3,
      comment: 5,
      reading_session: 10
    };

    if (pointsMap[type]) {
      await prisma.loyalty_points.create({
        data: {
          id: uuidv4(),
          user_id,
          points: pointsMap[type],
          action: `${type}_article`,
          reference_id: article_id,
          reference_type: 'article',
          metadata: {
            article_id,
            interaction_type: type,
            description: `تفاعل ${type} مع المقال`
          }
        }
      });
    }

    return corsResponse({
      success: true,
      interaction,
      action: 'added',
      message: 'تم تسجيل التفاعل بنجاح'
    });

  } catch (error) {
    console.error('خطأ في إضافة التفاعل:', error);
    return corsResponse({
      success: false,
      error: 'فشل في إضافة التفاعل',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, 500);
  }
}

// DELETE - حذف تفاعل
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const interactionId = searchParams.get('id');
    const userId = searchParams.get('user_id');

    if (!interactionId || !userId) {
      return corsResponse({
        success: false,
        error: 'يجب تحديد id و user_id'
      }, 400);
    }

    // التحقق من ملكية التفاعل
    const interaction = await prisma.interactions.findUnique({
      where: { id: interactionId }
    });

    if (!interaction) {
      return corsResponse({
        success: false,
        error: 'التفاعل غير موجود'
      }, 404);
    }

    if (interaction.user_id !== userId) {
      return corsResponse({
        success: false,
        error: 'لا تملك صلاحية حذف هذا التفاعل'
      }, 403);
    }

    // حذف التفاعل
    await prisma.interactions.delete({
      where: { id: interactionId }
    });

    // تحديث إحصائيات المقال
    const updateData: any = {};
    if (interaction.type === 'like') updateData.likes = { decrement: 1 };
    if (interaction.type === 'save') updateData.saves = { decrement: 1 };
    if (interaction.type === 'share') updateData.shares = { decrement: 1 };

    await prisma.articles.update({
      where: { id: interaction.article_id },
      data: updateData
    });

    return corsResponse({
      success: true,
      message: 'تم حذف التفاعل بنجاح'
    });

  } catch (error) {
    console.error('خطأ في حذف التفاعل:', error);
    return corsResponse({
      success: false,
      error: 'فشل في حذف التفاعل',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, 500);
  }
} 
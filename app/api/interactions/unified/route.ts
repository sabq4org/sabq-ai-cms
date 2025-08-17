import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// استخراج معرف المستخدم من الطلب
function getUserIdFromRequest(request: NextRequest): string | null {
  // محاولة من header user-id أولاً
  const userIdHeader = request.headers.get('user-id');
  if (userIdHeader && userIdHeader !== 'anonymous') {
    return userIdHeader;
  }

  // محاولة من Authorization Bearer token
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      // يمكن إضافة فك تشفير JWT هنا لاحقاً
      const token = authHeader.substring(7);
      // للبساطة الآن، نعتبر التوكن هو معرف المستخدم
      return token !== 'anonymous' ? token : null;
    } catch (error) {
      console.error('خطأ في فك تشفير التوكن:', error);
      return null;
    }
  }

  return null;
}

// Schema للتحقق من البيانات الواردة
const InteractionSchema = z.object({
  articleId: z.string().min(1, 'معرف المقال مطلوب'),
  type: z.enum(['like', 'save', 'share'], 'نوع التفاعل غير صحيح'),
  action: z.enum(['toggle', 'add', 'remove']).optional().default('toggle')
});

const GetUserInteractionsSchema = z.object({
  articleIds: z.array(z.string()).optional(),
  userId: z.string().optional()
});

/**
 * GET - جلب حالة تفاعلات المستخدم
 * Query params: ?articleIds=id1,id2,id3 أو ?userId=userId
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'غير مسموح - يجب تسجيل الدخول' }, { status: 401 });
    }

    const url = new URL(request.url);
    const articleIdsParam = url.searchParams.get('articleIds');
    const articleIds = articleIdsParam ? articleIdsParam.split(',') : undefined;

    // جلب جميع تفاعلات المستخدم
    const interactions = await prisma.interactions.findMany({
      where: {
        user_id: userId,
        ...(articleIds && { article_id: { in: articleIds } })
      },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            likes: true,
            saves: true,
            shares: true
          }
        }
      }
    });    // تنظيم البيانات في صيغة سهلة الاستخدام
    const userInteractions: Record<string, { liked: boolean; saved: boolean; shared: boolean }> = {};
    
    interactions.forEach(interaction => {
      if (!userInteractions[interaction.articleId]) {
        userInteractions[interaction.articleId] = {
          liked: false,
          saved: false,
          shared: false
        };
      }
      
      if (interaction.type === 'like') userInteractions[interaction.articleId].liked = true;
      if (interaction.type === 'save') userInteractions[interaction.articleId].saved = true;
      if (interaction.type === 'share') userInteractions[interaction.articleId].shared = true;
    });

    return NextResponse.json({
      success: true,
      data: userInteractions
    });

  } catch (error) {
    console.error('خطأ في جلب تفاعلات المستخدم:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في الخادم' 
    }, { status: 500 });
  }
}

/**
 * POST - إدارة تفاعل المستخدم (إضافة/إزالة/تبديل)
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'غير مسموح - يجب تسجيل الدخول' }, { status: 401 });
    }

    // التحقق من صحة البيانات الواردة
    const body = await request.json();
    const validatedData = InteractionSchema.parse(body);
    const { articleId, type, action } = validatedData;

    // التحقق من وجود المقال
    const article = await prisma.articles.findUnique({
      where: { id: articleId },
      select: { id: true, likes: true, saves: true, shares: true }
    });

    if (!article) {
      return NextResponse.json({ error: 'المقال غير موجود' }, { status: 404 });
    }

    // معالجة التفاعل باستخدام transaction للتأكد من consistency
    const result = await prisma.$transaction(async (tx) => {
      // البحث عن التفاعل الموجود
      const existingInteraction = await tx.interactions.findFirst({
        where: {
          user_id: userId,
          article_id: articleId,
          type: type
        }
      });

      let newInteractionState = false;
      let statsUpdate: any = {};

      // تحديد الإجراء المطلوب
      if (action === 'toggle') {
        newInteractionState = !existingInteraction;
      } else if (action === 'add') {
        newInteractionState = true;
      } else if (action === 'remove') {
        newInteractionState = false;
      }

      // تطبيق التغيير
      if (newInteractionState && !existingInteraction) {
        // إضافة تفاعل جديد
        await tx.interactions.create({
          data: {
            id: `${userId}-${articleId}-${type}-${Date.now()}`,
            user_id: userId,
            article_id: articleId,
            type: type
          }
        });

        // تحديث إحصائيات المقال
        if (type === 'like') statsUpdate.likes = { increment: 1 };
        if (type === 'save') statsUpdate.saves = { increment: 1 };
        if (type === 'share') statsUpdate.shares = { increment: 1 };

      } else if (!newInteractionState && existingInteraction) {
        // إزالة التفاعل الموجود
        await tx.interactions.delete({
          where: {
            id: existingInteraction.id
          }
        });

        // تحديث إحصائيات المقال
        if (type === 'like') statsUpdate.likes = { decrement: 1 };
        if (type === 'save') statsUpdate.saves = { decrement: 1 };
        if (type === 'share') statsUpdate.shares = { decrement: 1 };
      }

      // تحديث إحصائيات المقال إذا كان هناك تغيير
      if (Object.keys(statsUpdate).length > 0) {
        await tx.articles.update({
          where: { id: articleId },
          data: statsUpdate
        });
      }

      // جلب الإحصائيات المحدثة
      const updatedArticle = await tx.articles.findUnique({
        where: { id: articleId },
        select: { likes: true, saves: true, shares: true }
      });

      return {
        action: newInteractionState ? 'added' : 'removed',
        newState: newInteractionState,
        stats: updatedArticle
      };
    });

    // إضافة نقاط ولاء إذا كان تفاعل إيجابي
    if (result.action === 'added') {
      try {
        const pointsMap = { like: 1, save: 2, share: 3 };
        const points = pointsMap[type as keyof typeof pointsMap] || 0;
        
        if (points > 0) {
          await prisma.loyaltyPoint.create({
            data: {
              id: `${type}_points_${userId}_${articleId}_${Date.now()}`,
              userId: userId,
              sourceType: 'interaction',
              sourceId: articleId,
              pointsEarned: points,
              actionType: type,
              description: `${type === 'like' ? 'إعجاب' : type === 'save' ? 'حفظ' : 'مشاركة'} بمقال`,
              createdAt: new Date()
            }
          });
        }
      } catch (loyaltyError) {
        // نقاط الولاء ليست حرجة، نسجل الخطأ ونكمل
        console.warn('خطأ في إضافة نقاط الولاء:', loyaltyError);
      }
    }

    return NextResponse.json({
      success: true,
      action: result.action,
      [type]: result.newState,
      stats: result.stats,
      message: `تم ${result.action === 'added' ? 'إضافة' : 'إزالة'} ${
        type === 'like' ? 'الإعجاب' : type === 'save' ? 'الحفظ' : 'المشاركة'
      } بنجاح`
    });

  } catch (error) {
    console.error('خطأ في معالجة التفاعل:', error);
    
    // معالجة أخطاء التحقق من البيانات
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'بيانات غير صحيحة',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'حدث خطأ في معالجة التفاعل' 
    }, { status: 500 });
  }
}

/**
 * DELETE - حذف جميع تفاعلات المستخدم مع مقال معين
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'غير مسموح - يجب تسجيل الدخول' }, { status: 401 });
    }

    const url = new URL(request.url);
    const articleId = url.searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json({ error: 'معرف المقال مطلوب' }, { status: 400 });
    }

    // حذف جميع التفاعلات مع تحديث الإحصائيات
    await prisma.$transaction(async (tx) => {
      // العثور على التفاعلات الموجودة
      const existingInteractions = await tx.interactions.findMany({
        where: {
          user_id: userId,
          ...(articleId && { article_id: articleId })
        }
      });

      if (existingInteractions.length > 0) {
        // حساب التحديثات المطلوبة للإحصائيات
        const statsUpdate: any = { likes: 0, saves: 0, shares: 0 };
        existingInteractions.forEach(interaction => {
          if (interaction.type === 'like') statsUpdate.likes -= 1;
          if (interaction.type === 'save') statsUpdate.saves -= 1;
          if (interaction.type === 'share') statsUpdate.shares -= 1;
        });

        // حذف التفاعلات
        await tx.interactions.deleteMany({
          where: {
            user_id: userId,
            ...(articleId && { article_id: articleId })
          }
        });

        // تحديث إحصائيات المقال
        await tx.articles.update({
          where: { id: articleId },
          data: {
            likes: { increment: statsUpdate.likes },
            saves: { increment: statsUpdate.saves },
            shares: { increment: statsUpdate.shares }
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف جميع التفاعلات بنجاح'
    });

  } catch (error) {
    console.error('خطأ في حذف التفاعلات:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في حذف التفاعلات' 
    }, { status: 500 });
  }
}

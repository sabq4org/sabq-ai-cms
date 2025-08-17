import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Import Mock Database for testing when real DB is unavailable
const { MockPrisma } = require('@/lib/mockPrisma');

// Use Mock Database for testing
const prisma: any = new MockPrisma();
const usingMock = true;

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
      const token = authHeader.substring(7);
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
  article_id: z.string().min(1, 'معرف المقال مطلوب').optional(),
  articleId: z.string().min(1, 'معرف المقال مطلوب').optional(),
  type: z.enum(['like', 'save', 'share'], { 
    errorMap: () => ({ message: 'نوع التفاعل يجب أن يكون like أو save أو share' })
  }),
  action: z.enum(['toggle'], { 
    errorMap: () => ({ message: 'الإجراء يجب أن يكون toggle' })
  }).optional().default('toggle')
}).refine(data => data.article_id || data.articleId, {
  message: 'معرف المقال مطلوب (article_id أو articleId)',
  path: ['article_id']
});

// GET: جلب تفاعلات المستخدم
export async function GET(request: NextRequest) {
  if (usingMock) {
    console.log('🧪 Using Mock Database for GET request');
  }

  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'غير مصرح به - معرف المستخدم مطلوب',
        success: false 
      }, { status: 401 });
    }

    // استخراج معرفات المقالات من query string (اختياري)
    const { searchParams } = new URL(request.url);
    const articleIdsParam = searchParams.get('articleIds');
    const articleIds = articleIdsParam ? articleIdsParam.split(',') : undefined;

    // جلب جميع تفاعلات المستخدم
    const interactions = await prisma.interactions.findMany({
      where: {
        user_id: userId,
        ...(articleIds && { article_id: { in: articleIds } })
      },
      include: usingMock ? undefined : {
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
    });

    console.log(`✅ تم جلب ${interactions.length} تفاعل للمستخدم ${userId}${usingMock ? ' (Mock)' : ''}`);

    return NextResponse.json({ 
      success: true, 
      interactions,
      usingMock: usingMock,
      message: `تم جلب ${interactions.length} تفاعل بنجاح`
    });

  } catch (error: any) {
    console.error('خطأ في جلب تفاعلات المستخدم:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في الخادم',
      success: false,
      usingMock: usingMock
    }, { status: 500 });
  }
}

// POST: إضافة/إزالة تفاعل
export async function POST(request: NextRequest) {
  if (usingMock) {
    console.log('🧪 Using Mock Database for POST request');
  }

  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'غير مصرح به - معرف المستخدم مطلوب',
        success: false 
      }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = InteractionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'بيانات غير صحيحة',
        details: validationResult.error.errors,
        success: false 
      }, { status: 400 });
    }

    const { article_id, articleId, type } = validationResult.data;
    
    // استخدم article_id أو articleId
    const finalArticleId = article_id || articleId;

    // التحقق من وجود المقال (skip for mock)
    if (!usingMock) {
      const article = await prisma.articles.findUnique({
        where: { id: finalArticleId },
        select: { id: true, likes: true, saves: true, shares: true }
      });

      if (!article) {
        return NextResponse.json({ 
          error: 'المقال غير موجود',
          success: false 
        }, { status: 404 });
      }
    }

    // استخدام transaction للعمليات المتعددة
    const result = await prisma.$transaction(async (tx: any) => {
      // البحث عن التفاعل الموجود
        const existingInteraction = await tx.interactions.findFirst({
          where: {
            user_id: userId,
            article_id: finalArticleId,
            type: type
          }
        });      let isNowActive = false;
      let action = '';

      if (existingInteraction) {
        // إزالة التفاعل الموجود
        await tx.interactions.delete({
          where: {
            id: existingInteraction.id
          }
        });

        action = 'removed';
        isNowActive = false;
      } else {
        // إضافة تفاعل جديد
        await tx.interactions.create({
          data: {
            id: `${userId}-${finalArticleId}-${type}-${Date.now()}`,
            user_id: userId,
            article_id: finalArticleId,
            type: type
          }
        });

        action = 'added';
        isNowActive = true;
      }

      // تحديث إحصائيات المقال (skip for mock)
      if (!usingMock) {
        const increment = isNowActive ? 1 : -1;
        const updateData: any = {};
        
        if (type === 'like') updateData.likes = { increment };
        else if (type === 'save') updateData.saves = { increment };
        else if (type === 'share') updateData.shares = { increment };

        await tx.articles.update({
          where: { id: finalArticleId },
          data: updateData
        });
      }

      return { action, isNowActive };
    });

    console.log(`✅ تم ${result.action} تفاعل ${type} للمقال ${articleId}${usingMock ? ' (Mock)' : ''}`);

    return NextResponse.json({ 
      success: true,
      [type]: result.isNowActive,
      action: result.action,
      message: `تم ${result.action === 'added' ? 'إضافة' : 'إزالة'} ${type === 'like' ? 'الإعجاب' : type === 'save' ? 'الحفظ' : 'المشاركة'}`,
      usingMock: usingMock
    });

  } catch (error: any) {
    console.error('خطأ في معالجة التفاعل:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في معالجة التفاعل',
      success: false,
      usingMock: usingMock
    }, { status: 500 });
  }
}

// DELETE: حذف تفاعلات (للمقال الواحد أو جميع التفاعلات)
export async function DELETE(request: NextRequest) {
  if (usingMock) {
    console.log('🧪 Using Mock Database for DELETE request');
  }

  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'غير مصرح به - معرف المستخدم مطلوب',
        success: false 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    
    const body = await request.text();
    let bodyData = {};
    if (body) {
      try {
        bodyData = JSON.parse(body);
      } catch (e) {
        // تجاهل أخطاء parsing للـ body الفارغ
      }
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // العثور على التفاعلات الموجودة
      const existingInteractions = await tx.interactions.findMany({
        where: {
          user_id: userId,
          ...(articleId && { article_id: articleId })
        }
      });

      if (existingInteractions.length > 0) {
        // حذف التفاعلات
        const deleteResult = await tx.interactions.deleteMany({
          where: {
            user_id: userId,
            ...(articleId && { article_id: articleId })
          }
        });

        // تحديث إحصائيات المقال (skip for mock)
        if (!usingMock && articleId) {
          const statsUpdate = { likes: 0, saves: 0, shares: 0 };
          
          existingInteractions.forEach((interaction: any) => {
            if (interaction.type === 'like') statsUpdate.likes -= 1;
            if (interaction.type === 'save') statsUpdate.saves -= 1;
            if (interaction.type === 'share') statsUpdate.shares -= 1;
          });

          if (statsUpdate.likes !== 0 || statsUpdate.saves !== 0 || statsUpdate.shares !== 0) {
            await tx.articles.update({
              where: { id: articleId },
              data: {
                likes: { increment: statsUpdate.likes },
                saves: { increment: statsUpdate.saves },
                shares: { increment: statsUpdate.shares }
              }
            });
          }
        }

        return { deletedCount: deleteResult.count || existingInteractions.length };
      }

      return { deletedCount: 0 };
    });

    const message = articleId 
      ? `تم حذف ${result.deletedCount} تفاعل للمقال ${articleId}`
      : `تم حذف ${result.deletedCount} تفاعل`;

    console.log(`✅ ${message}${usingMock ? ' (Mock)' : ''}`);

    return NextResponse.json({ 
      success: true,
      deletedCount: result.deletedCount,
      message,
      usingMock: usingMock
    });

  } catch (error: any) {
    console.error('خطأ في حذف التفاعلات:', error);
    return NextResponse.json({ 
      error: 'حدث خطأ في حذف التفاعلات',
      success: false,
      usingMock: usingMock
    }, { status: 500 });
  }
}

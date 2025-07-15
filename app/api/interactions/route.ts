import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// معالجة CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// OPTIONS: معالجة طلبات CORS المسبقة
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET: جلب تفاعلات المستخدم مع مقال معين
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const articleId = searchParams.get('articleId');

    if (!userId || !articleId) {
      return NextResponse.json(
        { error: 'معرف المستخدم والمقال مطلوبان' },
        { status: 400, headers: corsHeaders }
      );
    }

    // جلب جميع التفاعلات للمستخدم مع هذا المقال
    const interactions = await prisma.interactions.findMany({
      where: {
        user_id: userId,
        article_id: articleId
      }
    });

    // تحويل التفاعلات إلى كائن للسهولة
    const interactionState = {
      liked: interactions.some(i => i.type === 'like'),
      saved: interactions.some(i => i.type === 'save'),
      shared: interactions.some(i => i.type === 'share'),
      viewed: interactions.some(i => i.type === 'view')
    };

    return NextResponse.json({
      success: true,
      data: interactionState,
      interactions: interactions
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error fetching interactions:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب التفاعلات' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST: إنشاء أو تحديث تفاعل
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, articleId, type, action = 'add' } = body;

    // التحقق من البيانات المطلوبة
    if (!userId || !articleId || !type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'معرف المستخدم والمقال ونوع التفاعل مطلوبة' 
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // التحقق من نوع التفاعل
    const validTypes = ['like', 'save', 'share', 'comment', 'view'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'نوع التفاعل غير صالح' 
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // معالجة التفاعل بناءً على الإجراء
    if (action === 'remove') {
      // حذف التفاعل إذا كان موجوداً
      await prisma.interactions.deleteMany({
        where: {
          user_id: userId,
          article_id: articleId,
          type: type as any
        }
      });

      // تحديث عدادات المقال
      if (type === 'like' || type === 'save' || type === 'share') {
        const updateField = type === 'save' ? 'saves' : `${type}s`;
        await prisma.articles.update({
          where: { id: articleId },
          data: {
            [updateField]: {
              decrement: 1
            }
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: `تم إلغاء ${type === 'like' ? 'الإعجاب' : type === 'save' ? 'الحفظ' : 'التفاعل'}`,
        action: 'removed'
      }, { headers: corsHeaders });

    } else {
      // إضافة التفاعل
      try {
        // استخدام upsert لتجنب التكرار
        const interaction = await prisma.interactions.upsert({
          where: {
            user_id_article_id_type: {
              user_id: userId,
              article_id: articleId,
              type: type as any
            }
          },
          update: {
            created_at: new Date() // تحديث وقت التفاعل
          },
          create: {
            id: `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            user_id: userId,
            article_id: articleId,
            type: type as any
          }
        });

        // تحديث عدادات المقال
        if (type === 'like' || type === 'save' || type === 'share' || type === 'view') {
          const updateField = type === 'save' ? 'saves' : type === 'view' ? 'views' : `${type}s`;
          await prisma.articles.update({
            where: { id: articleId },
            data: {
              [updateField]: {
                increment: 1
              }
            }
          });
        }

        // منح نقاط الولاء
        const pointsMap = {
          like: 10,
          save: 15,
          share: 20,
          comment: 25,
          view: 1
        };

        const points = pointsMap[type as keyof typeof pointsMap] || 0;
        if (points > 0 && userId !== 'anonymous') {
          await prisma.loyalty_points.create({
            data: {
              id: `loyalty-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              user_id: userId,
              points: points,
              action: `${type}_article`,
              reference_id: articleId,
              reference_type: 'article',
              metadata: {
                interaction_id: interaction.id,
                timestamp: new Date().toISOString()
              }
            }
          });
        }

        return NextResponse.json({
          success: true,
          message: `تم ${type === 'like' ? 'الإعجاب' : type === 'save' ? 'الحفظ' : 'التفاعل'} بنجاح`,
          action: 'added',
          points_earned: points,
          data: interaction
        }, { headers: corsHeaders });

      } catch (error: any) {
        // إذا كان التفاعل موجوداً بالفعل، اعتبره نجاحاً
        if (error.code === 'P2002') {
          return NextResponse.json({
            success: true,
            message: 'التفاعل موجود بالفعل',
            action: 'exists'
          }, { headers: corsHeaders });
        }
        throw error;
      }
    }

  } catch (error) {
    console.error('Error processing interaction:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في معالجة التفاعل'
    }, { status: 500, headers: corsHeaders });
  }
}

// DELETE: حذف تفاعل
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const articleId = searchParams.get('articleId');
    const type = searchParams.get('type');

    if (!userId || !articleId || !type) {
      return NextResponse.json(
        { error: 'معرف المستخدم والمقال ونوع التفاعل مطلوبة' },
        { status: 400, headers: corsHeaders }
      );
    }

    // حذف التفاعل
    await prisma.interactions.deleteMany({
      where: {
                  user_id: userId,
          article_id: articleId,
                     type: type as any
      }
    });

    // تحديث عدادات المقال
    if (type === 'like' || type === 'save' || type === 'share') {
      const updateField = type === 'save' ? 'saves' : `${type}s`;
      await prisma.articles.update({
        where: { id: articleId },
        data: {
          [updateField]: {
            decrement: 1
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف التفاعل بنجاح'
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error deleting interaction:', error);
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في حذف التفاعل'
    }, { status: 500, headers: corsHeaders });
  }
} 
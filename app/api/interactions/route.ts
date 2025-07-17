import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

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

// GET: جلب تفاعلات المستخدم مع مقال معين أو جميع التفاعلات للتشخيص
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
    const articleId = searchParams.get('articleId');
    const all = searchParams.get('all');

    // إذا كان طلب لجلب جميع التفاعلات (للتشخيص)
    if (all === 'true') {
      console.log('🔍 جلب جميع التفاعلات للتشخيص...');
      
      const interactions = await prisma.interactions.findMany({
        orderBy: { created_at: 'desc' },
        take: 100 // آخر 100 تفاعل
      });
      
      console.log(`📊 تم جلب ${interactions.length} تفاعل`);
      
      return NextResponse.json({
        success: true,
        interactions,
        total: interactions.length,
        message: `تم جلب ${interactions.length} تفاعل من قاعدة البيانات`
      }, { headers: corsHeaders });
    }

    // جلب تفاعلات مستخدم محدد مع مقال محدد
    if (!userId || !articleId) {
      return NextResponse.json(
        { error: 'معرف المستخدم والمقال مطلوبان (أو استخدم all=true لجلب جميع التفاعلات)' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`🔍 جلب تفاعلات المستخدم ${userId} مع المقال ${articleId}...`);

    // جلب جميع التفاعلات للمستخدم مع هذا المقال
    const interactions = await prisma.interactions.findMany({
      where: {
        user_id: userId,
        article_id: articleId
      },
      orderBy: { created_at: 'desc' }
    });

    console.log(`📊 تم العثور على ${interactions.length} تفاعل للمستخدم مع هذا المقال`);

    // تحويل التفاعلات إلى كائن للسهولة
    const interactionState = {
      liked: interactions.some(i => i.type === 'like'),
      saved: interactions.some(i => i.type === 'save'),
      shared: interactions.some(i => i.type === 'share'),
      viewed: interactions.some(i => i.type === 'view')
    };

    console.log('📋 حالة التفاعلات:', interactionState);

    return NextResponse.json({
      success: true,
      data: interactionState,
      interactions: interactions,
      totalInteractions: interactions.length
    }, { headers: corsHeaders });

  } catch (error: any) {
    console.error('❌ خطأ في جلب التفاعلات:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في جلب التفاعلات',
        details: error.message
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST: إنشاء أو تحديث تفاعل
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, articleId, type, action = 'add' } = body;

    console.log('🎯 معالجة تفاعل جديد:', { userId, articleId, type, action });

    // التحقق من البيانات المطلوبة
    if (!userId || !articleId || !type) {
      console.log('❌ بيانات مفقودة:', { userId: !!userId, articleId: !!articleId, type: !!type });
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
      console.log('❌ نوع تفاعل غير صالح:', type);
      return NextResponse.json(
        { 
          success: false, 
          error: 'نوع التفاعل غير صالح' 
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // التحقق من وجود المستخدم والمقال
    const userExists = await prisma.users.findUnique({ where: { id: userId } });
    if (!userExists) {
      console.log('❌ المستخدم غير موجود:', userId);
      return NextResponse.json(
        { success: false, error: 'المستخدم غير موجود' },
        { status: 404, headers: corsHeaders }
      );
    }

    const articleExists = await prisma.articles.findUnique({ where: { id: articleId } });
    if (!articleExists) {
      console.log('❌ المقال غير موجود:', articleId);
      return NextResponse.json(
        { success: false, error: 'المقال غير موجود' },
        { status: 404, headers: corsHeaders }
      );
    }

    console.log('✅ تم التحقق من وجود المستخدم والمقال');

    // التحقق من التفاعل الموجود مسبقاً
    const existingInteraction = await prisma.interactions.findFirst({
      where: {
        user_id: userId,
        article_id: articleId,
        type: type as any
      }
    });

    console.log('🔍 التفاعل الموجود:', existingInteraction ? 'نعم' : 'لا');

    // معالجة التفاعل بناءً على الإجراء
    if (action === 'remove') {
      if (!existingInteraction) {
        console.log('⚠️ لا يوجد تفاعل للحذف');
        return NextResponse.json({
          success: false,
          message: 'لا يوجد تفاعل للحذف',
          action: 'not_found'
        }, { headers: corsHeaders });
      }

      // حذف التفاعل
      console.log('🗑️ حذف التفاعل الموجود...');
      await prisma.interactions.delete({
        where: { id: existingInteraction.id }
      });

      // تحديث عدادات المقال
      if (type === 'like' || type === 'save' || type === 'share') {
        const updateField = type === 'save' ? 'saves' : `${type}s`;
        console.log(`📉 تقليل عداد ${updateField} للمقال`);
        
        await prisma.articles.update({
          where: { id: articleId },
          data: {
            [updateField]: {
              decrement: 1
            }
          }
        });
      }

      // إزالة نقاط الولاء (اختياري)
      const pointsMap = {
        like: 10,
        save: 15,
        share: 20,
        comment: 25,
        view: 1
      };

      const points = pointsMap[type as keyof typeof pointsMap] || 0;
      if (points > 0 && userId !== 'anonymous') {
        console.log(`🏆 إزالة ${points} نقطة ولاء`);
        
        await prisma.loyalty_points.create({
          data: {
            id: `loyalty-removal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            user_id: userId,
            points: -points, // نقاط سالبة للإزالة
            action: `remove_${type}_article`,
            reference_id: articleId,
            reference_type: 'article',
            metadata: {
              interaction_id: existingInteraction.id,
              timestamp: new Date().toISOString(),
              action: 'removed'
            }
          }
        });
      }

      console.log('✅ تم حذف التفاعل بنجاح');
      return NextResponse.json({
        success: true,
        message: `تم إلغاء ${type === 'like' ? 'الإعجاب' : type === 'save' ? 'الحفظ' : 'التفاعل'}`,
        action: 'removed',
        points_deducted: -points
      }, { headers: corsHeaders });

    } else if (action === 'add') {
      if (existingInteraction) {
        console.log('⚠️ التفاعل موجود مسبقاً');
        return NextResponse.json({
          success: true,
          message: `${type === 'like' ? 'الإعجاب' : type === 'save' ? 'الحفظ' : 'التفاعل'} موجود مسبقاً`,
          action: 'already_exists',
          data: existingInteraction
        }, { headers: corsHeaders });
      }
      // إضافة التفاعل الجديد
      console.log('➕ إضافة تفاعل جديد...');
      
      const interactionId = `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const interaction = await prisma.interactions.create({
        data: {
          id: interactionId,
          user_id: userId,
          article_id: articleId,
          type: type as any
        }
      });

             console.log('✅ تم إنشاء التفاعل:', interaction.id);

        // تحديث عدادات المقال
        if (type === 'like' || type === 'save' || type === 'share' || type === 'view') {
          const updateField = type === 'save' ? 'saves' : type === 'view' ? 'views' : `${type}s`;
          console.log(`📈 زيادة عداد ${updateField} للمقال`);
          
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
          console.log(`🏆 منح ${points} نقطة ولاء`);
          
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

        console.log('✅ تم إضافة التفاعل بنجاح');
        return NextResponse.json({
          success: true,
          message: `تم ${type === 'like' ? 'الإعجاب' : type === 'save' ? 'الحفظ' : 'التفاعل'} بنجاح`,
          action: 'added',
          points_earned: points,
          data: interaction
        }, { headers: corsHeaders });

    } else {
      // إجراء غير معروف
      console.log('❌ إجراء غير معروف:', action);
      return NextResponse.json({
        success: false,
        error: 'إجراء غير معروف. استخدم add أو remove'
      }, { status: 400, headers: corsHeaders });
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
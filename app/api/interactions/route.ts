import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



// GET: جلب التفاعلات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get('user_id');
    const articleId = searchParams.get('article_id');
    const type = searchParams.get('type');
    
    // بناء شروط البحث
    const where: any = {};
    if (userId) where.userId = userId;
    if (articleId) where.articleId = articleId;
    if (type) where.type = type;
    
    const interactions = await prisma.interaction.findMany({
      where,
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            featuredImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({
      success: true,
      interactions,
      total: interactions.length
    });
    
  } catch (error) {
    console.error('خطأ في جلب التفاعلات:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب التفاعلات'
    }, { status: 500 });
  }
}

// POST: إنشاء تفاعل جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { user_id, article_id, type, metadata } = body;
    
    if (!user_id || !article_id || !type) {
      return NextResponse.json({
        success: false,
        error: 'معرف المستخدم والمقال ونوع التفاعل مطلوبة'
      }, { status: 400 });
    }
    
    // التحقق من وجود المقال
    const article = await prisma.article.findUnique({
      where: { id: article_id }
    });
    
    if (!article) {
      return NextResponse.json({
        success: false,
        error: 'المقال غير موجود'
      }, { status: 404 });
    }
    
    // التحقق من نوع التفاعل
    const validTypes = ['like', 'save', 'share', 'view', 'comment'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'نوع التفاعل غير صحيح'
      }, { status: 400 });
    }
    
    // إنشاء أو تحديث التفاعل
    const interaction = await prisma.interaction.upsert({
      where: {
        userId_articleId_type: {
          userId: user_id,
          articleId: article_id,
          type: type
        }
      },
      create: {
        userId: user_id,
        articleId: article_id,
        type: type
      },
      update: {}
    });
    
    // إضافة نقاط الولاء
    if (type === 'like' || type === 'save') {
      await prisma.loyaltyPoint.create({
        data: {
          userId: user_id,
          points: type === 'like' ? 5 : 10,
          action: type,
          referenceId: article_id,
          referenceType: 'article',
          metadata: {
            article_title: article.title
          }
        }
      });
    }
    
    // تحديث إحصائيات المقال
    if (type === 'view') {
      await prisma.article.update({
        where: { id: article_id },
        data: {
          views: {
            increment: 1
          }
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      interaction,
      message: 'تم تسجيل التفاعل بنجاح'
    });
    
  } catch (error) {
    console.error('خطأ في تسجيل التفاعل:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في تسجيل التفاعل',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

// DELETE: حذف تفاعل
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, article_id, type } = body;
    
    if (!user_id || !article_id || !type) {
      return NextResponse.json({
        success: false,
        error: 'معرف المستخدم والمقال ونوع التفاعل مطلوبة'
      }, { status: 400 });
    }
    
    // حذف التفاعل
    await prisma.interaction.delete({
      where: {
        userId_articleId_type: {
          userId: user_id,
          articleId: article_id,
          type: type
        }
      }
    });
    
    // خصم نقاط الولاء
    if (type === 'like' || type === 'save') {
      await prisma.loyaltyPoint.create({
        data: {
          userId: user_id,
          points: -(type === 'like' ? 5 : 10),
          action: `cancel_${type}`,
          referenceId: article_id,
          referenceType: 'article'
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'تم حذف التفاعل بنجاح'
    });
    
  } catch (error) {
    console.error('خطأ في حذف التفاعل:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في حذف التفاعل',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

 
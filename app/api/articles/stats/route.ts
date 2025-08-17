import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const article_type = searchParams.get('article_type'); // فلتر نوع المقال
    
    console.log(`📊 جلب الإحصائيات للمقالات... (النوع: ${article_type || 'الكل'})`);
    
    // شروط استبعاد المقالات التجريبية والمجدولة
    const baseWhere: any = {
      status: {
        not: 'scheduled'
      },
      AND: [
        {
          title: {
            not: {
              contains: 'test'
            }
          }
        },
        {
          title: {
            not: {
              contains: 'تجربة'
            }
          }
        },
        {
          title: {
            not: {
              contains: 'demo'
            }
          }
        },
        {
          title: {
            not: {
              contains: 'example'
            }
          }
        }
      ]
    };
    
    // إضافة فلتر نوع المقال إذا تم تحديده
    if (article_type) {
      if (article_type === 'news') {
        baseWhere.article_type = 'news';
        console.log('🔎 فلترة الأخبار فقط (article_type=news)');
      } else {
        baseWhere.article_type = article_type;
        console.log(`🔎 فلترة نوع: ${article_type}`);
      }
    }

    // حساب العدد لكل حالة باستخدام Promise.all للأداء
    const [
      publishedCount,
      draftCount,
      archivedCount,
      deletedCount,
      breakingCount
    ] = await Promise.all([
      prisma.articles.count({
        where: {
          ...baseWhere,
          status: 'published'
        }
      }),
      prisma.articles.count({
        where: {
          ...baseWhere,
          status: 'draft'
        }
      }),
      prisma.articles.count({
        where: {
          ...baseWhere,
          status: 'archived'
        }
      }),
      prisma.articles.count({
        where: {
          ...baseWhere,
          status: 'deleted'
        }
      }),
      prisma.articles.count({
        where: {
          ...baseWhere,
          breaking: true
        }
      })
    ]);

    // إعداد الإحصائيات النهائية
    const stats = {
      total: publishedCount + draftCount + archivedCount + deletedCount,
      published: publishedCount,
      draft: draftCount,
      archived: archivedCount,
      deleted: deletedCount,
      breaking: breakingCount,
    };

    console.log('✅ تم حساب الإحصائيات:', stats);

    return NextResponse.json({
      success: true,
      stats: stats,
      timestamp: new Date().toISOString(),
      note: 'إحصائيات ثابتة مستقلة عن الفلاتر'
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب إحصائيات المقالات:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب الإحصائيات',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
    
  } finally {
    await prisma.$disconnect();
  }
}
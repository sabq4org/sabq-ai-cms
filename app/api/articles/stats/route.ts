import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('📊 جلب الإحصائيات الثابتة للمقالات...');
    
    // شروط استبعاد المقالات التجريبية والمجدولة
    const baseWhere = {
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
// مهمة Cron لتنظيف الإشعارات المكسورة كل ساعة
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('🧹 [CRON CLEANUP] بدء تنظيف الإشعارات المكسورة...');
    
    // التحقق من مفتاح الـ Cron للحماية
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let totalChecked = 0;
    let totalBroken = 0;
    let totalDeleted = 0;

    // الحصول على جميع الإشعارات
    const notifications = await prisma.smartNotifications.findMany({
      select: {
        id: true,
        title: true,
        message: true,
        data: true,
        created_at: true,
      }
    });

    totalChecked = notifications.length;
    const brokenNotifications: any[] = [];

    for (const notification of notifications) {
      let isBroken = false;
      let reason = '';
      let articleId = null;
      let slug = null;

      // استخراج معرف المقال أو slug من البيانات
      if (notification.data && typeof notification.data === 'object') {
        const data = notification.data as any;
        articleId = data.articleId || data.entityId;
        slug = data.slug;
        
        // استخراج slug من الرابط
        if (data.link && typeof data.link === 'string') {
          const linkMatch = data.link.match(/\/news\/([^\/\?]+)/);
          if (linkMatch) {
            slug = linkMatch[1];
          }
        }
      }

      // فحص وجود المقال
      if (articleId) {
        const article = await prisma.articles.findUnique({
          where: { id: articleId },
          select: { id: true, status: true, slug: true }
        });
        
        if (!article) {
          isBroken = true;
          reason = `مقال محذوف: ${articleId}`;
        } else if (article.status === 'deleted') {
          isBroken = true;
          reason = `مقال معلم كمحذوف: ${articleId}`;
        }
      } else if (slug) {
        const article = await prisma.articles.findFirst({
          where: { slug: slug },
          select: { id: true, status: true, slug: true }
        });
        
        if (!article) {
          isBroken = true;
          reason = `مقال محذوف: ${slug}`;
        } else if (article.status === 'deleted') {
          isBroken = true;
          reason = `مقال معلم كمحذوف: ${slug}`;
        }
      }

      // فحص الإشعارات التجريبية
      if (notification.title && notification.title.includes('test-article')) {
        isBroken = true;
        reason = 'إشعار تجريبي';
      }

      if (isBroken) {
        brokenNotifications.push({
          id: notification.id,
          title: notification.title,
          reason: reason,
          articleId: articleId,
          slug: slug,
          created_at: notification.created_at
        });
      }
    }

    totalBroken = brokenNotifications.length;

    // حذف الإشعارات المكسورة
    if (totalBroken > 0) {
      const brokenIds = brokenNotifications.map(n => n.id);
      const deleteResult = await prisma.smartNotifications.deleteMany({
        where: {
          id: { in: brokenIds }
        }
      });
      
      totalDeleted = deleteResult.count;
    }

    // إحصائيات نهائية
    const finalStats = await prisma.smartNotifications.aggregate({
      _count: { _all: true }
    });

    console.log(`✅ [CRON CLEANUP] تم فحص ${totalChecked} إشعارات، حذف ${totalDeleted} مكسورة، متبقي ${finalStats._count._all}`);

    return NextResponse.json({
      success: true,
      message: `تنظيف دوري: حذف ${totalDeleted} إشعارات مكسورة`,
      data: {
        timestamp: new Date().toISOString(),
        cleanup: {
          total_checked: totalChecked,
          broken_found: totalBroken,
          deleted: totalDeleted,
          remaining_total: finalStats._count._all
        },
        broken_details: totalBroken > 0 ? brokenNotifications.slice(0, 10) : [], // أول 10 فقط
        performance: {
          source: 'cron-hourly-cleanup',
          execution_time: new Date().toISOString()
        }
      }
    });

  } catch (error: any) {
    console.error('❌ [CRON CLEANUP] خطأ في التنظيف الدوري:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في التنظيف الدوري',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// API تنظيف الإشعارات المكسورة والمرتبطة بمقالات محذوفة
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    console.log('🧹 [CLEANUP] بدء تنظيف الإشعارات المكسورة...');
    
    // جلب المستخدم التجريبي
    const testUser = await prisma.users.findFirst({
      select: { id: true, name: true }
    });
    
    if (!testUser) {
      return NextResponse.json({
        success: false,
        error: 'لا يوجد مستخدم تجريبي'
      }, { status: 404 });
    }
    
    // البحث عن الإشعارات المرتبطة بمقالات
    const notificationsWithArticles = await prisma.smartNotifications.findMany({
      where: {
        user_id: testUser.id,
        OR: [
          { type: 'article_recommendation' },
          { type: 'breaking_news' },
          { type: 'user_engagement' }
        ]
      },
      select: {
        id: true,
        title: true,
        type: true,
        data: true,
        created_at: true
      }
    });
    
    console.log(`🔍 [CLEANUP] تم العثور على ${notificationsWithArticles.length} إشعارات مرتبطة بمقالات`);
    
    const brokenNotifications = [];
    const validNotifications = [];
    
    // فحص كل إشعار
    for (const notification of notificationsWithArticles) {
      const data = notification.data as any;
      let articleId = data?.articleId;
      let slug = data?.slug;
      
      // استخراج slug من الرابط إذا لم يكن موجود
      if (!slug && data?.link) {
        const linkMatch = data.link.match(/\/news\/([^/?]+)/);
        slug = linkMatch ? linkMatch[1] : null;
      }
      
      let isBroken = false;
      
      if (articleId) {
        // فحص المقال بالـ ID
        const article = await prisma.articles.findUnique({
          where: { id: articleId },
          select: { id: true, status: true }
        });
        
        if (!article || article.status === 'deleted' || article.status === 'draft') {
          isBroken = true;
        }
      } else if (slug) {
        // فحص المقال بالـ slug
        const article = await prisma.articles.findFirst({
          where: { slug: slug },
          select: { id: true, status: true }
        });
        
        if (!article || article.status === 'deleted' || article.status === 'draft') {
          isBroken = true;
        }
      } else if (data?.articleId === 'test-article-1' || data?.articleId === 'test-article-2' || data?.articleId === 'test-article-3') {
        // إشعارات تجريبية وهمية
        isBroken = true;
      }
      
      if (isBroken) {
        brokenNotifications.push({
          id: notification.id,
          title: notification.title,
          reason: slug ? `مقال محذوف: ${slug}` : `مقال تجريبي: ${data?.articleId}`,
          articleId: articleId || data?.articleId,
          slug: slug
        });
      } else {
        validNotifications.push(notification);
      }
    }
    
    console.log(`❌ [CLEANUP] تم العثور على ${brokenNotifications.length} إشعارات مكسورة`);
    console.log(`✅ [CLEANUP] ${validNotifications.length} إشعارات سليمة`);
    
    let deletedCount = 0;
    
    // حذف الإشعارات المكسورة
    if (brokenNotifications.length > 0) {
      const brokenIds = brokenNotifications.map(n => n.id);
      
      const deleteResult = await prisma.smartNotifications.deleteMany({
        where: {
          id: { in: brokenIds }
        }
      });
      
      deletedCount = deleteResult.count;
      console.log(`🗑️ [CLEANUP] تم حذف ${deletedCount} إشعارات مكسورة`);
    }
    
    // إحصائيات نهائية
    const [finalTotal, finalUnread] = await Promise.all([
      prisma.smartNotifications.count({
        where: { user_id: testUser.id }
      }),
      prisma.smartNotifications.count({
        where: { user_id: testUser.id, read_at: null }
      })
    ]);
    
    return NextResponse.json({
      success: true,
      message: `تم تنظيف ${deletedCount} إشعارات مكسورة`,
      data: {
        cleanup: {
          total_checked: notificationsWithArticles.length,
          broken_found: brokenNotifications.length,
          deleted: deletedCount,
          valid_remaining: validNotifications.length
        },
        broken_details: brokenNotifications,
        stats_after: {
          total: finalTotal,
          unread: finalUnread,
          read: finalTotal - finalUnread
        },
        performance: {
          timestamp: new Date().toISOString(),
          source: 'cleanup-api'
        }
      }
    });
    
  } catch (error: any) {
    console.error('❌ [CLEANUP] خطأ في التنظيف:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في تنظيف الإشعارات',
      details: error.message,
      code: 'CLEANUP_ERROR'
    }, { status: 500 });
  }
}

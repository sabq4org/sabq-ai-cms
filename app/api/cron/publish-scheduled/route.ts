import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

/**
 * Cron job لنشر الأخبار المجدولة
 * يتم استدعاؤه كل دقيقة من Vercel Cron
 */
export async function GET(request: NextRequest) {
  try {
    // التحقق من أن الطلب قادم من Vercel Cron
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    // في production: التحقق من CRON_SECRET
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('🚫 محاولة وصول غير مصرح لـ cron job');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    console.log(`🕐 [${now.toISOString()}] بدء فحص الأخبار المجدولة...`);

    // البحث عن الأخبار المجدولة التي حان وقت نشرها
    const scheduledArticles = await prisma.articles.findMany({
      where: {
        status: 'scheduled',
        scheduled_for: {
          lte: now // أقل من أو يساوي الوقت الحالي
        }
      },
      select: {
        id: true,
        title: true,
        scheduled_for: true,
        author_id: true,
        category_id: true
      },
      orderBy: {
        scheduled_for: 'asc'
      }
    });

    if (scheduledArticles.length === 0) {
      console.log('✅ لا توجد أخبار مجدولة للنشر في الوقت الحالي');
      return NextResponse.json({
        success: true,
        message: 'لا توجد أخبار للنشر',
        processed: 0,
        timestamp: now.toISOString()
      });
    }

    console.log(`📰 تم العثور على ${scheduledArticles.length} خبر مجدول للنشر`);

    let publishedCount = 0;
    let failedCount = 0;
    const results = [];

    // معالجة كل خبر مجدول
    for (const article of scheduledArticles) {
      try {
        console.log(`📝 معالجة: "${article.title}" (مجدول لـ ${article.scheduled_for?.toISOString()})`);

        // تحديث حالة الخبر إلى منشور
        const updatedArticle = await prisma.articles.update({
          where: { id: article.id },
          data: {
            status: 'published',
            published_at: now,
            updated_at: now,
            // إزالة scheduled_for أو الاحتفاظ بها للتاريخ
            // scheduled_for: null
          },
          select: {
            id: true,
            title: true,
            slug: true,
            published_at: true,
            author: {
              select: {
                name: true,
                email: true
              }
            },
            categories: {
              select: {
                name: true,
                slug: true
              }
            }
          }
        });

        publishedCount++;
        
        const result = {
          id: article.id,
          title: article.title,
          scheduledFor: article.scheduled_for,
          publishedAt: now,
          success: true
        };
        
        results.push(result);
        
        console.log(`✅ تم نشر: "${article.title}"`);

        // إشعار المستخدمين المهتمين بالتصنيف عند النشر
        try {
          if (article.category_id) {
            const { SmartNotificationEngine } = await import('@/lib/notifications/smart-engine');
            SmartNotificationEngine
              .notifyNewArticleInCategory(article.id, article.category_id)
              .catch(err => console.warn('⚠️ فشل إشعار المهتمين بالتصنيف:', err));
          }
        } catch (notifyErr) {
          console.warn('⚠️ خطأ أثناء محاولة إرسال إشعار الاهتمامات:', notifyErr);
        }

        // إضافة entry للـ activity log (اختياري)
        try {
          await prisma.activity_logs.create({
            data: {
              id: `auto_publish_${article.id}_${Date.now()}`,
              user_id: article.author_id || 'system',
              action: 'auto_publish_article',
              entity_type: 'article',
              entity_id: article.id,
              metadata: {
                title: article.title,
                scheduled_for: article.scheduled_for,
                published_at: now,
                auto_published: true
              },
              ip_address: '127.0.0.1', // نظام داخلي
              user_agent: 'Vercel-Cron/1.0',
              created_at: now
            }
          });
        } catch (logError) {
          console.warn(`⚠️ فشل تسجيل النشاط للمقال ${article.id}:`, logError);
          // لا نوقف العملية بسبب خطأ في السجل
        }

      } catch (articleError) {
        failedCount++;
        
        const errorResult = {
          id: article.id,
          title: article.title,
          scheduledFor: article.scheduled_for,
          success: false,
          error: articleError instanceof Error ? articleError.message : 'خطأ غير معروف'
        };
        
        results.push(errorResult);
        
        console.error(`❌ فشل نشر "${article.title}":`, articleError);

        // تسجيل الخطأ في قاعدة البيانات
        try {
          await prisma.activity_logs.create({
            data: {
              id: `auto_publish_error_${article.id}_${Date.now()}`,
              user_id: article.author_id || 'system',
              action: 'auto_publish_error',
              entity_type: 'article',
              entity_id: article.id,
              metadata: {
                title: article.title,
                scheduled_for: article.scheduled_for,
                error: errorResult.error,
                attempted_at: now
              },
              ip_address: '127.0.0.1',
              user_agent: 'Vercel-Cron/1.0',
              created_at: now
            }
          });
        } catch (logError) {
          console.warn(`⚠️ فشل تسجيل خطأ النشر للمقال ${article.id}:`, logError);
        }
      }
    }

    // التقرير النهائي
    const summary = {
      success: true,
      message: `تم معالجة ${scheduledArticles.length} خبر مجدول`,
      stats: {
        total: scheduledArticles.length,
        published: publishedCount,
        failed: failedCount
      },
      results,
      timestamp: now.toISOString(),
      executionTime: Date.now() - now.getTime()
    };

    console.log(`📊 النتائج النهائية:`);
    console.log(`   ✅ تم النشر: ${publishedCount}`);
    console.log(`   ❌ فشل: ${failedCount}`);
    console.log(`   📄 المجموع: ${scheduledArticles.length}`);

    // إرسال إشعارات للمحررين (اختياري)
    if (publishedCount > 0) {
      try {
        await sendPublishNotifications(results.filter(r => r.success));
      } catch (notificationError) {
        console.warn('⚠️ فشل إرسال الإشعارات:', notificationError);
      }
    }

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ خطأ حرج في cron job النشر المجدول:', error);
    
    return NextResponse.json({
      success: false,
      error: 'خطأ في النشر التلقائي',
      details: error instanceof Error ? error.message : 'خطأ غير معروف',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * إرسال إشعارات عن الأخبار المنشورة حديثاً
 */
async function sendPublishNotifications(publishedArticles: any[]) {
  if (publishedArticles.length === 0) return;

  try {
    // إرسال webhook للفريق (اختياري)
    if (process.env.SLACK_WEBHOOK_URL) {
      const message = {
        text: `📰 تم نشر ${publishedArticles.length} خبر تلقائياً`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*📰 النشر التلقائي للأخبار*\n\nتم نشر ${publishedArticles.length} خبر بنجاح:`
            }
          },
          ...publishedArticles.slice(0, 5).map(article => ({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `• *${article.title}*\n_نُشر في: ${new Date(article.publishedAt).toLocaleString('ar-SA')}_`
            }
          }))
        ]
      };

      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
    }

  } catch (error) {
    console.warn('⚠️ فشل إرسال إشعار Slack:', error);
  }
}

/**
 * Manual trigger لتشغيل النشر يدوياً
 */
export async function POST(request: NextRequest) {
  try {
    // التحقق من الصلاحيات (admin only)
    const body = await request.json();
    const adminSecret = body.adminSecret;
    
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔧 تشغيل يدوي للنشر المجدول...');
    
    // استدعاء نفس logic الـ GET
    return GET(request);

  } catch (error) {
    console.error('❌ خطأ في التشغيل اليدوي:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل التشغيل اليدوي'
    }, { status: 500 });
  }
}

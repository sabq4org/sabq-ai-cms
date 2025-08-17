// API تغذية الإشعارات الذكية - سبق الذكية
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'مطلوب تسجيل الدخول',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const types = searchParams.get('types')?.split(',');
    const priority = searchParams.get('priority');

    // بناء شروط البحث
    const whereClause: any = {
      user_id: user.id
    };

    if (types && types.length > 0) {
      whereClause.type = {
        in: types
      };
    }

    if (priority) {
      whereClause.priority = priority;
    }

    // جلب الإشعارات الحديثة
    const [notifications, totalUnread, recentActivity] = await Promise.all([
      // الإشعارات الرئيسية
      prisma.smartNotifications.findMany({
        where: whereClause,
        orderBy: [
          { priority: 'desc' },
          { created_at: 'desc' }
        ],
        skip: offset,
        take: Math.min(50, limit),
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          priority: true,
          status: true,
          read_at: true,
          created_at: true,
          sent_at: true,
          metadata: true
        }
      }),

      // عدد الإشعارات غير المقروءة
      prisma.smartNotifications.count({
        where: {
          user_id: user.id,
          read_at: null
        }
      }),

      // النشاط الحديث
      prisma.smartNotifications.findMany({
        where: {
          user_id: user.id,
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // آخر 24 ساعة
          }
        },
        orderBy: { created_at: 'desc' },
        take: 5,
        select: {
          id: true,
          type: true,
          title: true,
          created_at: true,
          read_at: true
        }
      })
    ]);

    // معالجة الإشعارات لإضافة معلومات إضافية
    const processedNotifications = notifications.map(notification => ({
      ...notification,
      isNew: !notification.read_at && 
             new Date(notification.created_at).getTime() > Date.now() - (2 * 60 * 60 * 1000), // آخر ساعتين
      timeAgo: getTimeAgo(notification.created_at),
      actionRequired: ['comment_reply', 'security_alert', 'breaking_news'].includes(notification.type),
      category: getCategoryFromType(notification.type)
    }));

    // إحصائيات حسب النوع
    const typeStats = await prisma.smartNotifications.groupBy({
      by: ['type', 'priority'],
      where: {
        user_id: user.id,
        read_at: null,
        created_at: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // آخر أسبوع
        }
      },
      _count: {
        type: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        notifications: processedNotifications,
        summary: {
          totalUnread,
          totalShown: notifications.length,
          hasMore: notifications.length === limit,
          nextOffset: offset + notifications.length
        },
        activity: {
          recent: recentActivity,
          stats: typeStats.reduce((acc, stat) => {
            const key = `${stat.type}_${stat.priority}`;
            acc[key] = stat._count.type;
            return acc;
          }, {} as Record<string, number>)
        },
        categories: {
          urgent: processedNotifications.filter(n => n.priority === 'high' && !n.read_at).length,
          engagement: processedNotifications.filter(n => ['user_engagement', 'comment_reply', 'author_follow'].includes(n.type) && !n.read_at).length,
          content: processedNotifications.filter(n => ['article_recommendation', 'breaking_news'].includes(n.type) && !n.read_at).length,
          system: processedNotifications.filter(n => ['system_announcement', 'security_alert'].includes(n.type) && !n.read_at).length
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ خطأ في جلب تغذية الإشعارات:', error);
    return NextResponse.json({
      success: false,
      error: 'خطأ في جلب تغذية الإشعارات',
      code: 'FEED_ERROR'
    }, { status: 500 });
  }
}

// دوال مساعدة
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days < 7) return `منذ ${days} يوم`;
  return new Date(date).toLocaleDateString('ar-SA');
}

function getCategoryFromType(type: string): string {
  const categories = {
    'breaking_news': 'أخبار عاجلة',
    'article_recommendation': 'مقالات مقترحة',
    'user_engagement': 'تفاعل المستخدمين',
    'comment_reply': 'ردود التعليقات',
    'author_follow': 'متابعة الكتاب',
    'daily_digest': 'ملخص يومي',
    'system_announcement': 'إعلانات النظام',
    'security_alert': 'تنبيهات الأمان'
  };
  
  return categories[type] || 'عام';
}

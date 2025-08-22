import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';

// إنشاء إشعارات تجريبية للمستخدم
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const userId = user.id;

    // إنشاء إشعارات تجريبية
    const demoNotifications = [
      {
        user_id: userId,
        title: '🎉 مرحباً بك في نظام الإشعارات الذكية',
        message: 'تم تفعيل نظام الإشعارات الذكية بنجاح! ستتلقى إشعارات مخصصة بناءً على اهتماماتك.',
        type: 'system',
        priority: 'high',
        category: 'system',
        status: 'delivered',
        delivery_channels: ['inApp'],
        ai_optimized: true,
        data: {}
      },
      {
        user_id: userId,
        title: '📰 افتتاح منتجع سياحي جديد في العلا',
        message: 'تم افتتاح منتجع "نجوم العلا" الفاخر وسط أجواء احتفالية مميزة - محتوى يتوافق مع اهتماماتك في السياحة',
        type: 'news',
        priority: 'medium',
        category: 'news',
        status: 'delivered',
        delivery_channels: ['inApp'],
        ai_optimized: true,
        personalization_score: 0.92,
        data: {
          articleId: 'demo-1',
          articleCategory: 'tourism',
          url: '/articles/demo-1'
        }
      },
      {
        user_id: userId,
        title: '🚨 عاجل: إعلان هام من هيئة السياحة',
        message: 'هيئة السياحة تعلن عن برنامج دعم جديد للمشاريع السياحية الناشئة بقيمة 500 مليون ريال',
        type: 'breaking',
        priority: 'high',
        category: 'news',
        status: 'delivered',
        delivery_channels: ['inApp'],
        data: {
          articleId: 'demo-2',
          articleCategory: 'tourism',
          url: '/articles/demo-2'
        }
      },
      {
        user_id: userId,
        title: '💬 تعليق جديد على مقالك',
        message: 'علق أحمد محمد على مقالك "أفضل الوجهات السياحية في السعودية"',
        type: 'comment',
        priority: 'low',
        category: 'interaction',
        status: 'delivered',
        delivery_channels: ['inApp'],
        read_at: new Date(Date.now() - 86400000), // مقروء منذ يوم
        data: {
          commentId: 'comment-1',
          articleId: 'article-123',
          url: '/articles/article-123#comment-1'
        }
      },
      {
        user_id: userId,
        title: '📈 مقالك يحقق نجاحاً كبيراً',
        message: 'مقالك "السياحة البيئية في المملكة" حقق أكثر من 10,000 مشاهدة!',
        type: 'trending',
        priority: 'medium',
        category: 'achievement',
        status: 'delivered',
        delivery_channels: ['inApp'],
        data: {
          articleId: 'article-456',
          views: 10523,
          url: '/articles/article-456'
        }
      }
    ];

    // حذف الإشعارات التجريبية السابقة
    await prisma.smartNotifications.deleteMany({
      where: {
        user_id: userId,
        data: {
          path: '$.demo',
          equals: true
        }
      }
    });

    // إنشاء الإشعارات الجديدة
    const notifications = await Promise.all(
      demoNotifications.map(async (notif, index) => {
        // إضافة تأخير تدريجي للترتيب الزمني
        const createdAt = new Date(Date.now() - (index * 3600000)); // كل ساعة
        
        return await prisma.smartNotifications.create({
          data: {
            ...notif,
            created_at: createdAt,
            data: {
              ...notif.data,
              demo: true
            }
          }
        });
      })
    );

    return NextResponse.json({ 
      success: true,
      message: `تم إنشاء ${notifications.length} إشعارات تجريبية`,
      notifications: notifications.length
    });

  } catch (error) {
    console.error('Error creating demo notifications:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الإشعارات التجريبية' },
      { status: 500 }
    );
  }
}

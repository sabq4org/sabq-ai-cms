import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// إنشاء إشعار تجريبي بسيط
export async function POST(request: NextRequest) {
  try {
    // إنشاء مستخدم افتراضي للاختبار إذا لم يكن موجوداً
    const defaultUserId = 'default-test-user';
    
    await prisma.users.upsert({
      where: { id: defaultUserId },
      update: {},
      create: {
        id: defaultUserId,
        name: 'مستخدم تجريبي',
        email: 'test@sabq.org',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // إنشاء إشعار تجريبي
    const notification = await prisma.smartNotifications.create({
      data: {
        user_id: defaultUserId,
        title: '🚨 خبر عاجل للاختبار',
        message: 'هذا إشعار تجريبي لاختبار وظيفة قراءة الإشعارات وإخفائها من القائمة',
        type: 'breaking_news',
        priority: 'high',
        status: 'delivered',
        data: {
          demo: true,
          url: '/news/test-article'
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الإشعار التجريبي بنجاح',
      data: {
        notificationId: notification.id,
        userId: defaultUserId,
        title: notification.title
      }
    });

  } catch (error) {
    console.error('خطأ في إنشاء الإشعار التجريبي:', error);
    return NextResponse.json({
      success: false,
      error: 'خطأ في إنشاء الإشعار التجريبي'
    }, { status: 500 });
  }
}

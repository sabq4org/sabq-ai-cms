import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { SmartNotificationsService } from '@/lib/modules/smart-notifications/service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { channel } = await request.json();

    if (!channel) {
      return NextResponse.json({ error: 'قناة التوصيل مطلوبة' }, { status: 400 });
    }

    // إنشاء خدمة الإشعارات
    const notificationService = new SmartNotificationsService();

    // محتوى الإشعار التجريبي
    const testNotificationContent = {
      title: 'إشعار تجريبي من سبق الذكية',
      message: getTestMessage(channel),
      type: 'info' as const,
      priority: 'medium' as const,
      category: 'system'
    };

    // إرسال الإشعار التجريبي
    const result = await sendTestNotification(
      session.user.id,
      session.user.email || '',
      channel,
      testNotificationContent
    );

    if (result.success) {
      return NextResponse.json({ 
        success: true,
        message: `تم إرسال إشعار تجريبي عبر ${getChannelName(channel)}`
      });
    } else {
      throw new Error(result.error || 'فشل إرسال الإشعار');
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إرسال الإشعار التجريبي' },
      { status: 500 }
    );
  }
}

function getTestMessage(channel: string): string {
  const messages: Record<string, string> = {
    email: 'هذا إشعار تجريبي للبريد الإلكتروني من منصة سبق الذكية. إذا وصلك هذا البريد، فإن نظام الإشعارات يعمل بشكل صحيح.',
    push: 'مرحباً! هذا إشعار تجريبي من سبق الذكية. الإشعارات الفورية تعمل بنجاح.',
    sms: 'سبق الذكية: إشعار تجريبي. نظام الرسائل النصية يعمل بشكل صحيح.',
    inApp: 'هذا إشعار تجريبي داخل التطبيق. يمكنك رؤية الإشعارات في لوحة الإشعارات.'
  };
  return messages[channel] || 'إشعار تجريبي من سبق الذكية';
}

function getChannelName(channel: string): string {
  const names: Record<string, string> = {
    email: 'البريد الإلكتروني',
    push: 'الإشعارات الفورية',
    sms: 'الرسائل النصية',
    inApp: 'داخل التطبيق'
  };
  return names[channel] || channel;
}

async function sendTestNotification(
  userId: string,
  userEmail: string,
  channel: string,
  content: any
): Promise<{ success: boolean; error?: string }> {
  try {
    switch (channel) {
      case 'email':
        // محاكاة إرسال بريد إلكتروني
        console.log(`Sending test email to ${userEmail}:`, content);
        // في الإنتاج، استخدم خدمة البريد الإلكتروني الفعلية
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };

      case 'push':
        // محاكاة إرسال إشعار فوري
        console.log(`Sending push notification to user ${userId}:`, content);
        // في الإنتاج، استخدم Web Push API أو Firebase
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true };

      case 'sms':
        // محاكاة إرسال رسالة نصية
        console.log(`Sending SMS to user ${userId}:`, content);
        // في الإنتاج، استخدم خدمة SMS مثل Twilio
        await new Promise(resolve => setTimeout(resolve, 1200));
        return { success: true };

      case 'inApp':
        // إنشاء إشعار داخل التطبيق
        const { prisma } = await import('@/lib/prisma');
        await prisma.smartNotifications.create({
          data: {
            user_id: userId,
            title: content.title,
            message: content.message,
            type: content.type,
            priority: content.priority,
            category: content.category,
            delivery_channels: ['inApp'],
            status: 'delivered',
            sent_at: new Date()
          }
        });
        return { success: true };

      default:
        return { success: false, error: 'قناة توصيل غير مدعومة' };
    }
  } catch (error) {
    console.error(`Error sending ${channel} notification:`, error);
    return { 
      success: false, 
      error: `فشل إرسال الإشعار عبر ${getChannelName(channel)}`
    };
  }
}

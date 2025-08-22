import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function POST(request: NextRequest) {
  try {
    // استخراج التوكن من الكوكيز
    const token = request.cookies.get('auth-token')?.value || 
                  request.cookies.get('access_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من صحة التوكن
    let userId: string;
    let userEmail: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.id;
      userEmail = decoded.email || '';
    } catch (error) {
      return NextResponse.json({ error: 'توكن غير صالح' }, { status: 401 });
    }

    const { channel } = await request.json();

    if (!channel) {
      return NextResponse.json({ error: 'قناة التوصيل مطلوبة' }, { status: 400 });
    }



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
      userId,
      userEmail,
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

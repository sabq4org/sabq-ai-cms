import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import { prisma } from '@/lib/prisma';

// جلب إعدادات الإشعارات
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // جلب إعدادات المستخدم من قاعدة البيانات
    const userSettings = await prisma.user_preferences.findUnique({
      where: {
        user_id_key: {
          user_id: session.user.id,
          key: 'notification_settings'
        }
      }
    });

    // الإعدادات الافتراضية
    const defaultSettings = {
      enabled: true,
      channels: {
        email: true,
        push: true,
        sms: false,
        inApp: true
      },
      aiFeatures: {
        smartTiming: true,
        contentPersonalization: true,
        priorityOptimization: true,
        userSegmentation: false
      },
      categories: {
        news: true,
        comments: true,
        mentions: true,
        system: true,
        marketing: false
      },
      schedule: {
        quietHoursEnabled: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        weekendNotifications: false
      }
    };

    const settings = userSettings ? JSON.parse(userSettings.value) : defaultSettings;

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الإعدادات' },
      { status: 500 }
    );
  }
}

// حفظ إعدادات الإشعارات
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const settings = await request.json();

    // حفظ الإعدادات في قاعدة البيانات
    await prisma.user_preferences.upsert({
      where: {
        user_id_key: {
          user_id: session.user.id,
          key: 'notification_settings'
        }
      },
      update: {
        value: JSON.stringify(settings),
        updated_at: new Date()
      },
      create: {
        id: `${session.user.id}_notification_settings`,
        user_id: session.user.id,
        key: 'notification_settings',
        value: JSON.stringify(settings)
      }
    });

    // تطبيق الإعدادات على نظام الإشعارات
    if (settings.enabled) {
      // تفعيل قنوات التوصيل
      const activeChannels = Object.entries(settings.channels)
        .filter(([_, enabled]) => enabled)
        .map(([channel]) => channel);

      // تحديث إعدادات المستخدم في نظام الإشعارات
      await prisma.$executeRaw`
        UPDATE users 
        SET notification_preferences = jsonb_set(
          COALESCE(notification_preferences, '{}')::jsonb,
          '{channels}',
          ${JSON.stringify(activeChannels)}::jsonb
        )
        WHERE id = ${session.user.id}
      `;
    }

    return NextResponse.json({ 
      success: true,
      message: 'تم حفظ الإعدادات بنجاح'
    });
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حفظ الإعدادات' },
      { status: 500 }
    );
  }
}

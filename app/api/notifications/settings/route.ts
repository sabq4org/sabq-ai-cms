import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// جلب إعدادات الإشعارات
export async function GET(request: NextRequest) {
  try {
    // استخراج التوكن من الكوكيز
    const token = request.cookies.get('auth-token')?.value || 
                  request.cookies.get('access_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من صحة التوكن
    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.id;
    } catch (error) {
      return NextResponse.json({ error: 'توكن غير صالح' }, { status: 401 });
    }

    // جلب إعدادات المستخدم من قاعدة البيانات
    const userSettings = await prisma.user_preferences.findUnique({
      where: {
        user_id_key: {
          user_id: userId,
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
    // استخراج التوكن من الكوكيز
    const token = request.cookies.get('auth-token')?.value || 
                  request.cookies.get('access_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // التحقق من صحة التوكن
    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.id;
    } catch (error) {
      return NextResponse.json({ error: 'توكن غير صالح' }, { status: 401 });
    }

    const settings = await request.json();

    // حفظ الإعدادات في قاعدة البيانات
    await prisma.user_preferences.upsert({
      where: {
        user_id_key: {
          user_id: userId,
          key: 'notification_settings'
        }
      },
      update: {
        value: JSON.stringify(settings),
        updated_at: new Date()
      },
      create: {
        id: `${userId}_notification_settings`,
        user_id: userId,
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
        WHERE id = ${userId}
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

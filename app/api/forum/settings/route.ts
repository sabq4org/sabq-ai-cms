import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: جلب إعدادات المنتدى
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 جلب إعدادات المنتدى...');

    // جلب الإعدادات من قاعدة البيانات
    const settings = await prisma.$queryRawUnsafe(`
      SELECT 
        setting_key,
        setting_value,
        setting_type,
        description
      FROM forum_settings
      ORDER BY setting_key
    `);

    // تحويل الإعدادات إلى كائن
    const settingsObject = (settings as any[]).reduce((acc, setting) => {
      let value = setting.setting_value;
      
      // تحويل القيم حسب النوع
      switch (setting.setting_type) {
        case 'boolean':
          value = value === 'true' || value === '1';
          break;
        case 'number':
          value = parseInt(value) || 0;
          break;
        case 'json':
          try {
            value = JSON.parse(value);
          } catch {
            value = {};
          }
          break;
      }
      
      acc[setting.setting_key] = value;
      return acc;
    }, {});

    // الإعدادات الافتراضية إذا لم تكن موجودة
    const defaultSettings = {
      forum_name: 'منتدى سبق',
      forum_description: 'مجتمع النقاش والحوار',
      allow_guest_read: true,
      require_moderation: false,
      allow_edit_posts: true,
      max_topics_per_day: 10,
      max_replies_per_day: 50,
      auto_lock_old_topics: false,
      auto_lock_days: 365,
      enable_reputation: true,
      enable_badges: true,
      enable_notifications: true,
      ...settingsObject
    };

    console.log('✅ تم جلب إعدادات المنتدى');

    return NextResponse.json({
      success: true,
      settings: defaultSettings
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب إعدادات المنتدى:', error);
    
    // إرجاع الإعدادات الافتراضية في حالة الخطأ
    return NextResponse.json({
      success: true,
      settings: {
        forum_name: 'منتدى سبق',
        forum_description: 'مجتمع النقاش والحوار',
        allow_guest_read: true,
        require_moderation: false,
        allow_edit_posts: true,
        max_topics_per_day: 10,
        max_replies_per_day: 50,
        auto_lock_old_topics: false,
        auto_lock_days: 365,
        enable_reputation: true,
        enable_badges: true,
        enable_notifications: true
      }
    });
  }
}

// POST: حفظ إعدادات المنتدى
export async function POST(request: NextRequest) {
  try {
    console.log('💾 حفظ إعدادات المنتدى...');
    
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'بيانات الإعدادات مطلوبة' },
        { status: 400 }
      );
    }

    // حفظ كل إعداد
    for (const [key, value] of Object.entries(settings)) {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      await prisma.$executeRawUnsafe(`
        INSERT INTO forum_settings (setting_key, setting_value, setting_type, updated_at)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
        setting_value = VALUES(setting_value),
        updated_at = NOW()
      `, key, stringValue, typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string');
    }

    console.log('✅ تم حفظ إعدادات المنتدى');

    return NextResponse.json({
      success: true,
      message: 'تم حفظ الإعدادات بنجاح'
    });

  } catch (error: any) {
    console.error('❌ خطأ في حفظ إعدادات المنتدى:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'حدث خطأ في حفظ الإعدادات',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
} 
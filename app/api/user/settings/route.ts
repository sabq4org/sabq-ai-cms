/**
 * API endpoint لإعدادات المستخدم
 * User Settings API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { settingsService } from '@/lib/modules/settings/service-updated';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const module = searchParams.get('module');
    
    // TODO: الحصول على معرف المستخدم من الجلسة
    const userId = 'current-user-id';

    const userSettings = await settingsService.getUserSettings(
      userId,
      module || undefined
    );

    return NextResponse.json({
      settings: userSettings,
      total: userSettings.length,
      user_id: userId
    });

  } catch (error) {
    console.error('Error in user settings GET endpoint:', error);
    return NextResponse.json(
      { error: 'فشل في جلب إعدادات المستخدم' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, module } = body;

    // التحقق من البيانات المطلوبة
    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'المفتاح والقيمة مطلوبان' },
        { status: 400 }
      );
    }

    // TODO: الحصول على معرف المستخدم من الجلسة
    const userId = 'current-user-id';

    const updatedSetting = await settingsService.updateUserSetting(
      userId,
      key,
      value,
      module || 'general'
    );

    return NextResponse.json({
      success: true,
      setting: updatedSetting,
      message: 'تم تحديث إعداد المستخدم بنجاح'
    });

  } catch (error) {
    console.error('Error in user settings POST endpoint:', error);
    return NextResponse.json(
      { 
        error: 'فشل في تحديث إعداد المستخدم',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings: userSettings } = body;

    if (!Array.isArray(userSettings) || userSettings.length === 0) {
      return NextResponse.json(
        { error: 'قائمة الإعدادات مطلوبة' },
        { status: 400 }
      );
    }

    // TODO: الحصول على معرف المستخدم من الجلسة
    const userId = 'current-user-id';

    const results = [];
    const errors = [];

    // تحديث كل إعداد على حدة
    for (const setting of userSettings) {
      try {
        const result = await settingsService.updateUserSetting(
          userId,
          setting.key,
          setting.value,
          setting.module || 'general'
        );
        results.push(result);
      } catch (error) {
        errors.push({
          key: setting.key,
          error: error instanceof Error ? error.message : 'خطأ غير معروف'
        });
      }
    }

    return NextResponse.json({
      success: true,
      updated_count: results.length,
      error_count: errors.length,
      results,
      errors,
      message: 'تم تحديث إعدادات المستخدم'
    });

  } catch (error) {
    console.error('Error in user settings bulk update:', error);
    return NextResponse.json(
      { 
        error: 'فشل في التحديث المجمع لإعدادات المستخدم',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

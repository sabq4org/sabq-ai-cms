/**
 * API endpoint للإعدادات المتقدمة
 * Advanced Settings API Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { settingsService } from '@/lib/modules/settings/service-updated';
import { validateSettingValue } from '@/lib/modules/settings/validators';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const module = searchParams.get('module');
    const category = searchParams.get('category');
    const key = searchParams.get('key');
    const isPublic = searchParams.get('public');
    const search = searchParams.get('search');

    // إذا كان هناك مفتاح محدد، جلب إعداد واحد
    if (key) {
      const setting = await settingsService.getSetting(
        key,
        category || 'general',
        module || 'general'
      );

      if (!setting) {
        return NextResponse.json(
          { error: 'الإعداد غير موجود' },
          { status: 404 }
        );
      }

      return NextResponse.json({ setting });
    }

    // جلب جميع الإعدادات مع التصفية
    const filters = {
      section: module || undefined,
      category: category || undefined,
      is_public: isPublic ? isPublic === 'true' : undefined,
      search: search || undefined
    };

    const settings = await settingsService.getSystemSettings(filters);

    return NextResponse.json({
      settings,
      total: settings.length,
      filters: filters
    });

  } catch (error) {
    console.error('Error in settings GET endpoint:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الإعدادات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value, category, module, description, validation_rules } = body;

    // التحقق من البيانات المطلوبة
    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'المفتاح والقيمة مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من صحة القيمة إذا توفرت قواعد التحقق
    if (validation_rules) {
      const validation = await validateSettingValue(value, validation_rules);
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'قيمة غير صالحة', validation_errors: validation.errors },
          { status: 400 }
        );
      }
    }

    // TODO: التحقق من صلاحيات المستخدم
    const userId = 'current-user-id'; // يجب الحصول على معرف المستخدم من الجلسة

    const payload = {
      key,
      value,
      category: category || 'general',
      module: module || 'general',
      description,
      validation_rules
    };

    const updatedSetting = await settingsService.updateSystemSetting(payload, userId);

    return NextResponse.json({
      success: true,
      setting: updatedSetting,
      message: 'تم تحديث الإعداد بنجاح'
    });

  } catch (error) {
    console.error('Error in settings POST endpoint:', error);
    return NextResponse.json(
      { 
        error: 'فشل في تحديث الإعداد',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings: bulkSettings } = body;

    if (!Array.isArray(bulkSettings) || bulkSettings.length === 0) {
      return NextResponse.json(
        { error: 'قائمة الإعدادات مطلوبة' },
        { status: 400 }
      );
    }

    // TODO: التحقق من صلاحيات المستخدم
    const userId = 'current-user-id';

    const bulkUpdate = {
      settings: bulkSettings,
      merge_strategy: 'overwrite' as const,
      backup_before_update: true
    };

    const result = await settingsService.bulkUpdateSettings(bulkUpdate, userId);

    return NextResponse.json({
      success: true,
      result,
      message: 'تم تحديث الإعدادات بنجاح'
    });

  } catch (error) {
    console.error('Error in settings bulk update:', error);
    return NextResponse.json(
      { 
        error: 'فشل في التحديث المجمع للإعدادات',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');
    const category = searchParams.get('category') || 'general';
    const module = searchParams.get('module') || 'general';

    if (!key) {
      return NextResponse.json(
        { error: 'مفتاح الإعداد مطلوب' },
        { status: 400 }
      );
    }

    // TODO: التحقق من صلاحيات المستخدم
    const userId = 'current-user-id';

    const result = await settingsService.deleteSetting(key, category, module, userId);

    return NextResponse.json({
      success: true,
      message: 'تم حذف الإعداد بنجاح'
    });

  } catch (error) {
    console.error('Error in settings DELETE endpoint:', error);
    return NextResponse.json(
      { 
        error: 'فشل في حذف الإعداد',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

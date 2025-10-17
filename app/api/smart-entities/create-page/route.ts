/**
 * 🔗 API: إنشاء صفحة كيان تلقائياً
 * 
 * POST /api/smart-entities/create-page
 * 
 * Body: {
 *   entityId: string
 * }
 * 
 * Response: {
 *   success: boolean,
 *   pageUrl?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSmartLinksService } from '@/lib/services/smartLinksService';
import { requireAuth } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة والصلاحيات
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // التحقق من الصلاحيات (محرر أو أعلى)
    if (user.role !== 'editor' && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'صلاحيات غير كافية' },
        { status: 403 }
      );
    }

    // قراءة البيانات
    const body = await request.json();
    const { entityId } = body;

    // التحقق من البيانات
    if (!entityId) {
      return NextResponse.json(
        { success: false, error: 'معرف الكيان مطلوب' },
        { status: 400 }
      );
    }

    // إنشاء الصفحة
    const service = getSmartLinksService();
    const result = await service.createEntityPage(entityId, user.id);

    return NextResponse.json(result);

  } catch (error) {
    console.error('خطأ في إنشاء صفحة الكيان:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم'
      },
      { status: 500 }
    );
  }
}


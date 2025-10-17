/**
 * 🔗 API: إدراج الروابط الذكية في المقال
 * 
 * POST /api/smart-links/insert
 * 
 * Body: {
 *   articleId: string,
 *   mentions: Array<{
 *     start: number,
 *     end: number,
 *     entityId?: string,
 *     linkType: string,
 *     linkUrl: string,
 *     text: string,
 *     normalized: string,
 *     confidence: number
 *   }>
 * }
 * 
 * Response: {
 *   success: boolean,
 *   insertedCount: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSmartLinksService } from '@/lib/services/smartLinksService';
import { requireAuth } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      );
    }

    // قراءة البيانات
    const body = await request.json();
    const { articleId, mentions } = body;

    // التحقق من البيانات
    if (!articleId || !mentions || !Array.isArray(mentions)) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير كاملة' },
        { status: 400 }
      );
    }

    // إدراج الروابط
    const service = getSmartLinksService();
    const result = await service.insertLinks(
      articleId,
      mentions,
      user.id
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('خطأ في إدراج الروابط:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في الخادم'
      },
      { status: 500 }
    );
  }
}


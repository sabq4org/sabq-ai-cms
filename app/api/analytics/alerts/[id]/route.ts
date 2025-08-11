import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH /api/analytics/alerts/[id] - تحديث تنبيه
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alertId = params.id;
    const body = await request.json();
    const { isRead, severity, actionRequired } = body;

    // التحقق من وجود التنبيه (محاكاة)
    const mockAlerts = [
      { id: '1', isRead: false, severity: 'high', actionRequired: true },
      { id: '2', isRead: false, severity: 'medium', actionRequired: false },
      { id: '3', isRead: true, severity: 'low', actionRequired: false }
    ];

    const alert = mockAlerts.find(a => a.id === alertId);
    if (!alert) {
      return NextResponse.json(
        { error: 'التنبيه غير موجود' },
        { status: 404 }
      );
    }

    // تحديث التنبيه (محاكاة)
    const updatedAlert = {
      ...alert,
      ...(isRead !== undefined && { isRead }),
      ...(severity !== undefined && { severity }),
      ...(actionRequired !== undefined && { actionRequired }),
      updatedAt: new Date().toISOString()
    };

    // في التطبيق الحقيقي، سيتم تحديث التنبيه في قاعدة البيانات
    // await prisma.alert.update({
    //   where: { id: alertId },
    //   data: { isRead, severity, actionRequired }
    // });

    return NextResponse.json(updatedAlert);

  } catch (error) {
    console.error('خطأ في تحديث التنبيه:', error);
    return NextResponse.json(
      { error: 'خطأ في تحديث التنبيه' },
      { status: 500 }
    );
  }
}

// DELETE /api/analytics/alerts/[id] - حذف تنبيه
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alertId = params.id;

    // التحقق من وجود التنبيه والحذف (محاكاة)
    // في التطبيق الحقيقي:
    // const alert = await prisma.alert.findUnique({
    //   where: { id: alertId }
    // });
    
    // if (!alert) {
    //   return NextResponse.json(
    //     { error: 'التنبيه غير موجود' },
    //     { status: 404 }
    //   );
    // }

    // await prisma.alert.delete({
    //   where: { id: alertId }
    // });

    return NextResponse.json({ 
      message: 'تم حذف التنبيه بنجاح',
      deletedId: alertId
    });

  } catch (error) {
    console.error('خطأ في حذف التنبيه:', error);
    return NextResponse.json(
      { error: 'خطأ في حذف التنبيه' },
      { status: 500 }
    );
  }
}

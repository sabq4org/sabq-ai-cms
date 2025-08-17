import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/analytics/alert-rules/[id] - تحديث قاعدة تنبيه
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ruleId = params.id;
    const body = await request.json();
    const { keyword, type, threshold, isActive, notificationMethod } = body;

    // التحقق من وجود القاعدة (محاكاة)
    const mockRules = [
      { id: '1', keyword: 'الذكاء الاصطناعي', type: 'usage_spike', threshold: 1000, isActive: true, notificationMethod: 'browser' },
      { id: '2', keyword: 'التقنية', type: 'view_threshold', threshold: 5000, isActive: true, notificationMethod: 'both' },
      { id: '3', keyword: 'الاقتصاد', type: 'usage_drop', threshold: 20, isActive: false, notificationMethod: 'email' }
    ];

    const rule = mockRules.find(r => r.id === ruleId);
    if (!rule) {
      return NextResponse.json(
        { error: 'قاعدة التنبيه غير موجودة' },
        { status: 404 }
      );
    }

    // تحديث القاعدة (محاكاة)
    const updatedRule = {
      ...rule,
      ...(keyword !== undefined && { keyword: keyword.trim() }),
      ...(type !== undefined && { type }),
      ...(threshold !== undefined && { threshold: Number(threshold) }),
      ...(isActive !== undefined && { isActive }),
      ...(notificationMethod !== undefined && { notificationMethod }),
      updatedAt: new Date().toISOString()
    };

    // في التطبيق الحقيقي، سيتم تحديث القاعدة في قاعدة البيانات
    // await prisma.alertRule.update({
    //   where: { id: ruleId },
    //   data: { keyword, type, threshold, isActive, notificationMethod }
    // });

    return NextResponse.json(updatedRule);

  } catch (error) {
    console.error('خطأ في تحديث قاعدة التنبيه:', error);
    return NextResponse.json(
      { error: 'خطأ في تحديث قاعدة التنبيه' },
      { status: 500 }
    );
  }
}

// DELETE /api/analytics/alert-rules/[id] - حذف قاعدة تنبيه
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ruleId = params.id;

    // التحقق من وجود القاعدة والحذف (محاكاة)
    // في التطبيق الحقيقي:
    // const rule = await prisma.alertRule.findUnique({
    //   where: { id: ruleId }
    // });
    
    // if (!rule) {
    //   return NextResponse.json(
    //     { error: 'قاعدة التنبيه غير موجودة' },
    //     { status: 404 }
    //   );
    // }

    // await prisma.alertRule.delete({
    //   where: { id: ruleId }
    // });

    return NextResponse.json({ 
      message: 'تم حذف قاعدة التنبيه بنجاح',
      deletedId: ruleId
    });

  } catch (error) {
    console.error('خطأ في حذف قاعدة التنبيه:', error);
    return NextResponse.json(
      { error: 'خطأ في حذف قاعدة التنبيه' },
      { status: 500 }
    );
  }
}

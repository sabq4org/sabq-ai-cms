import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST: متابعة زاوية
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    // TODO: الحصول على user_id من الجلسة
    const userId = 'demo-user-id'; // مؤقت للتجربة
    
    // التحقق من وجود الزاوية
    const corner = await prisma.$queryRaw`
      SELECT id FROM muqtarab_corners WHERE slug = ${slug} AND is_active = true LIMIT 1;
    `;
    
    if (!(corner as any[]).length) {
      return NextResponse.json(
        { success: false, error: 'الزاوية غير موجودة' },
        { status: 404 }
      );
    }
    
    const cornerId = (corner as any[])[0].id;
    
    // التحقق من المتابعة الموجودة
    const existing = await prisma.$queryRaw`
      SELECT id FROM muqtarab_followers 
      WHERE corner_id = ${cornerId} AND user_id = ${userId} LIMIT 1;
    `;
    
    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { success: false, error: 'تتابع هذه الزاوية بالفعل' },
        { status: 400 }
      );
    }
    
    // إضافة المتابعة
    await prisma.$executeRaw`
      INSERT INTO muqtarab_followers (corner_id, user_id, followed_at)
      VALUES (${cornerId}, ${userId}, NOW());
    `;
    
    return NextResponse.json({
      success: true,
      message: 'تم متابعة الزاوية بنجاح'
    });
    
  } catch (error) {
    console.error('خطأ في متابعة الزاوية:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في متابعة الزاوية' },
      { status: 500 }
    );
  }
}

// DELETE: إلغاء متابعة زاوية
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const userId = 'demo-user-id'; // مؤقت للتجربة
    
    // التحقق من وجود الزاوية
    const corner = await prisma.$queryRaw`
      SELECT id FROM muqtarab_corners WHERE slug = ${slug} AND is_active = true LIMIT 1;
    `;
    
    if (!(corner as any[]).length) {
      return NextResponse.json(
        { success: false, error: 'الزاوية غير موجودة' },
        { status: 404 }
      );
    }
    
    const cornerId = (corner as any[])[0].id;
    
    // حذف المتابعة
    const result = await prisma.$executeRaw`
      DELETE FROM muqtarab_followers 
      WHERE corner_id = ${cornerId} AND user_id = ${userId};
    `;
    
    return NextResponse.json({
      success: true,
      message: 'تم إلغاء متابعة الزاوية بنجاح'
    });
    
  } catch (error) {
    console.error('خطأ في إلغاء متابعة الزاوية:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في إلغاء متابعة الزاوية' },
      { status: 500 }
    );
  }
}
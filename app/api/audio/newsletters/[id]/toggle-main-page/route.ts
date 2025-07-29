import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log(`🏠 تحديث حالة النشرة للصفحة الرئيسية: ${id}`);
    
    // إلغاء تفعيل أي نشرة أخرى في الصفحة الرئيسية
    await prisma.audio_newsletters.updateMany({
      where: { is_main_page: true },
      data: { is_main_page: false }
    });
    
    // تفعيل النشرة المطلوبة
    const newsletter = await prisma.audio_newsletters.update({
      where: { id },
      data: { 
        is_main_page: true,
        is_published: true // تأكد من أنها منشورة أيضاً
      }
    });
    
    console.log('✅ تم تحديث حالة النشرة:', newsletter.id);
    
    return NextResponse.json({
      success: true,
      newsletter,
      message: 'تم إضافة النشرة إلى الصفحة الرئيسية بنجاح'
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في تحديث النشرة:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في تحديث النشرة',
      details: error.message
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log(`🏠 إزالة النشرة من الصفحة الرئيسية: ${id}`);
    
    // إلغاء تفعيل النشرة من الصفحة الرئيسية
    const newsletter = await prisma.audio_newsletters.update({
      where: { id },
      data: { is_main_page: false }
    });
    
    console.log('✅ تم إزالة النشرة من الصفحة الرئيسية:', newsletter.id);
    
    return NextResponse.json({
      success: true,
      newsletter,
      message: 'تم إزالة النشرة من الصفحة الرئيسية بنجاح'
    });
    
  } catch (error: any) {
    console.error('❌ خطأ في تحديث النشرة:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في تحديث النشرة',
      details: error.message
    }, { status: 500 });
  }
} 
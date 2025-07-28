import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {

    // محاولة جلب كتاب الرأي
    try {
      const authors = await prisma.opinion_authors.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          name: true,
          bio: true,
          avatarUrl: true,
          isActive: true,
          displayOrder: true,
          title: true,
          email: true
        }
      });

      return NextResponse.json({
        success: true,
        authors
      });
    } catch (dbError) {
      console.error('❌ خطأ في قاعدة البيانات:', dbError);
      
      // إرجاع قائمة فارغة في حالة الخطأ
      return NextResponse.json({
        success: false,
        error: 'فشل في جلب كتاب الرأي',
        authors: []
      });
    }
  } catch (error) {
    console.error('❌ خطأ عام:', error);
    return NextResponse.json({
      success: false,
      error: 'خطأ في النظام',
      authors: []
    }, { status: 500 });
  }
}

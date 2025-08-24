import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromRequest } from "@/app/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 جلب نقاط الولاء النشطة...');
    
    let user;
    try {
      user = await requireAuthFromRequest(req);
    } catch (authError) {
      console.error('❌ خطأ في المصادقة:', authError);
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 });
    }

    // جلب إجمالي النقاط من جدول users
    const userData = await prisma.users.findUnique({
      where: { id: user.id },
      select: { loyalty_points: true }
    });

    const points = userData?.loyalty_points || 0;

    // تحديد المستوى
    let level = 'برونزي';
    if (points >= 2000) level = 'بلاتيني';
    else if (points >= 500) level = 'ذهبي';
    else if (points >= 100) level = 'فضي';

    return NextResponse.json({
      success: true,
      data: {
        points,
        level,
        userId: user.id
      }
    });

  } catch (error) {
    console.error('❌ خطأ في جلب نقاط الولاء:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

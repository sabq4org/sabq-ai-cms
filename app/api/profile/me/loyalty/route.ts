import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromRequest } from "@/app/lib/auth";
import prisma from "@/lib/prisma";
import { ensureDbConnected, retryWithConnection } from "@/lib/prisma-helpers";

// تعيين runtime كـ nodejs لـ Prisma
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getLevel(totalPoints: number): { level: string; nextLevelThreshold: number } {
  if (totalPoints >= 2000) return { level: 'بلاتيني', nextLevelThreshold: 999999 };
  if (totalPoints >= 500) return { level: 'ذهبي', nextLevelThreshold: 2000 };
  if (totalPoints >= 100) return { level: 'فضي', nextLevelThreshold: 500 };
  return { level: 'برونزي', nextLevelThreshold: 100 };
}

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 [loyalty] بدء جلب نقاط الولاء...');
    
    let user;
    try {
      user = await requireAuthFromRequest(req);
      console.log('✅ [loyalty] تم التحقق من المستخدم:', user.id);
    } catch (authError: any) {
      console.error('❌ [loyalty] خطأ في المصادقة:', authError.message);
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized",
        details: process.env.NODE_ENV === 'development' ? authError.message : undefined
      }, { status: 401 });
    }

    // التأكد من الاتصال بقاعدة البيانات قبل الاستعلام
    await ensureDbConnected();
    
    // استخدام retryWithConnection لضمان المرونة
    const userData = await retryWithConnection(async () => {
      return await prisma.users.findUnique({
        where: { id: user.id },
        select: { loyalty_points: true }
      });
    });

    const points = userData?.loyalty_points || 0;
    const { level, nextLevelThreshold } = getLevel(points);

    console.log(`✅ [loyalty] تم جلب النقاط بنجاح للمستخدم ${user.id}:`, { points, level });

    return NextResponse.json({ 
      success: true, 
      points, 
      level, 
      nextLevelThreshold, 
      lastUpdatedAt: new Date().toISOString() 
    }, { 
      headers: { 'Cache-Control': 'no-store' } 
    });
    
  } catch (e: any) {
    console.error('❌ [loyalty] خطأ عام في الخادم:', e);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch loyalty',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    }, { status: 500 });
  }
}



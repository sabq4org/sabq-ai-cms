import { NextRequest, NextResponse } from 'next/server';
import { requireAuthFromRequest } from "@/app/lib/auth";
import { prisma, ensureDbConnected, retryWithConnection, isPrismaNotConnectedError } from "@/lib/prisma";

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

    let points = 0;
    let dbConnected = false;
    
    try {
      // محاولة الاتصال وجلب البيانات
      dbConnected = await ensureDbConnected();
      
      if (dbConnected) {
        const userData = await retryWithConnection(async () => {
          return await prisma.users.findUnique({
            where: { id: user.id },
            select: { loyalty_points: true }
          });
        });
        points = userData?.loyalty_points || 0;
      }
    } catch (dbError: any) {
      console.warn('⚠️ [loyalty] فشل الاتصال بقاعدة البيانات، استخدام القيم الافتراضية:', dbError.message);
      
      // إذا كانت مشكلة اتصال، استخدم قيمة افتراضية
      if (isPrismaNotConnectedError(dbError)) {
        points = 0; // قيمة افتراضية
        dbConnected = false;
      } else {
        throw dbError; // إعادة رمي الخطأ إذا لم يكن مشكلة اتصال
      }
    }

    const { level, nextLevelThreshold } = getLevel(points);

    console.log(`✅ [loyalty] تم جلب النقاط للمستخدم ${user.id}:`, { 
      points, 
      level, 
      dbConnected,
      fallback: !dbConnected 
    });

    return NextResponse.json({ 
      success: true, 
      points, 
      level, 
      nextLevelThreshold, 
      lastUpdatedAt: new Date().toISOString(),
      fallback: !dbConnected // إشارة للواجهة أن البيانات قد تكون افتراضية
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



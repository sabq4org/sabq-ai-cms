import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Cron Job للجدولة التلقائية للإعلانات
 * يتم استدعاؤه كل دقيقة من Vercel Cron Jobs
 * 
 * GET /api/internal/cron/announcements
 */

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // التحقق من السر
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    const results = {
      activated: 0,
      expired: 0,
      archived: 0,
      timestamp: now.toISOString()
    };

    // 1. تفعيل الإعلانات المجدولة
    try {
      const activatedResult = await prisma.adminAnnouncement.updateMany({
        where: {
          status: 'SCHEDULED',
          startAt: { lte: now },
        },
        data: { 
          status: 'ACTIVE',
          updatedAt: now
        },
      });
      results.activated = activatedResult.count;
      
      if (results.activated > 0) {
        console.log(`✅ Activated ${results.activated} scheduled announcements`);
      }
    } catch (error) {
      console.error('Error activating announcements:', error);
    }

    // 2. تعليق الإعلانات المنتهية
    try {
      const expiredResult = await prisma.adminAnnouncement.updateMany({
        where: {
          status: 'ACTIVE',
          endAt: { 
            not: null,
            lt: now 
          },
        },
        data: { 
          status: 'EXPIRED',
          updatedAt: now
        },
      });
      results.expired = expiredResult.count;
      
      if (results.expired > 0) {
        console.log(`⏰ Expired ${results.expired} active announcements`);
      }
    } catch (error) {
      console.error('Error expiring announcements:', error);
    }

    // 3. أرشفة تلقائية بعد 14 يوماً
    try {
      const archiveDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const archivedResult = await prisma.adminAnnouncement.updateMany({
        where: {
          status: 'EXPIRED',
          updatedAt: { lt: archiveDate },
        },
        data: { 
          status: 'ARCHIVED',
          updatedAt: now
        },
      });
      results.archived = archivedResult.count;
      
      if (results.archived > 0) {
        console.log(`📦 Archived ${results.archived} expired announcements`);
      }
    } catch (error) {
      console.error('Error archiving announcements:', error);
    }

    // 4. إعادة بناء الصفحات المتأثرة
    if (results.activated > 0 || results.expired > 0) {
      try {
        revalidatePath('/admin/dashboard');
        revalidatePath('/admin/announcements');
        console.log('✨ Revalidated cache for admin pages');
      } catch (error) {
        console.error('Error revalidating paths:', error);
      }
    }

    console.log('✅ Announcement cron job completed:', results);

    return NextResponse.json({
      success: true,
      message: 'Announcement cron job completed successfully',
      results,
    });

  } catch (error) {
    console.error('❌ Fatal error in announcement cron job:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

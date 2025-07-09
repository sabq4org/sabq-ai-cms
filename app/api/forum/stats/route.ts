import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: جلب إحصائيات المنتدى
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 جلب إحصائيات المنتدى...');

    // حساب الإحصائيات من قاعدة البيانات
    const [
      totalTopics,
      totalReplies,
      totalMembers,
      pinnedTopics,
      lockedTopics,
      todayTopics,
      todayReplies,
      activeTopics
    ] = await Promise.all([
      // إجمالي المواضيع
      prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM forum_topics WHERE status = 'active'
      `),
      
      // إجمالي الردود
      prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM forum_replies WHERE status = 'active'
      `),
      
      // إجمالي الأعضاء (المستخدمين النشطين)
      prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM users WHERE is_verified = true
      `),
      
      // المواضيع المثبتة
      prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM forum_topics WHERE is_pinned = true AND status = 'active'
      `),
      
      // المواضيع المقفلة
      prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM forum_topics WHERE is_locked = true AND status = 'active'
      `),
      
      // مواضيع اليوم
      prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM forum_topics 
        WHERE status = 'active' 
        AND DATE(created_at) = CURDATE()
      `),
      
      // ردود اليوم
      prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count FROM forum_replies 
        WHERE status = 'active' 
        AND DATE(created_at) = CURDATE()
      `),
      
      // المواضيع النشطة (التي لها ردود في آخر 7 أيام)
      prisma.$queryRawUnsafe(`
        SELECT COUNT(DISTINCT t.id) as count 
        FROM forum_topics t
        LEFT JOIN forum_replies r ON t.id = r.topic_id
        WHERE t.status = 'active' 
        AND (t.last_reply_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
             OR r.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY))
      `)
    ]);

    // استخراج القيم
    const stats = {
      totalTopics: Number((totalTopics as any[])[0]?.count || 0),
      totalReplies: Number((totalReplies as any[])[0]?.count || 0),
      totalMembers: Number((totalMembers as any[])[0]?.count || 0),
      pinnedTopics: Number((pinnedTopics as any[])[0]?.count || 0),
      lockedTopics: Number((lockedTopics as any[])[0]?.count || 0),
      todayTopics: Number((todayTopics as any[])[0]?.count || 0),
      todayReplies: Number((todayReplies as any[])[0]?.count || 0),
      activeTopics: Number((activeTopics as any[])[0]?.count || 0)
    };

    console.log('✅ تم جلب إحصائيات المنتدى:', stats);

    return NextResponse.json({
      success: true,
      stats,
      lastUpdated: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ خطأ في جلب إحصائيات المنتدى:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'حدث خطأ في جلب إحصائيات المنتدى',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
} 
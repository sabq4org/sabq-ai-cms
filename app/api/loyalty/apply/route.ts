import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ApplyBody = {
  event: 'like' | 'unlike' | 'read_complete' | 'read_revert';
  articleId?: string;
  durationSec?: number;
  scrollDepth?: number;
};

const DEFAULT_RULES = {
  read_complete_article: 10,
  like_article: 1,
  five_consecutive_reads: 15,
  read_thresholds: { min_read_time_sec: 30, min_scroll_depth: 0.85 },
  cooldowns: { like_same_article_sec: 60, repeat_read_same_article_hours: 12 },
};

async function getRules() {
  try {
    const setting = await prisma.site_settings.findFirst({ where: { section: 'loyalty.rules' } });
    const data: any = setting?.data;
    return data && typeof data === 'object' ? { ...DEFAULT_RULES, ...data } : DEFAULT_RULES;
  } catch {
    return DEFAULT_RULES;
  }
}

export async function POST(req: NextRequest) {
  try {
    await rateLimit('loyalty:apply', 10, 5);
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
  }

  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const body = (await req.json()) as ApplyBody;
    const rules = await getRules();

    let delta = 0;
    let reason = body.event;

    if (body.event === 'like') {
      // لا نضيف النقاط هنا إن كانت تُضاف بالفعل في مسار like، لكن نوحّد الواجهة
      delta = rules.like_article || 1;
    } else if (body.event === 'unlike') {
      // سحب النقاط إن كانت السياسة تنص على ذلك (افتراض: لا نسحب)
      delta = 0;
    } else if (body.event === 'read_complete') {
      const minT = rules.read_thresholds?.min_read_time_sec ?? 30;
      const minS = rules.read_thresholds?.min_scroll_depth ?? 0.85;
      if ((body.durationSec || 0) >= minT && (body.scrollDepth || 0) >= minS) {
        // منع التكرار لنفس المقال خلال window
        if (body.articleId) {
          const since = new Date(Date.now() - (rules.cooldowns?.repeat_read_same_article_hours ?? 12) * 3600 * 1000);
          const exists = await prisma.loyalty_points.findFirst({
            where: { user_id: user.id, action: 'read_complete', reference_id: body.articleId, created_at: { gte: since } },
          });
          if (!exists) delta = rules.read_complete_article || 10;
        } else {
          delta = rules.read_complete_article || 10;
        }
      }
    } else if (body.event === 'read_revert') {
      delta = 0;
    }

    let newBalance = 0;
    let pointsAwarded = 0;
    if (delta !== 0) {
      await prisma.loyalty_points.create({
        data: {
          id: `lp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          user_id: user.id,
          points: delta,
          action: reason,
          reference_id: body.articleId,
          reference_type: 'article',
          metadata: { source: 'loyalty/apply' },
          created_at: new Date(),
        },
      });
      pointsAwarded = delta;
    }

    const agg = await prisma.loyalty_points.aggregate({ where: { user_id: user.id }, _sum: { points: true } });
    newBalance = agg._sum.points || 0;

    return NextResponse.json({ success: true, pointsAwarded, points: newBalance, level: newBalance >= 2000 ? 'بلاتيني' : newBalance >= 500 ? 'ذهبي' : newBalance >= 100 ? 'فضي' : 'برونزي' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Failed to apply loyalty' }, { status: 500 });
  }
}



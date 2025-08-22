import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

type Stats = {
  total: number;
  unread: number;
  read: number;
};

function json(data: any, init?: number | ResponseInit) {
  return NextResponse.json(data, init);
}

function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '15', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('auth-token')?.value || request.cookies.get('access_token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.id || decoded.userId || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return json({ success: false, error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPagination(searchParams);
    const status = (searchParams.get('status') || 'all').toLowerCase();

    const where: any = { user_id: userId };
    if (status === 'unread') where.read_at = null;
    if (status === 'read') where.read_at = { not: null };

    const [totalCount, unreadCount, notifications] = await Promise.all([
      prisma.smartNotifications.count({ where }),
      prisma.smartNotifications.count({ where: { user_id: userId, read_at: null } }),
      prisma.smartNotifications.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const readCount = totalCount - unreadCount;
    const stats: Stats = { total: totalCount, unread: unreadCount, read: readCount };

    const formatted = notifications.map((n: any) => ({
      ...n,
      created_at: n.created_at?.toISOString?.() || n.created_at,
      updated_at: n.updated_at?.toISOString?.() || n.updated_at,
      read_at: n.read_at ? (n.read_at?.toISOString?.() || n.read_at) : null,
      data: n.data || n.metadata || {},
    }));

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const hasMore = page < totalPages;

    const res = json({
      success: true,
      data: {
        notifications: formatted,
        total: totalCount,
        unread: unreadCount,
        read: readCount,
        unreadCount,
        stats,
        pagination: { page, limit, totalPages, hasMore },
        performance: { returned: formatted.length, filtered: totalCount, removed: 0 },
      },
    });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error) {
    console.error('Error in GET /api/notifications:', error);
    return json({ success: false, error: 'فشل في جلب الإشعارات' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return json({ success: false, error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();
    const { targetUserId, type, title, message, priority = 'medium', metadata = {}, sendImmediate = true } = body || {};

    if (!targetUserId || !title || !message) {
      return json({ success: false, error: 'targetUserId, title, message مطلوبة' }, { status: 400 });
    }

    const created = await prisma.smartNotifications.create({
      data: {
        user_id: targetUserId,
        type: type || 'system_announcement',
        title,
        message,
        priority,
        status: sendImmediate ? 'delivered' : 'pending',
        data: metadata,
      },
    });

    return json({ success: true, data: { notification: created } }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/notifications:', error);
    return json({ success: false, error: 'فشل في إنشاء الإشعار' }, { status: 500 });
  }
}



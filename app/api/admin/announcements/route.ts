import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/getAuthenticatedUser';

// مخطط التحقق من صحة البيانات
const CreateAnnouncementSchema = z.object({
  title: z.string().min(5, 'العنوان قصير جداً').max(500),
  bodyMd: z.string().min(10, 'المحتوى قصير جداً'),
  type: z.enum(['ANNOUNCEMENT', 'CRITICAL', 'GUIDELINE', 'ASSET_APPROVED', 'MAINTENANCE', 'FEATURE', 'POLICY']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']),
  status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE']).default('DRAFT'),
  isPinned: z.boolean().default(false),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  audienceRoles: z.array(z.string()).default([]),
  audienceUsers: z.array(z.string()).default([]),
  audienceTeams: z.array(z.string()).default([]),
  attachments: z.array(z.object({
    url: z.string().url(),
    kind: z.enum(['IMAGE', 'VIDEO', 'FILE', 'LINK']),
    alt: z.string().optional(),
    meta: z.record(z.any()).optional()
  })).optional()
});

/**
 * GET /api/admin/announcements
 * الحصول على قائمة الإعلانات مع التصفية والترقيم
 */
export async function GET(request: NextRequest) {
  try {
    // التحقق من المصادقة
    const authResult = await getAuthenticatedUser(request);
    if (authResult.reason !== 'ok' || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
    
    const user = authResult.user;
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // استخراج المعاملات
    const { searchParams } = new URL(request.url);
    const filters = {
      q: searchParams.get('q') || undefined,
      type: searchParams.get('type') || undefined,
      priority: searchParams.get('priority') || undefined,
      status: searchParams.get('status') || undefined,
      isPinned: searchParams.get('isPinned') === 'true' ? true : undefined,
      authorId: searchParams.get('authorId') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    // بناء شروط WHERE
    const whereConditions: any = {
      AND: []
    };

    // البحث النصي
    if (filters.q) {
      whereConditions.AND.push({
        OR: [
          { title: { contains: filters.q, mode: 'insensitive' } },
          { bodyMd: { contains: filters.q, mode: 'insensitive' } }
        ]
      });
    }

    // التصفية حسب النوع
    if (filters.type) {
      whereConditions.AND.push({ type: filters.type });
    }

    // التصفية حسب الأولوية
    if (filters.priority) {
      whereConditions.AND.push({ priority: filters.priority });
    }

    // التصفية حسب الحالة
    if (filters.status) {
      whereConditions.AND.push({ status: filters.status });
    }

    // التصفية حسب المثبت
    if (filters.isPinned !== undefined) {
      whereConditions.AND.push({ isPinned: filters.isPinned });
    }

    // التصفية حسب المؤلف
    if (filters.authorId) {
      whereConditions.AND.push({ authorId: filters.authorId });
    }

    // منطق RBAC: إرجاع الإعلانات المناسبة للمستخدم
    whereConditions.AND.push({
      OR: [
        { audienceRoles: { isEmpty: true } }, // إعلانات عامة
        { audienceRoles: { has: user.role } },
        { audienceUsers: { has: user.id } },
        // إذا كان المستخدم admin، يرى كل شيء
        ...(user.role === 'admin' ? [{}] : [])
      ]
    });

    // الحصول على العدد الإجمالي
    const total = await prisma.adminAnnouncement.count({
      where: whereConditions.AND.length > 0 ? whereConditions : undefined
    });

    // الحصول على البيانات مع الترقيم
    const announcements = await prisma.adminAnnouncement.findMany({
      where: whereConditions.AND.length > 0 ? whereConditions : undefined,
      orderBy: [
        { isPinned: 'desc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        attachments: true
      }
    });

    return NextResponse.json({
      data: announcements,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit)
      }
    });

  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/announcements
 * إنشاء إعلان جديد
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthenticatedUser(request);
    
    // التحقق من الصلاحيات
    if (authResult.reason !== 'ok' || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user = authResult.user;
    
    if (!['admin', 'system_admin', 'editor'].includes(user.role || 'user')) {
      return NextResponse.json(
        { error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      );
    }

    // قراءة البيانات
    const body = await request.json();
    
    // التحقق من الصحة
    const validation = CreateAnnouncementSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // إنشاء الإعلان
    const announcement = await prisma.adminAnnouncement.create({
      data: {
        title: data.title,
        bodyMd: data.bodyMd,
        type: data.type,
        priority: data.priority,
        status: data.status,
        isPinned: data.isPinned,
        startAt: data.startAt ? new Date(data.startAt) : null,
        endAt: data.endAt ? new Date(data.endAt) : null,
        authorId: user.id,
        audienceRoles: data.audienceRoles,
        audienceUsers: data.audienceUsers,
        audienceTeams: data.audienceTeams,
        attachments: data.attachments ? {
          create: data.attachments
        } : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        attachments: true
      }
    });

    // تسجيل في سجل التدقيق
    try {
      await prisma.activity_logs?.create({
        data: {
          actorId: user.id,
          action: 'ANNOUNCEMENT_CREATED',
          entityType: 'AdminAnnouncement',
          entityId: announcement.id,
          newValue: JSON.stringify(announcement),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }

    return NextResponse.json(announcement, { status: 201 });

  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const UpdateAnnouncementSchema = z.object({
  title: z.string().min(5).max(500).optional(),
  bodyMd: z.string().min(10).optional(),
  type: z.enum(['ANNOUNCEMENT', 'CRITICAL', 'GUIDELINE', 'ASSET_APPROVED', 'MAINTENANCE', 'FEATURE', 'POLICY']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'EXPIRED', 'ARCHIVED']).optional(),
  isPinned: z.boolean().optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  audienceRoles: z.array(z.string()).optional(),
  audienceUsers: z.array(z.string()).optional(),
  audienceTeams: z.array(z.string()).optional(),
});

/**
 * GET /api/admin/announcements/[id]
 * الحصول على إعلان واحد
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const announcement = await prisma.adminAnnouncement.findUnique({
      where: { id: params.id },
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

    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    // التحقق من الصلاحيات
    const canView = 
      user.role === 'admin' ||
      announcement.audienceRoles.length === 0 ||
      announcement.audienceRoles.includes(user.role) ||
      announcement.audienceUsers.includes(user.id);

    if (!canView) {
      return NextResponse.json(
        { error: 'Forbidden - cannot view this announcement' },
        { status: 403 }
      );
    }

    return NextResponse.json(announcement);

  } catch (error) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/announcements/[id]
 * تحديث إعلان
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // الحصول على الإعلان الحالي
    const existing = await prisma.adminAnnouncement.findUnique({
      where: { id: params.id },
      include: { attachments: true }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    // التحقق من الصلاحيات
    const canEdit = 
      user.role === 'admin' ||
      user.id === existing.authorId ||
      ['system_admin', 'editor'].includes(user.role);

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Forbidden - cannot edit this announcement' },
        { status: 403 }
      );
    }

    // التحقق من البيانات
    const body = await request.json();
    const validation = UpdateAnnouncementSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // تحديث الإعلان
    const updated = await prisma.adminAnnouncement.update({
      where: { id: params.id },
      data: {
        ...data,
        startAt: data.startAt ? new Date(data.startAt) : undefined,
        endAt: data.endAt ? new Date(data.endAt) : undefined,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true }
        },
        attachments: true
      }
    });

    // تسجيل التغيير
    try {
      await prisma.activity_logs?.create({
        data: {
          user_id: user.id,
          action: 'ANNOUNCEMENT_UPDATED',
          entity_type: 'AdminAnnouncement',
          entity_id: params.id,
          old_value: JSON.stringify(existing),
          new_value: JSON.stringify(updated),
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        }
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }

    return NextResponse.json(updated);

  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/announcements/[id]
 * حذف إعلان
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.adminAnnouncement.findUnique({
      where: { id: params.id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    // فقط admins وصاحب الإعلان (system_admin)
    const canDelete = 
      user.role === 'admin' ||
      (user.role === 'system_admin' && user.id === existing.authorId);

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Forbidden - cannot delete this announcement' },
        { status: 403 }
      );
    }

    await prisma.adminAnnouncement.delete({
      where: { id: params.id }
    });

    // تسجيل الحذف
    try {
      await prisma.activity_logs?.create({
        data: {
          user_id: user.id,
          action: 'ANNOUNCEMENT_DELETED',
          entity_type: 'AdminAnnouncement',
          entity_id: params.id,
          old_value: JSON.stringify(existing),
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        }
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

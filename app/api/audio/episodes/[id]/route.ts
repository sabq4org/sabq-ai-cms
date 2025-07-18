import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// GET - جلب حلقة واحدة
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const episode = await prisma.audio_episodes.findUnique({
      where: { id },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            slug: true,
            voice_model: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!episode) {
      return NextResponse.json(
        { success: false, error: 'Episode not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      episode
    });
  } catch (error) {
    console.error('Error fetching episode:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch episode' },
      { status: 500 }
    );
  }
}

// PUT - تحديث حلقة
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // التحقق من المصادقة
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    // التحقق من صلاحيات المستخدم
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const data = await request.json();

    const episode = await prisma.audio_episodes.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.episode_number !== undefined && { episode_number: data.episode_number }),
        ...(data.voice_model && { voice_model: data.voice_model }),
        ...(data.scheduled_at !== undefined && { 
          scheduled_at: data.scheduled_at ? new Date(data.scheduled_at) : null 
        }),
        ...(data.status && { status: data.status }),
        ...(data.audio_url && { audio_url: data.audio_url }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.generation_status && { generation_status: data.generation_status }),
        ...(data.metadata && { metadata: data.metadata })
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      episode
    });
  } catch (error) {
    console.error('Error updating episode:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update episode' },
      { status: 500 }
    );
  }
}

// DELETE - حذف حلقة
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // التحقق من المصادقة
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    // التحقق من صلاحيات المستخدم
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // حذف المهام المجدولة المرتبطة
    await prisma.audio_scheduled_jobs.deleteMany({
      where: { episode_id: id }
    });

    // حذف الحلقة
    await prisma.audio_episodes.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Episode deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting episode:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete episode' },
      { status: 500 }
    );
  }
} 
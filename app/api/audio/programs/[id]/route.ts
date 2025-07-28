import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// GET - جلب برنامج واحد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const program = await prisma.audio_programs.findUnique({
      where: { id },
      include: {
        episodes: {
          orderBy: {
            episode_number: 'desc'
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

    if (!program) {
      return NextResponse.json(
        { success: false, error: 'Program not found' },
        { status: 404 }
      );
    }

    // حساب الإحصائيات
    const totalViews = await prisma.audio_episodes.aggregate({
      where: { program_id: id },
      _sum: { views: true }
    });

    const programWithStats = {
      ...program,
      stats: {
        totalEpisodes: program.episodes.length,
        publishedEpisodes: program.episodes.filter(e => e.status === 'published').length,
        totalViews: totalViews._sum.views || 0
      }
    };

    return NextResponse.json({
      success: true,
      program: programWithStats
    });
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch program' },
      { status: 500 }
    );
  }
}

// PUT - تحديث برنامج
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

    const program = await prisma.audio_programs.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.short_description !== undefined && { short_description: data.short_description }),
        ...(data.logo_url !== undefined && { logo_url: data.logo_url }),
        ...(data.thumbnail_url !== undefined && { thumbnail_url: data.thumbnail_url }),
        ...(data.preferred_duration !== undefined && { preferred_duration: data.preferred_duration }),
        ...(data.voice_model && { voice_model: data.voice_model }),
        ...(data.display_position && { display_position: data.display_position }),
        ...(data.display_order !== undefined && { display_order: data.display_order }),
        ...(data.status && { status: data.status }),
        ...(data.settings && { settings: data.settings })
      },
      include: {
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
      program
    });
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update program' },
      { status: 500 }
    );
  }
}

// DELETE - حذف برنامج
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

    // التحقق من صلاحيات المستخدم (admin فقط)
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // حذف البرنامج (سيتم حذف الحلقات تلقائياً بسبب onDelete: Cascade)
    await prisma.audio_programs.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Program deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete program' },
      { status: 500 }
    );
  }
} 
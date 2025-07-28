import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// POST - إنشاء حلقة جديدة
export async function POST(request: NextRequest) {
  try {
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
    const {
      program_id,
      title,
      content,
      episode_number,
      voice_model,
      scheduled_at,
      auto_generate,
      auto_publish
    } = data;

    // التحقق من وجود البرنامج
    const program = await prisma.audio_programs.findUnique({
      where: { id: program_id }
    });

    if (!program) {
      return NextResponse.json(
        { success: false, error: 'Program not found' },
        { status: 404 }
      );
    }

    // حساب رقم الحلقة إذا لم يتم تحديده
    let finalEpisodeNumber = episode_number;
    if (!finalEpisodeNumber) {
      const lastEpisode = await prisma.audio_episodes.findFirst({
        where: { program_id },
        orderBy: { episode_number: 'desc' }
      });
      finalEpisodeNumber = (lastEpisode?.episode_number || 0) + 1;
    }

    // إنشاء الحلقة
    const episode = await prisma.audio_episodes.create({
      data: {
        program_id,
        title,
        content,
        episode_number: finalEpisodeNumber,
        voice_model: voice_model || program.voice_model || 'bradford',
        scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
        status: scheduled_at ? 'scheduled' : 'draft',
        generation_status: 'pending',
        created_by: userId,
        metadata: {
          auto_generate: auto_generate || false,
          auto_publish: auto_publish || false
        }
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

    // إذا كانت هناك جدولة، أنشئ مهمة جدولة
    if (scheduled_at && (auto_generate || auto_publish)) {
      const scheduledTime = new Date(scheduled_at);
      
      // جدولة توليد الصوت (قبل 5 دقائق من موعد النشر)
      if (auto_generate) {
        const generateTime = new Date(scheduledTime);
        generateTime.setMinutes(generateTime.getMinutes() - 5);
        
        await prisma.audio_scheduled_jobs.create({
          data: {
            episode_id: episode.id,
            job_type: 'generate_audio',
            scheduled_for: generateTime,
            status: 'pending'
          }
        });
      }

      // جدولة النشر
      if (auto_publish) {
        await prisma.audio_scheduled_jobs.create({
          data: {
            episode_id: episode.id,
            job_type: 'publish_episode',
            scheduled_for: scheduledTime,
            status: 'pending'
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      episode
    });
  } catch (error) {
    console.error('Error creating episode:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create episode' },
      { status: 500 }
    );
  }
} 
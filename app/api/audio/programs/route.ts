import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// GET - جلب جميع البرامج
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const position = searchParams.get('position') || undefined;

    const programs = await prisma.audio_programs.findMany({
      where: {
        ...(status && { status }),
        ...(position && { display_position: position })
      },
      include: {
        episodes: {
          where: {
            status: 'published'
          },
          orderBy: {
            published_at: 'desc'
          },
          take: 5 // آخر 5 حلقات فقط
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { display_order: 'asc' },
        { created_at: 'desc' }
      ]
    });

    // حساب إحصائيات كل برنامج
    const programsWithStats = await Promise.all(
      programs.map(async (program) => {
        const totalEpisodes = await prisma.audio_episodes.count({
          where: { program_id: program.id }
        });

        const publishedEpisodes = await prisma.audio_episodes.count({
          where: { 
            program_id: program.id,
            status: 'published'
          }
        });

        const totalViews = await prisma.audio_episodes.aggregate({
          where: { program_id: program.id },
          _sum: { views: true }
        });

        return {
          ...program,
          stats: {
            totalEpisodes,
            publishedEpisodes,
            totalViews: totalViews._sum.views || 0
          }
        };
      })
    );

    return NextResponse.json({
      success: true,
      programs: programsWithStats
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

// POST - إنشاء برنامج جديد
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
      name,
      description,
      short_description,
      logo_url,
      thumbnail_url,
      preferred_duration,
      voice_model,
      display_position,
      display_order,
      status
    } = data;

    // توليد slug فريد
    const baseSlug = name
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\u0750-\u077Fa-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let slug = baseSlug;
    let counter = 0;
    
    while (true) {
      const existing = await prisma.audio_programs.findUnique({
        where: { slug }
      });
      
      if (!existing) break;
      
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    const program = await prisma.audio_programs.create({
      data: {
        name,
        description,
        short_description,
        logo_url,
        thumbnail_url,
        preferred_duration: preferred_duration || 5,
        voice_model: voice_model || 'bradford',
        display_position: display_position || 'header',
        display_order: display_order || 0,
        status: status || 'active',
        slug,
        created_by: userId,
        settings: {}
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
    console.error('Error creating program:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create program' },
      { status: 500 }
    );
  }
} 
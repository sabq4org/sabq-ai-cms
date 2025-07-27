import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: الحصول على قائمة النشرات الصوتية
export async function GET(request: NextRequest) {
  try {
    const newsletters = await prisma.audio_newsletters.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      newsletters
    });
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletters' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const {
      title,
      content,
      audioUrl,
      duration,
      voice_id,
      voice_name,
      language,
      category,
      is_featured
    } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!title || !content || !audioUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // إنشاء النشرة في قاعدة البيانات
    const newsletter = await prisma.audio_newsletters.create({
      data: {
        id: uuidv4(),
        title,
        content,
        audioUrl,
        duration,
        voice_id,
        voice_name,
        language: language || 'ar',
        category,
        is_published: true,
        is_featured: is_featured || false,
        play_count: 0
      }
    });

    // إذا كانت النشرة مميزة، قم بإلغاء تمييز النشرات الأخرى
    if (is_featured) {
      await prisma.audio_newsletters.updateMany({
        where: {
          id: { not: newsletter.id },
          is_featured: true
        },
        data: {
          is_featured: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      newsletter
    });
  } catch (error) {
    console.error('Error publishing newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to publish newsletter' },
      { status: 500 }
    );
  }
} 
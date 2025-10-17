/**
 * 🎙️ API: Episodes (الحلقات/البودكاست)
 * 
 * GET /api/episodes - جلب قائمة الحلقات
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // TODO: استبدل هذا بجدول episodes الفعلي عند إضافته
    // const episodes = await prisma.episode.findMany({
    //   take: limit,
    //   skip: skip,
    //   orderBy: { createdAt: 'desc' }
    // });

    // مؤقتاً: إرجاع قائمة فارغة
    const episodes: any[] = [];

    return NextResponse.json({
      success: true,
      data: {
        episodes,
        pagination: {
          page,
          limit,
          total: 0,
          hasMore: false
        }
      }
    });

  } catch (error) {
    console.error('Error fetching episodes:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'خطأ في الخادم',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


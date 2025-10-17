/**
 * 🎯 API: Personalized Content (المحتوى المخصص)
 * 
 * GET /api/personalized - جلب محتوى مخصص بناءً على اهتمامات المستخدم
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    // إذا لم يكن هناك userId، إرجاع محتوى عام
    if (!userId) {
      return NextResponse.json({
        success: true,
        data: {
          articles: [],
          recommendations: [],
          message: 'يرجى تسجيل الدخول للحصول على محتوى مخصص'
        }
      });
    }

    // TODO: جلب اهتمامات المستخدم
    // const userPreferences = await prisma.userPreference.findUnique({
    //   where: { userId }
    // });

    // TODO: جلب المقالات المخصصة بناءً على الاهتمامات
    // const personalizedArticles = await prisma.articles.findMany({
    //   where: {
    //     categoryId: { in: userPreferences?.categories || [] }
    //   },
    //   take: limit,
    //   orderBy: { created_at: 'desc' }
    // });

    // مؤقتاً: إرجاع قائمة فارغة
    return NextResponse.json({
      success: true,
      data: {
        articles: [],
        recommendations: [],
        message: 'لا توجد توصيات متاحة حالياً'
      }
    });

  } catch (error) {
    console.error('Error fetching personalized content:', error);
    
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


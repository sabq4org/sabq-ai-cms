import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      });
    }

    // بيانات وهمية آمنة لمنع الأخطاء
    const mockInsights = {
      todayRecommendation: null,
      weeklyActivity: {
        articlesRead: 0,
        articlesSaved: 0,
        interactions: 0,
        streak: 0
      },
      knowledgeDiversity: {
        readCategories: 0,
        totalCategories: 10,
        topCategory: 'غير محدد',
        topCategoryPercentage: 0,
        suggestedCategories: []
      },
      behaviorAnalysis: {
        preferredReadingTime: 'غير محدد',
        contentPreference: 'غير محدد',
        readingPattern: 'غير محدد'
      },
      similarReaders: {
        recommendations: []
      }
    };

    // يمكن إضافة منطق حقيقي لاحقاً لجلب البيانات من قاعدة البيانات
    
    return NextResponse.json({
      success: true,
      ...mockInsights
    });
  } catch (error) {
    console.error('Error fetching user insights:', error);
    
    // إرجاع بيانات آمنة حتى في حالة الخطأ
    return NextResponse.json({
      success: false,
      todayRecommendation: null,
      weeklyActivity: {
        articlesRead: 0,
        articlesSaved: 0,
        interactions: 0,
        streak: 0
      },
      knowledgeDiversity: {
        readCategories: 0,
        totalCategories: 10,
        topCategory: 'غير محدد',
        topCategoryPercentage: 0,
        suggestedCategories: []
      },
      behaviorAnalysis: {
        preferredReadingTime: 'غير محدد',
        contentPreference: 'غير محدد',
        readingPattern: 'غير محدد'
      },
      similarReaders: {
        recommendations: []
      }
    });
  }
} 
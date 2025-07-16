import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';









export async function GET(request: NextRequest) {
  try {
    // التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // جلب اهتمامات المستخدم المحفوظة
    const savedPreference = await prisma.user_preferences.findFirst({
      where: {
        user_id: userId,
        key: 'selected_categories'
      }
    });

    let categoryIds: string[] = [];

    if (savedPreference && savedPreference.value) {
      // تحويل JsonValue إلى string[]
      const value = savedPreference.value;
      if (Array.isArray(value)) {
        categoryIds = value.filter(id => typeof id === 'string') as string[];
      }
    }

    // إذا لم نجد تفضيلات محفوظة، نحاول من UserPreference
    if (categoryIds.length === 0) {
      const userPreferences = await prisma.user_preferences.findMany({
        where: { 
          user_id: userId,
          key: { startsWith: 'category_' }
        },
        select: { value: true }
      });

      if (userPreferences.length > 0) {
        const categorySlugs = userPreferences.map((pref: any) => {
          const value = pref.value as any;
          return value?.categorySlug || '';
        }).filter((slug: string) => Boolean(slug));

        const categories = await prisma.categories.findMany({
          where: {
            slug: { in: categorySlugs }
          },
          select: { id: true }
        });

        categoryIds = categories.map((c: { id: string }) => c.id);
      }
    }

    // إذا لم نجد أي اهتمامات، نعيد استجابة واضحة
    if (categoryIds.length === 0) {
      return NextResponse.json({
        articles: [],
        source: 'no_interests',
        message: 'لا توجد اهتمامات محفوظة للمستخدم. لا يمكن جلب مقالات مخصصة.'
      });
    }

    // جلب المقالات من التصنيفات المختارة
    const personalizedArticles = await prisma.articles.findMany({
      where: {
        status: 'published',
        category_id: { in: categoryIds }
      },
      include: {
        category: { select: { id: true, name: true, slug: true } }
      },
      orderBy: [
        { featured: 'desc' },
        { published_at: 'desc' }
      ],
      take: limit
    });

    // خلط المقالات بشكل ذكي للتنوع
    const shuffledArticles = personalizedArticles.sort((a: any, b: any) => {
      // الاحتفاظ بالمقالات المميزة في الأعلى
      if (personalizedArticles.some((a: any) => a.featured)) {
        return personalizedArticles[0].featured ? -1 : 1;
      }
      return Math.random() - 0.5;
    });

    // تسجيل النشاط - معطل مؤقتاً
    // await prisma.activity_logs.create({ ... });

    return NextResponse.json({
      articles: shuffledArticles,
      source: 'personalized',
      categoryIds,
      message: 'مقالات مخصصة بناءً على اهتماماتك'
    });

  } catch (error) {
    console.error('Error fetching personalized articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personalized articles' },
      { status: 500 }
    );
  }
} 
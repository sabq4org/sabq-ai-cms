import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');
    
    if (articleId) {
      // تحقق من مقال محدد
      const article = await prisma.articles.findUnique({
        where: { id: articleId },
        select: {
          id: true,
          title: true,
          featured_image: true,
          slug: true,
          published_at: true
        }
      });

      if (!article) {
        return NextResponse.json(
          { error: 'المقال غير موجود' },
          { status: 404 }
        );
      }

      // تشخيص الصورة
      const diagnosis = {
        article: {
          id: article.id,
          title: article.title,
          slug: article.slug
        },
        image: {
          url: article.featured_image,
          exists: !!article.featured_image,
          isCloudinaryUrl: article.featured_image?.includes('res.cloudinary.com') || false,
          isLocalUrl: article.featured_image?.startsWith('/') || false,
          isExternalUrl: article.featured_image?.startsWith('http') || false
        },
        suggestions: []
      };

      // اقتراحات
      if (!article.featured_image) {
        diagnosis.suggestions.push('المقال لا يحتوي على صورة مميزة');
      } else if (!article.featured_image.includes('res.cloudinary.com')) {
        diagnosis.suggestions.push('الصورة ليست من Cloudinary - قد تحتاج لرفعها');
      }

      return NextResponse.json(diagnosis);
    }

    // إحصائيات عامة
    const [
      totalArticles,
      articlesWithImages,
      cloudinaryImages,
      localImages,
      externalImages,
      emptyImages
    ] = await Promise.all([
      prisma.articles.count(),
      prisma.articles.count({
        where: {
          featured_image: {
            not: null,
            not: ''
          }
        }
      }),
      prisma.articles.count({
        where: {
          featured_image: {
            contains: 'res.cloudinary.com'
          }
        }
      }),
      prisma.articles.count({
        where: {
          AND: [
            { featured_image: { not: null } },
            { featured_image: { startsWith: '/' } }
          ]
        }
      }),
      prisma.articles.count({
        where: {
          AND: [
            { featured_image: { not: null } },
            { featured_image: { startsWith: 'http' } },
            { featured_image: { not: { contains: 'cloudinary.com' } } }
          ]
        }
      }),
      prisma.articles.count({
        where: {
          OR: [
            { featured_image: null },
            { featured_image: '' }
          ]
        }
      })
    ]);

    // عينة من المقالات بدون صور
    const articlesWithoutImages = await prisma.articles.findMany({
      where: {
        OR: [
          { featured_image: null },
          { featured_image: '' }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true
      },
      take: 5
    });

    // عينة من المقالات بصور غير Cloudinary
    const articlesWithNonCloudinaryImages = await prisma.articles.findMany({
      where: {
        AND: [
          { featured_image: { not: null } },
          { featured_image: { not: { contains: 'cloudinary.com' } } }
        ]
      },
      select: {
        id: true,
        title: true,
        featured_image: true
      },
      take: 5
    });

    return NextResponse.json({
      statistics: {
        totalArticles,
        articlesWithImages,
        imageDistribution: {
          cloudinary: cloudinaryImages,
          local: localImages,
          external: externalImages,
          empty: emptyImages
        },
        percentages: {
          withImages: Math.round((articlesWithImages / totalArticles) * 100),
          cloudinary: Math.round((cloudinaryImages / totalArticles) * 100),
          needsAttention: Math.round(((emptyImages + localImages + externalImages) / totalArticles) * 100)
        }
      },
      samples: {
        articlesWithoutImages,
        articlesWithNonCloudinaryImages
      },
      recommendations: [
        emptyImages > 0 && `${emptyImages} مقال بدون صورة مميزة`,
        localImages > 0 && `${localImages} مقال يستخدم صور محلية - يُنصح برفعها لـ Cloudinary`,
        externalImages > 0 && `${externalImages} مقال يستخدم صور خارجية - قد تكون غير مستقرة`
      ].filter(Boolean)
    });

  } catch (error) {
    console.error('خطأ في تشخيص الصور:', error);
    
    return NextResponse.json({
      error: 'فشل في تشخيص الصور',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, { status: 500 });
  }
}

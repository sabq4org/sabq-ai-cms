import { NextRequest, NextResponse } from 'next/server';
import prisma, { ensureConnection  } from '@/lib/prisma';
import { corsResponse } from '@/lib/cors';

// معالجة طلبات OPTIONS للـ CORS
export async function OPTIONS() {
  return corsResponse(null, 200);
}

// GET: جلب جميع كتاب الرأي
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 جلب كتاب الرأي...');
    
    // التأكد من الاتصال بقاعدة البيانات
    const isConnected = await ensureConnection();
    if (!isConnected) {
      return corsResponse({
        success: false,
        error: 'فشل الاتصال بقاعدة البيانات'
      }, 500);
    }

    const { searchParams } = new URL(request.url!);
    const isActive = searchParams.get('is_active');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');

    // بناء شروط البحث
    const where: any = {};
    
    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true';
    }
    
    if (category) {
      where.category = category;
    }

    // جلب الكتاب مع إحصائيات مقالاتهم
    const authors = await prisma.opinionAuthor.findMany({
      where,
      include: {
        articles: {
          where: {
            status: 'published',
            isActive: true
          },
          select: {
            id: true,
            title: true,
            views: true,
            likes: true,
            shares: true,
            publishedAt: true
          },
          orderBy: {
            publishedAt: 'desc'
          },
          take: 5 // آخر 5 مقالات لكل كاتب
        }
      },
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' }
      ],
      ...(limit && { take: parseInt(limit) })
    });

    // إضافة إحصائيات لكل كاتب
    const authorsWithStats = authors.map((author: any) => {
      const totalViews = author.articles.reduce((sum: number, article: any) => sum + (article.views || 0), 0);
      const totalLikes = author.articles.reduce((sum: number, article: any) => sum + (article.likes || 0), 0);
      const totalShares = author.articles.reduce((sum: number, article: any) => sum + (article.shares || 0), 0);
      
      return {
        ...author,
        stats: {
          totalArticles: author.articles.length,
          totalViews,
          totalLikes,
          totalShares,
          lastArticleDate: author.articles[0]?.publishedAt || null
        }
      };
    });

    console.log(`✅ تم جلب ${authorsWithStats.length} كاتب رأي`);

    return corsResponse({
      success: true,
      data: authorsWithStats,
      total: authorsWithStats.length
    });

  } catch (error) {
    console.error('❌ خطأ في جلب كتاب الرأي:', error);
    return corsResponse({
      success: false,
      error: 'حدث خطأ في جلب كتاب الرأي',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, 500);
  }
}

// POST: إضافة كاتب رأي جديد
export async function POST(request: NextRequest) {
  try {
    console.log('➕ إضافة كاتب رأي جديد...');
    
    const isConnected = await ensureConnection();
    if (!isConnected) {
      return corsResponse({
        success: false,
        error: 'فشل الاتصال بقاعدة البيانات'
      }, 500);
    }

    const body = await request.json();
    const {
      name,
      email,
      title,
      avatarUrl,
      bio,
      category,
      twitterUrl,
      linkedinUrl,
      websiteUrl,
      displayOrder,
      metadata
    } = body;

    // التحقق من البيانات المطلوبة
    if (!name || name.trim() === '') {
      return corsResponse({
        success: false,
        error: 'اسم الكاتب مطلوب'
      }, 400);
    }

    // التحقق من عدم تكرار البريد الإلكتروني
    if (email) {
      const existingAuthor = await prisma.opinionAuthor.findUnique({
        where: { email }
      });
      
      if (existingAuthor) {
        return corsResponse({
          success: false,
          error: 'البريد الإلكتروني مستخدم بالفعل'
        }, 400);
      }
    }

    // إنشاء الكاتب الجديد
    const newAuthor = await prisma.opinionAuthor.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        title: title?.trim() || null,
        avatarUrl: avatarUrl?.trim() || null,
        bio: bio?.trim() || null,
        category: category?.trim() || null,
        twitterUrl: twitterUrl?.trim() || null,
        linkedinUrl: linkedinUrl?.trim() || null,
        websiteUrl: websiteUrl?.trim() || null,
        displayOrder: displayOrder || null,
        metadata: metadata || null
      },
      include: {
        articles: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    console.log(`✅ تم إنشاء كاتب رأي جديد: ${newAuthor.name}`);

    return corsResponse({
      success: true,
      data: newAuthor,
      message: 'تم إضافة الكاتب بنجاح'
    }, 201);

  } catch (error) {
    console.error('❌ خطأ في إضافة كاتب الرأي:', error);
    return corsResponse({
      success: false,
      error: 'حدث خطأ في إضافة الكاتب',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, 500);
  }
}

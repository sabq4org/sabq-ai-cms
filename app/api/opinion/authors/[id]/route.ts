import { NextRequest, NextResponse } from 'next/server';
import prisma, { ensureConnection } from '@/lib/prisma';
import { corsResponse } from '@/lib/cors';

interface RouteParams {
  id: string;
}

// معالجة طلبات OPTIONS للـ CORS
export async function OPTIONS() {
  return corsResponse(null, 200);
}

// GET: جلب كاتب رأي محدد
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { id } = await params;
    console.log(`🔍 جلب بيانات الكاتب: ${id}`);
    
    const isConnected = await ensureConnection();
    if (!isConnected) {
      return corsResponse({
        success: false,
        error: 'فشل الاتصال بقاعدة البيانات'
      }, 500);
    }

    const author = await prisma.opinionAuthor.findUnique({
      where: { id },
      include: {
        articles: {
          where: {
            isActive: true
          },
          select: {
            id: true,
            title: true,
            excerpt: true,
            views: true,
            likes: true,
            shares: true,
            saves: true,
            status: true,
            publishedAt: true,
            createdAt: true
          },
          orderBy: {
            publishedAt: 'desc'
          }
        }
      }
    });

    if (!author) {
      return corsResponse({
        success: false,
        error: 'الكاتب غير موجود'
      }, 404);
    }

    // إضافة إحصائيات
    const totalViews = author.articles.reduce((sum: number, article: any) => sum + (article.views || 0), 0);
    const totalLikes = author.articles.reduce((sum: number, article: any) => sum + (article.likes || 0), 0);
    const totalShares = author.articles.reduce((sum: number, article: any) => sum + (article.shares || 0), 0);
    const publishedArticles = author.articles.filter(a => a.status === 'published');

    const authorWithStats = {
      ...author,
      stats: {
        totalArticles: author.articles.length,
        publishedArticles: publishedArticles.length,
        draftArticles: author.articles.filter(a => a.status === 'draft').length,
        totalViews,
        totalLikes,
        totalShares,
        lastArticleDate: publishedArticles[0]?.publishedAt || null
      }
    };

    console.log(`✅ تم جلب بيانات الكاتب: ${author.name}`);

    return corsResponse({
      success: true,
      data: authorWithStats
    });

  } catch (error) {
    console.error('❌ خطأ في جلب بيانات الكاتب:', error);
    return corsResponse({
      success: false,
      error: 'حدث خطأ في جلب بيانات الكاتب',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, 500);
  }
}

// PUT: تحديث بيانات كاتب رأي
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { id } = await params;
    console.log(`📝 تحديث بيانات الكاتب: ${id}`);
    
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
      isActive,
      displayOrder,
      metadata
    } = body;

    // التحقق من وجود الكاتب
    const existingAuthor = await prisma.opinionAuthor.findUnique({
      where: { id }
    });

    if (!existingAuthor) {
      return corsResponse({
        success: false,
        error: 'الكاتب غير موجود'
      }, 404);
    }

    // التحقق من البريد الإلكتروني إذا تم تغييره
    if (email && email !== existingAuthor.email) {
      const emailExists = await prisma.opinionAuthor.findUnique({
        where: { email }
      });
      
      if (emailExists) {
        return corsResponse({
          success: false,
          error: 'البريد الإلكتروني مستخدم بالفعل'
        }, 400);
      }
    }

    // تحديث البيانات
    const updatedAuthor = await prisma.opinionAuthor.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(title !== undefined && { title: title?.trim() || null }),
        ...(avatarUrl !== undefined && { avatarUrl: avatarUrl?.trim() || null }),
        ...(bio !== undefined && { bio: bio?.trim() || null }),
        ...(category !== undefined && { category: category?.trim() || null }),
        ...(twitterUrl !== undefined && { twitterUrl: twitterUrl?.trim() || null }),
        ...(linkedinUrl !== undefined && { linkedinUrl: linkedinUrl?.trim() || null }),
        ...(websiteUrl !== undefined && { websiteUrl: websiteUrl?.trim() || null }),
        ...(isActive !== undefined && { isActive }),
        ...(displayOrder !== undefined && { displayOrder }),
        ...(metadata !== undefined && { metadata })
      },
      include: {
        articles: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    });

    console.log(`✅ تم تحديث بيانات الكاتب: ${updatedAuthor.name}`);

    return corsResponse({
      success: true,
      data: updatedAuthor,
      message: 'تم تحديث بيانات الكاتب بنجاح'
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث بيانات الكاتب:', error);
    return corsResponse({
      success: false,
      error: 'حدث خطأ في تحديث بيانات الكاتب',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, 500);
  }
}

// DELETE: حذف كاتب رأي
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { id } = await params;
    console.log(`🗑️ حذف الكاتب: ${id}`);
    
    const isConnected = await ensureConnection();
    if (!isConnected) {
      return corsResponse({
        success: false,
        error: 'فشل الاتصال بقاعدة البيانات'
      }, 500);
    }

    // التحقق من وجود الكاتب
    const existingAuthor = await prisma.opinionAuthor.findUnique({
      where: { id },
      include: {
        articles: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!existingAuthor) {
      return corsResponse({
        success: false,
        error: 'الكاتب غير موجود'
      }, 404);
    }

    // التحقق من وجود مقالات مرتبطة
    if (existingAuthor.articles.length > 0) {
      return corsResponse({
        success: false,
        error: `لا يمكن حذف الكاتب لأنه لديه ${existingAuthor.articles.length} مقال مرتبط`,
        articlesCount: existingAuthor.articles.length
      }, 400);
    }

    // حذف الكاتب
    await prisma.opinionAuthor.delete({
      where: { id }
    });

    console.log(`✅ تم حذف الكاتب: ${existingAuthor.name}`);

    return corsResponse({
      success: true,
      message: 'تم حذف الكاتب بنجاح',
      deletedAuthor: {
        id: existingAuthor.id,
        name: existingAuthor.name
      }
    });

  } catch (error) {
    console.error('❌ خطأ في حذف الكاتب:', error);
    return corsResponse({
      success: false,
      error: 'حدث خطأ في حذف الكاتب',
      message: error instanceof Error ? error.message : 'خطأ غير معروف'
    }, 500);
  }
}

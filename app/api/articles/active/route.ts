import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 جلب المقالات النشطة...');
    
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    
    // بناء شروط البحث
    const where: any = {
      status: 'published',
      isDeleted: false,
      isActive: true
    };
    
    if (category) {
      where.category = {
        slug: category
      };
    }
    
    if (type) {
      where.article_type = type;
    }
    
    // جلب المقالات النشطة
    const articles = await prisma.articles.findMany({
      where,
      select: {
        id: true,
        title: true,
        excerpt: true,
        featured_image: true,
        slug: true,
        views: true,
        likes: true,
        shares: true,
        publishedAt: true,
        created_at: true,
        article_type: true,
        author: {
          select: {
            id: true,
            full_name: true,
            slug: true,
            avatar_url: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        }
      },
      orderBy: [
        { publishedAt: 'desc' },
        { created_at: 'desc' }
      ],
      take: limit ? parseInt(limit) : 20
    });
    
    console.log(`✅ تم جلب ${articles.length} مقال نشط`);
    
    return NextResponse.json({
      success: true,
      articles: articles,
      total: articles.length,
      message: `تم جلب ${articles.length} مقال نشط`
    });
    
  } catch (error) {
    console.error('❌ خطأ في جلب المقالات النشطة:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في جلب المقالات النشطة',
      articles: [],
      total: 0,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, action } = body;
    
    if (!articleId) {
      return NextResponse.json({
        success: false,
        error: 'معرف المقال مطلوب'
      }, { status: 400 });
    }
    
    let updateData: any = {};
    
    switch (action) {
      case 'activate':
        updateData = { isActive: true };
        break;
      case 'deactivate':
        updateData = { isActive: false };
        break;
      case 'publish':
        updateData = { status: 'published', publishedAt: new Date() };
        break;
      case 'unpublish':
        updateData = { status: 'draft' };
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'إجراء غير صحيح'
        }, { status: 400 });
    }
    
    const article = await prisma.articles.update({
      where: { id: articleId },
      data: updateData,
      select: {
        id: true,
        title: true,
        status: true,
        isActive: true,
        publishedAt: true
      }
    });
    
    return NextResponse.json({
      success: true,
      article,
      message: `تم ${action === 'activate' ? 'تفعيل' : action === 'deactivate' ? 'إلغاء تفعيل' : action === 'publish' ? 'نشر' : 'إلغاء نشر'} المقال بنجاح`
    });
    
  } catch (error) {
    console.error('❌ خطأ في تحديث حالة المقال:', error);
    
    return NextResponse.json({
      success: false,
      error: 'فشل في تحديث حالة المقال',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
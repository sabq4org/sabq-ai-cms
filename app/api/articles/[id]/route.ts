import { NextRequest, NextResponse } from 'next/server';
// اجبر هذا المسار على استخدام بيئة Node.js حتى يعمل Prisma
export const runtime = 'nodejs';
import { promises as fs } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'articles.json');

interface Article {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category_id: number;
  status: string;
  is_deleted?: boolean;
  updated_at: string;
  author_name?: string;
  author_avatar?: string;
  [key: string]: any;
}

// قراءة المقالات من الملف
async function loadArticles(): Promise<Article[]> {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const data = JSON.parse(fileContent);
    
    if (data.articles && Array.isArray(data.articles)) {
      return data.articles;
    }
    
    if (Array.isArray(data)) {
      return data;
    }
    
    return [];
  } catch (error) {
    return [];
  }
}

// حفظ المقالات في الملف
async function saveArticles(articles: Article[]): Promise<void> {
  try {
    const dataToSave = { articles };
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
  } catch (error) {
    console.error('خطأ في حفظ المقالات:', error);
    throw new Error('فشل في حفظ المقالات');
  }
}

// دالة لقراءة أعضاء الفريق
async function loadTeamMembers(): Promise<any[]> {
  try {
    const teamFilePath = path.join(process.cwd(), 'data', 'team_members.json');
    const fileContent = await fs.readFile(teamFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.teamMembers || [];
  } catch (error) {
    console.error('Error loading team members:', error);
    return [];
  }
}

// دالة لقراءة التصنيفات
async function loadCategories(): Promise<any[]> {
  try {
    const categoriesFilePath = path.join(process.cwd(), 'data', 'categories.json');
    const fileContent = await fs.readFile(categoriesFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.categories || [];
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
}

// تحديث مقال
async function updateArticle(id: string, updates: Partial<Article>): Promise<Article | null> {
  const articles = await loadArticles();
  const index = articles.findIndex(a => a.id === id);
  
  if (index === -1) {
    return null;
  }
  
  articles[index] = {
    ...articles[index],
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  await saveArticles(articles);

  // إثراء المقال ببيانات المراسل إن لم تكن موجودة
  if (articles[index].author_id && !articles[index].author_name) {
    const teamMembers = await loadTeamMembers();
    const author = teamMembers.find(member => member.userId === articles[index].author_id || member.id === articles[index].author_id);
    if (author) {
      articles[index].author_name = author.name;
      if (author.avatar) {
        articles[index].author_avatar = author.avatar;
      }
    }
  }

  return articles[index];
}

// Cache بسيط في الذاكرة للمقالات المتكررة
const articleCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 1000; // 30 ثانية

// GET - جلب مقال واحد
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Fetching article with ID:', id);
    
    // التحقق من Cache أولاً
    const cached = articleCache.get(id);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('Returning cached article');
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          'Content-Type': 'application/json',
          'X-Cache': 'HIT'
        }
      });
    }
    
    // جلب المقال من قاعدة البيانات - استعلام مبسط
    let dbArticle = await prisma.article.findFirst({
      where: { 
        OR: [
          { id },
          { slug: id }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        authorId: true,
        categoryId: true,
        status: true,
        views: true,
        featured: true,
        breaking: true,
        featuredImage: true,
        readingTime: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        metadata: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });

    if (!dbArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // زيادة عداد المشاهدات فقط (بدون انتظار النتيجة)
    prisma.article.update({
      where: { id: dbArticle.id },
      data: { views: { increment: 1 } }
    }).catch(err => console.error('Failed to increment views:', err));

    // حساب إحصائيات بسيطة (بدون groupBy المعقد)
    const interactionCounts = await prisma.interaction.findMany({
      where: { articleId: dbArticle.id },
      select: { type: true }
    }).then(interactions => {
      const counts = { likes: 0, shares: 0, saves: 0 };
      interactions.forEach(i => {
        if (i.type === 'like') counts.likes++;
        else if (i.type === 'share') counts.shares++;
        else if (i.type === 'save') counts.saves++;
      });
      return counts;
    }).catch(() => ({ likes: 0, shares: 0, saves: 0 }));

    // حساب عدد التعليقات
    const commentsCount = await prisma.comment.count({
      where: { articleId: dbArticle.id }
    }).catch(() => 0);

    // تنسيق البيانات للاستجابة
    const formatted = {
      id: dbArticle.id,
      title: dbArticle.title,
      slug: dbArticle.slug,
      content: dbArticle.content,
      summary: dbArticle.excerpt,
      author_id: dbArticle.authorId,
      author: dbArticle.author,
      category_id: dbArticle.categoryId,
      category_name: dbArticle.category?.name,
      category: dbArticle.category,
      category_display_name: dbArticle.category?.name,
      category_color: dbArticle.category?.color || '#3B82F6',
      status: dbArticle.status,
      featured_image: dbArticle.featuredImage,
      is_breaking: dbArticle.breaking,
      is_featured: dbArticle.featured,
      views_count: dbArticle.views + 1, // إضافة 1 للمشاهدة الحالية
      reading_time: dbArticle.readingTime || Math.ceil((dbArticle.content || '').split(/\s+/).length / 200),
      created_at: dbArticle.createdAt.toISOString(),
      updated_at: dbArticle.updatedAt.toISOString(),
      published_at: dbArticle.publishedAt?.toISOString(),
      tags: dbArticle.metadata && typeof dbArticle.metadata === 'object' && 'tags' in dbArticle.metadata ? (dbArticle.metadata as any).tags : [],
      interactions_count: interactionCounts.likes + interactionCounts.shares + interactionCounts.saves,
      comments_count: commentsCount,
      stats: {
        views: dbArticle.views + 1,
        likes: interactionCounts.likes,
        shares: interactionCounts.shares,
        comments: commentsCount,
        saves: interactionCounts.saves
      },
      author_name: dbArticle.author?.name,
      author_avatar: dbArticle.author?.avatar
    };

    // حفظ في Cache
    articleCache.set(id, {
      data: formatted,
      timestamp: Date.now()
    });

    // تنظيف Cache القديم (كل 100 طلب)
    if (Math.random() < 0.01) {
      const now = Date.now();
      for (const [key, value] of articleCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION * 2) {
          articleCache.delete(key);
        }
      }
    }

    return NextResponse.json(formatted, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'Content-Type': 'application/json',
        'X-Cache': 'MISS'
      }
    });

  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PATCH - تحديث مقال
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    
    // حذف من Cache عند التحديث
    articleCache.delete(id);
    
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: updates,
      include: {
        author: true,
        category: true
      }
    });
    
    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// PUT method لتحديث المقال كاملاً (للتحرير)
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // حذف من Cache عند التحديث
    articleCache.delete(id);
    
    const updated = await prisma.article.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date()
      },
      include: {
        author: true,
        category: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: updated, 
      message: 'تم تحديث المقال بنجاح' 
    });
  } catch (e) {
    console.error('خطأ في تحديث المقال:', e);
    return NextResponse.json({ 
      success: false, 
      error: 'فشل في تحديث المقال' 
    }, { status: 500 });
  }
}
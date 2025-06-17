import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// ===============================
// أنواع البيانات
// ===============================
interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  author_id: string;
  editor_id?: string;
  category_id?: number;
  section_id?: number;
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived' | 'deleted';
  featured_image?: string;
  featured_image_caption?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  is_breaking: boolean;
  is_featured: boolean;
  is_pinned: boolean;
  publish_at?: string;
  published_at?: string;
  views_count: number;
  reading_time?: number;
  content_blocks?: any[];
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

// ===============================
// دوال مساعدة لإدارة البيانات
// ===============================
const DATA_FILE = path.join(process.cwd(), 'data', 'articles.json');

async function loadArticles(): Promise<Article[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // إذا لم يكن الملف موجوداً، أنشئ مصفوفة فارغة
    return [];
  }
}

async function saveArticles(articles: Article[]): Promise<void> {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(articles, null, 2));
}

// GET - جلب مقال واحد
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const articles = await loadArticles();
    const article = articles.find(a => a.id === params.id && !a.is_deleted);
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(article);
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
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    const articles = await loadArticles();
    
    const articleIndex = articles.findIndex(a => a.id === params.id);
    if (articleIndex === -1) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    // تحديث المقال
    articles[articleIndex] = {
      ...articles[articleIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    await saveArticles(articles);
    
    return NextResponse.json(articles[articleIndex]);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// PUT method لتحديث المقال كاملاً (للتحرير)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const articles = await loadArticles();
    const index = articles.findIndex(a => a.id === id);
    
    if (index === -1) {
      return NextResponse.json({ 
        success: false, 
        error: 'المقال غير موجود' 
      }, { status: 404 });
    }

    // تحديث المقال مع الاحتفاظ بالحقول الأساسية
    const updated = {
      ...articles[index],
      ...body,
      id, // المحافظة على المعرف
      updated_at: new Date().toISOString(),
      author_id: articles[index].author_id // المحافظة على معرف الكاتب الأصلي
    };
    
    articles[index] = updated;
    
    // حفظ التغييرات
    await saveArticles(articles);

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
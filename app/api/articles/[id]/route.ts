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
const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'articles.json');

async function loadArticles(): Promise<Article[]> {
  try {
    const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch {
    return [];
  }
}

async function saveArticles(articles: Article[]): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data');
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(articles, null, 2), 'utf-8');
}

// GET method لاسترجاع مقال محدد
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const articles = await loadArticles();
    const article = articles.find(a => a.id === id);
    
    if (!article) {
      return NextResponse.json({ 
        success: false, 
        error: 'المقال غير موجود' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: article,
      message: 'تم جلب المقال بنجاح' 
    });
  } catch (e) {
    console.error('خطأ في جلب المقال:', e);
    return NextResponse.json({ 
      success: false, 
      error: 'فشل في جلب المقال' 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const articles = await loadArticles();
    const index = articles.findIndex(a => a.id === id);
    
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'مقال غير موجود' }, { status: 404 });
    }

    // تحديث الحقول المسموح بها فقط
    const allowed = ['status', 'is_deleted'];
    const updated = { ...articles[index] } as any;
    allowed.forEach(k => {
      if (k in body) updated[k] = body[k];
    });
    updated.updated_at = new Date().toISOString();
    articles[index] = updated;
    
    // حفظ التغييرات
    await saveArticles(articles);

    return NextResponse.json({ success: true, data: updated, message: 'تم التحديث بنجاح' });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'فشل التحديث' }, { status: 500 });
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
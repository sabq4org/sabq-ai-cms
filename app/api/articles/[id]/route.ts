import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

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
  return articles[index];
}

// GET - جلب مقال واحد
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Fetching article with ID:', id);
    
    const articles = await loadArticles();
    console.log('Loaded articles type:', typeof articles);
    console.log('Is array?', Array.isArray(articles));
    console.log('Articles count:', articles?.length || 0);
    
    const article = articles.find(a => a.id === id && !a.is_deleted);
    
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const updatedArticle = await updateArticle(id, updates);
    
    if (!updatedArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
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
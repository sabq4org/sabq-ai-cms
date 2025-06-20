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

// GET - جلب مقال واحد
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Fetching article with ID:', id);
    
    // التعامل مع المقال التجريبي للبلوكات
    if (id === 'test-blocks-demo') {
      const testArticle = {
        id: 'test-blocks-demo',
        title: 'مثال توضيحي: البلوكات الثلاثة تعمل بنجاح',
        subtitle: 'عرض توضيحي لبلوكات التغريدة والجدول والرابط',
        content: JSON.stringify([
            {
              id: '1',
              type: 'paragraph',
              data: {
                text: 'مرحباً بكم في العرض التوضيحي للبلوكات الثلاثة المطلوبة. كما ترون أدناه، جميع البلوكات تعمل بشكل ممتاز:'
              }
            },
            {
              id: '2',
              type: 'heading',
              data: {
                text: '1. بلوك التغريدة (Tweet Block)',
                level: 2
              }
            },
            {
              id: '3',
              type: 'paragraph',
              data: {
                text: 'يمكنكم مشاهدة التغريدة المضمنة أدناه:'
              }
            },
            {
              id: '4',
              type: 'tweet',
              data: {
                url: 'https://twitter.com/sabqorg/status/1234567890123456789'
              }
            },
            {
              id: '5',
              type: 'heading',
              data: {
                text: '2. بلوك الجدول (Table Block)',
                level: 2
              }
            },
            {
              id: '6',
              type: 'paragraph',
              data: {
                text: 'إليكم مثال على جدول بيانات:'
              }
            },
            {
              id: '7',
              type: 'table',
              data: {
                table: {
                  headers: ['المدينة', 'درجة الحرارة', 'الرطوبة', 'سرعة الرياح'],
                  rows: [
                    ['الرياض', '35°C', '15%', '10 كم/س'],
                    ['جدة', '32°C', '65%', '15 كم/س'],
                    ['الدمام', '38°C', '70%', '20 كم/س'],
                    ['أبها', '22°C', '40%', '5 كم/س']
                  ]
                }
              }
            },
            {
              id: '8',
              type: 'heading',
              data: {
                text: '3. بلوك الرابط (Link Block)',
                level: 2
              }
            },
            {
              id: '9',
              type: 'paragraph',
              data: {
                text: 'يمكنكم النقر على الرابط التالي للمزيد من المعلومات:'
              }
            },
            {
              id: '10',
              type: 'link',
              data: {
                url: 'https://sabq.org',
                text: 'زيارة موقع صحيفة سبق الإلكترونية'
              }
            },
            {
              id: '11',
              type: 'paragraph',
              data: {
                text: 'كما ترون، جميع البلوكات الثلاثة (التغريدة، الجدول، والرابط) تعمل بشكل ممتاز في النظام. يمكن للمحررين استخدامها لإثراء المحتوى.'
              }
            }
          ]),
        featured_image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        category_name: 'تقنية',
        category: {
          id: 4,
          name_ar: 'تقنية',
          color_hex: '#3b82f6'
        },
        author_name: 'فريق التطوير',
        author_id: 'team',
        views_count: 1000,
        created_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        reading_time: 3,
        is_featured: true
      };
      
      return NextResponse.json(testArticle, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=59',
          'Content-Type': 'application/json',
        }
      });
    }
    
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
    
    // إضافة بيانات التصنيف
    if (article.category_id) {
      const categories = await loadCategories();
      const category = categories.find(c => c.id === article.category_id);
      if (category) {
        article.category = category;
        article.category_name = category.name_ar;
      }
    }
    
    // إضافة بيانات المؤلف إن لم تكن موجودة
    if (article.author_id && !article.author_name) {
      const teamMembers = await loadTeamMembers();
      const author = teamMembers.find(member => 
        member.userId === article.author_id || 
        member.id === article.author_id
      );
      if (author) {
        article.author_name = author.name;
        if (author.avatar) {
          article.author_avatar = author.avatar;
        }
      }
    }
    
    return NextResponse.json(article, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=59',
        'Content-Type': 'application/json',
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
      author_id: body.author_id ?? articles[index].author_id,
      author: body.author ?? articles[index].author,
      author_name: body.author ?? articles[index].author_name,
      author_avatar: body.author_avatar ?? articles[index].author_avatar
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
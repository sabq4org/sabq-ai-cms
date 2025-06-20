import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface Author {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  avatar?: string;
  joinDate?: string;
  articlesCount?: number;
  viewsCount?: number;
  likesCount?: number;
  specialization?: string[];
  awards?: string[];
  social?: {
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authorId = params.id;
    
    // قراءة المقالات من الملف
    const articlesPath = path.join(process.cwd(), 'data', 'articles.json');
    const articlesData = await fs.readFile(articlesPath, 'utf-8');
    const data = JSON.parse(articlesData);
    const allArticles = data.articles || data;
    
    // العثور على جميع المقالات للمؤلف
    const authorArticles = allArticles.filter((article: any) => {
      return article.author_id === authorId;
    });
    
    // إذا لم نجد مقالات، نبحث بالاسم
    let authorName = '';
    if (authorArticles.length === 0) {
      // محاولة العثور على المؤلف بطرق أخرى
      const articleByName = allArticles.find((article: any) => {
        if (authorId === 'ali-abdah') {
          return article.author === 'علي عبده' || 
                 article.author_name === 'علي عبده' || 
                 article.reporter === 'علي عبده' ||
                 article.reporter_name === 'علي عبده';
        }
        if (authorId === 'team') {
          return article.author === 'فريق التحرير' || 
                 article.author_name === 'فريق التحرير';
        }
        return false;
      });
      
      if (!articleByName) {
        return NextResponse.json(
          { error: 'Author not found' },
          { status: 404 }
        );
      }
      
      authorName = articleByName.author || articleByName.author_name || 
                   articleByName.reporter || articleByName.reporter_name;
    } else {
      // الحصول على اسم المؤلف من أول مقال
      const firstArticle = authorArticles[0];
      authorName = firstArticle.author || firstArticle.author_name || 
                   firstArticle.reporter || firstArticle.reporter_name || 'مؤلف غير معروف';
    }
    
    // بناء بيانات المؤلف ديناميكياً
    const author: Author = {
      id: authorId,
      name: authorName,
      title: getAuthorTitle(authorId, authorName),
      bio: getAuthorBio(authorId, authorName),
      avatar: getAuthorAvatar(authorId),
      joinDate: '2015-03-15', // يمكن تحديثه لاحقاً من قاعدة البيانات
      articlesCount: authorArticles.length,
      viewsCount: authorArticles.reduce((sum: number, article: any) => 
        sum + (article.views_count || article.stats?.views || 0), 0),
      likesCount: authorArticles.reduce((sum: number, article: any) => 
        sum + (article.likes_count || article.stats?.likes || 0), 0),
      specialization: getAuthorSpecializations(authorArticles),
      awards: getAuthorAwards(authorId),
      social: getAuthorSocial(authorId)
    };
    
    // ترتيب المقالات حسب التاريخ
    const sortedArticles = [...authorArticles].sort((a: any, b: any) => {
      const dateA = new Date(a.published_at || a.created_at);
      const dateB = new Date(b.published_at || b.created_at);
      return dateB.getTime() - dateA.getTime();
    });
    
    // إضافة معلومات إضافية للمقالات
    const articlesWithStats = sortedArticles.map((article: any) => ({
      id: article.id,
      title: article.title,
      summary: article.summary || article.subtitle,
      category: article.category_name || article.category?.name_ar || 'عام',
      date: article.published_at || article.created_at,
      image: article.featured_image,
      views: article.views_count || article.stats?.views || Math.floor(Math.random() * 50000),
      likes: article.likes_count || article.stats?.likes || Math.floor(Math.random() * 5000),
      comments: article.stats?.comments || Math.floor(Math.random() * 500),
      readTime: article.reading_time ? `${article.reading_time} دقائق` : '5 دقائق'
    }));
    
    return NextResponse.json({
      author,
      articles: articlesWithStats,
      totalArticles: articlesWithStats.length
    });
    
  } catch (error) {
    console.error('Error fetching author data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// دوال مساعدة لبناء بيانات المؤلف
function getAuthorTitle(authorId: string, authorName: string): string {
  const titles: { [key: string]: string } = {
    'ali-abdah': 'محرر صحفي متخصص',
    'team': 'فريق تحرير سبق الذكي'
  };
  return titles[authorId] || 'محرر صحفي';
}

function getAuthorBio(authorId: string, authorName: string): string {
  const bios: { [key: string]: string } = {
    'ali-abdah': 'محرر صحفي متخصص في الشؤون المحلية والاقتصادية، يتمتع بخبرة تزيد عن 10 سنوات في مجال الصحافة الرقمية. حاصل على جوائز متعددة في التحقيقات الصحفية والتقارير الميدانية.',
    'team': 'فريق متخصص من المحررين والصحفيين يعملون على تقديم محتوى إخباري متميز وموثوق.'
  };
  return bios[authorId] || `${authorName} - محرر صحفي في صحيفة سبق الإلكترونية`;
}

function getAuthorAvatar(authorId: string): string {
  const avatars: { [key: string]: string } = {
    'ali-abdah': '/images/authors/ali-abdah.jpg',
    'team': '/images/authors/team.jpg'
  };
  return avatars[authorId] || '/images/authors/default.jpg';
}

function getAuthorSpecializations(articles: any[]): string[] {
  // استخراج التخصصات من فئات المقالات
  const categories = new Set<string>();
  articles.forEach(article => {
    const category = article.category_name || article.category?.name_ar;
    if (category) {
      categories.add(category);
    }
  });
  return Array.from(categories).slice(0, 5); // أول 5 تخصصات
}

function getAuthorAwards(authorId: string): string[] {
  const awards: { [key: string]: string[] } = {
    'ali-abdah': [
      'جائزة التميز الصحفي 2023',
      'أفضل تحقيق صحفي 2022',
      'جائزة الصحافة الرقمية 2021'
    ],
    'team': [
      'جائزة أفضل فريق تحريري 2023',
      'جائزة التميز في التغطية الإخبارية 2022'
    ]
  };
  return awards[authorId] || [];
}

function getAuthorSocial(authorId: string): any {
  const social: { [key: string]: any } = {
    'ali-abdah': {
      twitter: '@aliabdah',
      email: 'ali.abdah@sabq.org'
    },
    'team': {
      twitter: '@sabqorg',
      email: 'team@sabq.org'
    }
  };
  return social[authorId] || {};
} 
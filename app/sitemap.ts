import { MetadataRoute } from 'next';

interface Article {
  id: string;
  slug?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
}

async function getArticles(): Promise<Article[]> {
  try {
    // في بيئة الإنتاج، نعيد مصفوفة فارغة أو نستخدم API
    // يمكن تحديث هذا لاحقاً لاستخدام قاعدة البيانات مباشرة
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    
    // في بيئة التطوير فقط
    const fs = await import('fs/promises');
    const path = await import('path');
    const articlesPath = path.join(process.cwd(), 'data', 'articles.json');
    const articlesData = await fs.readFile(articlesPath, 'utf-8');
    const data = JSON.parse(articlesData);
    const articles = data.articles || data;
    
    // فلترة المقالات المنشورة فقط
    return articles.filter((article: any) => 
      !article.status || article.status === 'published'
    );
  } catch (error) {
    console.error('Error fetching articles for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sabq.org';
  const articles = await getArticles();
  
  // الصفحات الثابتة
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/opinion`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/insights/deep`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/forum`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/moment-by-moment`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
  
  // صفحات المقالات
  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/article/${article.slug || article.id}`,
    lastModified: new Date(article.updated_at || article.published_at || article.created_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  
  return [...staticPages, ...articlePages];
} 
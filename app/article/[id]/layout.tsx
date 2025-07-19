import Image from 'next/image';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  content?: string;
  featured_image?: string;
  featured_image_alt?: string;
  category_name?: string;
  author?: string | { name: string };
  author_name?: string;
  reporter?: string;
  reporter_name?: string;
  published_at?: string;
  created_at?: string;
  seo_keywords?: string | string[];
  seo_title?: string;
  seo_description?: string;
  slug?: string;
  excerpt?: string;
  views?: number;
  reading_time?: number;
}

async function getArticle(id: string): Promise<Article | null> {
  try {
    // التحقق من نوع المعرف (slug أو id)
    const isSlug = isNaN(Number(id)) && !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    
    const article = await prisma.articles.findFirst({
      where: isSlug ? { slug: id } : { id: id },
      include: {
        categories: true
      }
    });
    
    if (!article) return null;
    
    // جلب بيانات المؤلف
    let author: { name: string } | undefined = undefined;
    if (article.author_id) {
      const user = await prisma.users.findUnique({
        where: { id: article.author_id },
        select: { name: true }
      });
      if (user?.name) {
        author = { name: user.name };
      }
    }
    
    return {
      id: article.id,
      title: article.title,
      subtitle: article.excerpt || undefined,
      summary: article.excerpt || undefined,
      content: article.content,
      featured_image: article.featured_image || undefined,
      category_name: article.categories?.name,
      author: author || undefined,
      author_name: author?.name || undefined,
      published_at: article.published_at?.toISOString(),
      created_at: article.created_at.toISOString(),
      seo_keywords: article.seo_keywords || undefined,
      seo_title: article.seo_title || undefined,
      seo_description: article.seo_description || undefined,
      slug: article.slug,
      excerpt: article.excerpt || undefined,
      views: article.views,
      reading_time: article.reading_time || undefined
    };
  } catch (error) {
    console.error('Error fetching article from DB:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  
  if (!article) {
    return {
      title: 'المقال غير متوفر | صحيفة سبق الإلكترونية',
      description: 'عذراً، المقال الذي تبحث عنه غير موجود أو تم حذفه',
      robots: {
        index: false,
        follow: false
      }
    };
  }

  // استخراج اسم المؤلف
  let authorName = 'فريق التحرير';
  if (article.author) {
    if (typeof article.author === 'string') {
      authorName = article.author;
    } else if (article.author.name) {
      authorName = article.author.name;
    }
  } else if (article.author_name) {
    authorName = article.author_name;
  } else if (article.reporter || article.reporter_name) {
    authorName = article.reporter || article.reporter_name || 'فريق التحرير';
  }

  // استخراج الكلمات المفتاحية
  let keywords: string[] = [];
  if (article.seo_keywords) {
    if (typeof article.seo_keywords === 'string') {
      keywords = article.seo_keywords.split(',').map(k => k.trim());
    } else if (Array.isArray(article.seo_keywords)) {
      keywords = article.seo_keywords;
    }
  }

  // إضافة كلمات مفتاحية افتراضية
  keywords.push('صحيفة سبق', 'أخبار السعودية', article.category_name || 'أخبار');

  // استخدام seo_title إذا كان موجوداً، وإلا استخدام title
  const pageTitle = article.seo_title || `${article.title} | صحيفة سبق الإلكترونية`;
  
  // استخدام seo_description إذا كان موجوداً، وإلا استخدام الملخص أو المحتوى
  const description = article.seo_description || article.summary || article.excerpt || 
    (article.content ? article.content.substring(0, 160).replace(/<[^>]*>/g, '') + '...' : '') || 
    article.title || 'اقرأ المزيد على صحيفة سبق الإلكترونية';

  // الصورة المميزة
  const imageUrl = article.featured_image || 'https://sabq.org/default-news-image.jpg';

  return {
    title: pageTitle,
    description: description as string,
    keywords: keywords.join(', '),
    authors: [{ name: authorName }],
    alternates: {
      canonical: article.slug ? `https://sabq.org/article/${article.slug}` : `https://sabq.org/article/${article.id}`
    },
    openGraph: {
      title: article.title,
      description: description,
      type: 'article',
      publishedTime: article.published_at || article.created_at,
      authors: [authorName],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title
        }
      ],
      siteName: 'صحيفة سبق الإلكترونية',
      locale: 'ar_SA',
      url: article.slug ? `https://sabq.org/article/${article.slug}` : `https://sabq.org/article/${article.id}`
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: description,
      images: [imageUrl],
      creator: '@sabqorg',
      site: '@sabqorg'
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  };
}

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 
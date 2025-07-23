import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleData, getFullImageUrl, getFullArticleUrl, prepareKeywords } from '@/lib/article-api';
import ArticleClientComponent from './ArticleClientComponent';

// إنشاء Metadata ديناميكي للمقال
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticleData(resolvedParams.id);

  if (!article) {
    return {
      title: 'المقال غير متوفر | صحيفة سبق الالكترونية AI',
      description: 'عذراً، المقال المطلوب غير متاح أو غير موجود.',
    };
  }

  const title = `${article.title} | صحيفة سبق الالكترونية AI`;
  const description = article.excerpt || article.summary || article.ai_summary || 'اقرأ آخر الأخبار والتحليلات على صحيفة سبق الالكترونية AI';
  const imageUrl = getFullImageUrl(article.featured_image);
  const articleUrl = getFullArticleUrl(resolvedParams.id);
  const keywords = prepareKeywords(article.seo_keywords || article.keywords);

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: article.author?.name || 'صحيفة سبق' }],
    category: article.category?.name,
    
    // Open Graph
    openGraph: {
      title,
      description,
      url: articleUrl,
      siteName: 'صحيفة سبق الالكترونية AI',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ]
        : [],
      locale: 'ar_SA',
      type: 'article',
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      section: article.category?.name,
      authors: [article.author?.name || 'صحيفة سبق'],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: '@sabqorg',
      creator: '@sabqorg',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },

    // إضافات أخرى
    robots: {
      index: article.status === 'published',
      follow: true,
    },
    alternates: {
      canonical: articleUrl,
    },
  };
}

// الصفحة الرئيسية - Server Component
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // جلب البيانات في السيرفر
  const resolvedParams = await params;
  
  // معالجة URL-encoded IDs
  let articleId = resolvedParams.id;
  try {
    // فك ترميز URL إذا كان مُرمزاً
    const decodedId = decodeURIComponent(articleId);
    console.log(`[ArticlePage] معالجة المعرف: ${articleId} -> ${decodedId}`);
    
    // استخدام المعرف المُفكك بدون قيود - API يدعم البحث بـ ID أو slug
    articleId = decodedId;
  } catch (error) {
    console.error(`[ArticlePage] خطأ في فك ترميز المعرف:`, error);
  }
  
  const article = await getArticleData(articleId);

  if (!article) {
    console.error(`[ArticlePage] لم يتم العثور على مقال بالمعرف:`, articleId);
    console.error(`[ArticlePage] البيئة:`, process.env.NODE_ENV);
    console.error(`[ArticlePage] APP_URL:`, process.env.NEXT_PUBLIC_APP_URL);
    
    // محاولة استدعاء مباشر للـ API كتجربة أخيرة
    if (typeof process !== 'undefined') {
      try {
        console.log(`[ArticlePage] محاولة استدعاء مباشر للـ API...`);
        const directResponse = await fetch(`https://sabq.io/api/articles/${articleId}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (directResponse.ok) {
          const directData = await directResponse.json();
          if (directData && directData.id) {
            console.log(`[ArticlePage] تم العثور على المقال بالاستدعاء المباشر`);
            return <ArticleClientComponent initialArticle={directData} articleId={articleId} />;
          }
        }
        console.log(`[ArticlePage] فشل الاستدعاء المباشر:`, directResponse.status);
      } catch (directError) {
        console.error(`[ArticlePage] خطأ في الاستدعاء المباشر:`, directError);
      }
    }
    
    return (
      <div style={{
        padding: '3rem', 
        textAlign: 'center', 
        background: '#f8f9fa', 
        borderRadius: '12px', 
        margin: '4rem auto', 
        maxWidth: 600,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{color: '#1f2937', marginBottom: '1rem'}}>المقال غير متوفر</h1>
        <p style={{color: '#6b7280', fontSize: '1.1rem', lineHeight: 1.8}}>
          عذراً، لم نتمكن من العثور على المقال المطلوب.
        </p>
        <a 
          href="/" 
          style={{
            display: 'inline-block',
            marginTop: '2rem',
            padding: '0.75rem 2rem',
            background: '#2563eb',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 500
          }}
        >
          العودة للرئيسية
        </a>
      </div>
    );
  }

  // تمرير البيانات للـ Client Component
  return <ArticleClientComponent initialArticle={article} articleId={articleId} />;
}

// تحسين الأداء - إنشاء صفحات ثابتة للمقالات الشائعة
export async function generateStaticParams() {
  // يمكن تحسين هذا بجلب المقالات الأكثر شعبية
  return [];
}

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import { getSiteUrl } from "@/lib/url-builder";
import { 
  getOptimizedArticle, 
  getOptimizedArticleExtras,
  getArticleStats,
  incrementArticleViews,
  type OptimizedArticle 
} from "./OptimizedArticleLoader";
import OptimizedArticleView from "./components/OptimizedArticleView";
import ArticleSkeleton from "./components/ArticleSkeleton";

// تحسين الـ cache والأداء
export const revalidate = 3600; // cache لمدة ساعة
export const runtime = "nodejs";
export const fetchCache = 'force-cache';
export const dynamicParams = true;

// تحسين metadata generation
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getOptimizedArticle(decodeURIComponent(slug));
  
  if (!article) {
    return {
      title: 'المقال غير موجود - سبق الإلكترونية',
      description: 'المقال المطلوب غير متاح حالياً'
    };
  }

  const SITE_URL = getSiteUrl();
  const articleUrl = `${SITE_URL}/news/${encodeURIComponent(slug)}`;
  
  return {
    title: `${article.title} - سبق الإلكترونية`,
    description: article.summary || `اقرأ ${article.title} على موقع سبق الإلكترونية`,
    keywords: article.categories?.name || 'أخبار, سبق, السعودية',
    
    // Open Graph
    openGraph: {
      title: article.title,
      description: article.summary || '',
      url: articleUrl,
      siteName: 'سبق الإلكترونية',
      locale: 'ar_SA',
      type: 'article',
      publishedTime: article.published_at?.toISOString(),
      modifiedTime: article.updated_at?.toISOString(),
      authors: article.author?.name ? [article.author.name] : undefined,
      images: article.featured_image ? [{
        url: article.featured_image,
        width: 1200,
        height: 630,
        alt: article.title
      }] : undefined,
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary || '',
      images: article.featured_image ? [article.featured_image] : undefined,
    },
    
    // JSON-LD للـ SEO
    other: {
      'article:published_time': article.published_at?.toISOString() || '',
      'article:modified_time': article.updated_at?.toISOString() || '',
      'article:author': article.author?.name || article.article_author?.full_name || '',
      'article:section': article.categories?.name || '',
    }
  };
}

// مكون تحميل البيانات الإضافية
async function ArticleExtrasLoader({ 
  articleId, 
  children 
}: { 
  articleId: string;
  children: (extras: any) => React.ReactNode;
}) {
  const extras = await getOptimizedArticleExtras(articleId);
  return <>{children(extras)}</>;
}

// مكون تحميل الإحصائيات
async function ArticleStatsLoader({ 
  articleId, 
  children 
}: { 
  articleId: string;
  children: (stats: any) => React.ReactNode;
}) {
  const stats = await getArticleStats(articleId);
  return <>{children(stats)}</>;
}

export default async function OptimizedNewsPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  
  // تحميل البيانات الأساسية أولاً
  const article = await getOptimizedArticle(decodeURIComponent(slug));
  
  if (!article) {
    notFound();
  }

  // زيادة عدد المشاهدات في الخلفية (لا ننتظرها)
  incrementArticleViews(article.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* JSON-LD للـ SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": article.title,
            "description": article.summary,
            "image": article.featured_image,
            "datePublished": article.published_at?.toISOString(),
            "dateModified": article.updated_at?.toISOString(),
            "author": {
              "@type": "Person",
              "name": article.author?.name || article.article_author?.full_name
            },
            "publisher": {
              "@type": "Organization",
              "name": "سبق الإلكترونية",
              "logo": {
                "@type": "ImageObject",
                "url": `${getSiteUrl()}/logo.png`
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `${getSiteUrl()}/news/${encodeURIComponent(slug)}`
            }
          })
        }}
      />

      {/* المحتوى الأساسي - يتم تحميله فوراً */}
      <OptimizedArticleView article={article} />

      {/* البيانات الإضافية - يتم تحميلها بشكل lazy */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 mx-4 rounded-lg" />}>
        <ArticleExtrasLoader articleId={article.id}>
          {(extras) => (
            <div className="max-w-4xl mx-auto px-4 py-8">
              {/* العلامات */}
              {extras.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">العلامات</h3>
                  <div className="flex flex-wrap gap-2">
                    {extras.tags.map((tag: any) => (
                      <span
                        key={tag.id}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* المقالات المرتبطة */}
              {extras.relatedArticles.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4">مقالات ذات صلة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {extras.relatedArticles.map((relatedArticle: any) => (
                      <a
                        key={relatedArticle.id}
                        href={`/news/${relatedArticle.slug}`}
                        className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                      >
                        {relatedArticle.featured_image && (
                          <img
                            src={relatedArticle.featured_image}
                            alt={relatedArticle.title}
                            className="w-full h-32 object-cover rounded-t-lg"
                            loading="lazy"
                          />
                        )}
                        <div className="p-4">
                          <h4 className="font-semibold text-sm line-clamp-2">
                            {relatedArticle.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(relatedArticle.published_at).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ArticleExtrasLoader>
      </Suspense>

      {/* الإحصائيات - يتم تحميلها بشكل منفصل */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-16 mx-4 rounded-lg" />}>
        <ArticleStatsLoader articleId={article.id}>
          {(stats) => (
            <div className="max-w-4xl mx-auto px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <div className="flex gap-4">
                  <span>👁️ {stats.views.toLocaleString('ar-SA')} مشاهدة</span>
                  <span>❤️ {stats.likes.toLocaleString('ar-SA')} إعجاب</span>
                  <span>💬 {stats.comments.toLocaleString('ar-SA')} تعليق</span>
                </div>
                <div className="flex gap-4">
                  <span>📤 {stats.shares.toLocaleString('ar-SA')} مشاركة</span>
                  <span>🔖 {stats.saves.toLocaleString('ar-SA')} حفظ</span>
                </div>
              </div>
            </div>
          )}
        </ArticleStatsLoader>
      </Suspense>

      {/* التعليقات - يتم تحميلها بشكل lazy جداً */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 mx-4 rounded-lg mt-8" />}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div id="comments-section">
            {/* سيتم تحميل التعليقات عند الوصول لهذا القسم */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold mb-4">التعليقات</h3>
              <p className="text-gray-600 dark:text-gray-400">
                جاري تحميل التعليقات...
              </p>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}

// تحسين generateStaticParams للصفحات الأكثر زيارة
export async function generateStaticParams() {
  try {
    // تحميل أهم 100 مقال لـ pre-generation
    const articles = await prisma.articles.findMany({
      where: {
        status: 'published',
        published_at: {
          not: null
        }
      },
      select: {
        slug: true
      },
      orderBy: [
        { views: 'desc' },
        { published_at: 'desc' }
      ],
      take: 100
    });

    return articles.map((article) => ({
      slug: article.slug || ''
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}


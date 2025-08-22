import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getArticleData, ArticleData } from '@/lib/article-api';
import ArticleClientComponentEnhanced from './ArticleClientComponent-Enhanced';

interface Props {
  params: { id: string };
}

// دالة إنشاء البيانات الوصفية المحسنة
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const decodedId = decodeURIComponent(params.id);
    const article = await getArticleData(decodedId);

    if (!article) {
      return {
        title: 'المقال غير متوفر - صحيفة سبق',
        description: 'المقال المطلوب غير متوفر حالياً',
      };
    }

    // استخراج النص المفيد من المحتوى
    const cleanContent = article.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const description = article.excerpt || article.summary || article.ai_summary || 
                       cleanContent.substring(0, 155) + '...';

    // استخراج الكلمات المفتاحية
    let keywords: string[] = [];
    if (article.keywords && Array.isArray(article.keywords)) {
      keywords = article.keywords;
    } else if (article.seo_keywords) {
      if (typeof article.seo_keywords === 'string') {
        keywords = article.seo_keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
      } else if (Array.isArray(article.seo_keywords)) {
        keywords = article.seo_keywords;
      }
    }

    // إضافة كلمات مفتاحية افتراضية
    const defaultKeywords = ['سبق', 'أخبار', 'السعودية', 'صحيفة'];
    const allKeywords = [...new Set([...keywords, ...defaultKeywords])];

    return {
      title: `${article.title} | صحيفة سبق`,
      description,
      keywords: allKeywords.join(', '),
      
      // Open Graph
      openGraph: {
        title: article.title,
        description,
        url: `https://sabq.org/article/${params.id}`,
        siteName: 'صحيفة سبق',
        images: article.featured_image ? [
          {
            url: article.featured_image,
            width: 1200,
            height: 630,
            alt: article.title,
          }
        ] : [],
        locale: 'ar_SA',
        type: 'article',
        publishedTime: article.published_at || article.created_at,
        modifiedTime: article.updated_at,
        authors: article.author ? [article.author.name] : [],
        section: article.category?.name,
        tags: keywords,
      },

      // Twitter
      twitter: {
        card: 'summary_large_image',
        site: '@sabq_news',
        title: article.title,
        description,
        images: article.featured_image ? [article.featured_image] : [],
      },

      // بيانات إضافية للمحركات
      other: {
        'article:published_time': article.published_at || article.created_at || '',
        'article:modified_time': article.updated_at || '',
        'article:author': article.author?.name || 'فريق التحرير',
        'article:section': article.category?.name || 'أخبار',
        'article:tag': keywords.join(','),
      },

      // بيانات المقال للمحركات
      alternates: {
        canonical: `https://sabq.org/article/${params.id}`,
      },

      // معلومات الروبوت
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
    
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'خطأ في تحميل المقال - صحيفة سبق',
      description: 'حدث خطأ في تحميل المقال المطلوب',
    };
  }
}

// المكون الرئيسي للصفحة
export default async function ArticlePageEnhanced({ params }: Props) {
  try {
    const decodedId = decodeURIComponent(params.id);
    console.log('Attempting to fetch article with ID:', decodedId);
    
    const article = await getArticleData(decodedId);

    if (!article) {
      console.log('Article not found, redirecting to not found');
      notFound();
    }

    console.log('Article found:', {
      id: article.id,
      title: article.title,
      slug: article.slug
    });

    return (
      <>
        {/* إضافة ملف CSS المحسن */}
        <link 
          rel="stylesheet" 
          href="/styles/article-mobile-enhanced.css" 
          media="screen"
        />
        
        {/* Schema.org JSON-LD للمقالات */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              "headline": article.title,
              "image": article.featured_image ? [article.featured_image] : [],
              "datePublished": article.published_at || article.created_at,
              "dateModified": article.updated_at || article.created_at,
              "author": {
                "@type": "Person",
                "name": article.author?.name || "فريق التحرير",
                "url": "https://sabq.org/authors/" + (article.author?.name || "team")
              },
              "publisher": {
                "@type": "Organization",
                "name": "صحيفة سبق",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://sabq.org/logo.png"
                }
              },
              "description": article.excerpt || article.summary || article.ai_summary,
              "articleBody": article.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://sabq.org/article/${params.id}`
              },
              "articleSection": article.category?.name || "أخبار",
              "keywords": (() => {
                let keywords: string[] = [];
                if (article.keywords && Array.isArray(article.keywords)) {
                  keywords = article.keywords;
                } else if (article.seo_keywords) {
                  if (typeof article.seo_keywords === 'string') {
                    keywords = article.seo_keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
                  } else if (Array.isArray(article.seo_keywords)) {
                    keywords = article.seo_keywords;
                  }
                }
                return keywords.join(', ');
              })(),
              "wordCount": article.content.replace(/<[^>]*>/g, ' ').split(' ').length,
              "timeRequired": `PT${Math.max(1, Math.ceil(article.content.replace(/<[^>]*>/g, ' ').split(' ').length / 200))}M`,
              "inLanguage": "ar-SA",
              "isAccessibleForFree": true
            })
          }}
        />

        {/* Breadcrumb Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "الرئيسية",
                  "item": "https://sabq.org"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": article.category?.name || "أخبار",
                  "item": `https://sabq.org/categories/${article.category?.slug || 'news'}`
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": article.title,
                  "item": `https://sabq.org/article/${params.id}`
                }
              ]
            })
          }}
        />

        {/* إضافة CSS للمتصفح */}
        <style jsx global>{`
          /* تحسينات فورية للتحميل */
          body {
            font-feature-settings: "liga" 1, "calt" 1, "kern" 1;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* تحسين التمرير */
          html {
            scroll-behavior: smooth;
            scroll-padding-top: 4rem;
          }

          /* تحسينات الأداء */
          img {
            image-rendering: optimizeQuality;
            image-rendering: -webkit-optimize-contrast;
          }

          /* تحسينات الوصولية */
          @media (prefers-reduced-motion: reduce) {
            html {
              scroll-behavior: auto;
            }
            
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }

          /* تحسين اللمس */
          @media (hover: none) and (pointer: coarse) {
            button, a {
              min-height: 44px;
              min-width: 44px;
            }
          }
        `}</style>

        {/* المكون المحسن للمقال */}
        <div className="article-enhanced">
          <ArticleClientComponentEnhanced 
            initialArticle={article} 
            articleId={params.id} 
          />
        </div>
      </>
    );
    
  } catch (error) {
    console.error('Error in ArticlePage:', error);
    
    // في حالة الخطأ، محاولة البحث عن المقال
    try {
      const searchResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles/search?q=${encodeURIComponent(params.id)}&limit=1`);
      
      if (searchResponse.ok) {
        const searchResults = await searchResponse.json();
        if (searchResults.articles && searchResults.articles.length > 0) {
          const foundArticle = searchResults.articles[0];
          
          return (
            <div className="article-enhanced">
              <ArticleClientComponentEnhanced 
                initialArticle={foundArticle} 
                articleId={params.id} 
              />
            </div>
          );
        }
      }
    } catch (searchError) {
      console.error('Search fallback failed:', searchError);
    }
    
    // إذا فشل كل شيء، إظهار صفحة غير موجود
    notFound();
  }
}

// تحسين الأداء
export const dynamic = 'force-dynamic';
export const revalidate = 60; // إعادة التحقق كل دقيقة

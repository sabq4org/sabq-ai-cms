import { Metadata } from "next";

interface ArticleParams {
  id: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  summary?: string;
  featured_image?: string;
  published_at: string;
  author_name?: string;
  category_name?: string;
  article_type?: string;
  reading_time?: number;
  views?: number;
}

// دالة جلب المقال من قاعدة البيانات مباشرة (تجنب مشاكل API في generateMetadata)
async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    // استخدام prisma مباشرة بدلاً من API call
    const { default: prisma } = await import("@/lib/prisma");
    
    const article = await prisma.articles.findFirst({
      where: {
        OR: [
          { id: slug },
          { slug: slug }
        ],
        status: "published"
      },
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        summary: true,
        featured_image: true,
        published_at: true,
        author_name: true,
        reading_time: true,
        views: true,
        article_type: true,
        categories: {
          select: {
            name: true
          }
        },
        article_author: {
          select: {
            full_name: true
          }
        }
      }
    });

    if (!article) {
      console.log(`Article not found: ${slug}`);
      return null;
    }

    // تحويل البيانات للصيغة المطلوبة
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      summary: article.summary,
      featured_image: article.featured_image,
      published_at: article.published_at,
      author_name: article.article_author?.full_name || article.author_name,
      category_name: article.categories?.name,
      article_type: article.article_type,
      reading_time: article.reading_time,
      views: article.views
    };
    
  } catch (error) {
    console.error("Error fetching article for metadata:", error);
    return null;
  }
}

// توليد العنوان الديناميكي
function generateTitle(article: Article): string {
  if (!article.title) return "سبق الذكية";

  // قطع العنوان إذا كان طويلاً جداً (SEO best practice)
  const title =
    article.title.length > 60
      ? `${article.title.substring(0, 57)}...`
      : article.title;

  return `${title} - سبق الذكية`;
}

// توليد الوصف الديناميكي
function generateDescription(article: Article): string {
  const defaultDesc =
    "اقرأ هذا المقال من سبق الذكية - منصة الأخبار الذكية المدعومة بالذكاء الاصطناعي";

  if (article.excerpt) {
    return article.excerpt.length > 160
      ? `${article.excerpt.substring(0, 157)}...`
      : article.excerpt;
  }

  if (article.summary) {
    return article.summary.length > 160
      ? `${article.summary.substring(0, 157)}...`
      : article.summary;
  }

  return defaultDesc;
}

// توليد نوع المقال للـ OpenGraph
function getArticleType(article: Article): "article" | "website" {
  const newsTypes = ["news", "breaking", "urgent"];
  const articleTypes = ["opinion", "analysis", "editorial", "interview"];

  if (newsTypes.includes(article.article_type || "")) {
    return "article";
  }

  if (articleTypes.includes(article.article_type || "")) {
    return "article";
  }

  return "article"; // default to article for all content
}

// توليد الكلمات المفتاحية
function generateKeywords(article: Article): string[] {
  const baseKeywords = ["سبق الذكية", "أخبار", "مقالات"];

  if (article.category_name) {
    baseKeywords.push(article.category_name);
  }

  if (article.author_name) {
    baseKeywords.push(article.author_name);
  }

  // إضافة كلمات من العنوان (أول 3 كلمات)
  if (article.title) {
    const titleWords = article.title.split(" ").slice(0, 3);
    baseKeywords.push(...titleWords);
  }

  return baseKeywords;
}

export async function generateMetadata({
  params,
}: {
  params: ArticleParams;
}): Promise<Metadata> {
  // تجنب API calls في generateMetadata وإعطاء metadata أساسية
  // سيتم تحديث metadata ديناميكياً من العميل
  const articleId = params.id;
  
  return {
    title: "مقال - سبق الذكية",
    description: "اقرأ هذا المقال من سبق الذكية - منصة الأخبار الذكية المدعومة بالذكاء الاصطناعي.",
    openGraph: {
      title: "مقال - سبق الذكية",
      description: "اقرأ هذا المقال من سبق الذكية - منصة الأخبار الذكية المدعومة بالذكاء الاصطناعي.",
      url: `https://sabq.me/article/${articleId}`,
      siteName: "سبق الذكية",
      images: [
        {
          url: "https://sabq.me/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "سبق الذكية",
          type: "image/jpeg",
        },
      ],
      type: "article",
      locale: "ar_SA",
    },
    twitter: {
      card: "summary_large_image",
      site: "@sabq",
      creator: "@sabq",
      title: "مقال - سبق الذكية",
      description: "اقرأ هذا المقال من سبق الذكية - منصة الأخبار الذكية المدعومة بالذكاء الاصطناعي.",
      images: {
        url: "https://sabq.me/og-image.jpg",
        alt: "سبق الذكية",
      },
    },
    alternates: {
      canonical: `https://sabq.me/article/${articleId}`,
    },
  };

  /* 
  // الكود الأصلي معطل مؤقتاً حتى إصلاح مشاكل API
  const article = await getArticleBySlug(params.id);

  // إذا لم نجد المقال، أرجع metadata افتراضية
  if (!article) {
    return {
      title: "المقال غير موجود - سبق الذكية",
      description:
        "المقال المطلوب غير متاح حالياً. تصفح المزيد من الأخبار والمقالات على سبق الذكية.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const title = generateTitle(article);
  const description = generateDescription(article);
  const keywords = generateKeywords(article);
  const articleType = getArticleType(article);

  // رابط كامل للمقال
  const articleUrl = `https://sabq.me/article/${article.id}`;

  // صورة المقال أو صورة افتراضية
  const imageUrl = article.featured_image || "https://sabq.me/og-image.jpg";

  return {
    title,
    description,
    keywords,
    authors: article.author_name ? [{ name: article.author_name }] : undefined,
    openGraph: {
      title: article.title,
      description,
      url: articleUrl,
      siteName: "سبق الذكية",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
          type: "image/jpeg",
        },
      ],
      type: articleType,
      publishedTime: article.published_at,
      locale: "ar_SA",
      ...(article.author_name && { authors: [article.author_name] }),
      ...(article.category_name && { section: article.category_name }),
      ...(article.reading_time && {
        article: {
          publishedTime: article.published_at,
          modifiedTime: article.published_at,
          section: article.category_name,
          authors: article.author_name ? [article.author_name] : undefined,
          tags: keywords,
        },
      }),
    },
    twitter: {
      card: "summary_large_image",
      site: "@sabq",
      creator: article.author_name ? `@${article.author_name}` : "@sabq",
      title: article.title,
      description,
      images: {
        url: imageUrl,
        alt: article.title,
      },
    },
    alternates: {
      canonical: articleUrl,
    },
    other: {
      "article:published_time": article.published_at,
      "article:author": article.author_name || "سبق الذكية",
      "article:section": article.category_name || "أخبار",
      ...(article.reading_time && {
        "article:reading_time": `${article.reading_time} دقيقة`,
      }),
    },
  };
  */
}

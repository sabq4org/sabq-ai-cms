// دوال API لجلب بيانات المقالات

export interface ArticleData {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  subtitle?: string; // العنوان الفرعي المستقل
  description?: string; // وصف المقال
  summary?: string;
  ai_summary?: string;
  keywords?: string[];
  seo_keywords?: string | string[];
  metadata?: {
    subtitle?: string;
    [key: string]: any;
  };
  author?: {
    name: string;
    avatar?: string;
    reporter?: {
      id: string;
      full_name: string;
      slug: string;
      is_verified?: boolean;
      verification_badge?: string;
    };
  };
  likes?: number;
  saves?: number;
  shares?: number;
  author_id?: string;
  category?: { name: string; slug: string; color?: string; icon?: string };
  category_id?: string;
  featured_image?: string;
  image_url?: string; // رابط الصورة المرفوعة
  audio_summary_url?: string;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  slug?: string;
  views?: number;
  reading_time?: number;
  status?: string;
  article_type?: string; // نوع المقال
  allow_comments?: boolean;
  comments_count?: number;
  stats?: {
    likes: number;
    saves: number;
    shares: number;
    comments: number;
  };
}

// جلب المقال للسيرفر (SSR)
export async function getArticleData(id: string): Promise<ArticleData | null> {
  try {
    // إذا كنا في السيرفر، استخدم اتصال مباشر بقاعدة البيانات
    if (typeof window === "undefined") {
      console.log(
        `[getArticleData] استخدام اتصال مباشر بقاعدة البيانات للمعرف:`,
        id
      );

      try {
        const prisma = (await import("@/lib/prisma")).default;

        const article = await prisma.articles.findFirst({
          where: {
            OR: [{ id: id }, { slug: id }],
            status: "published",
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            categories: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
                icon: true,
              },
            },
          },
        });

        if (!article) {
          console.warn(`[getArticleData] لم يتم العثور على مقال بالمعرف:`, id);
          return null;
        }

        // تحديث عداد المشاهدات
        try {
          await prisma.articles.update({
            where: { id: article.id },
            data: { views: { increment: 1 } },
          });
          console.log(
            `[getArticleData] تم تحديث عداد المشاهدات للمقال:`,
            article.id
          );
        } catch (viewUpdateError) {
          console.warn(
            `[getArticleData] فشل في تحديث عداد المشاهدات:`,
            viewUpdateError
          );
        }

        // تحويل البيانات للتنسيق المطلوب
        const articleData: ArticleData = {
          id: article.id,
          title: article.title,
          content: article.content || "",
          excerpt: article.excerpt || undefined,
          summary: undefined, // غير موجود في schema
          ai_summary: undefined, // غير موجود في schema
          keywords: (article.metadata as any)?.keywords || [],
          seo_keywords: article.seo_keywords || undefined,
          author: article.author
            ? {
                name: article.author.name || "غير محدد",
                avatar: article.author.avatar || undefined,
              }
            : undefined,
          likes: article.likes || 0,
          saves: article.saves || 0,
          shares: article.shares || 0,
          author_id: article.author_id || undefined,
          category: article.categories
            ? {
                name: article.categories.name,
                slug: article.categories.slug,
                color: article.categories.color || undefined,
                icon: article.categories.icon || undefined,
              }
            : undefined,
          category_id: article.category_id || undefined,
          featured_image: article.featured_image || undefined,
          audio_summary_url: article.audio_summary_url || undefined,
          published_at: article.published_at?.toISOString(),
          created_at: article.created_at.toISOString(),
          updated_at: article.updated_at.toISOString(),
          slug: article.slug || undefined,
          views: article.views || 0, // المشاهدات الحقيقية فقط
          reading_time: article.reading_time || undefined,
          status: article.status,
          allow_comments: article.allow_comments ?? true,
          comments_count: 0, // يمكن تحديثه لاحقاً
          stats: {
            likes: article.likes || 0,
            saves: article.saves || 0,
            shares: article.shares || 0,
            comments: 0,
          },
        };

        console.log(
          `[getArticleData] تم جلب المقال بنجاح من قاعدة البيانات:`,
          article.title
        );
        return articleData;
      } catch (dbError) {
        console.error(
          `[getArticleData] خطأ في الاتصال بقاعدة البيانات:`,
          dbError
        );

        // في حالة فشل قاعدة البيانات، حاول مع API
        console.log(`[getArticleData] محاولة مع API كبديل...`);
      }
    }

    // للمتصفح أو في حالة فشل قاعدة البيانات
    let baseUrl: string;

    if (typeof window !== "undefined") {
      // في المتصفح - استخدم النطاق الحالي
      baseUrl = window.location.origin;
    } else {
      // في السيرفر كبديل - استخدم النطاق العام
      baseUrl = "https://sabq.io";
    }

    // ترميز المعرف للتأكد من صحة URL
    const encodedId = encodeURIComponent(id);
    const apiUrl = `${baseUrl}/api/articles/${encodedId}`;

    console.log(`[getArticleData] محاولة جلب مقال بـ API - المعرف:`, id);
    console.log(`[getArticleData] API URL:`, apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      // تأكد من عدم cache في حالة development
      ...(process.env.NODE_ENV === "development" && { cache: "no-store" }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`[getArticleData] المقال غير موجود:`, id);
        return null;
      }
      console.warn(
        `[getArticleData] خطأ HTTP عند جلب المقال:`,
        response.status,
        response.statusText
      );

      // في حالة فشل الاستدعاء، حاول مع localhost (للـ SSR الداخلي)
      if (typeof window === "undefined" && !baseUrl.includes("localhost")) {
        console.log(`[getArticleData] محاولة بديلة مع localhost...`);
        try {
          const fallbackUrl = `http://localhost:3002/api/articles/${encodedId}`;
          const fallbackResponse = await fetch(fallbackUrl, {
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          });

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (
              fallbackData &&
              fallbackData.success &&
              fallbackData.article &&
              fallbackData.article.id
            ) {
              console.log(`[getArticleData] تم جلب المقال بنجاح من localhost`);
              return fallbackData.article;
            }
          }
        } catch (fallbackError) {
          console.warn(
            `[getArticleData] فشلت المحاولة البديلة:`,
            fallbackError
          );
        }
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || !data.success || !data.article || !data.article.id) {
      console.warn(
        `[getArticleData] البيانات المستلمة للمقال فارغة أو غير صحيحة:`,
        data
      );
      return null;
    }
    return data.article;
  } catch (error) {
    console.warn("[getArticleData] خطأ في جلب بيانات المقال:", {
      id,
      error: error instanceof Error ? error.message : "خطأ غير معروف",
      timestamp: new Date().toISOString(),
    });
    return null;
  }
}

// تحديد URL كامل للصورة
export function getFullImageUrl(imageUrl?: string): string {
  if (!imageUrl) return "";

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  return `${baseUrl}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
}

// إنشاء URL كامل للمقال
export function getFullArticleUrl(id: string): string {
  let baseUrl: string;

  if (typeof window !== "undefined") {
    baseUrl = window.location.origin;
  } else {
    baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.APP_URL || "https://sabq.io";
  }

  return `${baseUrl}/article/${id}`;
}

// تحضير الكلمات المفتاحية
export function prepareKeywords(keywords?: string | string[]): string[] {
  if (!keywords) return [];

  if (typeof keywords === "string") {
    return keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  }

  return Array.isArray(keywords) ? keywords : [];
}

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getSiteUrl } from "@/lib/url-builder";
import ResponsiveArticle from "./parts/ResponsiveArticle";
import prisma from "@/lib/prisma";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import ArticleSkeleton from "./components/ArticleSkeleton";
import { getArticleWithCache, getArticleContentWithCache, getRelatedArticlesWithCache } from "@/lib/article-cache-optimized";

// ✅ تحسين: تقليل revalidate من 300s إلى 60s لمحتوى أحدث
export const revalidate = 60;
export const runtime = "nodejs";



type Insights = {
  views: number;
  readsCompleted: number;
  avgReadTimeSec: number;
  interactions: { likes: number; comments: number; shares: number };
  ai: {
    shortSummary: string;
    sentiment: "إيجابي" | "سلبي" | "محايد";
    topic: string;
    readerFitScore: number;
    recommendations: { id: string; title: string; url: string }[];
  };
};



// مخرجات افتراضية سريعة لـ insights لتقليل TTFB (سيتم تحديثها من العميل)
const getInsightsFallback = function getInsightsFallback(): Insights {
  return {
    views: 0,
    readsCompleted: 0,
    avgReadTimeSec: 60,
    interactions: { likes: 0, comments: 0, shares: 0 },
    ai: {
      shortSummary: "",
      sentiment: "محايد",
      topic: "أخبار",
      readerFitScore: 60,
      recommendations: [],
    },
  };
};

// معالجة HTML على الخادم لتقليل عمل المتصفح
function processArticleContentForClient(html: string | null | undefined, opts: { heroUrls?: string[] } = {}) {
  try {
    let c = String(html || "");
    // إزالة السكربتات
    c = c.replace(/<script[\s\S]*?<\/script>/gi, "");
    // روابط YouTube إلى iframe
    const getYouTubeId = (url: string): string | null => {
      try {
        const m = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return m?.[1] || null;
      } catch { return null; }
    };
    const ytAnchorRe = /<a[^>]+href=["'](https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[^"']+)["'][^>]*>.*?<\/a>/gi;
    c = c.replace(ytAnchorRe, (_m, url: string) => {
      const id = getYouTubeId(url);
      if (!id) return _m;
      const src = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
      return `<div class="my-6 rounded-2xl overflow-hidden shadow"><iframe src="${src}" style="width:100%;aspect-ratio:16/9;max-width:100%;" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    });
    // iframes: إضافة style وخواص التحميل
    c = c.replace(/<iframe(?![^>]*\bstyle=)/gi, '<iframe style="width:100%;aspect-ratio:16/9;max-width:100%;"');
    c = c.replace(/<iframe([^>]*)>/gi, (match: string) => {
      let tag = match;
      if (!/\bloading=/.test(tag)) tag = tag.replace('<iframe', '<iframe loading="lazy"');
      if (!/\ballow=/.test(tag)) tag = tag.replace('<iframe', '<iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"');
      if (!/\ballowfullscreen\b/i.test(tag)) tag = tag.replace(/<iframe([^>]*)>/i, '<iframe$1 allowfullscreen>');
      return tag;
    });
    // img: lazy + Cloudinary f_auto,q_auto:eco,w_1200
    c = c.replace(/<img(?![^>]*\bloading=)[^>]*>/gi, (tag) => tag.replace(/<img/i, '<img loading="lazy" decoding="async"'));
    c = c.replace(/<img([^>]+)src=["']([^"']+)["']([^>]*)>/gi, (m, pre, src, post) => {
      try {
        if (!src.includes('res.cloudinary.com') || !src.includes('/upload/')) return m;
        if(/\/upload\/(c_|w_|f_|q_|g_)/.test(src)) return m;
        const parts = src.split('/upload/');
        if (parts.length !== 2) return m;
        const tx = 'f_auto,q_auto:eco,w_1200';
        const newSrc = `${parts[0]}/upload/${tx}/${parts[1]}`;
        return `<img${pre}src="${newSrc}"${post}>`;
      } catch { return m; }
    });
    // إزالة أول تكرار لصورة الهيرو داخل المحتوى إن وُجدت
    const urls = Array.isArray(opts.heroUrls) ? opts.heroUrls.filter(Boolean) : [];
    const removeOnce = (str: string, re: RegExp): string => {
      let replaced = false;
      return str.replace(re, (mm) => {
        if (replaced) return mm;
        replaced = true;
        return "";
      });
    };
    for (const u of urls) {
      try {
        if (!u) continue;
        if (u.startsWith('data:')) {
          const re = /<img[^>]+src=["']data:[^"']+["'][^>]*>/i;
          c = removeOnce(c, re);
        } else {
          const clean = u.split('?')[0].split('#')[0];
          const tail = clean.slice(-80);
          const key = tail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const re = new RegExp(`<img[^>]+src=["'][^"']*${key}[^"']*["'][^>]*>`, 'i');
          c = removeOnce(c, re);
        }
      } catch { /* ignore */ }
    }
    return c;
  } catch {
    return String(html || "");
  }
}

const getArticle = async function getArticle(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  
  // ✅ تحسين: استخدام Redis Cache للحصول على أداء أفضل
  let article = await getArticleWithCache(decodedSlug);
  
  // إذا لم يُعثر عليه بالـ slug، حاول بالـ ID (fallback)
  if (!article && /^[a-z0-9]{8,}$/i.test(decodedSlug)) {
    // استعلام مباشر بالـ ID (لا يوجد cache wrapper له حالياً)
    article = await prisma.articles.findUnique({
      where: {
        id: decodedSlug,
      },
      select: {
        id: true,
        title: true,
        content: true,
        summary: true,
        excerpt: true,
        slug: true,
        featured_image: true,
        social_image: true,
        published_at: true,
        updated_at: true,
        views: true,
        likes: true,
        shares: true,
        saves: true,
        tags: true,
        seo_keywords: true,
        metadata: true,
        status: true,
        featured: true,
        reading_time: true,
        article_author: {
          select: {
            id: true,
            full_name: true,
            title: true,
            bio: true,
            avatar_url: true,
            specializations: true,
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true,
          }
        },
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    }) as any;
    
    // فحص status
    if (article && article.status !== 'published') {
      article = null;
    }
  }
  
  try {
    const anyArticle: any = article as any;
    let keywords: string[] = [];
    // 1) seo_keywords
    if (anyArticle?.seo_keywords) {
      const sk = anyArticle.seo_keywords;
      if (Array.isArray(sk)) {
        keywords = sk.filter(Boolean);
      } else if (typeof sk === 'string') {
        try {
          const parsed = JSON.parse(sk);
          keywords = Array.isArray(parsed) ? parsed.filter(Boolean) : sk.split(',').map((k: string) => k.trim()).filter(Boolean);
        } catch {
          keywords = sk.split(',').map((k: string) => k.trim()).filter(Boolean);
        }
      }
    }
    // 2) metadata
    if ((!keywords || keywords.length === 0) && anyArticle?.metadata) {
      const meta = typeof anyArticle.metadata === 'string' ? JSON.parse(anyArticle.metadata) : anyArticle.metadata;
      const mk = meta?.seo_keywords ?? meta?.keywords;
      if (mk) {
        if (Array.isArray(mk)) {
          keywords = mk.filter(Boolean);
        } else if (typeof mk === 'string') {
          try {
            const parsed = JSON.parse(mk);
            keywords = Array.isArray(parsed) ? parsed.filter(Boolean) : mk.split(',').map((k: string) => k.trim()).filter(Boolean);
          } catch {
            keywords = mk.split(',').map((k: string) => k.trim()).filter(Boolean);
          }
        } else {
          keywords = [String(mk)].filter(Boolean);
        }
      }
    }
    // 3) tags fallback
    if ((!keywords || keywords.length === 0) && anyArticle?.tags) {
      const t = anyArticle.tags;
      if (Array.isArray(t)) {
        keywords = t.map((x: any) => (typeof x === 'string' ? x : (x?.name ?? String(x)))).filter(Boolean);
      } else if (typeof t === 'string') {
        try {
          const parsed = JSON.parse(t);
          keywords = Array.isArray(parsed) ? parsed.map((x: any) => (typeof x === 'string' ? x : (x?.name ?? String(x)))).filter(Boolean) : [t];
        } catch {
          keywords = t.split(',').map((k: string) => k.trim()).filter(Boolean);
        }
      }
    }
    const unique = Array.from(new Set(keywords));
    
    // ✅ تحسين: جلب المحتوى بشكل منفصل (lazy loading)
    // إذا كان المحتوى موجوداً، قم بمعالجته
    let processed = (article as any)?.content_processed;
    if (!processed && (article as any)?.content) {
      const heroUrls: string[] = [];
      if ((article as any)?.featured_image) heroUrls.push((article as any).featured_image as any);
      if ((article as any)?.social_image) heroUrls.push((article as any).social_image as any);
      processed = processArticleContentForClient((article as any)?.content, { heroUrls });
    }
    
    return { ...(article as any), keywords: unique, content_processed: processed } as any;
  } catch {
    try {
      const heroUrls: string[] = [];
      if ((article as any)?.featured_image) heroUrls.push((article as any).featured_image as any);
      if ((article as any)?.social_image) heroUrls.push((article as any).social_image as any);
      const processed = processArticleContentForClient((article as any)?.content, { heroUrls });
      return { ...(article as any), content_processed: processed } as any;
    } catch {
      return article;
    }
  }
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  const SITE_URL = getSiteUrl();

  if (!article) {
    return { title: "خبر غير موجود" };
  }

  const image = article.featured_image ? (article.featured_image.startsWith("http") ? article.featured_image : `${SITE_URL}${article.featured_image}`) : `${SITE_URL}/images/sabq-logo-social.svg`;

  return {
    title: article.title,
    description: article.summary || undefined,
    openGraph: { title: article.title, description: article.summary || undefined, images: [image], type: "article" },
    twitter: { card: "summary_large_image", title: article.title, description: article.summary || undefined, images: [image] },
    alternates: { canonical: `${SITE_URL}/news/${slug}` },
  };
}

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // ✅ تحسين: استخدام getArticle المُحسّن (يستخدم Redis Cache داخلياً)
  // unstable_cache لا يزال يعمل كطبقة إضافية
  const getArticleCached = unstable_cache(
    async (s: string) => getArticle(s),
    ["news-article", slug],
    { tags: [
      `article:${slug}`,
      "articles",
      "news",
    ], revalidate: 60 }  // ✅ تحسين: من 300s إلى 60s
  );

  const article = await getArticleCached(slug);
  if (!article) return notFound();

  // تمرير insights افتراضية وسيقوم العميل بجلبها لاحقًا
  const insights = getInsightsFallback();

  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ResponsiveArticle 
        article={article}
        insights={insights}
        slug={slug}
      />
    </Suspense>
  );
}



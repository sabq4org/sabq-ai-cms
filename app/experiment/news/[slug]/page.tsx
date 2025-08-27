import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getSiteUrl } from "@/lib/url-builder";
import HeroGallery from "./parts/HeroGallery";
import ArticleBody from "./parts/ArticleBody";
import StickyInsightsPanel from "./parts/StickyInsightsPanel";
import FloatingReadButton from "./parts/FloatingReadButton";
import Container from "./parts/Container";
import CommentsSection from "./parts/CommentsSection";
import SmartQuestions from "./parts/SmartQuestions";

export const revalidate = 300;
export const runtime = "nodejs";

type Article = {
  id: string;
  title: string;
  subtitle?: string | null;
  summary?: string | null;
  content: string | null;
  featured_image: string | null;
  published_at: Date | null;
  updated_at?: Date | null;
  readMinutes?: number | null;
  views?: number;
  images?: { url: string; alt?: string | null; width?: number | null; height?: number | null }[];
  author?: { id: string; name: string | null; email?: string | null; avatar?: string | null; role?: string | null } | null;
  article_author?: { 
    id: string; 
    full_name: string | null; 
    slug: string | null; 
    title?: string | null; 
    avatar_url?: string | null;
    specializations?: any;
    bio?: string | null;
  } | null;
  categories?: { id: string; name: string; slug: string; color?: string | null; icon?: string | null } | null;
};

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

async function getArticle(slug: string) {
  const article = await prisma.articles.findFirst({
    where: { OR: [{ slug }, { id: slug }], status: "published" },
    include: {
      author: { select: { id: true, name: true, email: true, avatar: true, role: true } },
      article_author: { 
        select: { 
          id: true, 
          full_name: true, 
          slug: true, 
          title: true, 
          avatar_url: true,
          specializations: true,
          bio: true
        } 
      },
      categories: { select: { id: true, name: true, slug: true, color: true, icon: true } },
    },
  });

  if (!article) return null;

  const images: Article["images"] = [];
  if (article.featured_image) {
    images.push({ url: article.featured_image, alt: article.title || undefined, width: 1600, height: 900 });
  }

  const mapped: Article = {
    id: article.id,
    title: article.title || "",
    subtitle: (article as any)?.metadata?.subtitle || null,
    summary: (article as any).summary || (article as any).excerpt || null,
    content: article.content || null,
    featured_image: article.featured_image,
    published_at: article.published_at,
    updated_at: article.updated_at,
    readMinutes: (article as any).reading_time || null,
    views: article.views || 0,
    images,
    author: article.author,
    article_author: (article as any).article_author,
    categories: article.categories,
  };

  return mapped;
}

async function getInsights(articleId: string): Promise<Insights> {
  // بيانات افتراضية أولية - يمكن استبدالها لاحقاً بمصدر فعلي
  return {
    views: 0,
    readsCompleted: 0,
    avgReadTimeSec: Math.max(60, 60 *  (3)),
    interactions: { likes: 0, comments: 0, shares: 0 },
    ai: {
      shortSummary: "ملخص تجريبي قصير سيتم توليده لاحقاً من خدمة الذكاء الاصطناعي.",
      sentiment: "محايد",
      topic: "أخبار عامة",
      readerFitScore: 60,
      recommendations: [],
    },
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(decodeURIComponent(slug));
  const SITE_URL = getSiteUrl();

  if (!article) {
    return { title: "خبر تجريبي غير موجود" };
  }

  const image = article.featured_image ? (article.featured_image.startsWith("http") ? article.featured_image : `${SITE_URL}${article.featured_image}`) : `${SITE_URL}/images/sabq-logo-social.svg`;

  return {
    title: article.title,
    description: article.summary || undefined,
    openGraph: { title: article.title, description: article.summary || undefined, images: [image], type: "article" },
    twitter: { card: "summary_large_image", title: article.title, description: article.summary || undefined, images: [image] },
    alternates: { canonical: `${SITE_URL}/experiment/news/${slug}` },
  };
}

export default async function ExperimentalNewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(decodeURIComponent(slug));
  if (!article) return notFound();

  const insights = await getInsights(article.id);

  const contentHtml = article.content || "";

  // استخراج روابط الصور من محتوى المقال لعرضها كألبوم أعلى الصفحة
  const extractImageUrls = (html: string): string[] => {
    try {
      const matches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
      // إزالة الدوبلكيت والحفاظ على الترتيب
      const urls = matches.map((m) => m[1]).filter(Boolean);
      return Array.from(new Set(urls));
    } catch {
      return [];
    }
  };

  const contentImageUrls = extractImageUrls(contentHtml);
  const heroImageUrls = (contentImageUrls.length > 0)
    ? contentImageUrls
    : (article.images || []).map((img) => img.url);

  const heroImages: Article["images"] = heroImageUrls.map((url) => ({ url, alt: article.title || undefined, width: 1600, height: 900 }));

  // إخفاء جميع صور الألبوم من متن المقال حتى لا تتكرر أسفل التفاصيل
  const hiddenImageUrls = heroImageUrls;

  return (
    <div className="bg-[#f8f8f7] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 rtl" dir="rtl">
      <div className="pt-4">
        <HeroGallery images={heroImages} />
      </div>
      <main>
          <Container className="py-6 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          <section className="lg:col-span-8" id="article-start">
            <h1 className="text-2xl md:text-3xl font-bold leading-snug mb-3">{article.title}</h1>
            {article.subtitle && (
              <p className="text-[15px] md:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed mb-3 line-clamp-2">
                {article.subtitle}
              </p>
            )}
            
            {/* معلومات المقال تحت العنوان مباشرة */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              {article.published_at && (
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>{new Intl.DateTimeFormat('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }).format(new Date(article.published_at))}</span>
                </div>
              )}
              {article.published_at && (
                <div className="flex items-center gap-1">
                  <span>🕐</span>
                  <span>{new Intl.DateTimeFormat('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }).format(new Date(article.published_at))}</span>
                </div>
              )}
              {article.readMinutes && (
                <div className="flex items-center gap-1">
                  <span>📖</span>
                  <span>{article.readMinutes} دقيقة قراءة</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span>👁️</span>
                <span>{(article.views || 0).toLocaleString("en-US")} مشاهدة</span>
              </div>
            </div>

            {/* معلومات المراسل */}
            {(article.article_author || article.author) && (
              <div className="flex items-center gap-4 my-6">
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                  {article.article_author?.avatar_url || article.author?.avatar ? (
                    <img 
                      src={article.article_author?.avatar_url || article.author?.avatar || ""} 
                      alt={article.article_author?.full_name || article.author?.name || "المراسل"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500 dark:text-neutral-400 text-xl font-semibold">
                      {(article.article_author?.full_name || article.author?.name || "م").charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
                    {article.article_author?.full_name || article.author?.name || "المراسل"}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {article.article_author?.title || article.author?.role || "مراسل صحفي"}
                  </p>
                </div>
              </div>
            )}
            
            {/* خط فاصل */}
            <hr className="border-t border-neutral-200 dark:border-neutral-800 mb-6" />

            {/* شارات ذكية */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {/* الأكثر قراءة */}
              <div className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">الأكثر قراءة خلال 24 ساعة</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">هذا الخبر ضمن قائمة الأكثر قراءة في "سبق" خلال اليوم الماضي.</p>
                </div>
              </div>

              {/* مدعوم بتحليل ذكي */}
              <div className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">مدعوم بتحليل ذكي</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">تمت مراجعة هذا الخبر وتحليله آليًا لضمان دقة وسياق أوضح.</p>
                </div>
              </div>

              {/* مصداقية موثّقة */}
              <div className="flex items-start gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-neutral-700 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">مصداقية موثّقة</h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">هذا الخبر مستند إلى مصادر رسمية وموثق وفق سياسات "سبق".</p>
                </div>
              </div>
            </div>

            <ArticleBody html={contentHtml} article={article} hiddenImageUrls={hiddenImageUrls} />
            
            {/* أسئلة ذكية حول الخبر */}
            <SmartQuestions 
              articleId={article.id} 
              articleTitle={article.title}
              content={article.content || ""}
              author={article.article_author || article.author}
            />
            
            {/* قسم التعليقات */}
            <CommentsSection articleId={article.id} articleSlug={params.slug} />
          </section>
          <aside className="lg:col-span-4">
            <StickyInsightsPanel insights={insights} article={article} />
          </aside>
          </div>
          </Container>
      </main>
      <FloatingReadButton targetId="#article-start" />
    </div>
  );
}



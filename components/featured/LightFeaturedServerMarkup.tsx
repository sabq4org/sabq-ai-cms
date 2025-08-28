/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

interface FeaturedArticleLite {
  id: string | number;
  title: string;
  slug?: string;
  featured_image?: string | null;
  social_image?: string | null;
  image_url?: string | null;
  image?: string | null;
  thumbnail?: string | null;
  published_at?: string | null;
  created_at?: string | null;
  breaking?: boolean;
  is_breaking?: boolean;
  category?: { id: string | number; name: string; slug?: string; color?: string } | null;
  views?: number;
}

function normalizeImageSrc(raw?: string | null): string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;
  if (trimmed.startsWith("data:image/")) return trimmed;
  const isProd = process.env.NODE_ENV === "production";
  const fixed = trimmed.startsWith("http://")
    ? isProd
      ? trimmed.replace(/^http:\/\//, "https://")
      : trimmed
    : trimmed;
  if (fixed.includes("res.cloudinary.com") && fixed.includes("/upload/")) {
    try {
      const [prefix, rest] = fixed.split("/upload/");
      if (/^(c_|w_|h_|f_|q_)/.test(rest)) return `${prefix}/upload/${rest}`;
      const t = "c_fill,w_800,h_450,q_auto,f_auto";
      return `${prefix}/upload/${t}/${rest}`;
    } catch {
      // ignore
    }
  }
  return fixed.startsWith("http") || fixed.startsWith("/") ? fixed : `/${fixed.replace(/^\/+/, "")}`;
}

function getArticleHref(a: FeaturedArticleLite): string {
  if (a.slug) return `/news/${a.slug}`;
  if (a.id) return `/news/${a.id}`;
  return "/";
}

export default async function LightFeaturedServerMarkup({ limit = 3 }: { limit?: number }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const endpoint = `${baseUrl}/api/articles/featured?limit=${Math.max(1, Math.min(6, limit))}`;

  let articles: FeaturedArticleLite[] = [];
  try {
    const res = await fetch(endpoint, { 
      cache: "force-cache", 
      next: { revalidate: 300 } // 5 دقائق بدلاً من دقيقة
    });
    if (res.ok) {
      const json = await res.json();
      const list: any[] = Array.isArray(json?.data) ? json.data : [];
      articles = list.slice(0, Math.max(1, Math.min(6, limit))).map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        featured_image:
          a.featured_image || a.social_image || a.image_url || a.image || a.thumbnail || null,
        social_image: a.social_image,
        published_at: a.published_at,
        created_at: a.created_at,
        breaking: a.breaking || a.is_breaking || false,
        is_breaking: a.is_breaking || a.breaking || false,
        category: a.categories
          ? { id: a.categories.id, name: a.categories.name, slug: a.categories.slug, color: a.categories.color }
          : null,
        views: a.views ?? a.views_count ?? 0,
      }));
    }
  } catch {
    // ignore
  }

  if (!articles.length) {
    return (
      <div className="w-full px-4 sm:px-6">
        <div className="flex gap-4 overflow-hidden">
          <div className="w-[70%] xs:w-[60%] sm:w-[45%] md:w-[320px] max-w-[340px] h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="w-[70%] xs:w-[60%] sm:w-[45%] md:w-[320px] max-w-[340px] h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <section aria-label="الأخبار المميزة" className="mb-6">
      <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">الأخبار المميزة</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.slice(0, 3).map((article, idx) => {
          const href = getArticleHref(article);
          const displaySrc = normalizeImageSrc(
            article.featured_image || article.social_image || article.image_url
          ) || "/images/news-placeholder-lite.svg";
          
          return (
            <Link
              key={article.id || idx}
              href={href}
              prefetch={false}
              className="block"
            >
              <article className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative aspect-video">
                  <img
                    src={displaySrc}
                    alt={article.title}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2 text-gray-900 dark:text-white">
                    {article.title}
                  </h3>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}



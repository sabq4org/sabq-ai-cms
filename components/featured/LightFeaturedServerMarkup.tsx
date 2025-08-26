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
  const endpoint = `/api/articles/featured?limit=${Math.max(1, Math.min(6, limit))}`;

  let articles: FeaturedArticleLite[] = [];
  try {
    const res = await fetch(endpoint, { cache: "force-cache", next: { revalidate: 60 } });
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
    <section aria-label="الأخبار المميزة" className="relative" dir="rtl">
      <div
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: "touch" as any, scrollbarWidth: 'none' as any }}
      >
        {articles.slice(0, 3).map((article, idx) => {
          const href = getArticleHref(article);
          const rawImage =
            article.featured_image || article.social_image || article.image_url || article.image || article.thumbnail;
          const displaySrc = normalizeImageSrc(rawImage) || "/images/news-placeholder-lite.svg";
          return (
            <Link
              key={article.id || idx}
              href={href}
              prefetch={false}
              className="group flex-shrink-0 snap-start w-[70%] xs:w-[60%] sm:w-[45%] md:w-[320px] max-w-[340px] select-none"
              aria-label={article.title}
              style={{ contentVisibility: "auto" as any, containIntrinsicSize: "320px 260px" as any }}
            >
              <article className="relative rounded-2xl overflow-hidden border transition-all duration-200 h-full flex flex-col shadow-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <img
                    src={displaySrc}
                    alt={article.title}
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={idx === 0 ? ("high" as any) : ("low" as any)}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div className="flex flex-col p-3 pb-4 flex-1">
                  <h3 className="text-sm sm:text-base font-semibold leading-snug line-clamp-2 mb-2 text-gray-900 dark:text-white">
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



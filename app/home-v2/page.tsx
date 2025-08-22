import CloudImage from "@/components/ui/CloudImage";
import { getArticleLink } from "@/lib/utils";
import { ArrowLeft, Calendar, Clock, Eye, MessageSquare } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Article = {
  id: string;
  title: string;
  summary?: string;
  excerpt?: string;
  featured_image?: string;
  image?: string;
  image_url?: string;
  published_at?: string;
  created_at: string;
  views?: number;
  views_count?: number;
  comments_count?: number;
  reading_time?: number;
  breaking?: boolean;
  is_breaking?: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
  } | null;
};

async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3001";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  return `${protocol}://${host}`;
}

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return fallback as T;
    const json = await res.json();
    return json as T;
  } catch {
    return fallback as T;
  }
}

export default async function HomeV2() {
  const [
    latestResp,
    trendingResp,
    breakingResp,
    deepResp,
    opinionsResp,
    analysisResp,
  ] = await Promise.all([
    safeFetch<{ success: boolean; articles: Article[] }>(
      "/api/news?status=published&limit=12&sort=published_at&order=desc",
      { success: false, articles: [] }
    ),
    safeFetch<{ success: boolean; articles: Article[] }>(
      "/api/news?status=published&limit=8&sort=views&order=desc",
      { success: false, articles: [] }
    ),
    safeFetch<{ success: boolean; articles: Article[] }>(
      "/api/news?status=published&breaking=true&limit=6&sort=published_at&order=desc",
      { success: false, articles: [] }
    ),
    safeFetch<{ analyses?: any[] }>(
      "/api/deep-analyses?limit=2&sortBy=analyzed_at&sortOrder=desc",
      { analyses: [] }
    ),
    safeFetch<{ success: boolean; articles: Article[] }>(
      "/api/articles?types=opinion&limit=6&sort=published_at&order=desc",
      { success: false, articles: [] }
    ),
    safeFetch<{ success: boolean; articles: Article[] }>(
      "/api/articles?types=analysis&limit=8&sort=published_at&order=desc",
      { success: false, articles: [] }
    ),
  ]);

  const latest = latestResp?.articles ?? [];
  const trending = trendingResp?.articles ?? [];
  const breaking = breakingResp?.articles ?? [];
  const analyses = deepResp?.analyses ?? [];
  const opinions = opinionsResp?.articles ?? [];
  const muqtarib = analysisResp?.articles ?? [];

  const hero = (trending[0] || latest[0]) as Article | undefined;
  const highlights = (
    trending.slice(1, 4).length ? trending.slice(1, 4) : latest.slice(1, 4)
  ) as Article[];
  const featured = latest.slice(0, 4) as Article[];

  const numberFmt = new Intl.NumberFormat("ar", { notation: "compact" });
  return (
    <main
      className="min-h-dvh bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pt-14"
      dir="rtl"
    >
      {/* Top Nav */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-200/70 dark:border-gray-800/70 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-800"
              aria-hidden
            />
            <span className="font-bold">سبق الذكية</span>
          </div>

          {/* Sections */}
          <nav className="hidden md:flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <a
              href="#"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              الرئيسية
            </a>
            <a
              href="#"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              أقسام
            </a>
            <a
              href="#"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              الأحدث
            </a>
            <a
              href="#"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              الرائج
            </a>
          </nav>

          {/* Search + Theme + Profile */}
          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="ابحث..."
              className="hidden sm:block h-9 rounded-lg px-3 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              aria-label="بحث"
            />
            <button
              className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="تبديل الثيم"
            />
            <button
              className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700"
              aria-label="الملف الشخصي"
            />
          </div>
        </div>
      </header>

      {/* Hero + Side rail */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-12">
        <div className="lg:col-span-8 rounded-2xl overflow-hidden relative border border-gray-200 dark:border-gray-800 bg-gray-200/40 dark:bg-gray-800/40 min-h-[360px]">
          {hero ? (
            <Link href={getArticleLink(hero)} className="block h-full">
              <div className="relative h-[360px] sm:h-[420px]">
                <CloudImage
                  src={
                    hero.featured_image || hero.image || hero.image_url || null
                  }
                  alt={hero.title}
                  fill
                  className="object-cover"
                  priority
                  fallbackType="article"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 right-4 left-4">
                  {hero.category?.name && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
                      {hero.category.name}
                    </span>
                  )}
                  <h2 className="mt-3 text-white text-2xl sm:text-3xl font-bold leading-snug line-clamp-3">
                    {hero.title}
                  </h2>
                  <div className="mt-3 flex items-center gap-3 text-sm text-blue-100">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(
                        hero.published_at || hero.created_at
                      ).toLocaleDateString("ar-SA")}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {numberFmt.format(hero.views ?? hero.views_count ?? 0)}
                    </span>
                    {typeof hero.comments_count === "number" &&
                      hero.comments_count > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {numberFmt.format(hero.comments_count)}
                        </span>
                      )}
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 text-gray-900 font-semibold shadow">
                    اقرأ المزيد <ArrowLeft className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="h-[360px] sm:h-[420px]" />
          )}
        </div>
        <div className="lg:col-span-4 space-y-4">
          {/* Highlights - تمرير أفقي للموبايل */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 p-3">
            <div className="mb-2 font-semibold">أهم العناوين</div>
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory">
              {(highlights.length ? highlights : latest.slice(0, 3)).map(
                (a) => (
                  <Link
                    href={getArticleLink(a)}
                    key={a.id}
                    className="min-w-[220px] snap-start group"
                  >
                    <article className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <div className="relative h-24">
                        <CloudImage
                          src={
                            a.featured_image || a.image || a.image_url || null
                          }
                          alt={a.title}
                          fill
                          className="object-cover"
                          fallbackType="article"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {a.title}
                        </h3>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Eye className="w-3.5 h-3.5" />{" "}
                          {numberFmt.format(a.views ?? a.views_count ?? 0)}
                          {typeof a.comments_count === "number" &&
                            a.comments_count > 0 && (
                              <>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1">
                                  <MessageSquare className="w-3.5 h-3.5" />{" "}
                                  {numberFmt.format(a.comments_count)}
                                </span>
                              </>
                            )}
                        </div>
                      </div>
                    </article>
                  </Link>
                )
              )}
            </div>
          </div>
          {/* Smart Doses */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 p-3">
            <div className="mb-2 font-semibold">الجرعات الذكية</div>
            <div className="flex items-center gap-2 text-xs">
              {[
                { k: "morning", label: "صباح" },
                { k: "noon", label: "ظهر" },
                { k: "evening", label: "مساء" },
                { k: "night", label: "قبل النوم" },
              ].map((t) => (
                <button
                  key={t.k}
                  className="px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="space-y-2 mt-2">
              {(latest.slice(0, 3) as Article[]).map((a) => (
                <Link href={getArticleLink(a)} key={a.id} className="block">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="relative w-14 h-14 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                      <CloudImage
                        src={a.featured_image || a.image || a.image_url || null}
                        alt={a.title}
                        fill
                        className="object-cover"
                        fallbackType="article"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="line-clamp-2 font-medium">{a.title}</h4>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {a.reading_time || 5} د
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3 h-3" />{" "}
                          {numberFmt.format(a.views ?? a.views_count ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Context Bar */}
      <div className="border-y border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto flex items-center gap-2 px-4 py-3 text-sm">
          <button className="px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-white/60 dark:hover:bg-gray-700">
            فلاتر
          </button>
          <button className="px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
            لأجلك
          </button>
          <button className="px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
            الرائج
          </button>
          <button className="px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
            الأحدث
          </button>
        </div>
      </div>

      {/* Featured + Deep Analysis */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-12">
        <div className="lg:col-span-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {(featured.length ? featured : latest.slice(0, 4)).map((a) => (
            <Link href={getArticleLink(a)} key={a.id} className="group">
              <article className="h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 relative">
                <div className="absolute inset-0">
                  <CloudImage
                    src={a.featured_image || a.image || a.image_url || null}
                    alt={a.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    fallbackType="article"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  {/* إخفاء العنوان المتراكب على الديسكتوب - الإبقاء فقط للموبايل */}
                  <div className="md:hidden relative h-full p-4 flex flex-col justify-end">
                    <h3 className="text-white font-bold line-clamp-2">
                      {a.title}
                    </h3>
                  </div>
                </div>
                <div className="hidden md:flex relative h-full p-4 flex-col justify-end">
                  <div className="mt-1 text-blue-100 text-xs flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />{" "}
                      {numberFmt.format(a.views ?? a.views_count ?? 0)}
                    </span>
                    {typeof a.comments_count === "number" &&
                      a.comments_count > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />{" "}
                          {numberFmt.format(a.comments_count)}
                        </span>
                      )}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
        <aside className="lg:col-span-4 space-y-4">
          {analyses.slice(0, 2).map((an: any, idx: number) => (
            <div
              key={idx}
              className="h-40 rounded-xl overflow-hidden border border-purple-200/60 dark:border-purple-800/60 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/10 p-4"
            >
              <span className="inline-flex items-center gap-2 text-xs font-bold px-2 py-1 rounded-full bg-purple-600 text-white">
                تحليل عميق
              </span>
              <h4 className="mt-2 font-bold line-clamp-2">
                {an?.title || "تحليل"}
              </h4>
              <p className="mt-1 text-sm line-clamp-2 text-gray-600 dark:text-gray-300">
                {an?.summary || an?.excerpt || "ملخص تحليلي مختصر"}
              </p>
            </div>
          ))}
          {analyses.length === 0 && (
            <>
              <div className="h-40 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50" />
              <div className="h-40 rounded-xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50" />
            </>
          )}
        </aside>
      </section>

      {/* Muqtarib */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory">
          {(muqtarib.length ? muqtarib : latest.slice(0, 8)).map((a) => (
            <Link
              href={getArticleLink(a)}
              key={a.id}
              className="min-w-[240px] snap-start"
            >
              <article className="h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                <div className="relative h-24">
                  <CloudImage
                    src={a.featured_image || a.image || a.image_url || null}
                    alt={a.title}
                    fill
                    className="object-cover"
                    fallbackType="article"
                  />
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-semibold line-clamp-2">
                    {a.title}
                  </h4>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Opinion + Data */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-12">
        <div
          className="lg:col-span-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-800/60 p-4"
          aria-label="آراء"
        >
          <div className="mb-3 font-bold">آراء</div>
          <div className="space-y-3">
            {(opinions.length ? opinions : latest.slice(0, 5)).map((a) => (
              <Link href={getArticleLink(a)} key={a.id} className="block group">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                    <CloudImage
                      src={a.featured_image || a.image || a.image_url || null}
                      alt={a.title}
                      fill
                      className="object-cover"
                      fallbackType="article"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {a.title}
                    </h5>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5" />{" "}
                      {numberFmt.format(a.views ?? a.views_count ?? 0)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div
          className="lg:col-span-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-800/60 p-4"
          aria-label="بيانات ورسوم"
        >
          <div className="mb-3 font-bold">رسوم وبيانات</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(trending.slice(0, 4).length
              ? trending.slice(0, 4)
              : latest.slice(0, 4)
            ).map((a) => (
              <Link href={getArticleLink(a)} key={a.id} className="group">
                <article className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                  <div className="relative h-28">
                    <CloudImage
                      src={a.featured_image || a.image || a.image_url || null}
                      alt={a.title}
                      fill
                      className="object-cover"
                      fallbackType="article"
                    />
                  </div>
                  <div className="p-3">
                    <h6 className="text-sm font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {a.title}
                    </h6>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* For You (AI) - مؤقتاً من الأحدث */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-3 font-bold">لأجلك (تجريبي)</div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {(latest.slice(0, 6) as Article[]).map((a) => (
            <Link href={getArticleLink(a)} key={a.id} className="group">
              <article className="h-44 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 relative">
                <div className="absolute inset-0">
                  <CloudImage
                    src={a.featured_image || a.image || a.image_url || null}
                    alt={a.title}
                    fill
                    className="object-cover"
                    fallbackType="article"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>
                <div className="relative h-full p-3 flex flex-col justify-end">
                  <h6 className="text-white font-semibold text-sm line-clamp-2">
                    {a.title}
                  </h6>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

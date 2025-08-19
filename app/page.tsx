import PageClient from "./page-client";
import { Metadata } from "next";

async function safeFetch(url: string, options: RequestInit = {}) {
  try {
    const apiBase = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;

    // For server-side calls, we might not have a base URL.
    // We construct a full URL if apiBase is available, otherwise we assume it's a server-internal call.
    const fetchUrl = apiBase ? `${apiBase}${url}` : new URL(url, 'http://localhost:3000');
    
    const res = await fetch(fetchUrl, {
      ...options,
      next: { revalidate: 60 },
    });

    if (res.status === 204 || res.headers.get('content-length') === '0') {
      return null;
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return res.json();
    } else {
      // Handle non-JSON responses if necessary
      console.warn(`Response is not JSON, received: ${contentType}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}
export const metadata: Metadata = {
  title: "صحيفة سبق الالكترونية AI - الصفحة الرئيسية",
  description:
    "موقع صحيفة سبق الإلكترونية الرسمي - آخر الأخبار والمقالات من المملكة العربية السعودية والعالم بتقنية الذكاء الاصطناعي",
};

export default async function Page() {
  const [
    articlesData,
    categoriesData,
    statsData,
    deepAnalysesData,
    featuredArticlesData,
  ] = await Promise.all([
    safeFetch("/api/news?status=published&limit=20&sort=published_at&order=desc"),
    safeFetch("/api/categories?is_active=true"),
    safeFetch("/api/stats/homepage"),
    safeFetch("/api/deep-analyses?limit=3&sortBy=views&sortOrder=desc"),
    safeFetch("/api/featured-news-carousel"),
  ]);

  const articles = articlesData?.articles || articlesData?.data || [];
  const categories = categoriesData?.data || categoriesData?.categories || [];
  const stats = statsData || {
    activeReaders: null,
    dailyArticles: null,
    loading: false,
  };
  const deepAnalyses = deepAnalysesData?.analyses || [];
  const featuredArticles = featuredArticlesData?.articles || [];

  return (
    <PageClient
      initialArticles={articles}
      initialCategories={categories}
      initialStats={stats}
      initialDeepAnalyses={deepAnalyses}
      initialFeaturedArticles={featuredArticles}
    />
  );
}
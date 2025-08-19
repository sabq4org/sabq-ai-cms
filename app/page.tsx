import PageClient from "./page-client";
import { Metadata } from "next";

async function safeFetch(url: string, options: RequestInit = {}) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      ...options,
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.warn(`Failed to fetch ${url}: ${res.statusText}`);
      return null;
    }
    return res.json();
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
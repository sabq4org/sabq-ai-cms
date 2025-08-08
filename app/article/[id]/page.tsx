import ArticleClientComponent from "./ArticleClientComponent";
import { generateMetadata } from "./metadata";

interface ArticlePageProps {
  params: { id: string };
}

// تصدير generateMetadata للاستخدام من قبل Next.js
export { generateMetadata };

export const revalidate = 0; // عدم التخزين المؤقت للصفحة
export const dynamic = "force-dynamic"; // ضمان SSR دائمًا

async function fetchArticleServer(id: string) {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://sabq.io")).replace(/\/$/, "");

  try {
    const res = await fetch(`${baseUrl}/api/articles/${id}`,
      { cache: "no-store", next: { revalidate: 0 } }
    );
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  // مسار طوارئ احتياطي
  try {
    const emer = await fetch(`${baseUrl}/api/articles/${id}/emergency`, { cache: "no-store" });
    if (emer.ok) {
      const data = await emer.json();
      if (data?.success) return data;
    }
  } catch {}

  return null;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = params;
  const initialArticle = await fetchArticleServer(id);
  return <ArticleClientComponent articleId={id} initialArticle={initialArticle} />;
}

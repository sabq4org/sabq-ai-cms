import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "6", 10), 24);

    // قراءة البيانات من ملف JSON
    const dataPath = path.join(process.cwd(), "data", "articles.json");
    const fileContent = fs.readFileSync(dataPath, "utf8");
    const data = JSON.parse(fileContent);

    const articles = data.articles || [];
    
    // تحويل البيانات لتتماشى مع API الأصلي
    const formattedArticles = articles.slice(0, limit).map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      featured_image: article.featured_image,
      published_at: article.published_at,
      views: article.views_count || article.views || 0,
      categories: {
        id: article.category_id || "cat-001",
        name: article.category_name || "عام",
        slug: "general",
        color: "#3B82F6"
      }
    }));

    const res = NextResponse.json({ 
      ok: true, 
      data: formattedArticles, 
      count: formattedArticles.length 
    });
    res.headers.set("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
    res.headers.set("CDN-Cache-Control", "max-age=60");
    res.headers.set("Vercel-CDN-Cache-Control", "max-age=60");
    return res;
  } catch (error: any) {
    console.error("❌ [featured-json] خطأ في جلب المقالات المميزة:", error);
    return NextResponse.json({ ok: true, data: [], fallback: true }, { status: 200 });
  }
}

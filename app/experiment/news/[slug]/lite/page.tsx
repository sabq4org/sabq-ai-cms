import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import HeroGallery from "../parts/HeroGallery";
import ArticleBody from "../parts/ArticleBody";
import StickyInsightsPanel from "../parts/StickyInsightsPanel";
import CommentsSection from "../parts/CommentsSection";

export const revalidate = 300;
export const runtime = "nodejs";

async function getArticle(slug: string) {
  try {
    const article = await prisma.articles.findFirst({
      where: {
        OR: [
          { slug },
          { id: slug }
        ],
        status: "published"
      }
    });
    
    if (!article) return null;
    
    // جلب الوسائط (إن وجدت)
    let media: any[] = [];
    try {
      // محاولة جلب من جدول NewsArticleAssets إن وجد
      const assets = await prisma.newsArticleAssets.findMany({
        where: {
          articleId: article.id
        },
        orderBy: { createdAt: "asc" }
      });
      
      media = assets.map(asset => ({
        id: asset.id,
        file_path: asset.imageUrl,
        alt_text: asset.altText,
        is_featured: asset.type === 'HERO'
      }));
    } catch (e) {
      console.log("No media found for article");
    }
    
    // جلب معلومات الكاتب
    let author = null;
    if (article.author_id) {
      author = await prisma.users.findUnique({
        where: { id: article.author_id },
        select: {
          id: true,
          name: true,
          avatar: true,
          role: true
        }
      });
    }
    
    // تحديث عداد المشاهدات
    await prisma.articles.update({
      where: { id: article.id },
      data: { views: { increment: 1 } }
    });
    
    return {
      ...article,
      media,
      users: author
    };
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
}

export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const article = await getArticle(params.slug);
  
  if (!article) {
    return {
      title: "المقال غير موجود",
      description: "عذراً، المقال الذي تبحث عنه غير موجود"
    };
  }

  return {
    title: article.title,
    description: article.summary || article.excerpt || article.seo_description,
    openGraph: {
      title: article.title,
      description: article.summary || article.excerpt || article.seo_description,
      images: article.featured_image ? [{
        url: article.featured_image,
        width: 1200,
        height: 675,
        alt: article.title
      }] : []
    }
  };
}

export default async function LiteArticlePage({
  params
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);
  
  if (!article) {
    notFound();
  }

  // استخراج الصور
  const featuredImage = article.media?.find(m => m.is_featured) || article.media?.[0] || 
    (article.featured_image ? { file_path: article.featured_image, alt_text: article.title } : null);
  const galleryImages = article.media?.filter(m => !m.is_featured) || [];

  // إعداد البيانات للمكونات
  const contentHtml = article.content;
  const hiddenImageUrls: string[] = [];
  
  // معالج الوسائط
  const processedMedia: any[] = article.media || [];
  if (article.featured_image && !processedMedia.length) {
    processedMedia.push({
      id: 'featured',
      file_path: article.featured_image,
      type: 'image',
      caption: article.featured_image_caption || '',
      alt_text: article.featured_image_alt || article.title,
      is_featured: true,
      display_order: 0
    });
  }

  // إعداد البيانات للـ StickyInsightsPanel
  const insights = {
    views: article.views || 0,
    readsCompleted: Math.floor((article.views || 0) * 0.7), // تقدير 70% أكملوا القراءة
    avgReadTimeSec: (article.reading_time || Math.ceil((article.content?.split(' ').length || 0) / 200)) * 60,
    interactions: {
      likes: article.likes || 0,
      comments: 0, // سيتم تحديثه لاحقاً
      shares: article.shares || 0
    },
    ai: {
      shortSummary: article.summary || article.excerpt || "ملخص المقال غير متوفر",
      sentiment: "محايد" as const,
      topic: article.category_id || "عام",
      readerFitScore: 85,
      recommendations: []
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <article>
        {/* 1. الصورة البارزة */}
        {processedMedia.length > 0 && (
          <div className="mb-8">
            <HeroGallery images={processedMedia.map(m => ({
              url: m.file_path,
              alt: m.alt_text || article.title,
              caption: m.caption
            }))} />
          </div>
        )}

        <div className="px-4">
          {/* 2. العنوان الكبير */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {article.title}
          </h1>

          {/* 3. العنوان الصغير */}
          {article.excerpt && (
            <h2 className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 mb-6">
              {article.excerpt}
            </h2>
          )}

          {/* 4. بيانات النشر */}
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-2">
            <time dateTime={(article.published_at || article.created_at).toISOString()}>
              {new Date(article.published_at || article.created_at).toLocaleDateString("ar-SA", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            <span>•</span>
            <span>{article.views} مشاهدة</span>
          </div>

          {/* 5. المراسل */}
          {article.users && (
            <div className="flex items-center gap-3 mb-6">
              {article.users.avatar && (
                <img
                  src={article.users.avatar}
                  alt={article.users.name || "الكاتب"}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div>
                <div className="font-medium">{article.users.name}</div>
                <div className="text-sm text-neutral-500">{article.users.role}</div>
              </div>
            </div>
          )}

          {/* 6. خط فاصل */}
          <hr className="border-neutral-200 dark:border-neutral-800 my-8" />

          {/* 7. الموجز الذكي */}
          {(article.summary || article.excerpt) && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span>📋</span>
                <span>الموجز الذكي</span>
              </h3>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {article.summary || article.excerpt}
              </p>
            </div>
          )}

          {/* 8. نص المحتوى */}
          <ArticleBody 
            html={contentHtml} 
            article={article} 
            hiddenImageUrls={hiddenImageUrls}
          />

          {/* 9. بقية الصور (ألبوم) - إذا كان هناك أكثر من صورة */}
          {processedMedia.length > 1 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-4">ألبوم الصور</h3>
              <HeroGallery images={processedMedia.slice(1).map(m => ({
                url: m.file_path,
                alt: m.alt_text || article.title,
                caption: m.caption
              }))} />
            </div>
          )}

          {/* 10. تحليلات AI */}
          <StickyInsightsPanel insights={insights} article={article} />

          {/* 11. نظام التعليقات */}
          <CommentsSection articleId={article.id} articleSlug={params.slug} />
        </div>
      </article>
    </div>
  );
}

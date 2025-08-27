import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import HeaderInline from "../parts/HeaderInline";
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

  // إعداد البيانات الوهمية للـ insights (يمكن استبدالها بالبيانات الحقيقية)
  const insights = {
    readingTime: article.reading_time || Math.ceil((article.content?.split(' ').length || 0) / 200),
    wordCount: article.content?.split(' ').length || 0,
    category: article.category_id || "عام",
    publishDate: article.published_at || article.created_at
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
          {/* 2-5. العناوين والمعلومات */}
          <HeaderInline 
            title={article.title}
            subtitle={article.excerpt}
            publishDate={article.published_at || article.created_at}
            author={article.users}
            views={article.views}
          />

          {/* 6. خط فاصل */}
          <hr className="border-neutral-200 dark:border-neutral-800 my-8" />

          {/* 7. الموجز الذكي */}
          {(article.summary || article.excerpt) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
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

          {/* 11. نظرة سريعة */}
          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-xl p-6 my-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>👁️</span>
              <span>نظرة سريعة</span>
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">القسم:</span>
                <span className="font-medium mr-2">{article.category_id || "عام"}</span>
              </div>
              <div>
                <span className="text-neutral-500">الكلمات:</span>
                <span className="font-medium mr-2">{insights.wordCount}</span>
              </div>
              <div>
                <span className="text-neutral-500">وقت القراءة:</span>
                <span className="font-medium mr-2">{insights.readingTime} دقائق</span>
              </div>
              <div>
                <span className="text-neutral-500">المشاهدات:</span>
                <span className="font-medium mr-2">{article.views}</span>
              </div>
            </div>
          </div>

          {/* 12. أزرار التفاعل */}
          <div className="flex items-center justify-center gap-4 my-12">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <span>👍</span>
              <span>أعجبني ({article.likes || 0})</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-lg transition-colors">
              <span>📤</span>
              <span>مشاركة ({article.shares || 0})</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-lg transition-colors">
              <span>🔖</span>
              <span>حفظ ({article.saves || 0})</span>
            </button>
          </div>

          {/* 13. نظام التعليقات */}
          <CommentsSection articleId={article.id} articleSlug={params.slug} />
        </div>
      </article>
    </div>
  );
}

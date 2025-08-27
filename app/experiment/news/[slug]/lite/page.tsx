import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import HeroMedia from "../parts/HeroMedia";
import HeroContent from "../parts/HeroContent";
import ArticleStats from "../parts/ArticleStats";
import ArticleBody from "../parts/ArticleBody";
import HeroGallery from "../parts/HeroGallery";
import InsightsBoxes from "../parts/InsightsBoxes";
import SocialInteractionButtons from "../parts/SocialInteractionButtons";
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <article className="space-y-8">
        {/* 1. الصورة البارزة */}
        {processedMedia.length > 0 && (
          <HeroMedia 
            media={processedMedia}
            title={article.title}
          />
        )}

        {/* 2. العنوان الكبير */}
        {/* 3. العنوان الصغير */}
        {/* 4. بيانات النشر */}
        {/* 5. المراسل */}
        <HeroContent article={article} />

        {/* 6. خط فاصل */}
        <hr className="border-neutral-200 dark:border-neutral-800" />

        {/* 7. الموجز الذكي - استخدام InsightsBoxes */}
        {(article.summary || article.excerpt) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
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

        {/* 9. بقية الصور (ألبوم) */}
        {processedMedia.filter(m => !m.is_featured).length > 0 && (
          <HeroGallery media={processedMedia} />
        )}

        {/* 10. تحليلات AI - استخدام InsightsBoxes */}
        <InsightsBoxes insights={insights} />

        {/* 11. نظرة سريعة - استخدام ArticleStats */}
        <ArticleStats article={article} />

        {/* 12. أزرار التفاعل */}
        <SocialInteractionButtons 
          articleId={article.id}
          initialLikes={article.likes || 0}
          initialShares={article.shares || 0}
          initialSaves={article.saves || 0}
        />

        {/* 13. نظام التعليقات */}
        <CommentsSection articleId={article.id} articleSlug={params.slug} />
      </article>
    </div>
  );
}

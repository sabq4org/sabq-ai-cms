import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CommentsSection from "../parts/CommentsSection";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

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

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
        {/* 1. الصورة البارزة */}
        {featuredImage && (
          <div className="mb-8">
            <img
              src={featuredImage.file_path}
              alt={featuredImage.alt_text || article.title}
              className="w-full h-auto rounded-xl"
            />
          </div>
        )}

        {/* 2. العنوان الكبير */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
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
          <time dateTime={article.created_at.toISOString()}>
            {formatDistanceToNow(new Date(article.created_at), {
              addSuffix: true,
              locale: ar
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
        <hr className="border-neutral-200 dark:border-neutral-800 mb-8" />

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
        <div 
          className="prose prose-lg dark:prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* 9. بقية الصور (ألبوم) */}
        {galleryImages.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold mb-4">ألبوم الصور</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {galleryImages.map((image, index) => (
                <img
                  key={image.id}
                  src={image.file_path}
                  alt={image.alt_text || `صورة ${index + 1}`}
                  className="w-full h-auto rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* 10. تحليلات AI */}
        {article.ai_analysis && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <span>🤖</span>
              <span>تحليلات AI</span>
            </h3>
            <div className="space-y-4">
              {Object.entries(article.ai_analysis as any).map(([key, value]) => (
                <div key={key}>
                  <h4 className="font-medium mb-1">{key}:</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {JSON.stringify(value, null, 2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 11. نظرة سريعة */}
        <div className="bg-neutral-100 dark:bg-neutral-900 rounded-xl p-6 mb-8">
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
              <span className="font-medium mr-2">{article.content?.split(' ').length || 0}</span>
            </div>
            <div>
              <span className="text-neutral-500">وقت القراءة:</span>
              <span className="font-medium mr-2">{article.reading_time || Math.ceil((article.content?.split(' ').length || 0) / 200)} دقائق</span>
            </div>
            <div>
              <span className="text-neutral-500">المشاهدات:</span>
              <span className="font-medium mr-2">{article.views}</span>
            </div>
          </div>
        </div>

        {/* 12. أزرار التفاعل */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <span>👍</span>
            <span>أعجبني</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-lg transition-colors">
            <span>📤</span>
            <span>مشاركة</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-lg transition-colors">
            <span>🔖</span>
            <span>حفظ</span>
          </button>
        </div>

        {/* 13. نظام التعليقات */}
        <CommentsSection articleId={article.id} articleSlug={params.slug} />
    </article>
  );
}

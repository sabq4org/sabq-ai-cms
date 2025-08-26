import { useState } from "react";
import Link from "next/link";
import { Article } from "@/types";
import { getReadableTimeString } from "@/utils/date-utils";
import { getThumbnailUrl } from "@/lib/production-image-fix";
import OptimizedImage from "../ui/OptimizedImage";
import { RightToLeftIcon } from "../icons";

interface FeaturedNewsBlockProps {
  articles: Article[];
  className?: string;
  categoryClassName?: string;
  slug?: string;
  additionalCategory?: { title: string; slug: string };
}

export function FeaturedNewsBlock({
  articles = [],
  className = "",
  categoryClassName = "",
  slug = "",
  additionalCategory,
}: FeaturedNewsBlockProps) {
  const [isImagesLoaded, setIsImagesLoaded] = useState<Record<string, boolean>>({});
  
  // التحقق ما إذا كنا في الجهاز المكتبي
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
  
  // تحديد إذا كان الخبر جديد (آخر ساعتين)
  const isNewsNew = (dateString?: string) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      return diffTime <= 2 * 60 * 60 * 1000; // ساعتان
    } catch {
      return false;
    }
  };
  
  // تسجيل معلومات تشخيصية
  console.log(`🔍 FeaturedNewsBlock - نوع الجهاز: ${isDesktop ? 'مكتبي' : 'جوال'}`);
  console.log(`🔍 FeaturedNewsBlock - عدد المقالات: ${articles.length}`);

  if (articles.length === 0) {
    console.warn("⚠️ لا توجد مقالات في FeaturedNewsBlock");
    return null;
  }

  const handleImageLoad = (articleId: string) => {
    console.log(`✅ تم تحميل الصورة للمقال: ${articleId}`);
    setIsImagesLoaded((prev) => ({ ...prev, [articleId]: true }));
  };

  const handleImageError = (articleId: string, error: any) => {
    console.error(`❌ خطأ في تحميل الصورة للمقال: ${articleId}`, error);
    // استمر في تعيين الصورة كمحملة حتى لا تظهر حالة التحميل إلى الأبد
    setIsImagesLoaded((prev) => ({ ...prev, [articleId]: true }));
  };

  const firstArticle = articles[0];
  const restArticles = articles.slice(1, 4);

  // تسجيل معلومات عن الصورة الرئيسية
  if (firstArticle) {
    console.log(`🖼️ معلومات الصورة الرئيسية:`, {
      id: firstArticle.id,
      title: firstArticle.title,
      imageUrl: firstArticle.imageUrl,
      slug: firstArticle.slug,
      processedImageUrl: getThumbnailUrl(firstArticle.imageUrl)
    });
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* عنوان القسم */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-2 lg:pb-4 mb-3 lg:mb-5">
        <div className="flex items-center gap-2">
          <h2 className={`text-xl lg:text-2xl font-bold ${categoryClassName}`}>
            {additionalCategory?.title || "الأخبار المميزة"}
          </h2>
        </div>
        <Link
          href={additionalCategory ? `/category/${additionalCategory.slug}` : "/"}
          className="flex items-center text-gray-500 text-sm hover:underline"
        >
          <span>المزيد</span>
          <RightToLeftIcon className="mr-1 h-3 w-3 relative top-px" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        {/* المقال الرئيسي */}
        {firstArticle && (
          <div className="lg:col-span-6">
            <div className="flex flex-col h-full">
              <div className="relative overflow-hidden rounded-lg mb-3" style={{ minHeight: isDesktop ? '300px' : '180px' }}>
                <Link href={`/news/${firstArticle.slug}`}>
                  <OptimizedImage
                    src={getThumbnailUrl(firstArticle.imageUrl)}
                    alt={firstArticle.title || "صورة الخبر"}
                    className="w-full h-full object-cover rounded-lg"
                    width={800}
                    height={500}
                    priority={true}
                    onLoad={() => handleImageLoad(firstArticle.id)}
                    onError={(e) => handleImageError(firstArticle.id, e)}
                    unoptimized={false}
                    showLoader={!isImagesLoaded[firstArticle.id]}
                    showPlaceholder={true}
                  />
                </Link>
              </div>
              <div className="flex-grow">
                {/* الشارات فوق العنوان */}
                <div className="flex items-center gap-2 mb-2 justify-end">
                  {(() => {
                    const name = (firstArticle as any)?.category?.name
                      || (firstArticle as any)?.categories?.name
                      || (firstArticle as any)?.category_name
                      || (firstArticle as any)?.category
                      || null;
                    return name ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/85 text-gray-800 border border-gray-200 backdrop-blur-sm">
                        {(firstArticle as any)?.category?.icon && (
                          <span className="text-xs">{(firstArticle as any).category.icon}</span>
                        )}
                        {name}
                      </span>
                    ) : null;
                  })()}
                  {isNewsNew((firstArticle as any)?.publishedAt) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-emerald-500">
                      <span className="text-xs">🔥</span>
                      جديد
                    </span>
                  )}
                </div>
                <Link href={`/news/${firstArticle.slug}`}>
                  <h3 className="text-xl lg:text-2xl font-bold hover:text-primary-900 line-clamp-3 mb-2">
                    {firstArticle.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mb-2">
                  {firstArticle.author?.name && (
                    <>
                      <span className="font-semibold">{firstArticle.author.name}</span>
                      <span className="mx-1">•</span>
                    </>
                  )}
                  <span>{getReadableTimeString(firstArticle.publishedAt)}</span>
                </p>
                <p className="text-gray-600 line-clamp-2">
                  {firstArticle.excerpt || firstArticle.description || ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* المقالات الأخرى */}
        <div className="lg:col-span-6 grid grid-cols-1 gap-4">
          {restArticles.map((article) => (
            <div
              key={article.id}
              className="flex flex-col lg:flex-row gap-3 lg:items-center border-b border-gray-100 pb-4 last:border-0 last:pb-0"
            >
              <div className="relative lg:w-1/3 overflow-hidden rounded-lg" style={{ minHeight: '120px' }}>
                <Link href={`/news/${article.slug}`}>
                  <OptimizedImage
                    src={getThumbnailUrl(article.imageUrl)}
                    alt={article.title || "صورة الخبر"}
                    className="w-full h-full object-cover rounded-lg"
                    width={400}
                    height={300}
                    onLoad={() => handleImageLoad(article.id)}
                    onError={(e) => handleImageError(article.id, e)}
                    unoptimized={false}
                    showLoader={!isImagesLoaded[article.id]}
                    showPlaceholder={true}
                  />
                </Link>
              </div>
              <div className="lg:w-2/3">
                {/* الشارات فوق العنوان */}
                <div className="flex items-center gap-2 mb-2 justify-end">
                  {(() => {
                    const name = (article as any)?.category?.name
                      || (article as any)?.categories?.name
                      || (article as any)?.category_name
                      || (article as any)?.category
                      || null;
                    return name ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-white/85 text-gray-800 border border-gray-200 backdrop-blur-sm">
                        {(article as any)?.category?.icon && (
                          <span className="text-xs">{(article as any).category.icon}</span>
                        )}
                        {name}
                      </span>
                    ) : null;
                  })()}
                  {isNewsNew((article as any)?.publishedAt) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-emerald-500">
                      <span className="text-xs">🔥</span>
                      جديد
                    </span>
                  )}
                </div>
                <Link href={`/news/${article.slug}`}>
                  <h3 className="text-lg font-bold hover:text-primary-900 line-clamp-2 mb-2">
                    {article.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500">
                  {article.author?.name && (
                    <>
                      <span className="font-semibold">{article.author.name}</span>
                      <span className="mx-1">•</span>
                    </>
                  )}
                  <span>{getReadableTimeString(article.publishedAt)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

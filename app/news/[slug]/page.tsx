/**
 * صفحة عرض الخبر الفردي - /news/[slug]
 * تستخدم جدول news_articles الجديد
 * محسن للجوال مع تصميم متجاوب
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Clock,
  ExternalLink,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Tag,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import "./mobile-styles.css";

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: string;
  published_at?: string;
  scheduled_for?: string;

  // معلومات التصنيف والكاتب
  category_id?: string;
  author_id: string;

  // خصائص الخبر
  breaking: boolean;
  featured: boolean;
  urgent: boolean;
  source?: string;
  location?: string;

  // المحتوى المرئي
  featured_image?: string;
  gallery?: any;
  video_url?: string;

  // SEO
  seo_title?: string;
  seo_description?: string;
  seo_keywords: string[];
  social_image?: string;

  // إحصائيات
  views: number;
  likes: number;
  shares: number;
  reading_time?: number;

  // تفاعل
  allow_comments: boolean;

  // ملخص ذكي
  ai_summary?: string;
  audio_summary_url?: string;

  // معلومات النظام
  metadata?: any;
  created_at: string;
  updated_at: string;

  // العلاقات
  categories?: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  author: {
    id: string;
    name: string;
    email: string;
  };
}

export default function NewsArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { darkMode } = useDarkModeContext();
  const { toast } = useToast();

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsArticle[]>([]);

  // جلب الخبر بواسطة slug
  useEffect(() => {
    if (!slug) return;

    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 جلب الخبر:", slug);

      // جلب الخبر من API الجديد
      const response = await fetch(
        `/api/news?search=${encodeURIComponent(slug)}&limit=1`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "فشل في جلب الخبر");
      }

      // البحث عن الخبر بواسطة slug
      const foundArticle = data.data?.find(
        (article: NewsArticle) =>
          article.slug === slug || article.slug.includes(slug)
      );

      let selectedArticle = foundArticle;

      if (!foundArticle) {
        // محاولة البحث في العنوان
        const titleMatch = data.data?.find(
          (article: NewsArticle) =>
            article.title.toLowerCase().includes(slug.toLowerCase()) ||
            slug
              .toLowerCase()
              .includes(article.title.toLowerCase().substring(0, 20))
        );

        if (titleMatch) {
          selectedArticle = titleMatch;
          setArticle(titleMatch);
        } else {
          setError("الخبر غير موجود");
          return;
        }
      } else {
        setArticle(foundArticle);
      }

      // تحديث عدد المشاهدات
      if (selectedArticle?.id) {
        incrementViews(selectedArticle.id);
      }

      // جلب الأخبار المرتبطة
      if (selectedArticle?.categories?.id) {
        fetchRelatedNews(selectedArticle.categories.id, selectedArticle.id);
      }
    } catch (error) {
      console.error("❌ خطأ في جلب الخبر:", error);
      setError(error instanceof Error ? error.message : "خطأ غير معروف");
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (articleId?: string) => {
    if (!articleId) return;

    try {
      // تحديث المشاهدات (يمكن إضافة API مخصص لهذا لاحقاً)
      console.log("👁️ تحديث المشاهدات للخبر:", articleId);
    } catch (error) {
      console.error("خطأ في تحديث المشاهدات:", error);
    }
  };

  const fetchRelatedNews = async (
    categoryId: string,
    currentArticleId: string
  ) => {
    try {
      const response = await fetch(
        `/api/news?category_id=${categoryId}&limit=5`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // استبعاد الخبر الحالي
          const related = data.data.filter(
            (news: NewsArticle) => news.id !== currentArticleId
          );
          setRelatedNews(related.slice(0, 4));
        }
      }
    } catch (error) {
      console.error("خطأ في جلب الأخبار المرتبطة:", error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "تاريخ غير صحيح";
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt || article?.ai_summary,
          url: window.location.href,
        });
      } else {
        // نسخ الرابط للحافظة
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "تم نسخ الرابط",
          description: "تم نسخ رابط الخبر إلى الحافظة",
        });
      }
    } catch (error) {
      console.error("خطأ في المشاركة:", error);
    }
  };

  if (loading) {
    return (
      <div
        className={cn("min-h-screen", darkMode ? "bg-gray-900" : "bg-gray-50")}
      >
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div
              className={cn(
                "h-8 rounded",
                darkMode ? "bg-gray-800" : "bg-gray-200"
              )}
            ></div>
            <div
              className={cn(
                "h-64 rounded-lg",
                darkMode ? "bg-gray-800" : "bg-gray-200"
              )}
            ></div>
            <div className="space-y-4">
              <div
                className={cn(
                  "h-4 rounded",
                  darkMode ? "bg-gray-800" : "bg-gray-200"
                )}
              ></div>
              <div
                className={cn(
                  "h-4 rounded w-3/4",
                  darkMode ? "bg-gray-800" : "bg-gray-200"
                )}
              ></div>
              <div
                className={cn(
                  "h-4 rounded w-1/2",
                  darkMode ? "bg-gray-800" : "bg-gray-200"
                )}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div
        className={cn(
          "min-h-screen flex items-center justify-center",
          darkMode ? "bg-gray-900" : "bg-gray-50"
        )}
      >
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle
            className={cn(
              "w-16 h-16 mx-auto mb-4",
              darkMode ? "text-red-400" : "text-red-500"
            )}
          />
          <h1
            className={cn(
              "text-2xl font-bold mb-2",
              darkMode ? "text-white" : "text-gray-900"
            )}
          >
            الخبر غير موجود
          </h1>
          <p
            className={cn("mb-6", darkMode ? "text-gray-400" : "text-gray-600")}
          >
            {error || "عذراً، لم نتمكن من العثور على الخبر المطلوب."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article
      className={cn("min-h-screen", darkMode ? "bg-gray-900" : "bg-gray-50")}
    >
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-4 lg:py-8">
        {/* التنقل العلوي - محسن للجوال */}
        <nav className="mb-4 lg:mb-6">
          <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm">
            <Link
              href="/"
              className={cn(
                "hover:underline",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              الرئيسية
            </Link>
            <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
            <Link
              href="/news"
              className={cn(
                "hover:underline",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              الأخبار
            </Link>
            {article.categories && (
              <>
                <ArrowRight className="w-3 h-3 lg:w-4 lg:h-4" />
                <span
                  className={cn(
                    "truncate",
                    darkMode ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  {article.categories.name}
                </span>
              </>
            )}
          </div>
        </nav>

        {/* شارات الخبر - محسن للجوال */}
        <div className="flex flex-wrap gap-1.5 lg:gap-2 mb-4 lg:mb-6">
          {article.breaking && (
            <Badge
              variant="destructive"
              className="bg-red-600 text-white text-xs lg:text-sm px-2 py-1"
            >
              🔴 عاجل
            </Badge>
          )}
          {article.urgent && (
            <Badge
              variant="destructive"
              className="bg-orange-600 text-white text-xs lg:text-sm px-2 py-1"
            >
              ⚡ عاجل جداً
            </Badge>
          )}
          {article.featured && (
            <Badge
              variant="secondary"
              className="bg-blue-600 text-white text-xs lg:text-sm px-2 py-1"
            >
              ⭐ مميز
            </Badge>
          )}
          {article.categories && (
            <Badge
              variant="outline"
              className="text-xs lg:text-sm px-2 py-1"
              style={{
                backgroundColor: article.categories.color || "#gray",
                color: "white",
                borderColor: article.categories.color || "#gray",
              }}
            >
              {article.categories.name}
            </Badge>
          )}
        </div>

        {/* عنوان الخبر - محسن للجوال */}
        <header className="mb-4 lg:mb-6 px-2 lg:px-0">
          <h1
            className={cn(
              "text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-3 lg:mb-4 text-right",
              darkMode ? "text-white" : "text-gray-900"
            )}
          >
            {article.title}
          </h1>

          {article.excerpt && (
            <p
              className={cn(
                "text-base lg:text-lg leading-relaxed text-right",
                darkMode ? "text-gray-300" : "text-gray-700"
              )}
            >
              {article.excerpt}
            </p>
          )}
        </header>

        {/* معلومات الخبر - محسن للجوال */}
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 py-3 lg:py-4 border-y px-2 lg:px-0",
            darkMode ? "border-gray-700" : "border-gray-200"
          )}
        >
          <div className="flex items-center gap-2">
            <User className="w-3 h-3 lg:w-4 lg:h-4" />
            <span
              className={cn(
                "text-xs lg:text-sm",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              {article.author.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 lg:w-4 lg:h-4" />
            <span
              className={cn(
                "text-xs lg:text-sm",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              {formatDate(article.published_at || article.created_at)}
            </span>
          </div>

          {article.reading_time && (
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
              <span
                className={cn(
                  "text-xs lg:text-sm",
                  darkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                {article.reading_time} دقيقة
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
            <span
              className={cn(
                "text-xs lg:text-sm",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              {article.views.toLocaleString("ar-SA")}
            </span>
          </div>

          {article.source && (
            <div className="flex items-center gap-2 sm:w-full lg:w-auto">
              <ExternalLink className="w-3 h-3 lg:w-4 lg:h-4" />
              <span
                className={cn(
                  "text-xs lg:text-sm truncate",
                  darkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                المصدر: {article.source}
              </span>
            </div>
          )}

          {article.location && (
            <div className="flex items-center gap-2">
              <Tag className="w-3 h-3 lg:w-4 lg:h-4" />
              <span
                className={cn(
                  "text-xs lg:text-sm",
                  darkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                {article.location}
              </span>
            </div>
          )}
        </div>

        {/* الصورة المميزة - محسن للجوال */}
        {article.featured_image && (
          <div className="my-6 lg:my-8 px-2 lg:px-0">
            <div className="relative w-full max-w-[92%] mx-auto h-64 md:h-80 lg:h-[500px] rounded-xl overflow-hidden shadow-lg">
              <Image
                src={article.featured_image}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* الملخص الذكي - محسن للجوال */}
        {article.ai_summary && (
          <div
            className={cn(
              "p-4 lg:p-6 rounded-lg mb-4 lg:mb-6 mx-2 lg:mx-0",
              darkMode ? "bg-gray-800" : "bg-blue-50"
            )}
          >
            <h3
              className={cn(
                "font-semibold mb-2 lg:mb-3 text-sm lg:text-base",
                darkMode ? "text-white" : "text-gray-900"
              )}
            >
              📝 ملخص الخبر
            </h3>
            <p
              className={cn(
                "text-sm lg:text-base leading-relaxed text-right",
                darkMode ? "text-gray-300" : "text-gray-700"
              )}
            >
              {article.ai_summary}
            </p>
          </div>
        )}

        {/* محتوى الخبر - محسن للجوال */}
        <div
          className={cn(
            "prose prose-sm md:prose-base lg:prose-lg max-w-none mb-6 lg:mb-8 px-4 lg:px-0 arabic-content",
            darkMode ? "prose-invert" : ""
          )}
        >
          <div
            className={cn(
              "leading-relaxed text-right arabic-content",
              "prose-img:max-w-[92%] prose-img:mx-auto prose-img:rounded-xl prose-img:shadow-md",
              "prose-p:text-right prose-p:mb-4 prose-p:leading-7",
              "prose-h1:text-right prose-h2:text-right prose-h3:text-right",
              "prose-ul:text-right prose-ol:text-right",
              darkMode ? "text-gray-300" : "text-gray-800"
            )}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* الكلمات المفتاحية - محسن للجوال */}
        {article.seo_keywords.length > 0 && (
          <div className="mb-4 lg:mb-6 px-2 lg:px-0">
            <h3
              className={cn(
                "font-semibold mb-3 text-sm lg:text-base",
                darkMode ? "text-white" : "text-gray-900"
              )}
            >
              🏷️ كلمات مفتاحية
            </h3>
            <div className="flex flex-wrap gap-2">
              {article.seo_keywords.map((keyword, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs lg:text-sm px-2 py-1"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* أزرار التفاعل - محسن للجوال */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 py-4 lg:py-6 px-2 lg:px-0">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center justify-center gap-2 text-sm py-3 sm:py-2"
          >
            <Heart className="w-4 h-4" />
            إعجاب ({article.likes})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 text-sm py-3 sm:py-2"
          >
            <Share2 className="w-4 h-4" />
            مشاركة ({article.shares})
          </Button>

          {article.allow_comments && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-2 text-sm py-3 sm:py-2"
            >
              <MessageCircle className="w-4 h-4" />
              تعليقات
            </Button>
          )}
        </div>

        <Separator className="my-8" />

        {/* الأخبار المرتبطة - محسن للجوال */}
        {relatedNews.length > 0 && (
          <section className="mt-8 lg:mt-12 px-2 lg:px-0">
            <h2
              className={cn(
                "text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-right",
                darkMode ? "text-white" : "text-gray-900"
              )}
            >
              أخبار مرتبطة
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {relatedNews.map((news) => (
                <Link
                  key={news.id}
                  href={`/news/${news.slug}`}
                  className={cn(
                    "block p-3 lg:p-4 rounded-lg border transition-all hover:border-blue-500 hover:shadow-md",
                    darkMode
                      ? "border-gray-700 bg-gray-800 hover:bg-gray-750"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  )}
                >
                  {news.featured_image && (
                    <div className="relative w-full h-28 lg:h-32 mb-3 rounded overflow-hidden">
                      <Image
                        src={news.featured_image}
                        alt={news.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <h3
                    className={cn(
                      "font-semibold mb-2 line-clamp-2 text-sm lg:text-base text-right leading-snug",
                      darkMode ? "text-white" : "text-gray-900"
                    )}
                  >
                    {news.title}
                  </h3>

                  {news.excerpt && (
                    <p
                      className={cn(
                        "text-xs lg:text-sm line-clamp-2 text-right mb-2",
                        darkMode ? "text-gray-400" : "text-gray-600"
                      )}
                    >
                      {news.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <span>{news.views} مشاهدة</span>
                    <span>
                      {formatDate(news.published_at || news.created_at)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

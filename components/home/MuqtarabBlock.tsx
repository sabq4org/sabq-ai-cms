"use client";

import { HeroCard } from "@/components/muqtarab/HeroCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Eye,
  RefreshCw,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import MuqtarabCard from "./MuqtarabCard";

interface MuqtarabArticle {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  coverImage?: string;
  readingTime: number;
  publishDate: string;
  views: number;
  tags?: string[];
  isFeatured?: boolean;
  isRecent?: boolean;
  link?: string;

  angle: {
    id?: string;
    title: string;
    slug: string;
    icon?: string;
    themeColor?: string;
  };

  author: {
    id?: string;
    name: string;
    avatar?: string;
  };
}

interface HeroArticle {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  coverImage?: string;
  readingTime: number;
  publishDate: string;
  views: number;
  tags: string[];
  aiScore: number;
  angle: {
    title: string;
    slug: string;
    icon?: string;
    themeColor?: string;
  };
  author: {
    name: string;
    avatar?: string;
  };
}

interface AngleArticle {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  coverImage?: string;
  readingTime: number;
  publishDate: string;
  views: number;
  tags: string[];
  aiScore: number;
  angle: {
    title: string;
    slug: string;
    icon?: string;
    themeColor?: string;
  };
  author: {
    name: string;
    avatar?: string;
  };
}

interface MuqtarabBlockProps {
  className?: string;
}

export default function MuqtarabBlock({ className }: MuqtarabBlockProps) {
  const [articles, setArticles] = useState<MuqtarabArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [heroArticle, setHeroArticle] = useState<HeroArticle | null>(null);
  const [heroLoading, setHeroLoading] = useState(true);
  const [angleArticle, setAngleArticle] = useState<AngleArticle | null>(null);
  const [angleLoading, setAngleLoading] = useState(true);

  // جلب البطاقة المميزة (Hero Article)
  const fetchHeroArticle = async () => {
    try {
      console.log("🔍 [MuqtarabBlock] جاري جلب المقال المميز...");

      const response = await fetch("/api/muqtarab/hero-article", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.heroArticle) {
          console.log(
            "✅ [MuqtarabBlock] تم جلب المقال المميز:",
            data.heroArticle.title
          );
          setHeroArticle(data.heroArticle);
        } else {
          console.log("⚠️ [MuqtarabBlock] لا توجد مقالات مميزة");
        }
      } else {
        console.warn(
          "❌ [MuqtarabBlock] خطأ في جلب المقال المميز:",
          response.status
        );
      }
    } catch (error) {
      console.warn("خطأ في جلب المقال المميز:", error);
    } finally {
      setHeroLoading(false);
    }
  };

  // جلب مقال من زاوية "فكر رقمي"
  const fetchAngleArticle = async () => {
    try {
      console.log("🔍 [MuqtarabBlock] جاري جلب مقال من زاوية فكر رقمي...");

      // أولاً، جلب معرف زاوية "فكر رقمي"
      const angleResponse = await fetch(
        "/api/muqtarab/angles/by-slug/digital-thinking",
        {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      if (angleResponse.ok) {
        const angleData = await angleResponse.json();
        if (angleData.success && angleData.angle) {
          // جلب أحدث مقال من هذه الزاوية
          const articlesResponse = await fetch(
            `/api/muqtarab/angles/${angleData.angle.id}/articles`,
            {
              cache: "no-store",
              headers: {
                "Cache-Control": "no-cache",
              },
            }
          );

          if (articlesResponse.ok) {
            const articlesData = await articlesResponse.json();
            if (articlesData.success && articlesData.articles.length > 0) {
              const latestArticle = articlesData.articles[0]; // أحدث مقال
              console.log(
                "✅ [MuqtarabBlock] تم جلب مقال فكر رقمي:",
                latestArticle.title
              );
              console.log("🖼️ [MuqtarabBlock] معلومات الصورة:", {
                hasImage: !!latestArticle.coverImage,
                imageType: latestArticle.coverImage?.startsWith("data:")
                  ? "Base64"
                  : latestArticle.coverImage?.startsWith("http")
                  ? "URL"
                  : "Local",
                imageLength: latestArticle.coverImage?.length,
                imagePreview: latestArticle.coverImage?.substring(0, 50),
              });

              setAngleArticle({
                id: latestArticle.id,
                title: latestArticle.title,
                excerpt:
                  latestArticle.excerpt ||
                  latestArticle.title.substring(0, 120) + "...",
                slug: latestArticle.slug,
                coverImage: latestArticle.coverImage,
                readingTime: latestArticle.readingTime,
                publishDate: latestArticle.publishDate,
                views: latestArticle.views,
                tags: latestArticle.tags || [],
                aiScore: 85, // درجة افتراضية
                angle: {
                  title: angleData.angle.title,
                  slug: angleData.angle.slug,
                  icon: angleData.angle.icon,
                  themeColor: angleData.angle.themeColor,
                },
                author: latestArticle.author,
              });
            } else {
              console.log(
                "⚠️ [MuqtarabBlock] لا توجد مقالات في زاوية فكر رقمي"
              );
            }
          }
        }
      }
    } catch (error) {
      console.warn("خطأ في جلب مقال زاوية فكر رقمي:", error);
    } finally {
      setAngleLoading(false);
    }
  };

  // جلب المقالات الإبداعية
  const fetchArticles = async (refresh = false) => {
    if (refresh) setRefreshing(true);

    try {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "6");
      params.set("sortBy", "newest");

      const response = await fetch(
        `/api/muqtarab/all-articles?${params.toString()}`,
        {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setArticles(data.articles || []);
        }
      }
    } catch (error) {
      console.error("خطأ في جلب مقالات مقترَب:", error);
    } finally {
      setLoading(false);
      if (refresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    fetchHeroArticle();
    fetchAngleArticle();
  }, []);

  const handleRefresh = () => {
    fetchArticles(true);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-2xl p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100",
        "dark:from-gray-800 dark:via-gray-700/50 dark:to-gray-800",
        "rounded-2xl overflow-hidden",
        "border border-gray-300 dark:border-gray-600",
        "shadow-lg",
        className
      )}
    >
      {/* رأس الوحدة - محسن للهواتف */}
      <div className="relative">
        {/* الهيدر المضغوط للموبايل */}
        <div className="p-2 sm:p-3 md:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            {/* العنوان مع أيقونة مبسطة */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                مقترَب
              </h2>
              <Sparkles className="w-4 h-4 text-blue-500" />
            </div>

            {/* أيقونات مبسطة */}
            <div className="flex items-center gap-1">
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                size="sm"
                variant="ghost"
                className="p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                title="تحديث"
              >
                <RefreshCw
                  className={cn(
                    "w-4 h-4 text-blue-600",
                    refreshing && "animate-spin"
                  )}
                />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
                title="عرض الكل"
                asChild
              >
                <Link href="/muqtarab">
                  <ArrowLeft className="w-4 h-4 text-gray-600" />
                </Link>
              </Button>
            </div>
          </div>

          {/* فلاتر الفئات - محسنة للهواتف */}
          <div className="relative">
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 overflow-x-auto pb-1 sm:pb-2 scrollbar-hide scroll-smooth">
              {categories.map((category) => (
                <button
                  key={category.value || "all"}
                  onClick={() => setSelectedCategory(category.value)}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-1 transition-all duration-200",
                    "px-1.5 py-1 sm:px-2 sm:py-1.5 md:px-3 md:py-2 rounded-md sm:rounded-lg md:rounded-full",
                    "min-w-[30px] sm:min-w-[36px] md:min-w-auto text-center",
                    "touch-manipulation", // تحسين اللمس للهواتف
                    selectedCategory === category.value
                      ? "bg-white dark:bg-gray-800 text-purple-600 dark:text-blue-400 shadow-md scale-105 ring-2 ring-purple-200 dark:ring-blue-500/30"
                      : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 active:bg-white/70 dark:active:bg-gray-800/70"
                  )}
                  title={category.name}
                >
                  <span className="text-xs sm:text-sm md:text-base">
                    {category.emoji}
                  </span>
                  <span className="hidden md:inline text-xs font-medium whitespace-nowrap">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى - محسن للهواتف */}
      <div className="p-2 sm:p-3 md:p-4 lg:p-6">
        {/* البطاقة المميزة (Hero Article) - محسنة للهواتف */}
        {!heroLoading && heroArticle && (
          <div className="mb-4 sm:mb-6 md:mb-8">
            <HeroCard heroArticle={heroArticle} />
          </div>
        )}

        {/* بطاقة مقال الزاوية - محسنة للهواتف */}
        {!angleLoading && angleArticle && (
          <div className="mb-3 sm:mb-4 md:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              <AngleArticleCard angleArticle={angleArticle} />
              {/* مساحة لمقالات إضافية في المستقبل */}
            </div>
          </div>
        )}

        {/* عرض المقالات الإضافية - محسنة للهواتف */}
        {articles.length > 0 && (
          <>
            <div className="space-y-3 sm:space-y-4 md:space-y-6 mb-3 sm:mb-4 md:mb-6">
              {/* البطاقات - شبكة متنوعة محسنة للهواتف */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {articles.slice(0, 2).map((article, index) => (
                  <MuqtarabCard
                    key={article.id}
                    article={article}
                    variant="medium"
                    className="lg:col-span-2"
                  />
                ))}
                {articles.slice(2).map((article, index) => (
                  <MuqtarabCard
                    key={article.id}
                    article={article}
                    variant="small"
                    className="lg:col-span-1"
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* رابط عرض المزيد - يظهر دائماً إذا كان هناك أي محتوى */}
        {(heroArticle || angleArticle || articles.length > 0) && (
          <div className="flex justify-center">
            <Link href="/muqtarab">
              <Button
                variant="outline"
                className="group bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <span>استكشف المزيد من مقترَب</span>
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        )}

        {/* رسالة عدم وجود محتوى - تظهر فقط إذا لم يكن هناك أي محتوى على الإطلاق */}
        {!heroLoading &&
          !angleLoading &&
          !heroArticle &&
          !angleArticle &&
          articles.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-800 dark:to-blue-900/20 flex items-center justify-center">
                <div className="text-3xl">🧠</div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد مقالات إبداعية حالياً
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                نعمل على إنتاج محتوى إبداعي مخصص لك
              </p>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 ml-2" />
                تحديث
              </Button>
            </div>
          )}
      </div>

      {/* مؤشر الذكاء الاصطناعي */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Sparkles className="w-3 h-3" />
          <span>مدعوم بالذكاء الاصطناعي • مخصص حسب اهتماماتك</span>
        </div>
      </div>
    </div>
  );
}

// مكون بطاقة مقال الزاوية
function AngleArticleCard({ angleArticle }: { angleArticle: AngleArticle }) {
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 aspect-square">
      {/* الثلث العلوي - الصورة */}
      <div className="relative h-1/3 overflow-hidden">
        {angleArticle.coverImage ? (
          <img
            src={angleArticle.coverImage}
            alt={angleArticle.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // في حالة فشل تحميل الصورة، إخفاءها وإظهار البديل
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const fallback = parent.querySelector(".fallback-bg");
                if (fallback) {
                  (fallback as HTMLElement).style.display = "flex";
                }
              }
            }}
          />
        ) : null}

        {/* خلفية بديلة - تظهر إذا لم توجد صورة أو فشل تحميلها */}
        <div
          className={`fallback-bg w-full h-full flex items-center justify-center ${
            !angleArticle.coverImage ? "flex" : "hidden"
          }`}
          style={{
            background: `linear-gradient(135deg, ${
              angleArticle.angle.themeColor || "#8B5CF6"
            }20, ${angleArticle.angle.themeColor || "#8B5CF6"}40)`,
          }}
        >
          <div
            className="text-4xl"
            style={{ color: angleArticle.angle.themeColor || "#8B5CF6" }}
          >
            {angleArticle.angle.icon || "💡"}
          </div>
        </div>

        {/* ليبل اسم الزاوية - نفس شكل HeroCard */}
        <div className="absolute top-2 right-2">
          <Badge
            className="backdrop-blur-sm border-0 text-white font-medium"
            variant="outline"
            style={{
              backgroundColor: angleArticle.angle.themeColor || "#8B5CF6",
              borderColor: angleArticle.angle.themeColor || "#8B5CF6",
            }}
          >
            <span className="mr-1">{angleArticle.angle.icon || "💡"}</span>
            {angleArticle.angle.title}
          </Badge>
        </div>
      </div>

      {/* الثلثين السفليين - المحتوى */}
      <div className="h-2/3 p-2 flex flex-col">
        {/* العنوان فقط */}
        <div className="flex-1 flex items-center">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-3 leading-tight">
            {angleArticle.title}
          </h3>
        </div>

        {/* الأيقونات وزر القراءة */}
        <div className="space-y-1">
          {/* معلومات صغيرة */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="truncate max-w-16">
                {angleArticle.author.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{angleArticle.readingTime}د</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{angleArticle.views}</span>
              </div>
            </div>
          </div>

          {/* زر القراءة */}
          <Link href={`/muqtarab/${angleArticle.slug}`} className="block">
            <Button
              size="sm"
              className="w-full text-xs py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: angleArticle.angle.themeColor || "#8B5CF6",
                color: "white",
              }}
            >
              <BookOpen className="w-3 h-3 ml-1" />
              قراءة المقال
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

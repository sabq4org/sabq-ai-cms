"use client";

import { HeroCard } from "@/components/muqtarab/HeroCard";
import WithMuqtarabErrorBoundary from "@/components/muqtarab/MuqtarabErrorBoundary";
import { MuqtarabPageSkeleton } from "@/components/muqtarab/MuqtarabSkeletons";
import { SafeMuqtarabWrapper } from "@/components/muqtarab/SafeMuqtarabWrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Angle } from "@/types/muqtarab";
import {
  BookOpen,
  Calendar,
  Eye,
  Lightbulb,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
// import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// ملاحظة: لا يمكن تصدير metadata من صفحة عميل.
// يمكن لاحقًا نقل الميتاداتا إلى ملف layout أو صفحة خادومية.

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

interface FeaturedArticle {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  coverImage?: string;
  readingTime: number;
  publishDate: string;
  views: number;
  tags: string[];
  angle: {
    id: string;
    title: string;
    slug: string;
    icon?: string;
    themeColor?: string;
  };
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface MuqtarabStats {
  totalAngles: number;
  publishedAngles: number;
  totalArticles: number;
  publishedArticles: number;
  totalViews: number;
  displayViews: {
    raw: number;
    formatted: string;
  };
}

function MuqtaribPageContent() {
  const [angles, setAngles] = useState<Angle[]>([]);
  const [filteredAngles, setFilteredAngles] = useState<Angle[]>([]);
  const [heroArticle, setHeroArticle] = useState<HeroArticle | null>(null);
  const [featuredArticles, setFeaturedArticles] = useState<FeaturedArticle[]>(
    []
  );
  const [stats, setStats] = useState<MuqtarabStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // فلاتر التصنيف
  const filters = [
    { id: "all", label: "جميع الزوايا", icon: BookOpen },
    { id: "featured", label: "مميزة", icon: Sparkles },
    { id: "trending", label: "الأكثر تفاعلاً", icon: TrendingUp },
    { id: "recent", label: "الأحدث", icon: Calendar },
    { id: "tech", label: "تقنية", icon: Lightbulb },
  ];

  // جلب الزوايا والمقال المميز مُحسّن
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔍 جاري جلب بيانات مُقترب...");

        // استخدام endpoint محسّن واحد بدلاً من عدة calls
        const optimizedResponse = await fetch("/api/muqtarab/optimized-page", {
          // إزالة no-cache للسماح بـ browser caching
          headers: {
            Accept: "application/json",
          },
        });

        if (optimizedResponse.ok) {
          const data = await optimizedResponse.json();

          if (data.success) {
            console.log("✅ تم جلب البيانات المُحسّنة:", {
              angles: data.angles?.length || 0,
              heroArticle: data.heroArticle ? "✓" : "✗",
              featuredArticles: data.featuredArticles?.length || 0,
              cached: data.cached,
            });

            // إزالة أي زوايا مكررة بحسب slug/id
            const seen = new Set<string>();
            const uniqueAngles = (data.angles || []).filter((a: any) => {
              const key = (a.slug || a.id || "").toString().toLowerCase();
              if (!key) return true;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            setAngles(uniqueAngles);
            setFilteredAngles(uniqueAngles);
            setHeroArticle(data.heroArticle);
            setStats(data.stats);
            // إزالة تكرار المقالات المميزة بحسب slug/id
            const seenFa = new Set<string>();
            const uniqueFeatured = (data.featuredArticles || []).filter(
              (art: any) => {
                const key = (art.slug || art.id || "").toString().toLowerCase();
                if (!key) return true;
                if (seenFa.has(key)) return false;
                seenFa.add(key);
                return true;
              }
            );
            setFeaturedArticles(uniqueFeatured);

            return; // نجح التحميل المُحسّن
          }
        }

        // Fallback: استخدام الطريقة القديمة في حالة فشل الـ optimized endpoint
        console.log("⚠️ استخدام fallback للتحميل التقليدي...");

        // جلب الزوايا بشكل منفصل
        const anglesResponse = await fetch("/api/muqtarab/angles", {
          next: { revalidate: 30 },
        });
        if (anglesResponse.ok) {
          const anglesData = await anglesResponse.json();
          setAngles(anglesData.angles || []);
          setFilteredAngles(anglesData.angles || []);
        }

        // جلب المقال المميز (اختياري)
        try {
          const heroResponse = await fetch("/api/muqtarab/hero-article", {
            cache: "no-store",
          });
          if (heroResponse.ok) {
            const heroData = await heroResponse.json();
            if (heroData.success && heroData.heroArticle) {
              setHeroArticle(heroData.heroArticle);
            }
          }
        } catch (heroError) {
          console.warn("تحذير: فشل في جلب المقال المميز:", heroError);
        }

        // جلب الإحصائيات (اختياري)
        try {
          const statsResponse = await fetch("/api/muqtarab/stats", {
            next: { revalidate: 60 },
          });
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            if (statsData.success && statsData.stats) {
              setStats(statsData.stats);
            }
          }
        } catch (statsError) {
          console.warn("تحذير: فشل في جلب الإحصائيات:", statsError);
        }
      } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        toast.error("حدث خطأ في التحميل");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // فلترة الزوايا
  useEffect(() => {
    let filtered = angles;

    // فلترة بالبحث
    if (searchQuery) {
      filtered = filtered.filter(
        (angle) =>
          angle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          angle.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // فلترة بالتصنيف
    switch (selectedFilter) {
      case "featured":
        filtered = filtered.filter((angle) => angle.isFeatured);
        break;
      case "recent":
        filtered = filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "trending":
        // يمكن إضافة منطق ترتيب حسب التفاعل
        filtered = filtered.sort(
          (a, b) => (b.articlesCount || 0) - (a.articlesCount || 0)
        );
        break;
    }

    setFilteredAngles(filtered);
  }, [angles, searchQuery, selectedFilter]);

  // Loading state مع Skeleton
  if (loading) {
    return <MuqtarabPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section - مماثل لصفحة الأخبار */}
      <section className="relative py-16 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl bg-blue-200/30 dark:bg-blue-900/20" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl bg-purple-200/30 dark:bg-purple-900/20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl">
              <BookOpen className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              مُقترب
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
              زوايا فكرية متخصصة في مختلف المجالات
            </p>

            {/* إحصائيات مقترب */}
            {stats && (
              <div className="mt-6 inline-flex flex-wrap justify-center items-center gap-4 md:gap-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-4 md:px-6 py-3 shadow-lg">
                <div className="text-center px-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats ? stats.publishedAngles : filteredAngles.length}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    زاوية
                  </div>
                </div>

                <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>

                <div className="text-center px-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats
                        ? stats.publishedArticles
                        : featuredArticles.length + (heroArticle ? 1 : 0)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    مقال
                  </div>
                </div>

                <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>

                <div className="text-center px-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats
                        ? stats.displayViews.formatted
                        : heroArticle
                        ? (heroArticle.views / 1000).toFixed(1) + "K"
                        : "0"}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    قراءة
                  </div>
                </div>
              </div>
            )}

            {/* Loading indicator for stats */}
            {!stats && (
              <div className="mt-6 inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-sm">جاري تحميل الإحصائيات...</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* المقال المميز */}
      {heroArticle && (
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          {/* عنوان بسيط */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                المقال المميز
              </h2>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              اكتشف أحدث المقالات المميزة في زوايا مُقترب
            </p>
          </div>

          {/* بطاقة مميزة محسنة للموبايل */}
          <div className="md:hidden">
            <MobileHeroCard heroArticle={heroArticle} />
          </div>
          <div className="hidden md:block">
            <HeroCard heroArticle={heroArticle} className="mb-8" />
          </div>
        </div>
      )}

      {/* المقالات المختارة من الزوايا */}
      {featuredArticles.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 bg-green-600 rounded-full"></div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                مقالات مختارة
              </h2>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              اكتشف أحدث المقالات من مختلف الزوايا الفكرية
            </p>
          </div>

          {/* شبكة المقالات المختارة */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featuredArticles.slice(0, 6).map((article) => (
              <FeaturedArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}

      {/* البحث والفلاتر */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <div className="bg-card rounded-lg border p-4 md:p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* شريط البحث */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="ابحث في الزوايا..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* فلاتر التصنيف */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {filters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <Button
                    key={filter.id}
                    size="sm"
                    variant={
                      selectedFilter === filter.id ? "default" : "outline"
                    }
                    onClick={() => setSelectedFilter(filter.id)}
                    className="whitespace-nowrap"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {filter.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* الزوايا المميزة - عرض فقط إذا كانت هناك زوايا مميزة */}
        {selectedFilter === "all" &&
          angles.some((angle) => angle.isFeatured) && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  الزوايا المميزة
                </h2>
                <Badge variant="secondary" className="text-xs">
                  {angles.filter((angle) => angle.isFeatured).length} زاوية
                </Badge>
              </div>

              {/* عرض مختلف للموبايل والديسكتوب */}
              <div className="md:hidden">
                {/* شبكة صغيرة للموبايل */}
                <div className="grid grid-cols-2 gap-3">
                  {angles
                    .filter((angle) => angle.isFeatured)
                    .slice(0, 4)
                    .map((angle) => (
                      <MobileFeaturedAngleCard key={angle.id} angle={angle} />
                    ))}
                </div>
              </div>
              <div className="hidden md:grid lg:grid-cols-2 gap-6">
                {angles
                  .filter((angle) => angle.isFeatured)
                  .slice(0, 2)
                  .map((angle) => (
                    <FeaturedAngleCard key={angle.id} angle={angle} />
                  ))}
              </div>
            </div>
          )}

        {/* شبكة الزوايا - محسنة للموبايل */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-3xl font-bold text-gray-900">
              {selectedFilter === "all"
                ? "باقي الزوايا"
                : filters.find((f) => f.id === selectedFilter)?.label}
            </h2>
            <div className="text-xs md:text-sm text-gray-500">
              {/* عدد الزوايا بعد استبعاد المميزة في حالة الفلتر "all" */}
              {selectedFilter === "all"
                ? filteredAngles.filter((angle) => !angle.isFeatured).length
                : filteredAngles.length}{" "}
              زاوية
            </div>
          </div>

          {/* تصفية الزوايا لاستبعاد المميزة عند عرض "جميع الزوايا" لتجنب التكرار */}
          {(() => {
            // في حالة الفلتر "all"، نستبعد الزوايا المميزة لأنها معروضة في القسم أعلاه
            const displayAngles =
              selectedFilter === "all"
                ? filteredAngles.filter((angle) => !angle.isFeatured)
                : filteredAngles;

            return displayAngles.length === 0 ? (
              <div className="text-center py-12 md:py-16">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Search className="w-8 h-8 md:w-12 md:h-12 text-gray-400" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  لا توجد زوايا
                </h3>
                <p className="text-sm md:text-base text-gray-500">
                  {selectedFilter === "all"
                    ? "لا توجد زوايا إضافية غير المميزة"
                    : "جرب تغيير معايير البحث أو الفلتر"}
                </p>
              </div>
            ) : (
              <>
                {/* عرض مختلف للموبايل والديسكتوب */}
                <div className="md:hidden">
                  {/* قائمة مبسطة للموبايل */}
                  <div className="space-y-3">
                    {displayAngles.map((angle) => (
                      <MobileAngleCard key={angle.id} angle={angle} />
                    ))}
                  </div>
                </div>
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayAngles.map((angle) => (
                    <AngleCard key={angle.id} angle={angle} />
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* فوتر مقترب الرسمي */}
      <MuqtarabFooter stats={stats} />
    </div>
  );
}

// مكون المقال المميز للموبايل
function MobileHeroCard({ heroArticle }: { heroArticle: HeroArticle }) {
  return (
    <Card className="flex gap-3 items-start p-4 rounded-xl shadow-sm bg-white border">
      {heroArticle.coverImage && (
        <div className="relative w-20 h-20 flex-shrink-0">
          <Image
            src={heroArticle.coverImage}
            alt={heroArticle.title}
            fill
            className="rounded-md object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold leading-snug line-clamp-2 mb-2">
          {heroArticle.title}
        </div>
        <div className="text-xs text-gray-500 line-clamp-2 mb-3">
          {heroArticle.excerpt}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{heroArticle.readingTime} د</span>
          </div>
          <Link
            href={`/muqtarab/articles/${heroArticle.slug || heroArticle.id}`}
          >
            <Button size="sm" className="text-xs px-3 py-1 h-7">
              قراءة
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

// مكون الزاوية المميزة للموبايل
function MobileFeaturedAngleCard({ angle }: { angle: Angle }) {
  return (
    <Card className="p-3 rounded-xl shadow-sm bg-white text-center">
      <div className="relative w-16 h-16 mx-auto mb-2">
        {angle.coverImage ? (
          <Image
            src={angle.coverImage}
            alt={angle.title}
            fill
            className="rounded-lg object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        )}
        {angle.isFeatured && (
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>
        )}
      </div>
      <h3 className="text-sm font-semibold line-clamp-2 mb-1">{angle.title}</h3>
      <div className="text-xs text-gray-500 mb-2">
        {angle.articlesCount || 0} مقالة
      </div>
      <Link href={`/muqtarab/${angle.slug}`}>
        <Button size="sm" variant="outline" className="text-xs w-full">
          استكشاف
        </Button>
      </Link>
    </Card>
  );
}

// مكون الزاوية للموبايل
function MobileAngleCard({ angle }: { angle: Angle }) {
  return (
    <Card className="flex items-center gap-3 p-3 rounded-lg shadow-sm bg-white">
      <div className="relative w-12 h-12 flex-shrink-0">
        {angle.coverImage ? (
          <Image
            src={angle.coverImage}
            alt={angle.title}
            fill
            className="rounded-md object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 rounded-md flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold line-clamp-1">{angle.title}</h3>
          {angle.isFeatured && (
            <Sparkles className="w-3 h-3 text-yellow-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
          {angle.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400">
            {angle.articlesCount || 0} مقالة
          </div>
          <Link href={`/muqtarab/${angle.slug}`}>
            <Button size="sm" variant="ghost" className="text-xs px-2 py-1 h-6">
              <Eye className="w-3 h-3 ml-1" />
              عرض
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

// مكون بطاقة الزاوية العادية
function AngleCard({ angle }: { angle: Angle }) {
  return (
    <Card className="group rounded-2xl overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-48 w-full overflow-hidden">
        {angle.coverImage ? (
          <Image
            src={angle.coverImage}
            alt={angle.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-white/80" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-bold text-lg line-clamp-2">
            {angle.title}
          </h3>
        </div>

        {angle.isFeatured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-yellow-500 text-yellow-900 border-0">
              <Sparkles className="w-3 h-3 ml-1" />
              مميزة
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{angle.articlesCount || 0} مقالة</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{angle.author?.name}</span>
          </div>
        </div>

        {angle.description && (
          <p className="text-gray-700 text-sm line-clamp-3 leading-relaxed">
            {angle.description}
          </p>
        )}

        <Link href={`/muqtarab/${angle.slug}`}>
          <Button
            variant="ghost"
            className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-8"
          >
            <Eye className="w-4 h-4 ml-2" />
            استكشاف الزاوية
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// مكون بطاقة المقال المختار
function FeaturedArticleCard({ article }: { article: FeaturedArticle }) {
  const themeColor = article.angle?.themeColor || "#3B82F6"; // Added optional chaining
  return (
    <Card className="group rounded-xl overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-40 md:h-48 w-full overflow-hidden">
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
            <BookOpen className="w-12 h-12 md:w-16 md:h-16 text-white/80" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        {/* شارة الزاوية */}
        <div className="absolute top-3 right-3">
          <Badge
            className="text-xs border-0 text-white shadow-lg"
            style={{
              backgroundColor: themeColor,
            }}
          >
            {article.angle?.title} {/* Added optional chaining */}
          </Badge>
        </div>
      </div>

      <CardContent className="p-3 md:p-4 space-y-2 md:space-y-3">
        <h3 className="font-bold text-sm md:text-lg text-gray-900 line-clamp-2 leading-tight">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="text-xs md:text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{article.readingTime} د</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{article.views}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-gray-500">{article.author?.name}</div>
          <Link href={`/muqtarab/articles/${article.slug}`}>
            <Button
              size="sm"
              className="text-xs px-3 py-1 h-7"
              style={{
                backgroundColor: themeColor,
              }}
            >
              قراءة
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// مكون بطاقة الزاوية المميزة
function FeaturedAngleCard({ angle }: { angle: Angle }) {
  return (
    <Card className="group rounded-2xl overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
      <div className="flex h-64">
        <div className="relative w-1/2 overflow-hidden">
          {angle.coverImage ? (
            <Image
              src={angle.coverImage}
              alt={angle.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
              <BookOpen className="w-20 h-20 text-white/80" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="w-1/2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-yellow-500 text-yellow-900 border-0">
                <Sparkles className="w-3 h-3 ml-1" />
                زاوية مميزة
              </Badge>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
              {angle.title}
            </h3>

            {angle.description && (
              <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                {angle.description}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{angle.articlesCount || 0} مقالة</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{angle.author?.name}</span>
              </div>
            </div>

            <Link href={`/muqtarab/${angle.slug}`}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Eye className="w-4 h-4 ml-2" />
                استكشاف الزاوية
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

// فوتر مقترب الرسمي
function MuqtarabFooter({ stats }: { stats: MuqtarabStats | null }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 border-t border-gray-200 dark:border-gray-700">
      {/* خلفية ديناميكية */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl bg-blue-200/20 dark:bg-blue-900/10" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-3xl bg-indigo-200/20 dark:bg-indigo-900/10" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* الجزء العلوي */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* معلومات مقترب */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  مُقترب
                </h3>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    زوايا فكرية متخصصة
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              منصة رائدة تقدم محتوى فكري عميق ومتنوع في مختلف المجالات، من
              التقنية والثقافة إلى الفكر المعاصر والتحليل العميق. نهدف إلى إثراء
              المحتوى العربي بزوايا نظر متميزة وأفكار مبتكرة.
            </p>

            {/* إحصائيات حقيقية */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Eye className="w-4 h-4 text-blue-500" />
                <span>
                  {stats ? stats.displayViews.formatted : "0"} مشاهدة إجمالية
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <BookOpen className="w-4 h-4 text-green-500" />
                <span>{stats ? stats.publishedAngles : "0"} زاوية منشورة</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>{stats ? stats.publishedArticles : "0"} مقال منشور</span>
              </div>
            </div>
          </div>

          {/* روابط سريعة */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              الزوايا المتاحة
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/muqtarab"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  جميع الزوايا
                </Link>
              </li>
              <li>
                <Link
                  href="/muqtarab?filter=featured"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  الزوايا المميزة
                </Link>
              </li>
              <li>
                <Link
                  href="/muqtarab?filter=trending"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  الأكثر تفاعلاً
                </Link>
              </li>
              <li>
                <Link
                  href="/muqtarab?filter=recent"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  الأحدث
                </Link>
              </li>
            </ul>
          </div>

          {/* معلومات التواصل */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              تواصل معنا
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4 text-blue-500" />
                <span>فريق مقترب التحريري</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <BookOpen className="w-4 h-4 text-green-500" />
                <span>اقتراح زاوية جديدة</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span>مشاركة فكرة</span>
              </div>
            </div>

            {/* أزرار التواصل الاجتماعي */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="#"
                className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                title="تويتر"
              >
                <svg
                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                title="واتساب"
              >
                <svg
                  className="w-4 h-4 text-green-600 dark:text-green-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                title="تيليجرام"
              >
                <svg
                  className="w-4 h-4 text-purple-600 dark:text-purple-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* خط فاصل */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* معلومات حقوق النشر */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>© {currentYear} مُقترب - جزء من منصة</span>
              <Link
                href="/"
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                سبق الذكية
              </Link>
            </div>

            {/* روابط سياسات */}
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/privacy-policy"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                سياسة الخصوصية
              </Link>
              <Link
                href="/terms-of-use"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                شروط الاستخدام
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                تواصل معنا
              </Link>
            </div>
          </div>

          {/* رسالة تشجيعية */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30">
            <div className="flex items-center justify-center gap-2 text-center">
              <span className="text-gray-700 dark:text-gray-300 text-sm">
                نسعى لإثراء المحتوى العربي بأفكار عميقة ونقاشات هادفة
              </span>
              <Sparkles className="w-4 h-4 text-blue-500" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function MuqtaribPage() {
  return (
    <SafeMuqtarabWrapper>
      <WithMuqtarabErrorBoundary>
        <MuqtaribPageContent />
      </WithMuqtarabErrorBoundary>
    </SafeMuqtarabWrapper>
  );
}

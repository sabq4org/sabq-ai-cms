"use client";

import { HeroCard } from "@/components/muqtarab/HeroCard";
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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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

export default function MuqtaribPage() {
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

  // جلب الزوايا والمقال المميز
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔍 جاري جلب بيانات مُقترب...");

        // جلب الزوايا
        const anglesResponse = await fetch("/api/muqtarab/angles", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (anglesResponse.ok) {
          const anglesData = await anglesResponse.json();
          console.log("✅ تم جلب الزوايا:", anglesData.angles?.length || 0);
          setAngles(anglesData.angles || []);
          setFilteredAngles(anglesData.angles || []);
        } else {
          console.error("❌ فشل في جلب الزوايا:", anglesResponse.status);
          toast.error("فشل في تحميل الزوايا");
        }

        // جلب المقال المميز
        try {
          const heroResponse = await fetch("/api/muqtarab/hero-article", {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          });

          if (heroResponse.ok) {
            const heroData = await heroResponse.json();
            if (heroData.success && heroData.heroArticle) {
              console.log(
                "✅ تم جلب المقال المميز:",
                heroData.heroArticle.title
              );
              setHeroArticle(heroData.heroArticle);
            } else {
              console.log("📝 لا يوجد مقال مميز متاح");
            }
          }
        } catch (heroError) {
          console.warn("تحذير: فشل في جلب المقال المميز:", heroError);
          // لا نظهر خطأ للمستخدم هنا لأن المقال المميز اختياري
        }

        // جلب الإحصائيات الحقيقية
        try {
          const statsResponse = await fetch("/api/muqtarab/stats", {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          });

          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            if (statsData.success && statsData.stats) {
              console.log("📊 تم جلب الإحصائيات:", {
                زوايا: statsData.stats.publishedAngles,
                مقالات: statsData.stats.publishedArticles,
                مشاهدات: statsData.stats.totalViews,
              });
              setStats(statsData.stats);
            }
          }
        } catch (statsError) {
          console.warn("تحذير: فشل في جلب الإحصائيات:", statsError);
          // الإحصائيات اختيارية
        }

        // جلب المقالات المختارة
        try {
          const featuredResponse = await fetch(
            "/api/muqtarab/featured-articles",
            {
              cache: "no-store",
              headers: {
                "Cache-Control": "no-cache",
              },
            }
          );

          if (featuredResponse.ok) {
            const featuredData = await featuredResponse.json();
            if (featuredData.success && featuredData.articles) {
              console.log(
                "✅ تم جلب المقالات المختارة:",
                featuredData.articles.length
              );
              setFeaturedArticles(featuredData.articles);
            } else {
              console.log("📝 لا توجد مقالات مختارة متاحة");
            }
          }
        } catch (featuredError) {
          console.warn("تحذير: فشل في جلب المقالات المختارة:", featuredError);
          // لا نظهر خطأ للمستخدم هنا لأن المقالات المختارة اختيارية
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل مُقترب...</p>
        </div>
      </div>
    );
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
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.publishedAngles}</div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">زاوية</div>
                </div>
                
                <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
                
                <div className="text-center px-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.publishedArticles}</div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">مقال</div>
                </div>
                
                <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
                
                <div className="text-center px-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.displayViews.formatted}</div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">قراءة</div>
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

        {/* الزوايا المميزة */}
        {selectedFilter === "all" && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                الزوايا المميزة
              </h2>
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
                ? "جميع الزوايا"
                : filters.find((f) => f.id === selectedFilter)?.label}
            </h2>
            <div className="text-xs md:text-sm text-gray-500">
              {filteredAngles.length} زاوية
            </div>
          </div>

          {filteredAngles.length === 0 ? (
            <div className="text-center py-12 md:py-16">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Search className="w-8 h-8 md:w-12 md:h-12 text-gray-400" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                لا توجد زوايا
              </h3>
              <p className="text-sm md:text-base text-gray-500">
                جرب تغيير معايير البحث أو الفلتر
              </p>
            </div>
          ) : (
            <>
              {/* عرض مختلف للموبايل والديسكتوب */}
              <div className="md:hidden">
                {/* قائمة مبسطة للموبايل */}
                <div className="space-y-3">
                  {filteredAngles.map((angle) => (
                    <MobileAngleCard key={angle.id} angle={angle} />
                  ))}
                </div>
              </div>
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAngles.map((angle) => (
                  <AngleCard key={angle.id} angle={angle} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
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
            href={`/muqtarab/${heroArticle.angle.slug}/${
              heroArticle.slug || heroArticle.id
            }`}
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
              backgroundColor: article.angle.themeColor || "#3B82F6",
            }}
          >
            {article.angle.title}
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
          <div className="text-xs text-gray-500">{article.author.name}</div>
          <Link href={`/muqtarab/${article.angle.slug}/${article.slug}`}>
            <Button
              size="sm"
              className="text-xs px-3 py-1 h-7"
              style={{
                backgroundColor: article.angle.themeColor || "#3B82F6",
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

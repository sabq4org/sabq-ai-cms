"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Angle } from "@/types/muqtarab";
import { HeroCard } from "@/components/muqtarab/HeroCard";
import {
  BookOpen,
  Calendar,
  Eye,
  Lightbulb,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Users,
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

export default function MuqtaribPage() {
  const [angles, setAngles] = useState<Angle[]>([]);
  const [filteredAngles, setFilteredAngles] = useState<Angle[]>([]);
  const [heroArticle, setHeroArticle] = useState<HeroArticle | null>(null);
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
              console.log("✅ تم جلب المقال المميز:", heroData.heroArticle.title);
              setHeroArticle(heroData.heroArticle);
            } else {
              console.log("📝 لا يوجد مقال مميز متاح");
            }
          }
        } catch (heroError) {
          console.warn("تحذير: فشل في جلب المقال المميز:", heroError);
          // لا نظهر خطأ للمستخدم هنا لأن المقال المميز اختياري
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - محسن للموبايل */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-20">
          <div className="text-center">
            {/* شارة سبق - أصغر للموبايل */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-4 md:mb-6">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-medium">منصة سبق الذكية</span>
            </div>

            {/* العنوان - متجاوب */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-6">مُقتَرب</h1>

            {/* الوصف - مختصر للموبايل */}
            <p className="text-sm md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-2">
              <span className="md:hidden">
                زوايا فكرية متخصصة في مختلف المجالات والثقافة والتقنية
              </span>
              <span className="hidden md:block">
                زوايا فكرية متخصصة تقدم محتوى عميق ومتميز في مختلف المجالات،
                <br />
                من التقنية إلى الثقافة والفكر المعاصر
              </span>
            </p>

            {/* الأزرار - محسنة للموبايل */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/admin/muqtarab/angles/new">
                <Button
                  size="sm"
                  className="bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  <span className="md:hidden">زاوية جديدة</span>
                  <span className="hidden md:inline">اقتراح زاوية جديدة</span>
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
              >
                <BookOpen className="w-4 h-4 ml-2" />
                <span className="md:hidden">استكشاف</span>
                <span className="hidden md:inline">استكشف الزوايا</span>
              </Button>
            </div>
          </div>
        </div>

        {/* موجات زخرفية - أصغر للموبايل */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-6 md:h-12"
          >
            <path
              d="M0,0V60c0,0,200,50,600,0s600,50,600,0V0"
              className="fill-current text-gray-50"
            ></path>
          </svg>
        </div>
      </div>

      {/* المقال المميز (Hero Article) - محسن للموبايل */}
      {heroArticle && (
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          {/* عنوان مختصر للموبايل */}
          <div className="text-center mb-4 md:mb-6">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
              <span className="md:hidden">المقال المميز</span>
              <span className="hidden md:inline">المقال المميز</span>
            </h2>
            <p className="text-sm md:text-base text-gray-600 hidden md:block">
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

      {/* البحث والفلاتر - محسن للموبايل */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="bg-white rounded-xl md:rounded-2xl shadow-md md:shadow-lg p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col gap-3 md:gap-4">
            {/* شريط البحث - محسن للموبايل */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <Input
                placeholder="ابحث في الزوايا..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 h-10 md:h-12 text-sm md:text-lg rounded-lg md:rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* فلاتر التصنيف - محسنة للموبايل */}
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
                    className="whitespace-nowrap rounded-lg md:rounded-xl text-xs md:text-sm"
                  >
                    <Icon className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                    {filter.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* الزوايا المميزة - محسنة للموبايل */}
        {selectedFilter === "all" && (
          <div className="mb-8 md:mb-12">
            <h2 className="text-lg md:text-3xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
              <Sparkles className="w-5 h-5 md:w-8 md:h-8 text-yellow-500" />
              الزوايا المميزة
            </h2>

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
              <p className="text-sm md:text-base text-gray-500">جرب تغيير معايير البحث أو الفلتر</p>
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
          <Link href={`/muqtarab/${heroArticle.angle.slug}/${heroArticle.id}`}>
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
      <h3 className="text-sm font-semibold line-clamp-2 mb-1">
        {angle.title}
      </h3>
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
          <h3 className="text-sm font-semibold line-clamp-1">
            {angle.title}
          </h3>
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

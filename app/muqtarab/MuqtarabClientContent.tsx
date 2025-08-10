"use client";

import { HeroCard } from "@/components/muqtarab/HeroCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Brain,
  Calendar,
  Eye,
  Lightbulb,
  Rocket,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo, useMemo, useState } from "react";

interface MuqtarabClientContentProps {
  initialData: {
    angles: any[];
    heroArticle: any;
    featuredArticles: any[];
    stats: any;
  };
}

// مكون البطاقة المحسّن مع memo
const AngleCard = memo(({ angle }: { angle: any }) => {
  const angleIcon = getAngleIcon(angle.icon);
  const themeColor = angle.themeColor || "blue";

  return (
    <Link
      href={`/muqtarab/${angle.slug}`}
      prefetch={false}
      className="block h-full transform transition-all duration-300 hover:scale-105"
    >
      <Card className="h-full overflow-hidden border-gray-200 dark:border-gray-700 hover:shadow-xl">
        <div
          className={`h-2 bg-gradient-to-r from-${themeColor}-500 to-${themeColor}-600`}
        />

        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div
              className={`p-3 rounded-xl bg-${themeColor}-100 dark:bg-${themeColor}-900/30`}
            >
              {angleIcon}
            </div>
            {angle.articleCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {angle.articleCount} مقال
              </Badge>
            )}
          </div>

          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white line-clamp-1">
            {angle.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 line-clamp-2 text-sm mb-4">
            {angle.description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {angle.views?.toLocaleString() || 0}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(angle.createdAt).toLocaleDateString("ar-SA")}
              </span>
            </div>
            {angle.featured && <Sparkles className="w-4 h-4 text-yellow-500" />}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

AngleCard.displayName = "AngleCard";

// مكون المقال المميز مع memo
const FeaturedArticleCard = memo(({ article }: { article: any }) => {
  return (
    <Link
      href={`/muqtarab/articles/${article.slug}`}
      prefetch={false}
      className="block group"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
        {article.coverImage && (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}

        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {article.angle?.title || "عام"}
            </Badge>
            <span className="text-xs text-gray-500">
              {article.readingTime || 5} دقائق قراءة
            </span>
          </div>

          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {article.excerpt}
          </p>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {article.author?.avatar && (
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span className="text-gray-600 dark:text-gray-400">
                {article.author?.name || "مُقترب"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-500">
              <Eye className="w-3 h-3" />
              <span>{article.views?.toLocaleString() || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

FeaturedArticleCard.displayName = "FeaturedArticleCard";

function MuqtarabClientContent({ initialData }: MuqtarabClientContentProps) {
  const { angles, heroArticle, featuredArticles, stats } = initialData;

  // حالات البحث والفلترة فقط (لا جلب بيانات)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // الفلاتر
  const filters = [
    { id: "all", label: "جميع الزوايا", icon: BookOpen },
    { id: "featured", label: "مميزة", icon: Sparkles },
    { id: "trending", label: "الأكثر تفاعلاً", icon: TrendingUp },
    { id: "recent", label: "الأحدث", icon: Calendar },
    { id: "tech", label: "تقنية", icon: Lightbulb },
  ];

  // فلترة الزوايا بناءً على البحث والفلتر المحدد
  const filteredAngles = useMemo(() => {
    let filtered = angles;

    // تطبيق فلتر البحث
    if (searchQuery) {
      filtered = filtered.filter(
        (angle) =>
          angle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          angle.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // تطبيق فلتر التصنيف
    switch (selectedFilter) {
      case "featured":
        filtered = filtered.filter((angle) => angle.featured);
        break;
      case "trending":
        filtered = [...filtered].sort(
          (a, b) => (b.views || 0) - (a.views || 0)
        );
        break;
      case "recent":
        filtered = [...filtered].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "tech":
        filtered = filtered.filter((angle) =>
          angle.tags?.some((tag: string) =>
            ["تقنية", "ذكاء اصطناعي", "برمجة", "تكنولوجيا"].includes(
              tag.toLowerCase()
            )
          )
        );
        break;
    }

    return filtered;
  }, [angles, searchQuery, selectedFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* القسم الرئيسي */}
      <section className="py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* الهيدر */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              مُقترب
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              منصة المحتوى الإبداعي حيث تلتقي الأفكار المبتكرة مع الرؤى العميقة
            </p>
          </div>

          {/* المقال المميز */}
          {heroArticle && (
            <div className="mb-12">
              <HeroCard article={heroArticle} />
            </div>
          )}

          {/* أدوات البحث والفلترة */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* شريط البحث */}
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="search"
                  placeholder="ابحث في الزوايا..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 py-6 text-lg"
                />
              </div>

              {/* أزرار الفلترة */}
              <div className="flex gap-2 flex-wrap">
                {filters.map((filter) => (
                  <Button
                    key={filter.id}
                    variant={
                      selectedFilter === filter.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedFilter(filter.id)}
                    className="flex items-center gap-2"
                  >
                    <filter.icon className="w-4 h-4" />
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* شبكة الزوايا */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredAngles.map((angle) => (
              <AngleCard key={angle.id} angle={angle} />
            ))}
          </div>

          {/* رسالة عدم وجود نتائج */}
          {filteredAngles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                لم يتم العثور على زوايا مطابقة للبحث
              </p>
            </div>
          )}

          {/* المقالات المميزة */}
          {featuredArticles.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                مقالات مميزة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredArticles.map((article) => (
                  <FeaturedArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          {/* الإحصائيات */}
          {stats && (
            <div className="mt-12 bg-gray-100 dark:bg-gray-800 rounded-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-3xl font-bold">{stats.totalWriters}</div>
                  <div className="text-gray-600 dark:text-gray-400">
                    كاتب مبدع
                  </div>
                </div>
                <div>
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-3xl font-bold">
                    {stats.totalArticles}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    مقال منشور
                  </div>
                </div>
                <div>
                  <Eye className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-3xl font-bold">
                    {stats.displayViews?.formatted || "0"}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">مشاهدة</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// دالة مساعدة للحصول على أيقونة الزاوية
function getAngleIcon(iconName?: string) {
  const iconMap: { [key: string]: React.ReactNode } = {
    brain: <Brain className="w-6 h-6 text-purple-600" />,
    lightbulb: <Lightbulb className="w-6 h-6 text-yellow-600" />,
    rocket: <Rocket className="w-6 h-6 text-blue-600" />,
    target: <Target className="w-6 h-6 text-red-600" />,
    sparkles: <Sparkles className="w-6 h-6 text-pink-600" />,
  };

  return (
    iconMap[iconName || ""] || <BookOpen className="w-6 h-6 text-gray-600" />
  );
}

export default memo(MuqtarabClientContent);

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Angle, AngleArticle } from "@/types/muqtarab";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Calendar,
  Clock,
  Cpu,
  Eye,
  Filter,
  Heart,
  MessageCircle,
  Rocket,
  Search,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type SortOption = "latest" | "popular" | "oldest";

export default function AnglePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [angle, setAngle] = useState<Angle | null>(null);
  const [articles, setArticles] = useState<AngleArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<AngleArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [showOnlyPublished, setShowOnlyPublished] = useState(true);

  // جلب بيانات الزاوية
  useEffect(() => {
    const fetchAngleData = async () => {
      try {
        console.log("🔍 جاري جلب بيانات الزاوية:", slug);

        // جلب بيانات الزاوية بالـ slug
        const angleResponse = await fetch(
          `/api/muqtarab/angles/by-slug/${slug}`,
          {
            cache: "no-store",
          }
        );

        if (!angleResponse.ok) {
          console.error("❌ فشل في جلب الزاوية:", angleResponse.status);
          toast.error("الزاوية غير موجودة");
          router.push("/muqtarab");
          return;
        }

        const angleData = await angleResponse.json();
        console.log("✅ تم جلب بيانات الزاوية:", angleData.angle.title);
        setAngle(angleData.angle);

        // جلب مقالات الزاوية
        setArticlesLoading(true);
        const articlesResponse = await fetch(
          `/api/muqtarab/angles/${angleData.angle.id}/articles?limit=50`,
          {
            cache: "no-store",
          }
        );

        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          console.log(
            "✅ تم جلب المقالات:",
            articlesData.articles?.length || 0
          );
          setArticles(articlesData.articles || []);
          setFilteredArticles(articlesData.articles || []);
        } else {
          console.error("❌ فشل في جلب المقالات:", articlesResponse.status);
          toast.error("فشل في تحميل المقالات");
        }
      } catch (error) {
        console.error("خطأ في تحميل الزاوية:", error);
        toast.error("حدث خطأ في التحميل");
        router.push("/muqtarab");
      } finally {
        setLoading(false);
        setArticlesLoading(false);
      }
    };

    if (slug) {
      fetchAngleData();
    }
  }, [slug, router]);

  // فلترة وترتيب المقالات
  useEffect(() => {
    let filtered = articles;

    // فلترة المقالات المنشورة فقط
    if (showOnlyPublished) {
      filtered = filtered.filter((article) => article.isPublished);
    }

    // فلترة بالبحث
    if (searchQuery) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // ترتيب المقالات
    switch (sortBy) {
      case "latest":
        filtered = filtered.sort(
          (a, b) =>
            new Date(b.publishDate || b.createdAt).getTime() -
            new Date(a.publishDate || a.createdAt).getTime()
        );
        break;
      case "oldest":
        filtered = filtered.sort(
          (a, b) =>
            new Date(a.publishDate || a.createdAt).getTime() -
            new Date(b.publishDate || b.createdAt).getTime()
        );
        break;
      case "popular":
        // يمكن إضافة منطق ترتيب حسب المشاهدات أو التفاعل
        filtered = filtered.sort(
          (a, b) => (b.readingTime || 0) - (a.readingTime || 0)
        );
        break;
    }

    setFilteredArticles(filtered);
  }, [articles, searchQuery, sortBy, showOnlyPublished]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الزاوية...</p>
        </div>
      </div>
    );
  }

  if (!angle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            الزاوية غير موجودة
          </h1>
          <p className="text-gray-600 mb-4">
            لم يتم العثور على الزاوية المطلوبة
          </p>
          <Link href="/muqtarab">
            <Button>العودة إلى مُقترب</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header الزاوية */}
      <AngleHeader angle={angle} />

      {/* شريط الفلترة */}
      <AngleFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showOnlyPublished={showOnlyPublished}
        setShowOnlyPublished={setShowOnlyPublished}
        articlesCount={filteredArticles.length}
        angle={angle}
      />

      {/* شبكة المقالات */}
      <AngleArticlesGrid
        articles={filteredArticles}
        loading={articlesLoading}
        angle={angle}
      />
    </div>
  );
}

// مكون ترويسة الزاوية المحسن - تصميم احترافي بهوية بصرية واضحة
function AngleHeader({ angle }: { angle: Angle }) {
  // تحديد أيقونة الزاوية
  const getAngleIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      cpu: Cpu,
      brain: Brain,
      zap: Zap,
      rocket: Rocket,
      sparkles: Sparkles,
      target: Target,
    };
    return iconMap[iconName] || BookOpen;
  };

  const IconComponent = getAngleIcon(angle.icon);

  return (
    <div className="relative overflow-hidden">
      {/* الشريط العلوي بلون الزاوية */}
      <div
        className="h-3 w-full"
        style={{ backgroundColor: angle.themeColor }}
      />

      {/* هيدر الزاوية الجديد */}
      <div className="relative h-[350px] md:h-[400px] overflow-hidden">
        {/* صورة الخلفية */}
        {angle.coverImage ? (
          <Image
            src={angle.coverImage}
            alt={angle.title}
            fill
            className="object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${angle.themeColor} 0%, #1f2937 100%)`,
            }}
          />
        )}

        {/* طبقة داكنة محسنة للوضوح */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* طبقة إضافية بلون الزاوية */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(45deg, ${angle.themeColor}20 0%, transparent 60%)`,
          }}
        />

        {/* زر العودة المحسن - ثابت وواضح */}
        <div className="absolute top-6 right-6 z-20">
          <Link
            href="/muqtarab"
            className="inline-flex items-center gap-2 bg-white/95 dark:bg-black/90 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-black transition-all px-4 py-2 rounded-full shadow-lg backdrop-blur-sm border border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">العودة إلى مُقترب</span>
          </Link>
        </div>

        {/* صندوق معلومات الزاوية المحسن - تصميم متجاوب وواضح */}
        <div className="absolute bottom-6 right-6 left-6 md:left-auto md:max-w-2xl">
          {/* تصميم الجوال - مبسط ومقسم */}
          <div className="block md:hidden">
            {/* عنوان الزاوية على الصورة للجوال */}
            <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3 mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex-shrink-0 p-2 rounded-full shadow-lg"
                  style={{
                    backgroundColor: angle.themeColor,
                    color: "white",
                  }}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold text-white leading-tight flex-1">
                  {angle.title}
                </h1>
                {angle.isFeatured && (
                  <Badge
                    className="text-xs font-medium px-2 py-1 border-0 shadow-sm"
                    style={{
                      backgroundColor: angle.themeColor,
                      color: "white",
                    }}
                  >
                    مميزة
                  </Badge>
                )}
              </div>
            </div>

            {/* صندوق الوصف والتفاصيل للجوال */}
            <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/20">
              {/* مؤشر التخصص */}
              <div
                className="text-xs uppercase tracking-wide font-semibold mb-2"
                style={{ color: angle.themeColor }}
              >
                🧠 زاوية متخصصة
              </div>

              {/* الوصف مع التنسيق المحسن */}
              {angle.description && (
                <div className="prose prose-sm max-w-none whitespace-pre-line text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-3">
                  {angle.description}
                </div>
              )}

              {/* الإحصائيات */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>{angle.articlesCount || 0} مقالة</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{angle.author?.name}</span>
                </div>
              </div>

              {/* زر المتابعة للجوال */}
              <Button
                className="w-full shadow-lg border-0 text-white font-medium transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: angle.themeColor }}
              >
                <Heart className="w-4 h-4 ml-2" />
                متابعة الزاوية
              </Button>
            </div>
          </div>

          {/* تصميم الديسكتوب - محسن مع خلفية شفافة */}
          <div className="hidden md:block bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-2xl px-6 py-5 shadow-2xl border border-white/20">
            {/* رأس الصندوق مع مؤشر التخصص */}
            <div className="mb-4">
              {/* مؤشر التخصص */}
              <div
                className="text-xs uppercase tracking-wide font-semibold mb-1"
                style={{ color: angle.themeColor }}
              >
                🧠 زاوية متخصصة
              </div>

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="p-3 rounded-xl shadow-lg"
                    style={{
                      backgroundColor: angle.themeColor,
                      color: "white",
                    }}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h1
                      className="text-2xl md:text-3xl font-bold leading-tight"
                      style={{ color: angle.themeColor }}
                    >
                      {angle.title}
                    </h1>
                    {angle.isFeatured && (
                      <Badge
                        className="mt-1 text-xs border-0"
                        style={{
                          backgroundColor: `${angle.themeColor}15`,
                          color: angle.themeColor,
                        }}
                      >
                        <Sparkles className="w-3 h-3 ml-1" />
                        زاوية مميزة
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* وصف الزاوية مع التنسيق المحسن */}
            {angle.description && (
              <div className="prose prose-sm max-w-none whitespace-pre-line text-gray-800 dark:text-gray-300 text-sm md:text-base leading-relaxed mb-4">
                {angle.description}
              </div>
            )}

            {/* إحصائيات محسنة */}
            <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-4">
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{angle.articlesCount || 0} مقالة</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>بواسطة {angle.author?.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  آخر تحديث {new Date(angle.createdAt).toLocaleDateString("ar-SA")}
                </span>
              </div>
            </div>

            {/* أزرار التفاعل المحسنة */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 font-medium border-0 shadow-lg text-white transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: angle.themeColor,
                }}
              >
                <Heart className="w-4 h-4 ml-2" />
                متابعة الزاوية
              </Button>
              <Button
                variant="outline"
                className="flex-1 font-medium border-2 shadow-lg transition-all duration-200 hover:scale-105"
                style={{
                  borderColor: angle.themeColor,
                  color: angle.themeColor,
                }}
              >
                <Share2 className="w-4 h-4 ml-2" />
                مشاركة
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// مكون شريط الفلترة المحسن
function AngleFilterBar({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  showOnlyPublished,
  setShowOnlyPublished,
  articlesCount,
  angle,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  showOnlyPublished: boolean;
  setShowOnlyPublished: (show: boolean) => void;
  articlesCount: number;
  angle: Angle;
}) {
  const sortOptions = [
    { value: "latest" as SortOption, label: "الأحدث", icon: Calendar },
    { value: "popular" as SortOption, label: "الأكثر قراءة", icon: TrendingUp },
    { value: "oldest" as SortOption, label: "الأقدم", icon: Clock },
  ];

  return (
    <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* البحث */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث في مقالات الزاوية..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all"
              style={
                {
                  "--tw-ring-color": angle.themeColor,
                } as React.CSSProperties
              }
              onFocus={(e) => {
                e.target.style.borderColor = angle.themeColor;
                e.target.style.boxShadow = `0 0 0 2px ${angle.themeColor}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* الفلاتر والترتيب */}
          <div className="flex items-center gap-4">
            {/* عدد المقالات */}
            <div className="text-sm text-gray-500">{articlesCount} مقالة</div>

            <Separator orientation="vertical" className="h-6" />

            {/* ترتيب المقالات */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border border-gray-200 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* فلتر المنشور فقط */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showOnlyPublished}
                onChange={(e) => setShowOnlyPublished(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>المنشور فقط</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// مكون شبكة المقالات
function AngleArticlesGrid({
  articles,
  loading,
  angle,
}: {
  articles: AngleArticle[];
  loading: boolean;
  angle: Angle;
}) {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            لا توجد مقالات
          </h3>
          <p className="text-gray-500 mb-6">
            لم يتم نشر أي مقالات في هذه الزاوية بعد
          </p>
          <Link href={`/admin/muqtarab/angles/${angle.id}/articles/new`}>
            <Button
              style={{
                backgroundColor: angle.themeColor,
                color: "white",
              }}
              className="hover:opacity-90 transition-opacity"
            >
              <BookOpen className="w-4 h-4 ml-2" />
              إنشاء مقال جديد
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <AngleArticleCard key={article.id} article={article} angle={angle} />
        ))}
      </div>
    </div>
  );
}

// مكون بطاقة المقال
function AngleArticleCard({
  article,
  angle,
}: {
  article: AngleArticle;
  angle: Angle;
}) {
  return (
    <Card className="group rounded-xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
      {/* صورة المقال */}
      <div className="relative h-48 w-full overflow-hidden">
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

        {/* شارة الحالة */}
        <div className="absolute top-3 right-3">
          {article.isPublished ? (
            <Badge
              className="border-0 text-white"
              style={{ backgroundColor: angle.themeColor }}
            >
              منشور
            </Badge>
          ) : (
            <Badge variant="secondary">مسودة</Badge>
          )}
        </div>

        {/* شريط صغير بلون الزاوية */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: angle.themeColor }}
        />
      </div>

      <CardContent className="p-5">
        {/* عنوان المقال */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 leading-tight">
          {article.title}
        </h3>

        {/* مقدمة المقال */}
        {article.excerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {/* معلومات المقال */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-2">
            <User className="w-3 h-3" />
            <span>{article.author?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" />
            <span>{article.readingTime || 5} دقائق</span>
          </div>
        </div>

        {/* تاريخ النشر والتفاعل */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>
            {new Date(
              article.publishDate || article.createdAt
            ).toLocaleDateString("ar-SA")}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>234</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>12</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>5</span>
            </div>
          </div>
        </div>

        {/* زر القراءة */}
        <Link href={`/muqtarab/${angle.slug}/${article.id}`}>
          <Button
            variant="ghost"
            className="w-full justify-start p-0 h-8"
            style={{
              color: angle.themeColor,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${angle.themeColor}10`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <BookOpen className="w-4 h-4 ml-2" />
            قراءة المقال
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

// 🚀 Server Component - بيانات محسنة ومسبقة التجهيز
const muqtarabData = {
  angles: [
    {
      id: "1",
      title: "تقنية وذكاء اصطناعي",
      slug: "tech-ai",
      description: "زاوية متخصصة في أحدث التطورات التقنية والذكاء الاصطناعي",
      coverImage: "/images/tech-angle.jpg",
      themeColor: "#3B82F6",
      isFeatured: true,
      articlesCount: 15,
      author: { name: "فريق التقنية" },
      createdAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "2",
      title: "تحليل اقتصادي",
      slug: "economic-analysis",
      description: "تحليلات اقتصادية عميقة للأسواق والاتجاهات المالية",
      coverImage: "/images/economy-angle.jpg",
      themeColor: "#10B981",
      isFeatured: false,
      articlesCount: 8,
      author: { name: "فريق الاقتصاد" },
      createdAt: "2024-01-02T00:00:00.000Z",
    },
    {
      id: "3",
      title: "فكر معاصر",
      slug: "contemporary-thought",
      description: "رؤى وأفكار معاصرة في مختلف جوانب الحياة",
      coverImage: "/images/thought-angle.jpg",
      themeColor: "#8B5CF6",
      isFeatured: true,
      articlesCount: 12,
      author: { name: "فريق الفكر" },
      createdAt: "2024-01-03T00:00:00.000Z",
    },
  ],
  heroArticle: {
    id: "hero-1",
    title: "مستقبل الذكاء الاصطناعي في التعليم العربي",
    excerpt:
      "استكشاف للتطبيقات الثورية للذكاء الاصطناعي في تطوير التعليم باللغة العربية",
    slug: "ai-in-arabic-education",
    coverImage: "/images/ai-education.jpg",
    readingTime: 8,
    publishDate: "2024-12-15T10:00:00.000Z",
    views: 2547,
    tags: ["ذكاء اصطناعي", "تعليم", "تقنية"],
    angle: {
      title: "تقنية وذكاء اصطناعي",
      slug: "tech-ai",
      themeColor: "#3B82F6",
    },
    author: { name: "د. أحمد التقني" },
  },
  featuredArticles: [
    {
      id: "featured-1",
      title: "تحليل التضخم الاقتصادي في المنطقة",
      excerpt: "دراسة شاملة لأسباب التضخم وتأثيره على الاقتصادات العربية",
      slug: "inflation-analysis",
      coverImage: "/images/inflation.jpg",
      readingTime: 6,
      publishDate: "2024-12-14T14:30:00.000Z",
      views: 1823,
      angle: {
        title: "تحليل اقتصادي",
        themeColor: "#10B981",
      },
      author: { name: "د. سارة الاقتصادية" },
    },
    {
      id: "featured-2",
      title: "الفلسفة في عصر التكنولوجيا",
      excerpt: "كيف تتطور الأفكار الفلسفية مع التقدم التكنولوجي السريع",
      slug: "philosophy-tech-age",
      coverImage: "/images/philosophy-tech.jpg",
      readingTime: 10,
      publishDate: "2024-12-13T09:15:00.000Z",
      views: 1456,
      angle: {
        title: "فكر معاصر",
        themeColor: "#8B5CF6",
      },
      author: { name: "د. محمد الفيلسوف" },
    },
  ],
  stats: {
    totalAngles: 3,
    publishedAngles: 3,
    totalArticles: 35,
    publishedArticles: 35,
    totalViews: 45000,
    displayViews: { formatted: "45K" },
  },
};

export const metadata: Metadata = {
  title: "مُقترب - زوايا فكرية متخصصة | سبق الذكية",
  description:
    "منصة رائدة تقدم محتوى فكري عميق ومتنوع في مختلف المجالات من التقنية والثقافة إلى الفكر المعاصر والتحليل العميق",
  keywords: [
    "مقترب",
    "زوايا فكرية",
    "تحليل",
    "تقنية",
    "ذكاء اصطناعي",
    "اقتصاد",
    "فكر معاصر",
  ],
  openGraph: {
    title: "مُقترب - زوايا فكرية متخصصة",
    description: "اكتشف زوايا فكرية متميزة وأفكار مبتكرة في مختلف المجالات",
    type: "website",
    locale: "ar_SA",
  },
  alternates: {
    canonical: "/muqtarab",
  },
};

// مكون تحميل سريع
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// مكون الإحصائيات
function StatsBar() {
  const { stats } = muqtarabData;

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-4 md:px-6 py-3 shadow-lg">
      <div className="inline-flex flex-wrap justify-center items-center gap-4 md:gap-6">
        <div className="text-center px-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.publishedAngles}
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">زاوية</div>
        </div>
        <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
        <div className="text-center px-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.publishedArticles}
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">مقال</div>
        </div>
        <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
        <div className="text-center px-2">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.displayViews.formatted}
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">قراءة</div>
        </div>
      </div>
    </div>
  );
}

// مكون المقال المميز
function HeroSection() {
  const { heroArticle } = muqtarabData;

  if (!heroArticle) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            المقال المميز
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          اكتشف أحدث المقالات المميزة في زوايا مُقترب
        </p>
      </div>

      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="md:flex">
          <div className="relative md:w-1/2 h-64 md:h-80">
            <Image
              src={heroArticle.coverImage}
              alt={heroArticle.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4">
              <Badge
                className="mb-2"
                style={{ backgroundColor: heroArticle.angle.themeColor }}
              >
                {heroArticle.angle.title}
              </Badge>
            </div>
          </div>

          <div className="md:w-1/2 p-6 md:p-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {heroArticle.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {heroArticle.excerpt}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{heroArticle.author.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{heroArticle.readingTime} دقائق</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{heroArticle.views.toLocaleString()}</span>
              </div>
            </div>

            <Link href={`/muqtarab/articles/${heroArticle.slug}`}>
              <Button
                size="lg"
                style={{ backgroundColor: heroArticle.angle.themeColor }}
                className="text-white hover:opacity-90"
              >
                قراءة المقال
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

// مكون المقالات المختارة
function FeaturedArticles() {
  const { featuredArticles } = muqtarabData;

  if (featuredArticles.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 bg-green-600 rounded-full"></div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            مقالات مختارة
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {featuredArticles.map((article) => (
          <Card
            key={article.id}
            className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="relative h-48 overflow-hidden">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                <Badge
                  className="border-0 text-white"
                  style={{ backgroundColor: article.angle.themeColor }}
                >
                  {article.angle.title}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {article.excerpt}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{article.readingTime} د</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{article.views}</span>
                </div>
              </div>

              <Link href={`/muqtarab/articles/${article.slug}`}>
                <Button
                  size="sm"
                  className="w-full"
                  style={{ backgroundColor: article.angle.themeColor }}
                >
                  قراءة المقال
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// مكون الزوايا
function AnglesGrid() {
  const { angles } = muqtarabData;
  const featuredAngles = angles.filter((angle) => angle.isFeatured);
  const regularAngles = angles.filter((angle) => !angle.isFeatured);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      {/* الزوايا المميزة */}
      {featuredAngles.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              الزوايا المميزة
            </h2>
            <Badge variant="secondary" className="text-xs">
              {featuredAngles.length} زاوية
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {featuredAngles.map((angle) => (
              <Card
                key={angle.id}
                className="group rounded-2xl overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex h-64">
                  <div className="relative w-1/2 overflow-hidden">
                    <Image
                      src={angle.coverImage}
                      alt={angle.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>

                  <div className="w-1/2 p-6 flex flex-col justify-between">
                    <div>
                      <Badge className="bg-yellow-500 text-yellow-900 border-0 mb-3">
                        <Sparkles className="w-3 h-3 ml-1" />
                        زاوية مميزة
                      </Badge>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                        {angle.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                        {angle.description}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{angle.articlesCount} مقالة</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{angle.author.name}</span>
                        </div>
                      </div>

                      <Link href={`/muqtarab/${angle.slug}`}>
                        <Button
                          className="w-full"
                          style={{ backgroundColor: angle.themeColor }}
                        >
                          <Eye className="w-4 h-4 ml-2" />
                          استكشاف الزاوية
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* باقي الزوايا */}
      {regularAngles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
              باقي الزوايا
            </h2>
            <div className="text-sm text-gray-500">
              {regularAngles.length} زاوية
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {regularAngles.map((angle) => (
              <Card
                key={angle.id}
                className="group rounded-2xl overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={angle.coverImage}
                    alt={angle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg line-clamp-2">
                      {angle.title}
                    </h3>
                  </div>
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{ backgroundColor: angle.themeColor }}
                  />
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{angle.articlesCount} مقالة</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{angle.author.name}</span>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                    {angle.description}
                  </p>

                  <Link href={`/muqtarab/${angle.slug}`}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-8"
                      style={{ color: angle.themeColor }}
                    >
                      <Eye className="w-4 h-4 ml-2" />
                      استكشاف الزاوية
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// الصفحة الرئيسية - Server Component
export default function MuqtarabPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
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
            <div className="mt-6">
              <StatsBar />
            </div>
          </div>
        </div>
      </section>

      {/* المقال المميز */}
      <Suspense
        fallback={
          <div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 mx-4 rounded-xl" />
        }
      >
        <HeroSection />
      </Suspense>

      {/* المقالات المختارة */}
      <Suspense
        fallback={
          <div className="h-64 animate-pulse bg-gray-100 dark:bg-gray-800 mx-4 rounded-xl" />
        }
      >
        <FeaturedArticles />
      </Suspense>

      {/* شبكة الزوايا */}
      <Suspense fallback={<LoadingSkeleton />}>
        <AnglesGrid />
      </Suspense>
    </div>
  );
}

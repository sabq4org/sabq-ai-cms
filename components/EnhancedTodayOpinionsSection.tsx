"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getArticleLink } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Lightbulb,
  MessageCircle,
  Pause,
  Quote,
  Star,
  ThumbsUp,
  TrendingUp,
  Volume2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface OpinionAuthor {
  id: string;
  name: string;
  avatar?: string;
  specialization?: string;
  bio?: string;
  articlesCount?: number;
  totalViews?: number;
  isVerified?: boolean;
}

interface OpinionArticle {
  id: string;
  title: string;
  excerpt: string;
  author: OpinionAuthor;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  readingTime: number;
  tags: string[];
  mood: "positive" | "negative" | "neutral" | "analytical";
  opinionType: "short" | "extended";
  isFeatured: boolean;
  isPinned: boolean;
  hasAudioSummary: boolean;
  audioUrl?: string;
  slug: string;
  featuredImage?: string;
  isBreaking?: boolean;
  isTrending?: boolean;
}

interface TodayOpinionsSectionProps {
  darkMode?: boolean;
}

const OpinionCard = ({
  article,
  isHero = false,
  darkMode = false,
}: {
  article: OpinionArticle;
  isHero?: boolean;
  darkMode?: boolean;
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const getMoodBadge = (mood: string) => {
    const moodConfig: Record<
      string,
      { label: string; color: string; icon: any }
    > = {
      positive: { label: "إيجابي", color: "bg-green-500", icon: TrendingUp },
      negative: { label: "نقدي", color: "bg-red-500", icon: BarChart3 },
      neutral: { label: "محايد", color: "bg-gray-500", icon: Quote },
      analytical: { label: "تحليلي", color: "bg-blue-500", icon: Lightbulb },
    };

    const config = moodConfig[mood] || moodConfig.neutral;
    const Icon = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </div>
    );
  };

  const handleAudioPlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <Link href={getArticleLink(article)}>
      <Card
        className={`group overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
          darkMode
            ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
            : "bg-white border-gray-200 hover:bg-gray-50"
        } ${isHero ? "h-auto" : "h-full"}`}
      >
        <CardContent className="p-0">
          {/* صورة المقال (للمقالات البارزة) */}
          {isHero && article.featuredImage && (
            <div className="relative overflow-hidden">
              <Image
                src={article.featuredImage}
                alt={article.title}
                width={600}
                height={300}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* شارات المقال */}
              <div className="absolute top-4 right-4 flex gap-2">
                {article.isFeatured && (
                  <Badge className="bg-yellow-500 text-white border-0">
                    <Star className="w-3 h-3 mr-1" />
                    مميز
                  </Badge>
                )}
                {article.isPinned && (
                  <Badge className="bg-blue-500 text-white border-0">
                    مثبت
                  </Badge>
                )}
                {article.isTrending && (
                  <Badge className="bg-red-500 text-white border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    رائج
                  </Badge>
                )}
              </div>

              {/* وقت القراءة */}
              <div className="absolute bottom-4 left-4">
                <div className="bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {article.readingTime} دقيقة
                </div>
              </div>
            </div>
          )}

          <div className={`p-6 ${isHero ? "pb-6" : "h-full flex flex-col"}`}>
            {/* شارات للمقالات العادية */}
            {!isHero && (
              <div className="flex items-center gap-2 mb-3">
                {getMoodBadge(article.mood)}
                {article.opinionType === "extended" && (
                  <Badge variant="outline" className="text-xs">
                    تحليل موسع
                  </Badge>
                )}
                {article.isFeatured && (
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    مميز
                  </Badge>
                )}
              </div>
            )}

            {/* العنوان */}
            <h3
              className={`font-bold mb-3 leading-tight transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                isHero ? "text-xl md:text-2xl" : "text-lg"
              } ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              {article.title}
            </h3>

            {/* المقتطف */}
            <p
              className={`text-sm leading-relaxed mb-4 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              } ${isHero ? "line-clamp-3" : "line-clamp-2 flex-grow"}`}
            >
              {article.excerpt}
            </p>

            {/* معلومات الكاتب */}
            <div className="flex items-center gap-3 mb-4">
              {article.author.avatar && (
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4
                    className={`font-medium text-sm ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {article.author.name}
                  </h4>
                  {article.author.isVerified && (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                {article.author.specialization && (
                  <p
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {article.author.specialization}
                  </p>
                )}
              </div>
            </div>

            {/* الوسوم */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {article.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      darkMode
                        ? "bg-gray-700 text-gray-300"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
                {article.tags.length > 3 && (
                  <span
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    +{article.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* إحصائيات ومعلومات إضافية */}
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-4 text-xs">
                <div
                  className={`flex items-center gap-1 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  {article.views.toLocaleString()}
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  {article.likes}
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  <MessageCircle className="w-3 h-3" />
                  {article.comments}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* تاريخ النشر */}
                <span
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {format(new Date(article.publishedAt), "dd MMM", {
                    locale: ar,
                  })}
                </span>

                {/* زر الصوت */}
                {article.hasAudioSummary && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleAudioPlay}
                    className={`p-1 rounded-full ${
                      darkMode
                        ? "hover:bg-gray-700 text-purple-400"
                        : "hover:bg-purple-50 text-purple-600"
                    }`}
                  >
                    {isPlayingAudio ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* مؤشر القراءة */}
            <div className="mt-3 flex items-center justify-between">
              <div
                className={`flex items-center gap-1 text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <Clock className="w-3 h-3" />
                {article.readingTime} دقيقة قراءة
              </div>

              <Button
                variant="ghost"
                size="sm"
                className={`text-xs font-medium ${
                  darkMode
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-700"
                }`}
              >
                اقرأ المزيد
                <ArrowRight className="w-3 h-3 mr-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const AuthorCard = ({
  author,
  darkMode = false,
}: {
  author: OpinionAuthor;
  darkMode?: boolean;
}) => (
  <Link href={`/opinion/author/${author.id}`}>
    <Card
      className={`group transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <CardContent className="p-4 text-center">
        {author.avatar && (
          <Image
            src={author.avatar}
            alt={author.name}
            width={60}
            height={60}
            className="w-15 h-15 rounded-full object-cover mx-auto mb-3"
          />
        )}
        <div className="flex items-center justify-center gap-1 mb-1">
          <h3
            className={`font-medium text-sm ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {author.name}
          </h3>
          {author.isVerified && (
            <CheckCircle className="w-4 h-4 text-blue-500" />
          )}
        </div>
        {author.specialization && (
          <p
            className={`text-xs mb-2 ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {author.specialization}
          </p>
        )}
        <div className="flex justify-center gap-4 text-xs">
          <div className={darkMode ? "text-gray-300" : "text-gray-700"}>
            <div className="font-bold">{author.articlesCount || 0}</div>
            <div>مقال</div>
          </div>
          <div className={darkMode ? "text-gray-300" : "text-gray-700"}>
            <div className="font-bold">
              {author.totalViews
                ? author.totalViews > 1000
                  ? `${(author.totalViews / 1000).toFixed(1)}k`
                  : author.totalViews
                : 0}
            </div>
            <div>مشاهدة</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
);

export default function EnhancedTodayOpinionsSection({
  darkMode = false,
}: TodayOpinionsSectionProps) {
  const isDark = darkMode || contextDarkMode;

  const [featuredArticles, setFeaturedArticles] = useState<OpinionArticle[]>(
    []
  );
  const [regularArticles, setRegularArticles] = useState<OpinionArticle[]>([]);
  const [featuredAuthors, setFeaturedAuthors] = useState<OpinionAuthor[]>([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const featuredCarouselRef = useRef<HTMLDivElement>(null);
  const authorsCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOpinionData();
  }, []);

  // تدوير المقالات المميزة تلقائياً
  useEffect(() => {
    if (featuredArticles.length > 1) {
      const interval = setInterval(() => {
        setCurrentFeaturedIndex((prev) => (prev + 1) % featuredArticles.length);
      }, 8000); // 8 ثوان

      return () => clearInterval(interval);
    }
  }, [featuredArticles.length]);

  const fetchOpinionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // جلب المقالات المميزة والعادية مع معالجة أفضل للأخطاء
      let articlesData = { articles: [] };
      let authorsData = { authors: [] };

      try {
        const [articlesResponse, authorsResponse] = await Promise.all([
          fetch(
            "/api/articles?type=OPINION&status=published&limit=15&featured=true,false"
          ),
          fetch("/api/opinion-authors?featured=true&limit=8"),
        ]);

        if (articlesResponse.ok) {
          articlesData = await articlesResponse.json();
        } else {
          console.warn("فشل جلب المقالات:", articlesResponse.status);
        }

        if (authorsResponse.ok) {
          authorsData = await authorsResponse.json();
        } else {
          console.warn("فشل جلب الكتاب:", authorsResponse.status);
        }
      } catch (fetchError) {
        console.warn("خطأ في جلب البيانات:", fetchError);
      }

      // معالجة المقالات
      const articles = Array.isArray(articlesData)
        ? articlesData
        : articlesData.articles || [];
      const transformedArticles: OpinionArticle[] = articles.map(
        (article: any) => ({
          id: article.id,
          title: article.title,
          excerpt: article.excerpt || "",
          author: {
            id: article.opinion_author?.id || article.author_id || "unknown",
            name:
              article.opinion_author?.name || article.author_name || "غير محدد",
            avatar: article.opinion_author?.avatar,
            specialization: article.opinion_author?.specialization,
            bio: article.opinion_author?.bio,
            articlesCount: article.opinion_author?.articles_count,
            totalViews: article.opinion_author?.total_views,
            isVerified: article.opinion_author?.is_verified || false,
          },
          publishedAt: article.published_at || article.created_at,
          views: article.views || 0,
          likes: article.likes || 0,
          comments: article._count?.comments || 0,
          shares: article.shares || 0,
          readingTime: article.reading_time || 5,
          tags: article.metadata?.tags || [],
          mood: article.metadata?.mood || "neutral",
          opinionType: article.metadata?.opinion_type || "short",
          isFeatured:
            article.metadata?.is_featured || article.featured || false,
          isPinned: article.metadata?.is_pinned || false,
          hasAudioSummary: !!article.metadata?.audio_url,
          audioUrl: article.metadata?.audio_url,
          slug: article.slug,
          featuredImage: article.featured_image,
          isBreaking: article.metadata?.is_breaking || false,
          isTrending: article.metadata?.is_trending || false,
        })
      );

      // تقسيم المقالات
      const featured = transformedArticles
        .filter((article) => article.isFeatured)
        .slice(0, 3);
      const regular = transformedArticles
        .filter((article) => !article.isFeatured)
        .slice(0, 8);

      setFeaturedArticles(featured);
      setRegularArticles(regular);

      // معالجة الكتاب
      const authors = Array.isArray(authorsData)
        ? authorsData
        : authorsData.authors || [];
      setFeaturedAuthors(authors);
    } catch (error) {
      console.error("خطأ في جلب بيانات الرأي:", error);
      setError(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const scrollCarousel = (
    ref: React.RefObject<HTMLDivElement>,
    direction: "left" | "right"
  ) => {
    if (ref.current) {
      const scrollAmount = 300;
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <section className={`py-12 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="animate-pulse space-y-8">
            <div
              className={`h-8 rounded ${
                isDark ? "bg-gray-800" : "bg-gray-200"
              }`}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`h-64 rounded ${
                    isDark ? "bg-gray-800" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`h-48 rounded ${
                    isDark ? "bg-gray-800" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`py-12 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <Quote
              className={`w-16 h-16 mx-auto mb-4 opacity-50 ${
                isDark ? "text-gray-600" : "text-gray-400"
              }`}
            />
            <h3
              className={`text-xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              خطأ في تحميل مقالات الرأي
            </h3>
            <p className={`mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {error}
            </p>
            <Button onClick={fetchOpinionData}>إعادة المحاولة</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-12 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* رأس القسم */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className={`text-3xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              آراء اليوم
            </h2>
            <p
              className={`text-lg ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              أحدث التحليلات والآراء من كبار الكتاب والمفكرين
            </p>
          </div>

          <Link href="/opinion">
            <Button variant="outline" className="flex items-center gap-2">
              جميع مقالات الرأي
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* المقالات المميزة */}
        {featuredArticles.length > 0 && (
          <div className="mb-12">
            <h3
              className={`text-xl font-bold mb-6 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              مقالات مميزة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.map((article) => (
                <OpinionCard
                  key={article.id}
                  article={article}
                  isHero={true}
                  darkMode={isDark}
                />
              ))}
            </div>
          </div>
        )}

        {/* الكتاب المميزون */}
        {featuredAuthors.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                كتاب مميزون
              </h3>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scrollCarousel(authorsCarouselRef, "left")}
                  className="p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scrollCarousel(authorsCarouselRef, "right")}
                  className="p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div
              ref={authorsCarouselRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {featuredAuthors.map((author) => (
                <div
                  key={author.id}
                  className="flex-shrink-0 w-48"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <AuthorCard author={author} darkMode={isDark} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* المقالات العادية */}
        {regularArticles.length > 0 && (
          <div>
            <h3
              className={`text-xl font-bold mb-6 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              مقالات حديثة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {regularArticles.map((article) => (
                <OpinionCard
                  key={article.id}
                  article={article}
                  darkMode={isDark}
                />
              ))}
            </div>
          </div>
        )}

        {/* رابط لعرض المزيد */}
        <div className="text-center mt-8">
          <Link href="/opinion">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              استكشف جميع مقالات الرأي
              <ArrowRight className="w-5 h-5 mr-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

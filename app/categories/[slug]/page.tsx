"use client";

// import CompactCategoryCardMini from "@/components/mobile/CompactCategoryCardMini";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { getArticleLink } from "@/lib/utils";
import "@/styles/compact-category-cards-mini.css";
import "@/styles/mobile-category-cards.css";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Globe,
  Grid,
  Heart,
  Laptop,
  Leaf,
  List,
  Loader2,
  Newspaper,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
  Trophy,
  User,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../categories-fixes.css";
import "../category-page-mobile.css";
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  articles_count?: number;
  metadata?: {
    name_ar?: string;
    themeColor?: string;
    icon?: string;
    cover_image?: string;
    [key: string]: any;
  };
  cover_image?: string;
  icon?: string;
  color?: string;
  [key: string]: any;
}
interface Article {
  id: string;
  title: string;
  subtitle?: string;
  excerpt?: string;
  featured_image?: string;
  category_id: number;
  category_name?: string;
  author_name?: string;
  views_count: number;
  likes_count?: number;
  created_at: string;
  published_at?: string;
  reading_time?: number;
  is_featured?: boolean;
  is_breaking?: boolean;
}
// أيقونات التصنيفات
const categoryIcons: { [key: string]: React.ComponentType<any> } = {
  تقنية: Laptop,
  رياضة: Trophy,
  اقتصاد: TrendingUp,
  صحة: Heart,
  بيئة: Leaf,
  ثقافة: BookOpen,
  محلي: Globe,
  دولي: Globe,
  منوعات: Activity,
  default: Tag,
};
// ألوان التصنيفات
const categoryColors: { [key: string]: string } = {
  تقنية: "from-purple-500 to-purple-600",
  رياضة: "from-blue-500 to-blue-600",
  اقتصاد: "from-green-500 to-green-600",
  صحة: "from-pink-500 to-pink-600",
  بيئة: "from-teal-500 to-teal-600",
  ثقافة: "from-amber-500 to-amber-600",
  محلي: "from-indigo-500 to-indigo-600",
  دولي: "from-cyan-500 to-cyan-600",
  منوعات: "from-orange-500 to-orange-600",
  default: "from-gray-500 to-gray-600",
};
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return "منذ لحظات";
  if (diffInSeconds < 3600)
    return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
  if (diffInSeconds < 86400)
    return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
  if (diffInSeconds < 2592000)
    return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
interface CategoryStats {
  breakingNews: number;
  todayArticles: number;
  weeklyArticles: number;
    totalViews: number;
    totalLikes: number;
  averageReadTime: number;
  topAuthors: Array<{
    name: string;
    articleCount: number;
    avatar?: string;
  }>;
  popularTags: string[];
  engagement: {
    likesRate: number;
    sharesRate: number;
    totalShares: number;
    averageViews: number;
  };
}
interface PageProps {
  params: {
    slug: string;
  };
}
export default function CategoryDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "views" | "likes">("date");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);
  useEffect(() => {
    fetchCategoryData(params.slug);
  }, [params.slug]);
  useEffect(() => {
    // تحديث filteredArticles مباشرة عند تغيير articles
    if (articles.length > 0 && !searchTerm && sortBy === "date") {
      setFilteredArticles(articles);
    } else if (articles.length > 0) {
      fetchFilteredArticles();
    }
  }, [searchTerm, sortBy, selectedTag, articles]);
  const fetchFilteredArticles = async () => {
    try {
      let filtered = [...articles];
      // تطبيق البحث
      if (searchTerm) {
        filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      // تطبيق الترتيب
      filtered.sort((a, b) => {
      switch (sortBy) {
        case "views":
            return (b.views_count || 0) - (a.views_count || 0);
        case "likes":
            return (b.likes_count || 0) - (a.likes_count || 0);
        default:
            return (
              new Date(b.published_at || b.created_at).getTime() -
              new Date(a.published_at || a.created_at).getTime()
            );
        }
      });
      // البحث بحسب التاق إذا لزم
      const params = new URLSearchParams({
        status: "published",
        category_id: category?.id.toString() || "",
      });
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();

      if (data.success && data.data) {
        const processedArticles = data.data.map((article: any) => ({
          ...article,
          views_count: article.views || article.views_count || 0,
          likes_count: article.likes || article.likes_count || 0,
          shares_count: article.shares || article.shares_count || 0,
          category_name: category.name,
          author_name:
            article.author?.name || article.author_name || "كاتب مجهول",
        }));

        setFilteredArticles(processedArticles);
      }
    } catch (error) {
      console.error("خطأ في جلب المقالات المفلترة:", error);
    }
  };
  const fetchCategoryData = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);

      const categoryResponse = await fetch(`/api/categories/by-slug/${slug}`);
      if (!categoryResponse.ok) {
        throw new Error("Category not found");
      }
      const categoryData = await categoryResponse.json();
      setCategory(categoryData.category);

      const articlesResponse = await fetch(
        `/api/articles?category_id=${categoryData.category.id}&status=published&article_type=news`
      );
      if (articlesResponse.ok) {
        const articlesData = await articlesResponse.json();
        console.log("Articles API Response:", articlesData);
        // التعامل مع البنية المختلفة للبيانات من API
        const articles = articlesData.data || articlesData.articles || [];
        console.log("Processed articles:", articles);
        setArticles(articles);
        setFilteredArticles(articles);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  const getIcon = (categoryName: string) => {
    const IconComponent =
      categoryIcons[categoryName] || categoryIcons["default"];
    return IconComponent;
  };
  const getColor = (categoryName: string) => {
    return categoryColors[categoryName] || categoryColors["default"];
  };

  // مكون البطاقة الموحد
  const ArticleCard = ({ article }: { article: any }) => {
    const isBreaking = Boolean(article.is_breaking || article?.metadata?.breaking);
    const baseBg = isBreaking ? 'hsla(0, 78%, 55%, 0.14)' : 'hsl(var(--bg-elevated))';
    const hoverBg = isBreaking ? 'hsla(0, 78%, 55%, 0.22)' : 'hsl(var(--accent) / 0.06)';
    const baseBorder = isBreaking ? '1px solid hsl(0 72% 45% / 0.45)' : '1px solid hsl(var(--line))';

    return (
      <Link href={getArticleLink(article)} style={{ textDecoration: 'none' }}>
        <div style={{
          background: baseBg,
          border: baseBorder,
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.background = hoverBg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.background = baseBg;
        }}>
          {/* صورة المقال */}
          <div style={{
            position: 'relative',
            height: '180px',
            width: '100%',
            background: 'hsl(var(--bg))',
            overflow: 'hidden'
          }}>
            {article.featured_image ? (
              <img
                src={article.featured_image}
                alt={article.title}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)',
                color: '#7C3AED'
              }}>
                <Sparkles className="w-12 h-12" />
              </div>
            )}
            {/* ليبل عاجل يحل محل التصنيف عند العاجل */}
            {isBreaking ? (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'hsl(0 72% 45%)',
                color: 'white',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
                zIndex: 10
              }}>
                <span style={{ animation: 'pulse 2s infinite' }}>⚡</span>
                عاجل
              </div>
            ) : (
              article.category_name && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(8px)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#7C3AED',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  zIndex: 10
                }}>
                  {article.category_name}
                </div>
              )
            )}
          </div>

          {/* محتوى البطاقة */}
          <div style={{
            padding: '16px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* العنوان */}
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: isBreaking ? 'hsl(0 72% 45%)' : 'hsl(var(--fg))',
              marginBottom: '12px',
              lineHeight: '1.5',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical'
            }}>
              {article.title}
            </h3>

            {/* البيانات الوصفية */}
            <div style={{
              marginTop: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '12px',
              color: 'hsl(var(--muted))'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock className="w-3 h-3" />
                {new Date(article.published_at || article.created_at).toLocaleDateString('ar-SA')}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Eye className="w-3 h-3" />
                {article.views_count || 0}
                {article.views_count > 300 && ' 🔥'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  };
  const getCategoryImage = (category: Category) => {
    // استخدام الصورة المرفوعة من لوحة التحكم إذا كانت موجودة
    const coverImage =
      category.cover_image ||
      (category.metadata &&
      typeof category.metadata === "object" &&
      "cover_image" in category.metadata
        ? (category.metadata as any).cover_image
        : null);

    if (coverImage) {
      return coverImage;
    }

    // إذا لم توجد صورة، استخدام صورة افتراضية جذابة بناءً على نوع التصنيف
    const defaultImages: Record<string, string> = {
      تقنية:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      رياضة:
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
      اقتصاد:
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
      صحة: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80",
      بيئة: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
      ثقافة:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
      محلي:
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
      دولي:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      منوعات:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    };

    return (
      defaultImages[category.name] ||
      "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=1200&q=80"
    );
  };
  const filteredStats = {
    totalArticles: filteredArticles.length,
    todayArticles: filteredArticles.filter((article) => {
      const today = new Date();
      const articleDate = new Date(article.published_at || article.created_at);
      return (
        articleDate.getDate() === today.getDate() &&
        articleDate.getMonth() === today.getMonth() &&
        articleDate.getFullYear() === today.getFullYear()
      );
    }).length,
    totalViews: filteredArticles.reduce(
      (sum, article) => sum + (article.views_count || 0),
      0
    ),
    featuredCount: filteredArticles.filter((article) => article.is_featured)
      .length,
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
          </div>
        </div>
    );
  }
  if (error || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            عذراً، حدث خطأ
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || "لم نتمكن من العثور على هذا القسم"}
          </p>
              <button
            onClick={() => router.push("/categories")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
            العودة للأقسام
          </button>
            </div>
          </div>
    );
  }
  const Icon = getIcon(category.name);
  const colorGradient = getColor(category.name);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 category-page-wrapper">
      {/* Hero Section with Cover Image (full-bleed) */}
      <section className="relative h-[300px] md:h-[500px] overflow-hidden full-bleed" style={{ marginTop: '-72px', paddingTop: '72px' }}>
        <Image
          src={getCategoryImage(category)}
          alt={category.name}
          fill
          className="object-cover"
          sizes="100vw"
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/placeholder.jpg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        {/* Category Info Overlay */}
        <div className="absolute bottom-0 right-0 left-0 p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                {category.icon || category.metadata?.icon ? (
                  <span className="text-3xl md:text-4xl">
                    {category.icon || category.metadata?.icon}
                  </span>
                ) : (
                  <Icon className="w-8 h-8 md:w-10 md:h-10 text-gray-700" />
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-lg md:text-xl text-white/80 max-w-2xl">
                    {(() => {
                      let desc = category.description;
                      if (desc.startsWith("{")) {
                        try {
                          const parsed = JSON.parse(desc);
                          desc = parsed.ar || parsed.description || desc;
                        } catch (e) {}
                      }
                      return desc;
                    })()}
                  </p>
                )}
              </div>
            </div>
                                    {/* Quick Stats - تنسيق محسّن */}
            <div className="flex flex-wrap gap-2 md:gap-3 mt-4">
              <div className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 hover:bg-black/50 transition-colors">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-white/80" />
                  <div className="flex items-center gap-1">
                    <div className="text-lg font-bold text-white">
                      {filteredStats.totalArticles}
                    </div>
                    <div className="text-xs text-white/70">مقال</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 hover:bg-black/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-white/80" />
                  <div className="flex items-center gap-1">
                    <div className="text-lg font-bold text-white">
                      {filteredStats.todayArticles}
                    </div>
                    <div className="text-xs text-white/70">اليوم</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 hover:bg-black/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-white/80" />
                  <div className="flex items-center gap-1">
                    <div className="text-lg font-bold text-white">
                      {filteredStats.totalViews}
                    </div>
                    <div className="text-xs text-white/70">مشاهدة</div>
                  </div>
                </div>
              </div>
              
              {filteredStats.featuredCount > 0 && (
                <div className="bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 hover:bg-black/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-white/80" />
                    <div className="flex items-center gap-1">
                      <div className="text-lg font-bold text-white">
                        {filteredStats.featuredCount}
                      </div>
                      <div className="text-xs text-white/70">مميز</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Filters & Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
            {/* Search Box */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث في المقالات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
              />
            </div>
            {/* Controls */}
            <div className="flex items-center gap-4 w-full lg:w-auto">
              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "date" | "views" | "likes")
                }
                className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 lg:flex-initial"
              >
                <option value="date">الأحدث</option>
                <option value="views">الأكثر مشاهدة</option>
                <option value="likes">الأكثر تفاعلاً</option>
              </select>
              {/* View Mode Toggle - Desktop Only */}
              <div className="hidden lg:flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                  title="عرض شبكي"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                  title="عرض قائمة"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              {/* Refresh Button */}
              <button
                onClick={() => fetchCategoryData(params.slug)}
                className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                title="تحديث"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        {/* Results Count */}
        {searchTerm && (
          <div className="mb-6 text-gray-600 dark:text-gray-400">
            {filteredArticles.length > 0 ? (
              <>
                عرض {filteredArticles.length} نتيجة لـ &ldquo;{searchTerm}
                &rdquo;
              </>
            ) : (
              <>لا توجد نتائج لـ &ldquo;{searchTerm}&rdquo;</>
            )}
          </div>
        )}
        {/* Articles Grid/List */}
        {filteredArticles.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <BookOpen className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-3">
              لا توجد مقالات
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {searchTerm
                ? "لم نعثر على مقالات تطابق بحثك. جرب كلمات أخرى"
                : "لا توجد مقالات في هذا القسم حالياً"}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile View - Always Grid */}
            <div className="block md:hidden">
              <div className="grid grid-cols-1 gap-4">
                {filteredArticles && filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => {
                    try {
                      return <ArticleCard key={article?.id || Math.random()} article={article} />;
                    } catch (error) {
                      console.error("Error rendering mobile article:", error);
                      return null;
                    }
                  })
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد مقالات للعرض</p>
                  </div>
                )}
                  </div>
              </div>
            {/* Desktop View - Keep existing */}
            <div className="hidden md:block">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredArticles && filteredArticles.length > 0 ? (
                    filteredArticles.map((article) => {
                      try {
                        return <ArticleCard key={article?.id || Math.random()} article={article} />;
                      } catch (error) {
                        console.error("Error rendering grid article:", error);
                        return null;
                      }
                    })
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">لا توجد مقالات للعرض</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredArticles && filteredArticles.length > 0 ? (
                    filteredArticles.map((article) => {
                      try {
                        return <ArticleCard key={article?.id || Math.random()} article={article} />;
                      } catch (error) {
                        console.error("Error rendering list article:", error);
                        return null;
                      }
                    })
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">لا توجد مقالات للعرض</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
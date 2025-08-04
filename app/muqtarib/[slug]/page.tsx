"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Angle, AngleArticle, AngleFilterOptions } from "@/types/muqtarab";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Filter,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  User,
  Sparkles,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// مكونات فرعية للصفحة
const AngleHeader = ({ angle }: { angle: Angle }) => {
  return (
    <div className="relative">
      {/* صورة الغلاف */}
      <div className="h-64 md:h-80 relative overflow-hidden rounded-2xl">
        {angle.coverImage ? (
          <img
            src={angle.coverImage}
            alt={angle.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${angle.themeColor}AA, ${angle.themeColor})`
            }}
          >
            <Sparkles className="w-24 h-24 text-white/70" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* محتوى الهيدر */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: angle.themeColor }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{angle.title}</h1>
                {angle.isFeatured && (
                  <Badge className="bg-yellow-500/90 text-yellow-900">مميزة</Badge>
                )}
              </div>
              
              <p className="text-white/90 text-lg mb-4 leading-relaxed">
                {angle.description}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>بقلم: {angle.author?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{angle.articlesCount || 0} مقال</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{angle.totalViews || 0} مشاهدة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AngleFilterBar = ({ 
  filters, 
  onFiltersChange 
}: { 
  filters: AngleFilterOptions;
  onFiltersChange: (filters: AngleFilterOptions) => void;
}) => {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium">ترتيب حسب:</span>
        </div>
        
        <div className="flex gap-2">
          {[
            { key: 'newest', label: 'الأحدث' },
            { key: 'popular', label: 'الأكثر قراءة' },
            { key: 'trending', label: 'الأكثر تفاعلاً' },
          ].map((option) => (
            <Button
              key={option.key}
              variant={filters.sortBy === option.key ? "default" : "outline"}
              size="sm"
              onClick={() => onFiltersChange({ ...filters, sortBy: option.key as any })}
            >
              {option.label}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 mr-auto">
          <span className="text-sm text-gray-500">الفترة الزمنية:</span>
          <select
            value={filters.timeRange}
            onChange={(e) => onFiltersChange({ ...filters, timeRange: e.target.value as any })}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="all">كل الأوقات</option>
            <option value="week">هذا الأسبوع</option>
            <option value="month">هذا الشهر</option>
            <option value="year">هذا العام</option>
          </select>
        </div>
      </div>
    </Card>
  );
};

const AngleArticleCard = ({ article }: { article: AngleArticle }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive": return "text-green-600 bg-green-50";
      case "critical": return "text-red-600 bg-red-50";
      default: return "text-blue-600 bg-blue-50";
    }
  };

  const getSentimentLabel = (sentiment?: string) => {
    switch (sentiment) {
      case "positive": return "إيجابي";
      case "critical": return "نقدي";
      default: return "محايد";
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {article.coverImage && (
        <div className="h-48 overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex items-start gap-3 mb-3">
          <Badge className={`text-xs px-2 py-1 ${getSentimentColor(article.sentiment)}`}>
            {getSentimentLabel(article.sentiment)}
          </Badge>
          
          {article.tags && article.tags.length > 0 && (
            <div className="flex gap-1">
              {article.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>
        
        {article.excerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {article.excerpt}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{article.author?.name}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article.createdAt)}</span>
            </div>
            
            {article.readingTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{article.readingTime} دقيقة</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{article.views || 0}</span>
            </div>
            
            <Button size="sm" variant="ghost" className="text-gray-500 hover:text-blue-600">
              <Heart className="w-4 h-4" />
            </Button>
            
            <Button size="sm" variant="ghost" className="text-gray-500 hover:text-blue-600">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AngleArticlesGrid = ({ 
  articles, 
  loading 
}: { 
  articles: AngleArticle[];
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <Card className="p-12 text-center">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مقالات حتى الآن</h3>
        <p className="text-gray-600 mb-6">ستظهر المقالات هنا عند نشرها في هذه الزاوية</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <Link key={article.id} href={`/article/${article.id}`}>
          <AngleArticleCard article={article} />
        </Link>
      ))}
    </div>
  );
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        السابق
      </Button>
      
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let pageNum;
        if (totalPages <= 5) {
          pageNum = i + 1;
        } else if (currentPage <= 3) {
          pageNum = i + 1;
        } else if (currentPage >= totalPages - 2) {
          pageNum = totalPages - 4 + i;
        } else {
          pageNum = currentPage - 2 + i;
        }
        
        return (
          <Button
            key={pageNum}
            variant={currentPage === pageNum ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </Button>
        );
      })}
      
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        التالي
      </Button>
    </div>
  );
};

export default function AnglePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  
  const [angle, setAngle] = useState<Angle | null>(null);
  const [articles, setArticles] = useState<AngleArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<AngleFilterOptions>({
    sortBy: 'newest',
    timeRange: 'all',
  });

  // جلب بيانات الزاوية
  useEffect(() => {
    const fetchAngle = async () => {
      try {
        const response = await fetch(`/api/muqtarib/angles/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setAngle(data.angle);
        } else {
          toast.error("الزاوية غير موجودة");
          router.push("/muqtarib");
        }
      } catch (error) {
        console.error("خطأ في جلب بيانات الزاوية:", error);
        toast.error("حدث خطأ في تحميل الزاوية");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchAngle();
    }
  }, [slug, router]);

  // جلب مقالات الزاوية
  useEffect(() => {
    const fetchArticles = async () => {
      if (!angle) return;
      
      setArticlesLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "9",
          sortBy: filters.sortBy,
          timeRange: filters.timeRange,
        });

        if (filters.sentiment) {
          params.append("sentiment", filters.sentiment);
        }

        const response = await fetch(`/api/muqtarib/angles/${angle.id}/articles?${params}`);
        if (response.ok) {
          const data = await response.json();
          setArticles(data.articles);
          setTotalPages(data.pagination.pages);
        } else {
          toast.error("فشل في تحميل المقالات");
        }
      } catch (error) {
        console.error("خطأ في جلب المقالات:", error);
        toast.error("حدث خطأ في تحميل المقالات");
      } finally {
        setArticlesLoading(false);
      }
    };

    fetchArticles();
  }, [angle, currentPage, filters]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">جاري تحميل الزاوية...</p>
        </div>
      </div>
    );
  }

  if (!angle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">الزاوية غير موجودة</h2>
          <p className="text-gray-600 mb-6">لم يتم العثور على الزاوية المطلوبة</p>
          <Link href="/muqtarib">
            <Button>
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة لمُقترب
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* شريط التنقل */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Link href="/muqtarib">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 ml-2" />
                مُقترب
              </Button>
            </Link>
            <span className="text-gray-400">/</span>
            <span className="font-medium text-gray-900">{angle.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* هيدر الزاوية */}
          <AngleHeader angle={angle} />
          
          {/* شريط الفلترة */}
          <AngleFilterBar filters={filters} onFiltersChange={setFilters} />
          
          {/* شبكة المقالات */}
          <AngleArticlesGrid articles={articles} loading={articlesLoading} />
          
          {/* التنقل بين الصفحات */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Filter,
  Heart,
  MessageCircle,
  Search,
  Share2,
  TrendingUp,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { memo, useMemo, useState } from "react";

interface AngleClientContentProps {
  angle: any;
  initialArticles: any[];
}

// مكون بطاقة المقال مع memo
const ArticleCard = memo(({ article }: { article: any }) => {
  return (
    <Link
      href={`/muqtarab/articles/${article.slug}`}
      prefetch={true}
      className="block group h-full"
    >
      <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* صورة المقال */}
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        <CardContent className="p-6">
          {/* معلومات المقال */}
          <div className="flex items-center gap-2 mb-3 text-sm">
            <Badge variant="outline" className="text-xs">
              {article.status === "published" ? "منشور" : "مسودة"}
            </Badge>
            <span className="text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readingTime || 5} دقائق
            </span>
          </div>

          {/* العنوان */}
          <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {article.title}
          </h3>

          {/* المقتطف */}
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
            {article.excerpt}
          </p>

          {/* التفاعلات */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {article.views?.toLocaleString() || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {article.likes?.toLocaleString() || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {article.comments?.toLocaleString() || 0}
              </span>
            </div>

            {/* تاريخ النشر */}
            <time className="text-gray-500 text-xs">
              {new Date(article.publishDate || article.createdAt).toLocaleDateString("ar-SA")}
            </time>
          </div>

          {/* العلامات */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {article.tags.slice(0, 3).map((tag: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-0.5"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
});

ArticleCard.displayName = "ArticleCard";

function AngleClientContent({ angle, initialArticles }: AngleClientContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "oldest">("latest");
  const [showOnlyPublished, setShowOnlyPublished] = useState(true);

  // فلترة وترتيب المقالات
  const filteredArticles = useMemo(() => {
    let filtered = [...initialArticles];

    // فلتر حسب الحالة
    if (showOnlyPublished) {
      filtered = filtered.filter((article) => article.status === "published");
    }

    // فلتر البحث
    if (searchQuery) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.tags?.some((tag: string) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // الترتيب
    switch (sortBy) {
      case "latest":
        filtered.sort(
          (a, b) =>
            new Date(b.publishDate || b.createdAt).getTime() -
            new Date(a.publishDate || a.createdAt).getTime()
        );
        break;
      case "popular":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "oldest":
        filtered.sort(
          (a, b) =>
            new Date(a.publishDate || a.createdAt).getTime() -
            new Date(b.publishDate || b.createdAt).getTime()
        );
        break;
    }

    return filtered;
  }, [initialArticles, searchQuery, sortBy, showOnlyPublished]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* رأس الصفحة */}
          <div className="mb-8">
            {/* زر العودة */}
            <Link
              href="/muqtarab"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة إلى مُقترب
            </Link>

            {/* معلومات الزاوية */}
            <div className="flex items-start gap-6">
              {angle.icon && (
                <div className={`p-4 rounded-2xl bg-${angle.themeColor || 'blue'}-100 dark:bg-${angle.themeColor || 'blue'}-900/30`}>
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>
              )}
              
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
                  {angle.title}
                </h1>
                
                {angle.description && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                    {angle.description}
                  </p>
                )}

                {/* إحصائيات الزاوية */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {angle.articleCount || 0} مقال
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {angle.views?.toLocaleString() || 0} مشاهدة
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {angle.author?.name || "مُقترب"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    منذ {new Date(angle.createdAt).toLocaleDateString("ar-SA")}
                  </span>
                </div>

                {/* أزرار التفاعل */}
                <div className="flex gap-2 mt-6">
                  <Button size="sm" variant="outline">
                    <Heart className="w-4 h-4 ml-2" />
                    متابعة الزاوية
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="w-4 h-4 ml-2" />
                    مشاركة
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator className="mb-8" />

          {/* أدوات البحث والفلترة */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* شريط البحث */}
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="search"
                  placeholder="ابحث في مقالات الزاوية..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>

              {/* خيارات الترتيب */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={sortBy === "latest" ? "default" : "outline"}
                  onClick={() => setSortBy("latest")}
                >
                  <Calendar className="w-4 h-4 ml-2" />
                  الأحدث
                </Button>
                <Button
                  size="sm"
                  variant={sortBy === "popular" ? "default" : "outline"}
                  onClick={() => setSortBy("popular")}
                >
                  <TrendingUp className="w-4 h-4 ml-2" />
                  الأكثر مشاهدة
                </Button>
                <Button
                  size="sm"
                  variant={showOnlyPublished ? "default" : "outline"}
                  onClick={() => setShowOnlyPublished(!showOnlyPublished)}
                >
                  <Filter className="w-4 h-4 ml-2" />
                  المنشورة فقط
                </Button>
              </div>
            </div>
          </div>

          {/* شبكة المقالات */}
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {searchQuery
                  ? "لم يتم العثور على مقالات مطابقة للبحث"
                  : "لا توجد مقالات في هذه الزاوية بعد"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(AngleClientContent);

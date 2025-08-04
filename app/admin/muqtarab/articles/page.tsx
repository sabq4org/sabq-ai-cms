"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// تم إزالة DashboardLayout - تستخدم الصفحة layout.tsx الأساسي
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  Clock,
  Edit3,
  Eye,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  author_name: string;
  corner_name: string;
  corner_slug: string;
  status: string;
  is_featured: boolean;
  read_time: number;
  ai_sentiment: string;
  ai_compatibility_score: number;
  view_count: number;
  likes_count: number;
  shares_count: number;
  comments_count: number;
  created_at: string;
  publish_at: string;
}

interface Corner {
  id: string;
  name: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const statusLabels = {
  draft: "مسودة",
  published: "منشور",
  archived: "مؤرشف",
  scheduled: "مجدول",
};

const sentimentLabels = {
  ساخر: "ساخر",
  تأملي: "تأملي",
  عاطفي: "عاطفي",
  تحليلي: "تحليلي",
  إلهامي: "إلهامي",
};

export default function ArticlesManagementPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [corners, setCorners] = useState<Corner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cornerFilter, setCornerFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchCorners();
    fetchArticles();
  }, [
    pagination.page,
    searchTerm,
    statusFilter,
    cornerFilter,
    sentimentFilter,
  ]);

  const fetchCorners = async () => {
    try {
      const response = await fetch("/api/admin/muqtarab/corners?limit=100");
      if (response.ok) {
        const data = await response.json();
        setCorners(data.data.corners || []);
      }
    } catch (error) {
      console.error("خطأ في جلب الزوايا:", error);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        status: statusFilter,
        corner_id: cornerFilter,
        sentiment: sentimentFilter,
      });

      const response = await fetch(`/api/admin/muqtarab/articles?${params}`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.data.articles || []);
        setPagination(data.data.pagination);
      } else {
        console.error("خطأ في جلب المقالات");
      }
    } catch (error) {
      console.error("خطأ في جلب المقالات:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "archived":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "ساخر":
        return "😏";
      case "تأملي":
        return "🤔";
      case "عاطفي":
        return "❤️";
      case "تحليلي":
        return "🔍";
      case "إلهامي":
        return "✨";
      default:
        return "📝";
    }
  };

  const goToPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            إدارة المقالات
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            إدارة وتنظيم مقالات المحتوى الإبداعي في منصة مُقترَب
          </p>
        </div>
        <Button onClick={() => router.push("/admin/muqtarab/articles/create")}>
          <Plus className="w-4 h-4 ml-2" />
          كتابة مقال جديد
        </Button>
      </div>

      {/* شريط البحث والفلاتر */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث في المقالات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="published">منشور</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="scheduled">مجدول</SelectItem>
                <SelectItem value="archived">مؤرشف</SelectItem>
              </SelectContent>
            </Select>

            <Select value={cornerFilter} onValueChange={setCornerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الزاوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الزوايا</SelectItem>
                {corners.map((corner) => (
                  <SelectItem key={corner.id} value={corner.id}>
                    {corner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="النمط" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنماط</SelectItem>
                <SelectItem value="ساخر">😏 ساخر</SelectItem>
                <SelectItem value="تأملي">🤔 تأملي</SelectItem>
                <SelectItem value="عاطفي">❤️ عاطفي</SelectItem>
                <SelectItem value="تحليلي">🔍 تحليلي</SelectItem>
                <SelectItem value="إلهامي">✨ إلهامي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* جدول المقالات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            المقالات ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="mr-3">جاري التحميل...</span>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد مقالات
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                لم يتم العثور على مقالات تطابق البحث المحدد
              </p>
              <Button
                onClick={() => router.push("/admin/muqtarab/articles/create")}
              >
                <Plus className="w-4 h-4 ml-2" />
                كتابة مقال جديد
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* صفوف البيانات */}
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* العمود الأول: العنوان والمعلومات الأساسية */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {getSentimentIcon(article.ai_sentiment)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {article.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className={getStatusColor(article.status)}>
                              {statusLabels[
                                article.status as keyof typeof statusLabels
                              ] || article.status}
                            </Badge>
                            {article.is_featured && (
                              <Badge
                                variant="outline"
                                className="text-yellow-600 border-yellow-600"
                              >
                                مميز
                              </Badge>
                            )}
                            {article.ai_sentiment && (
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1"
                              >
                                <Brain className="w-3 h-3" />
                                {article.ai_sentiment}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p>
                              بقلم:{" "}
                              <span className="font-medium">
                                {article.author_name}
                              </span>
                            </p>
                            <p>
                              في زاوية:{" "}
                              <span className="font-medium">
                                {article.corner_name}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* العمود الثاني: الإحصائيات */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span>{article.view_count}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <span>{article.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{article.read_time} د</span>
                        </div>
                        {article.ai_compatibility_score > 0 && (
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-blue-500" />
                            <span className="text-blue-600">
                              {article.ai_compatibility_score}%
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        <p>تاريخ الإنشاء: {formatDate(article.created_at)}</p>
                        {article.publish_at && (
                          <p>تاريخ النشر: {formatDate(article.publish_at)}</p>
                        )}
                      </div>
                    </div>

                    {/* العمود الثالث: الإجراءات */}
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/muqtarab/${article.corner_slug}/${article.slug}`
                              )
                            }
                          >
                            <Eye className="w-4 h-4 ml-2" />
                            عرض المقال
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/admin/muqtarab/articles/${article.id}/edit`
                              )
                            }
                          >
                            <Edit3 className="w-4 h-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => console.log("Delete", article.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* الترقيم */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                عرض {(pagination.page - 1) * pagination.limit + 1} إلى{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                من {pagination.total} مقال
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  السابق
                </Button>
                {Array.from(
                  { length: Math.min(5, pagination.pages) },
                  (_, i) => {
                    const page = i + Math.max(1, pagination.page - 2);
                    return (
                      <Button
                        key={page}
                        variant={
                          page === pagination.page ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  }
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

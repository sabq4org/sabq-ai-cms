"use client";

import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { cn } from "@/lib/utils";
import {
  Brain,
  Calendar,
  Clock,
  Crown,
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
// تم إزالة DashboardLayout لأن الصفحة تستخدم layout.tsx في /admin

// Types
interface ArticleAuthor {
  id: string;
  full_name: string;
  slug: string;
  title?: string;
  avatar_url?: string;
  ai_score: number;
  total_articles: number;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  summary?: string;
  article_author_id?: string;
  article_author?: ArticleAuthor;
  status: "published" | "draft" | "archived";
  article_type: string;
  featured_image?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  views: number;
  likes: number;
  shares: number;
  reading_time?: number;
  tags: string[];
  ai_quotes: string[];
  ai_score?: number;
  is_opinion_leader?: boolean;
  featured?: boolean;
  breaking?: boolean;
}

interface ArticleStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  thisWeek: number;
  totalViews: number;
  avgScore: number;
  featured: number;
  breaking: number;
}

const ArticlesAdminPage = () => {
  const { darkMode } = useDarkModeContext();

  // State
  const [articles, setArticles] = useState<Article[]>([]);
  const [authors, setAuthors] = useState<ArticleAuthor[]>([]);
  const [stats, setStats] = useState<ArticleStats>({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0,
    thisWeek: 0,
    totalViews: 0,
    avgScore: 0,
    featured: 0,
    breaking: 0,
  });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "published" | "draft" | "archived"
  >("all");
  const [filterAuthor, setFilterAuthor] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    | "created_at"
    | "published_at"
    | "views"
    | "ai_score"
    | "featured"
    | "breaking"
  >("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentOpinionLeader, setCurrentOpinionLeader] = useState<
    string | null
  >(null);
  const [settingOpinionLeader, setSettingOpinionLeader] = useState<
    string | null
  >(null);
  const [updatingFeatured, setUpdatingFeatured] = useState<string | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);

  // Load data
  useEffect(() => {
    loadArticles();
    loadAuthors();
    loadCurrentOpinionLeader();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/articles");
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);

        // Calculate stats
        const total = data.articles?.length || 0;
        const published =
          data.articles?.filter((a: Article) => a.status === "published")
            .length || 0;
        const draft =
          data.articles?.filter((a: Article) => a.status === "draft").length ||
          0;
        const archived =
          data.articles?.filter((a: Article) => a.status === "archived")
            .length || 0;
        const featured =
          data.articles?.filter((a: Article) => a.featured).length || 0;
        const breaking =
          data.articles?.filter((a: Article) => a.breaking).length || 0;
        const totalViews =
          data.articles?.reduce(
            (sum: number, a: Article) => sum + (a.views || 0),
            0
          ) || 0;
        const avgScore =
          data.articles
            ?.filter((a: Article) => a.ai_score)
            .reduce((sum: number, a: Article) => sum + (a.ai_score || 0), 0) /
            data.articles?.filter((a: Article) => a.ai_score).length || 0;

        setStats({
          total,
          published,
          draft,
          archived,
          featured,
          breaking,
          thisWeek: 0,
          totalViews,
          avgScore: Math.round(avgScore * 100) / 100,
        });
      }
    } catch (error) {
      console.error("Error loading articles:", error);
      toast.error("خطأ في تحميل المقالات");
    } finally {
      setLoading(false);
    }
  };

  const loadAuthors = async () => {
    try {
      const response = await fetch("/api/admin/article-authors", { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setAuthors(data.authors || []);
      }
    } catch (error) {
      console.error("Error loading authors:", error);
    }
  };

  const loadCurrentOpinionLeader = async () => {
    try {
      const response = await fetch("/api/opinion/leaders");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCurrentOpinionLeader(data.data.id);
        }
      }
    } catch (error) {
      console.error("Error loading current opinion leader:", error);
    }
  };

  const setAsOpinionLeader = async (articleId: string) => {
    try {
      setSettingOpinionLeader(articleId);

      const response = await fetch("/api/opinion/leaders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ articleId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCurrentOpinionLeader(articleId);
          toast.success("تم تعيين المقال كقائد رأي اليوم بنجاح!");

          // Update the articles list to reflect the change
          setArticles((prev) =>
            prev.map((article) => ({
              ...article,
              is_opinion_leader: article.id === articleId,
            }))
          );
        } else {
          toast.error(data.error || "فشل في تعيين قائد الرأي");
        }
      } else {
        toast.error("فشل في تعيين قائد الرأي");
      }
    } catch (error) {
      console.error("Error setting opinion leader:", error);
      toast.error("حدث خطأ في تعيين قائد الرأي");
    } finally {
      setSettingOpinionLeader(null);
    }
  };

  const toggleFeaturedStatus = async (
    articleId: string,
    currentStatus: boolean
  ) => {
    try {
      setUpdatingFeatured(articleId);

      const response = await fetch(`/api/articles/${articleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          featured: !currentStatus,
          breaking: !currentStatus && true, // إذا كان مميز، فهو عاجل أيضاً
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update the articles list
          setArticles((prev) =>
            prev.map((article) =>
              article.id === articleId
                ? {
                    ...article,
                    featured: !currentStatus,
                    breaking: !currentStatus,
                  }
                : article
            )
          );

          toast.success(
            !currentStatus
              ? "✨ تم تمييز المقال كخبر عاجل!"
              : "تم إلغاء تمييز المقال"
          );
        } else {
          toast.error(data.error || "فشل في تحديث حالة المقال");
        }
      } else {
        toast.error("فشل في تحديث حالة المقال");
      }
    } catch (error) {
      console.error("Error updating featured status:", error);
      toast.error("حدث خطأ في تحديث حالة المقال");
    } finally {
      setUpdatingFeatured(null);
    }
  };

  const handleDeleteClick = (article: Article) => {
    setArticleToDelete(article);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;

    setDeletingArticle(articleToDelete.id);
    try {
      const response = await fetch(`/api/articles/${articleToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // إزالة المقال من القائمة
          setArticles((prev) =>
            prev.filter((article) => article.id !== articleToDelete.id)
          );

          // تحديث الإحصائيات
          setStats((prev) => ({
            ...prev,
            total: prev.total - 1,
            [articleToDelete.status]: Math.max(
              0,
              prev[articleToDelete.status] - 1
            ),
            featured: articleToDelete.featured
              ? Math.max(0, prev.featured - 1)
              : prev.featured,
            breaking: articleToDelete.breaking
              ? Math.max(0, prev.breaking - 1)
              : prev.breaking,
          }));

          toast.success(`تم حذف المقال "${articleToDelete.title}" نهائياً!`);
          setDeleteModalOpen(false);
          setArticleToDelete(null);
        } else {
          toast.error(data.error || "فشل في حذف المقال");
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "فشل في حذف المقال");
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("حدث خطأ في حذف المقال");
    } finally {
      setDeletingArticle(null);
    }
  };

  // Filter articles
  const filteredArticles = useMemo(() => {
    let filtered = articles;

    if (searchTerm) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.article_author?.full_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((article) => article.status === filterStatus);
    }

    if (filterAuthor !== "all") {
      filtered = filtered.filter(
        (article) => article.article_author_id === filterAuthor
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(
        (article) => article.article_type === filterType
      );
    }

    // Sort
    filtered.sort((a, b) => {
      // Handle special sorting for featured and breaking news
      if (sortBy === "featured") {
        if (a.featured !== b.featured) {
          return b.featured ? 1 : -1; // Featured articles first
        }
        // If both have same featured status, sort by date
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      if (sortBy === "breaking") {
        if (a.breaking !== b.breaking) {
          return b.breaking ? 1 : -1; // Breaking news first
        }
        // If both have same breaking status, sort by date
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      // Default sorting logic for other fields
      const aValue = a[sortBy] || 0;
      const bValue = b[sortBy] || 0;

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    articles,
    searchTerm,
    filterStatus,
    filterAuthor,
    filterType,
    sortBy,
    sortOrder,
  ]);

  return (
    <>
      <link rel="stylesheet" href="/manus-ui.css" />
      <div style={{ 
        minHeight: '100vh', 
        background: 'hsl(var(--bg))', 
        padding: '0',
        width: '100%',
        color: 'hsl(var(--fg))'
      }}>
      <div className="news-page-container">
        <div className="space-y-6 md:space-y-8">
      {/* رسالة الترحيب */}
      <div className="card card-accent shadow-md rounded-xl p-6" style={{ marginBottom: '0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'hsl(var(--accent) / 0.1)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'hsl(var(--accent))'
          }}>
            <FileText style={{ width: '24px', height: '24px' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 className="heading-2" style={{ marginBottom: '8px' }}>
              نظام إدارة المقالات المتطور
            </h2>
            <p className="text-muted" style={{ marginBottom: '16px' }}>
              إدارة شاملة لمقالات قادة الرأي مع أدوات ذكية مدعومة بالذكاء الاصطناعي
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="chip">
                ✅ {stats.published} مقال منشور
              </div>
              <div className="chip chip-muted">
                📊 {stats.total} إجمالي
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={loadArticles}
              className="btn"
            >
              <RefreshCw style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
              تحديث
            </button>

            <Link href="/admin/articles/new">
              <button className="btn btn-primary">
                <Plus style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
                مقال جديد
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {[
          {
            label: "إجمالي المقالات",
            value: stats.total.toString(),
            icon: FileText,
            color: "blue",
          },
          {
            label: "المنشورة",
            value: stats.published.toString(),
            icon: Eye,
            color: "green",
          },
          {
            label: "المسودات",
            value: stats.draft.toString(),
            icon: Clock,
            color: "yellow",
          },
          {
            label: "المميزة",
            value: stats.featured.toString(),
            icon: TrendingUp,
            color: "red",
          },
          {
            label: "العاجلة",
            value: stats.breaking.toString(),
            icon: Crown,
            color: "orange",
          },
          {
            label: "المشاهدات",
            value: stats.totalViews.toLocaleString(),
            icon: TrendingUp,
            color: "purple",
          },
          {
            label: "قائد رأي اليوم",
            value: currentOpinionLeader ? "✓" : "✗",
            icon: Crown,
            color: "gold",
            special: true,
          },
        ].map((stat, index) => (
          <div key={index} className="card shadow-md rounded-xl p-6" style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'hsl(var(--accent) / 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'hsl(var(--accent))'
              }}>
                <stat.icon style={{ width: '24px', height: '24px' }} />
              </div>
              
              <div style={{ flex: 1 }}>
                <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>{stat.label}</div>
                <div className="heading-3" style={{ margin: '4px 0', color: 'hsl(var(--accent))' }}>
                  {stat.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* أدوات البحث والفلترة */}
      <div className="card shadow-md rounded-xl p-6" style={{ marginBottom: '0' }}>
        <div className="card-header">
          <h3 className="card-title">البحث والفلترة</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* البحث */}
          <div style={{ position: 'relative' }}>
            <Search style={{ 
              position: 'absolute', 
              right: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'hsl(var(--muted))', 
              width: '16px', 
              height: '16px' 
            }} />
            <input
              type="text"
              placeholder="البحث في المقالات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 12px',
                border: '1px solid hsl(var(--line))',
                borderRadius: '8px',
                background: 'hsl(var(--bg-card))',
                color: 'hsl(var(--fg))',
                textAlign: 'right'
              }}
            />
          </div>

          {/* فلتر الحالة */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            style={{
              padding: '12px 16px',
              border: '1px solid hsl(var(--line))',
              borderRadius: '8px',
              background: 'hsl(var(--bg-card))',
              color: 'hsl(var(--fg))'
            }}
          >
            <option value="all">جميع الحالات</option>
            <option value="published">منشورة</option>
            <option value="draft">مسودة</option>
            <option value="archived">مؤرشفة</option>
          </select>

          {/* فلتر الكاتب */}
          <select
            value={filterAuthor}
            onChange={(e) => setFilterAuthor(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '1px solid hsl(var(--line))',
              borderRadius: '8px',
              background: 'hsl(var(--bg-card))',
              color: 'hsl(var(--fg))'
            }}
          >
            <option value="all">جميع الكتّاب</option>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.full_name}
              </option>
            ))}
          </select>

          {/* الترتيب */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-");
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            style={{
              padding: '12px 16px',
              border: '1px solid hsl(var(--line))',
              borderRadius: '8px',
              background: 'hsl(var(--bg-card))',
              color: 'hsl(var(--fg))'
            }}
          >
            <option value="created_at-desc">الأحدث أولاً</option>
            <option value="created_at-asc">الأقدم أولاً</option>
            <option value="published_at-desc">آخر نشر</option>
            <option value="views-desc">الأكثر مشاهدة</option>
            <option value="ai_score-desc">أعلى تقييم</option>
            <option value="featured-desc">المميزة أولاً</option>
            <option value="breaking-desc">العاجلة أولاً</option>
          </select>
        </div>
      </div>

      {/* قائمة المقالات */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px 0' }}>
          <RefreshCw style={{ width: '32px', height: '32px', color: 'hsl(var(--accent))' }} className="animate-spin" />
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="card shadow-md rounded-xl" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <FileText style={{ width: '64px', height: '64px', color: 'hsl(var(--muted))', margin: '0 auto 16px' }} />
          <h3 className="heading-3" style={{ marginBottom: '8px' }}>
            لا توجد مقالات
          </h3>
          <p className="text-muted" style={{ marginBottom: '24px' }}>
            ابدأ بكتابة أول مقال لك
          </p>
          <Link href="/admin/articles/new">
            <button className="btn btn-primary">
              <Plus style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
              إنشاء مقال جديد
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredArticles.map((article) => (
            <div key={article.id} className="card interactive shadow-md rounded-xl p-6">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <h3 className="heading-3" style={{ marginBottom: '0' }}>
                      {article.title}
                    </h3>

                    {/* شارة قائد الرأي اليوم */}
                    {currentOpinionLeader === article.id && (
                      <div className="chip" style={{
                        background: 'rgba(251, 191, 36, 0.1)',
                        color: '#d97706',
                        border: '1px solid rgba(251, 191, 36, 0.3)'
                      }}>
                        <Crown style={{ width: '12px', height: '12px', marginLeft: '4px' }} />
                        قائد رأي اليوم
                      </div>
                    )}

                    {/* شارة المقال المميز والعاجل */}
                    {article.featured && (
                      <div className="chip" style={{
                        background: 'linear-gradient(to right, #ef4444, #f97316)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.25)'
                      }}>
                        <span style={{ animation: 'pulse 2s infinite' }}>🔥</span>
                        خبر عاجل
                      </div>
                    )}

                    <div
                      className="chip"
                      style={{
                        background: article.status === "published" 
                          ? 'hsl(var(--accent-3) / 0.1)' 
                          : article.status === "draft"
                          ? 'hsl(var(--accent-4) / 0.1)'
                          : 'hsl(var(--line) / 0.3)',
                        color: article.status === "published"
                          ? 'hsl(var(--accent-3))'
                          : article.status === "draft"
                          ? 'hsl(var(--accent-4))'
                          : 'hsl(var(--muted))',
                        border: `1px solid ${article.status === "published" 
                          ? 'hsl(var(--accent-3) / 0.2)' 
                          : article.status === "draft"
                          ? 'hsl(var(--accent-4) / 0.2)'
                          : 'hsl(var(--line))'}`
                      }}
                    >
                      {article.status === "published"
                        ? "منشور"
                        : article.status === "draft"
                        ? "مسودة"
                        : "مؤرشف"}
                    </div>
                  </div>

                  {article.excerpt && (
                    <p className="text-sm text-muted" style={{ marginBottom: '12px', lineHeight: '1.5' }}>
                      {article.excerpt}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '14px', color: 'hsl(var(--muted))' }}>
                    {article.article_author && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User style={{ width: '16px', height: '16px' }} />
                        <span>{article.article_author.full_name}</span>
                        {article.article_author.title && (
                          <span style={{ color: 'hsl(var(--muted))' }}>
                            ({article.article_author.title})
                          </span>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar style={{ width: '16px', height: '16px' }} />
                      <span>
                        {new Date(article.created_at).toLocaleDateString("ar-SA")}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Eye style={{ width: '16px', height: '16px' }} />
                      <span>{article.views.toLocaleString()}</span>
                    </div>

                    {article.ai_score && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Brain style={{ width: '16px', height: '16px' }} />
                        <span>{Math.round(article.ai_score * 100)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* زر الخبر العاجل/المميز */}
                  {article.status === "published" && (
                    <button
                      onClick={() =>
                        toggleFeaturedStatus(
                          article.id,
                          article.featured || false
                        )
                      }
                      disabled={updatingFeatured === article.id}
                      className={article.featured ? "btn btn-sm" : "btn btn-sm"}
                      style={{
                        background: article.featured 
                          ? 'linear-gradient(to right, #ef4444, #f97316)'
                          : 'hsl(var(--bg-card))',
                        color: article.featured ? 'white' : 'hsl(var(--fg))',
                        border: article.featured ? 'none' : '1px solid hsl(var(--line))',
                        opacity: updatingFeatured === article.id ? 0.5 : 1,
                        cursor: updatingFeatured === article.id ? 'not-allowed' : 'pointer'
                      }}
                      title={
                        article.featured
                          ? "إلغاء تمييز كخبر عاجل"
                          : "تمييز كخبر عاجل"
                      }
                    >
                      {article.featured ? (
                        <>
                          <span style={{ animation: 'pulse 2s infinite' }}>🔥</span>
                          <span>عاجل</span>
                        </>
                      ) : (
                        <>
                          <span>⭐</span>
                          <span>تمييز</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* زر قائد الرأي اليوم */}
                  {article.status === "published" &&
                    article.article_type === "opinion" && (
                      <button
                        onClick={() => setAsOpinionLeader(article.id)}
                        disabled={settingOpinionLeader === article.id}
                        className="btn btn-sm"
                        style={{
                          background: currentOpinionLeader === article.id
                            ? 'rgba(251, 191, 36, 0.1)'
                            : 'hsl(var(--bg-card))',
                          color: currentOpinionLeader === article.id
                            ? '#d97706'
                            : 'hsl(var(--muted))',
                          border: currentOpinionLeader === article.id
                            ? '1px solid rgba(251, 191, 36, 0.3)'
                            : '1px solid hsl(var(--line))',
                          opacity: settingOpinionLeader === article.id ? 0.5 : 1,
                          cursor: settingOpinionLeader === article.id ? 'not-allowed' : 'pointer',
                          position: 'relative'
                        }}
                        title={
                          currentOpinionLeader === article.id
                            ? "قائد رأي اليوم الحالي"
                            : "تعيين كقائد رأي اليوم"
                        }
                      >
                        <Crown style={{ width: '16px', height: '16px' }} />
                        {currentOpinionLeader === article.id && (
                          <span style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            width: '8px',
                            height: '8px',
                            background: '#eab308',
                            borderRadius: '50%'
                          }}></span>
                        )}
                      </button>
                    )}

                  <Link href={`/admin/articles/edit/${article.id}`}>
                    <button className="btn btn-sm">
                      <Edit style={{ width: '16px', height: '16px' }} />
                    </button>
                  </Link>

                  <button
                    onClick={() => handleDeleteClick(article)}
                    disabled={deletingArticle === article.id}
                    className="btn btn-sm"
                    style={{
                      color: '#ef4444',
                      borderColor: 'hsl(var(--line))',
                      opacity: deletingArticle === article.id ? 0.5 : 1,
                      cursor: deletingArticle === article.id ? 'not-allowed' : 'pointer'
                    }}
                    title="حذف المقال نهائياً"
                  >
                    <Trash2 style={{ width: '16px', height: '16px' }} />
                  </button>

                  <button className="btn btn-sm">
                    <MoreHorizontal style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      </div>
      </div>
      {/* Modal تأكيد الحذف */}
      {deleteModalOpen && articleToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            maxWidth: '448px',
            width: '100%',
            margin: '0 16px',
            borderRadius: '12px',
            padding: '24px',
            background: 'hsl(var(--bg-card))',
            border: '1px solid hsl(var(--line))',
            color: 'hsl(var(--fg))'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                padding: '8px',
                borderRadius: '8px',
                background: 'hsl(0 60% 95%)'
              }}>
                <Trash2 style={{ width: '24px', height: '24px', color: '#dc2626' }} />
              </div>
              <div>
                <h3 className="heading-3" style={{ marginBottom: '4px' }}>
                  تأكيد حذف المقال
                </h3>
                <p className="text-sm text-muted">
                  هذا الإجراء لا يمكن التراجع عنه
                </p>
              </div>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              background: 'hsl(0 60% 95%)',
              border: '1px solid hsl(0 60% 85%)'
            }}>
              <p style={{ fontSize: '14px', marginBottom: '8px', color: '#7f1d1d' }}>
                <strong>سيتم حذف المقال التالي نهائياً:</strong>
              </p>
              <p style={{ fontWeight: '500', marginBottom: '12px', color: 'hsl(var(--fg))' }}>
                "{articleToDelete.title}"
              </p>
              <ul style={{ fontSize: '12px', color: '#991b1b', listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '4px' }}>• سيتم حذف المقال والمحتوى نهائياً</li>
                <li style={{ marginBottom: '4px' }}>• سيتم حذف جميع التعليقات والإعجابات</li>
                <li style={{ marginBottom: '4px' }}>• سيتم إزالة المقال من قوائم المستخدمين المحفوظة</li>
                <li>• لا يمكن استرداد هذه البيانات لاحقاً</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setArticleToDelete(null);
                }}
                disabled={deletingArticle === articleToDelete.id}
                className="btn"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingArticle === articleToDelete.id}
                className="btn"
                style={{
                  background: '#ef4444',
                  color: 'white',
                  borderColor: '#ef4444',
                  opacity: deletingArticle === articleToDelete.id ? 0.5 : 1,
                  cursor: deletingArticle === articleToDelete.id ? 'not-allowed' : 'pointer'
                }}
              >
                {deletingArticle === articleToDelete.id ? (
                  <>
                    <RefreshCw style={{ width: '16px', height: '16px', marginLeft: '8px' }} className="animate-spin" />
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <Trash2 style={{ width: '16px', height: '16px', marginLeft: '8px' }} />
                    حذف نهائي
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default ArticlesAdminPage;

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Head from "next/head";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  Clock,
  ChevronDown,
  Check,
  X,
  TrendingUp,
  AlertCircle,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { toast } from "react-hot-toast";

type NewsStatus = "all" | "published" | "draft" | "scheduled" | "archived";

interface Article {
  id: string;
  title: string;
  slug?: string;
  thumbnail_url?: string | null;
  status: string;
  published_at?: string | null;
  created_at: string;
  views?: number;
  breaking?: boolean;
  category?: { name: string; color?: string };
  author?: { name: string; avatar?: string };
  comments_count?: number;
}

export default function ImprovedAdminMobileNewsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<NewsStatus>(
    (searchParams.get("status") as NewsStatus) || "all"
  );
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const statusOptions: { value: NewsStatus; label: string; color: string; icon: React.ElementType }[] = [
    { value: "all", label: "الكل", color: "hsl(var(--fg))", icon: Calendar },
    { value: "published", label: "منشور", color: "#10B981", icon: Check },
    { value: "draft", label: "مسودة", color: "#6B7280", icon: Edit },
    { value: "scheduled", label: "مجدول", color: "#3B82F6", icon: Clock },
    { value: "archived", label: "مؤرشف", color: "#F59E0B", icon: X },
  ];

  // جلب الأخبار مع تحسينات الأداء
  const fetchArticles = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!append) setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "all") params.set("status", selectedStatus);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("page", pageNum.toString());
      params.set("limit", "20");

      const response = await fetch(`/api/admin/news?${params}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const newArticles = data.items || data.articles || [];
      
      if (append) {
        setArticles(prev => [...prev, ...newArticles]);
      } else {
        setArticles(newArticles);
      }
      
      setHasMore(newArticles.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("حدث خطأ في جلب الأخبار");
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, searchQuery]);

  // تأخير البحث لتحسين الأداء
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      fetchArticles(1, false);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  useEffect(() => {
    fetchArticles(1, false);
    
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [selectedStatus]);

  // التحميل اللانهائي المحسن
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && articles.length > 0) {
          fetchArticles(page + 1, true);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [page, hasMore, loading, fetchArticles, articles.length]);

  // حذف مقال مع تأكيد محسن
  const handleDelete = async (id: string, title: string) => {
    const confirmed = window.confirm(`هل أنت متأكد من حذف الخبر: "${title}"؟`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (response.ok) {
        setArticles(prev => prev.filter(a => a.id !== id));
        toast.success("تم حذف الخبر بنجاح");
        setSelectedArticle(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "فشل حذف الخبر");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  // تبديل حالة العاجل مع تحسينات
  const toggleBreaking = async (id: string, currentState: boolean, title: string) => {
    try {
      const response = await fetch(`/api/admin/toggle-breaking/${id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ breaking: !currentState })
      });

      if (response.ok) {
        setArticles(prev => 
          prev.map(a => a.id === id ? { ...a, breaking: !currentState } : a)
        );
        toast.success(
          !currentState 
            ? `تم تعيين "${title}" كخبر عاجل` 
            : `تم إلغاء الخبر العاجل من "${title}"`
        );
        setSelectedArticle(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "فشل في تحديث حالة الخبر");
      }
    } catch (error) {
      console.error("Toggle breaking error:", error);
      toast.error("حدث خطأ في تحديث حالة الخبر");
    }
  };

  // إغلاق الإجراءات عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = () => {
      if (selectedArticle) {
        setSelectedArticle(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [selectedArticle]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="hsl(var(--bg))" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </Head>
      
      <div className="mobile-news-page" dir="rtl">
        {/* شريط البحث والفلتر المحسن */}
        <div className="search-filter-bar">
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div className="search-input-container">
              <Search size={18} style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "hsl(var(--muted))",
                zIndex: 1
              }} />
              <input
                type="search"
                placeholder="البحث في الأخبار..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="search-input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`filter-button ${filterOpen ? 'active' : ''}`}
              aria-label="فتح الفلاتر"
            >
              <Filter size={18} />
              {selectedStatus !== "all" && (
                <span style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  width: "8px",
                  height: "8px",
                  background: "#EF4444",
                  borderRadius: "50%"
                }} />
              )}
            </button>
          </div>

          {/* قائمة الفلاتر المحسنة */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <div className="filter-options">
                  {statusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedStatus(option.value);
                        setFilterOpen(false);
                        router.push(`/admin-mobile/news?status=${option.value}`);
                      }}
                      className={`filter-option ${selectedStatus === option.value ? 'active' : ''}`}
                      style={{
                        borderColor: selectedStatus === option.value ? option.color : "hsl(var(--line))",
                        backgroundColor: selectedStatus === option.value ? `${option.color}20` : "hsl(var(--bg-card))",
                        color: selectedStatus === option.value ? option.color : "hsl(var(--fg))",
                      }}
                    >
                      <option.icon size={14} />
                      {option.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* قائمة الأخبار المحسنة */}
        <div className="news-list-container">
          {loading && articles.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <EmptyState status={selectedStatus} searchQuery={searchQuery} />
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {articles.map((article, index) => (
                  <NewsCard
                    key={`${article.id}-${index}`}
                    article={article}
                    isSelected={selectedArticle === article.id}
                    onSelect={() => setSelectedArticle(article.id === selectedArticle ? null : article.id)}
                    onDelete={() => handleDelete(article.id, article.title)}
                    onToggleBreaking={() => toggleBreaking(article.id, article.breaking || false, article.title)}
                  />
                ))}
              </div>

              {/* مؤشر التحميل المحسن */}
              {hasMore && (
                <div ref={loadMoreRef} style={{ textAlign: "center", padding: "20px" }}>
                  {loading ? (
                    <div className="loading-spinner" />
                  ) : (
                    <div style={{ color: "hsl(var(--muted))", fontSize: "14px" }}>
                      اسحب لأسفل لتحميل المزيد
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* الأنماط المضمنة */}
        <style jsx>{`
          .mobile-news-page {
            min-height: 100vh;
            min-height: 100dvh;
            width: 100%;
            max-width: 100vw;
            position: relative;
            background: hsl(var(--bg));
            overflow-x: hidden;
          }

          .search-filter-bar {
            position: sticky;
            top: 0;
            background: hsl(var(--bg));
            border-bottom: 1px solid hsl(var(--line));
            padding: 12px 16px;
            z-index: 100;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          }

          .search-input-container {
            flex: 1;
            position: relative;
            min-width: 0;
          }

          .search-input {
            width: 100%;
            padding: 10px 40px 10px 12px;
            border: 1px solid hsl(var(--line));
            border-radius: 8px;
            background: hsl(var(--bg-card));
            font-size: 16px;
            line-height: 1.4;
            -webkit-appearance: none;
            appearance: none;
            transition: all 0.2s ease;
          }

          .search-input:focus {
            outline: none;
            border-color: hsl(var(--accent));
            box-shadow: 0 0 0 2px hsl(var(--accent) / 0.2);
          }

          .filter-button {
            min-width: 44px;
            min-height: 44px;
            padding: 8px 12px;
            border: 1px solid hsl(var(--line));
            border-radius: 8px;
            background: hsl(var(--bg-card));
            cursor: pointer;
            transition: all 0.2s ease;
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
            position: relative;
          }

          .filter-button:active {
            transform: scale(0.95);
          }

          .filter-button.active {
            background: hsl(var(--accent));
            color: white;
            border-color: hsl(var(--accent));
          }

          .filter-options {
            display: flex;
            gap: 8px;
            margin-top: 12px;
            overflow-x: auto;
            padding-bottom: 4px;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .filter-options::-webkit-scrollbar {
            display: none;
          }

          .filter-option {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border-radius: 20px;
            border: 1px solid hsl(var(--line));
            background: hsl(var(--bg-card));
            font-size: 13px;
            white-space: nowrap;
            transition: all 0.2s ease;
            cursor: pointer;
            min-height: 36px;
            touch-action: manipulation;
          }

          .news-list-container {
            padding: 8px 12px;
            padding-bottom: calc(8px + env(safe-area-inset-bottom));
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid hsl(var(--line));
            border-top-color: hsl(var(--accent));
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }

          .skeleton-card {
            height: 100px;
            background: hsl(var(--bg-card));
            border-radius: 12px;
            animation: pulse 1.5s ease-in-out infinite;
            margin-bottom: 12px;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }

          @supports (-webkit-touch-callout: none) {
            .mobile-news-page {
              min-height: -webkit-fill-available;
            }
          }

          @supports (padding: max(0px)) {
            .mobile-news-page {
              padding-left: max(12px, env(safe-area-inset-left));
              padding-right: max(12px, env(safe-area-inset-right));
            }
          }
        `}</style>
      </div>
    </>
  );
}

// مكون بطاقة الخبر المحسن
function NewsCard({ 
  article, 
  isSelected, 
  onSelect, 
  onDelete,
  onToggleBreaking 
}: {
  article: Article;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleBreaking: () => void;
}) {
  const [imageError, setImageError] = useState(false);
  
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onSelect(),
    onSwipedRight: () => onSelect(),
    trackMouse: false,
    preventScrollOnSwipe: false,
    delta: 50
  });

  const timeAgo = (date: string) => {
    const now = new Date();
    const published = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - published.getTime()) / 60000);
    
    if (diffInMinutes < 1) return "الآن";
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "#10B981";
      case "draft": return "#6B7280";
      case "scheduled": return "#3B82F6";
      case "archived": return "#F59E0B";
      default: return "hsl(var(--muted))";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "published": return "منشور";
      case "draft": return "مسودة";
      case "scheduled": return "مجدول";
      case "archived": return "مؤرشف";
      default: return status;
    }
  };

  const imageUrl = (article as any).thumbnail_url || 
                   (article as any).image_url || 
                   (article as any).thumbnail || 
                   (article as any).image || 
                   (article as any).cover_url;

  return (
    <motion.div
      {...swipeHandlers}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileTap={{ scale: 0.98 }}
      className="news-card-mobile"
      style={{
        background: "transparent",
        borderBottom: "1px solid hsl(var(--line))",
        overflow: "visible",
        position: "relative"
      }}
    >
      <div className="news-card-content">
        {/* الصورة المصغرة المحسنة */}
        <div className="news-thumbnail">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={article.title}
              loading="lazy"
              onError={() => setImageError(true)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          ) : (
            <div className="news-thumbnail-placeholder">
              <ImageIcon size={24} style={{ color: "hsl(var(--muted))" }} />
            </div>
          )}
        </div>

        {/* المحتوى المحسن */}
        <div className="news-content">
          {/* العنوان */}
          <h3 className="news-title">
            {(article as any).main_title || article.title}
          </h3>

          {/* المعلومات الوصفية */}
          <div className="news-meta">
            <span 
              className="news-badge"
              style={{
                backgroundColor: `${getStatusColor(article.status)}15`,
                color: getStatusColor(article.status),
              }}
            >
              {getStatusLabel(article.status)}
            </span>
            
            {article.breaking && (
              <span 
                className="news-badge"
                style={{
                  backgroundColor: "#EF444415",
                  color: "#EF4444",
                  fontWeight: "600"
                }}
              >
                عاجل
              </span>
            )}

            {article.category && (
              <span 
                className="news-badge"
                style={{
                  backgroundColor: `${article.category.color || "#6B7280"}15`,
                  color: article.category.color || "#6B7280",
                }}
              >
                {article.category.name}
              </span>
            )}
          </div>

          {/* معلومات إضافية */}
          <div className="news-info">
            <span>{timeAgo(article.published_at || article.created_at)}</span>
            {article.views !== undefined && (
              <>
                <span>•</span>
                <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                  <Eye size={10} />
                  {article.views > 999 ? `${Math.floor(article.views/1000)}k` : article.views}
                </span>
              </>
            )}
            {article.comments_count !== undefined && article.comments_count > 0 && (
              <>
                <span>•</span>
                <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                  <MessageSquare size={10} />
                  {article.comments_count}
                </span>
              </>
            )}
          </div>
        </div>

        {/* زر الإجراءات المحسن */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="actions-button"
          aria-label="فتح الإجراءات"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {/* إجراءات السحب المحسنة */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="swipe-actions"
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              href={`/admin/news/edit/${article.id}`}
              className="swipe-action-button"
              style={{ backgroundColor: "#10B981", color: "white" }}
              aria-label="تحرير الخبر"
            >
              <Edit size={16} />
            </Link>
            <button
              onClick={onToggleBreaking}
              className="swipe-action-button"
              style={{ 
                backgroundColor: article.breaking ? "#F59E0B" : "#8B5CF6", 
                color: "white" 
              }}
              aria-label={article.breaking ? "إلغاء الخبر العاجل" : "تعيين كخبر عاجل"}
            >
              <Zap size={18} />
            </button>
            <button
              onClick={onDelete}
              className="swipe-action-button"
              style={{ backgroundColor: "#EF4444", color: "white" }}
              aria-label="حذف الخبر"
            >
              <Trash2 size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .news-card-content {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          align-items: flex-start;
          width: 100%;
          min-height: 80px;
        }

        .news-thumbnail {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          overflow: hidden;
          background: hsl(var(--accent) / 0.08);
          flex-shrink: 0;
          position: relative;
        }

        .news-thumbnail-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: hsl(var(--muted) / 0.1);
        }

        .news-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .news-title {
          font-size: 15px;
          font-weight: 700;
          line-height: 1.4;
          color: hsl(var(--fg));
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-wrap: break-word;
        }

        .news-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }

        .news-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 500;
          white-space: nowrap;
        }

        .news-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: hsl(var(--muted));
          flex-wrap: wrap;
        }

        .actions-button {
          background: transparent;
          border: none;
          padding: 8px;
          cursor: pointer;
          color: hsl(var(--muted));
          border-radius: 8px;
          transition: all 0.2s ease;
          min-width: 44px;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .actions-button:hover,
        .actions-button:focus {
          background: hsl(var(--accent) / 0.1);
        }

        .swipe-actions {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to left, transparent, hsl(var(--bg-card) / 0.95) 30%);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          padding: 12px;
          z-index: 10;
        }

        .swipe-action-button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: transform 0.2s ease;
          touch-action: manipulation;
          text-decoration: none;
        }

        .swipe-action-button:active {
          transform: scale(0.9);
        }
      `}</style>
    </motion.div>
  );
}

// مكون الحالة الفارغة المحسن
function EmptyState({ status, searchQuery }: { status: NewsStatus; searchQuery: string }) {
  const getMessage = () => {
    if (searchQuery.trim()) {
      return `لا توجد نتائج للبحث عن "${searchQuery}"`;
    }
    
    switch (status) {
      case "published": return "لا توجد أخبار منشورة";
      case "draft": return "لا توجد مسودات";
      case "scheduled": return "لا توجد أخبار مجدولة";
      case "archived": return "لا توجد أخبار مؤرشفة";
      default: return "لا توجد أخبار";
    }
  };

  const getDescription = () => {
    if (searchQuery.trim()) {
      return "جرب البحث بكلمات مختلفة أو تحقق من الإملاء";
    }
    return "ابدأ بإنشاء خبر جديد";
  };

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <ImageIcon size={64} />
      </div>
      <h3 className="empty-state-title">
        {getMessage()}
      </h3>
      <p className="empty-state-description">
        {getDescription()}
      </p>
      {!searchQuery.trim() && (
        <Link
          href="/admin/news/unified"
          style={{
            background: "hsl(var(--accent))",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            fontWeight: "600"
          }}
        >
          إنشاء خبر جديد
        </Link>
      )}

      <style jsx>{`
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: hsl(var(--bg-card));
          border-radius: 16px;
          border: 1px solid hsl(var(--line));
          margin: 20px 0;
        }

        .empty-state-icon {
          color: hsl(var(--muted));
          margin-bottom: 16px;
        }

        .empty-state-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: hsl(var(--fg));
        }

        .empty-state-description {
          color: hsl(var(--muted));
          margin-bottom: 24px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
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
}

export default function AdminMobileNewsPage() {
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

  // جلب الأخبار
  const fetchArticles = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!append) setLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "all") params.set("status", selectedStatus);
      if (searchQuery) params.set("search", searchQuery);
      params.set("page", pageNum.toString());
      params.set("limit", "20");

      const response = await fetch(`/api/admin/news?${params}`);
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

  useEffect(() => {
    fetchArticles(1, false);
  }, [fetchArticles]);

  // التحميل اللانهائي
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchArticles(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [page, hasMore, loading, fetchArticles]);

  // حذف مقال
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الخبر؟")) return;

    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (response.ok) {
        setArticles(prev => prev.filter(a => a.id !== id));
        toast.success("تم حذف الخبر بنجاح");
      } else {
        toast.error("فشل حذف الخبر");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  // تبديل حالة العاجل
  const toggleBreaking = async (id: string, currentState: boolean) => {
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
        toast.success(!currentState ? "تم تعيين كخبر عاجل" : "تم إلغاء الخبر العاجل");
      }
    } catch (error) {
      toast.error("حدث خطأ في تحديث حالة الخبر");
    }
  };

  return (
    <div className="mobile-news-page">
      {/* شريط البحث والفلتر */}
      <div style={{
        position: "sticky",
        top: "56px",
        background: "hsl(var(--bg))",
        borderBottom: "1px solid hsl(var(--line))",
        padding: "12px 16px",
        zIndex: 10
      }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={18} style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "hsl(var(--muted))"
            }} />
            <input
              type="search"
              placeholder="البحث في الأخبار..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{
                paddingRight: "40px",
                fontSize: "14px",
                height: "40px"
              }}
            />
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="btn-mobile btn-sm"
            style={{
              background: filterOpen ? "hsl(var(--accent))" : "hsl(var(--bg-card))",
              color: filterOpen ? "white" : "hsl(var(--fg))",
              border: "1px solid hsl(var(--line))",
              position: "relative"
            }}
          >
            <Filter size={18} />
            {selectedStatus !== "all" && (
              <span style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                width: "8px",
                height: "8px",
                background: "#EF4444",
                borderRadius: "50%"
              }} />
            )}
          </button>
        </div>

        {/* قائمة الفلاتر */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div style={{
                display: "flex",
                gap: "8px",
                marginTop: "12px",
                overflowX: "auto",
                paddingBottom: "4px"
              }} className="hide-scrollbar">
                {statusOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedStatus(option.value);
                      router.push(`/admin-mobile/news?status=${option.value}`);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: "1px solid",
                      borderColor: selectedStatus === option.value ? option.color : "hsl(var(--line))",
                      background: selectedStatus === option.value ? `${option.color}20` : "hsl(var(--bg-card))",
                      color: selectedStatus === option.value ? option.color : "hsl(var(--fg))",
                      fontSize: "13px",
                      fontWeight: selectedStatus === option.value ? "600" : "400",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease"
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

      {/* قائمة الأخبار */}
      <div style={{ padding: "16px" }}>
        {loading && articles.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton-card" style={{
                height: "100px",
                background: "hsl(var(--bg-card))",
                borderRadius: "12px",
                animation: "pulse 1.5s ease-in-out infinite"
              }} />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <EmptyState status={selectedStatus} />
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {articles.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  isSelected={selectedArticle === article.id}
                  onSelect={() => setSelectedArticle(article.id === selectedArticle ? null : article.id)}
                  onDelete={() => handleDelete(article.id)}
                  onToggleBreaking={() => toggleBreaking(article.id, article.breaking || false)}
                />
              ))}
            </div>

            {/* مؤشر التحميل */}
            {hasMore && (
              <div ref={loadMoreRef} style={{ textAlign: "center", padding: "20px" }}>
                <div className="loading-spinner" />
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// مكون بطاقة الخبر
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
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onSelect(),
    onSwipedRight: () => onSelect(),
    trackMouse: false
  });

  const timeAgo = (date: string) => {
    const now = new Date();
    const published = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - published.getTime()) / 60000);
    
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

  return (
    <motion.div
      {...swipeHandlers}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileTap={{ scale: 0.98 }}
      className="news-card-mobile"
      style={{
        background: "hsl(var(--bg-card))",
        border: "1px solid hsl(var(--line))",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative"
      }}
    >
      <div style={{
        display: "flex",
        gap: "12px",
        padding: "12px",
        alignItems: "center"
      }}>
        {/* الصورة المصغرة */}
        {article.thumbnail_url && (
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "8px",
            overflow: "hidden",
            background: "hsl(var(--bg))",
            flexShrink: 0
          }}>
            <img
              src={article.thumbnail_url}
              alt={article.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        {/* المحتوى */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* العنوان */}
          <h3 style={{
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "4px",
            lineHeight: "1.4",
            color: "hsl(var(--fg))",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}>
            {article.title}
          </h3>

          {/* السطر الأول: الحالة والتصنيف */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "6px", 
            marginBottom: "4px",
            flexWrap: "wrap"
          }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "11px",
              padding: "2px 6px",
              borderRadius: "10px",
              background: `${getStatusColor(article.status)}15`,
              color: getStatusColor(article.status),
              fontWeight: "500"
            }}>
              {article.status === "published" ? "منشور" :
               article.status === "draft" ? "مسودة" :
               article.status === "scheduled" ? "مجدول" :
               article.status === "archived" ? "مؤرشف" : article.status}
            </span>
            
            {article.breaking && (
              <span style={{
                fontSize: "11px",
                padding: "2px 6px",
                borderRadius: "10px",
                background: "#EF444415",
                color: "#EF4444",
                fontWeight: "600"
              }}>
                عاجل
              </span>
            )}

            {article.category && (
              <span style={{
                fontSize: "11px",
                padding: "2px 6px",
                borderRadius: "10px",
                background: `${article.category.color || "#6B7280"}15`,
                color: article.category.color || "#6B7280",
                fontWeight: "500"
              }}>
                {article.category.name}
              </span>
            )}
          </div>

          {/* السطر الثاني: الوقت والمشاهدات */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "11px",
            color: "hsl(var(--muted))"
          }}>
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

        {/* زر الإجراءات */}
        <button
          onClick={onSelect}
          style={{
            background: "transparent",
            border: "none",
            padding: "8px",
            cursor: "pointer",
            color: "hsl(var(--muted))",
            borderRadius: "8px",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "hsl(var(--accent) / 0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Swipe Actions - إجراءات سريعة */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(to left, transparent, hsl(var(--bg-card) / 0.95) 30%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "8px",
              padding: "12px"
            }}
          >
            <Link
              href={`/admin/news/unified?id=${article.id}`}
              style={{
                width: "40px",
                height: "40px",
                background: "#10B981",
                color: "white",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}
            >
              <Edit size={18} />
            </Link>
            <button
              onClick={onToggleBreaking}
              style={{
                width: "40px",
                height: "40px",
                background: article.breaking ? "#F59E0B" : "#8B5CF6",
                color: "white",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}
            >
              <Zap size={18} />
            </button>
            <button
              onClick={onDelete}
              style={{
                width: "40px",
                height: "40px",
                background: "#EF4444",
                color: "white",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}
            >
              <Trash2 size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .action-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        
        .action-button:active {
          transform: scale(0.95);
        }
      `}</style>
    </motion.div>
  );
}

// مكون الحالة الفارغة
function EmptyState({ status }: { status: NewsStatus }) {
  const getMessage = () => {
    switch (status) {
      case "published": return "لا توجد أخبار منشورة";
      case "draft": return "لا توجد مسودات";
      case "scheduled": return "لا توجد أخبار مجدولة";
      case "archived": return "لا توجد أخبار مؤرشفة";
      default: return "لا توجد أخبار";
    }
  };

  return (
    <div style={{
      textAlign: "center",
      padding: "60px 20px",
      background: "hsl(var(--bg-card))",
      borderRadius: "16px",
      border: "1px solid hsl(var(--line))"
    }}>
      <ImageIcon size={64} style={{ color: "hsl(var(--muted))", marginBottom: "16px" }} />
      <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
        {getMessage()}
      </h3>
      <p style={{ color: "hsl(var(--muted))", marginBottom: "24px" }}>
        ابدأ بإنشاء خبر جديد
      </p>
      <Link
        href="/admin/news/unified"
        className="btn-mobile"
        style={{
          background: "hsl(var(--accent))",
          color: "white",
          display: "inline-flex"
        }}
      >
        إنشاء خبر جديد
      </Link>
    </div>
  );
}

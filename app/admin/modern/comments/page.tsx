/**
 * صفحة إدارة التعليقات الحديثة
 * Modern Comments Management Page
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  Check,
  Clock,
  Flag,
  MessageCircle,
  MessageSquare,
  Search,
  X,
  ArrowUpRight,
  Download,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "react-hot-toast";

// مكون بطاقة إحصائية
const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: { value: number; label: string };
  color?: string;
}) => {
  return (
    <div className="card" style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'hsl(var(--accent) / 0.1)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color || 'hsl(var(--accent))'
        }}>
          <Icon style={{ width: '24px', height: '24px' }} />
        </div>
        
        <div style={{ flex: 1 }}>
          <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>{title}</div>
          <div className="heading-3" style={{ margin: '4px 0', color: color || 'hsl(var(--accent))' }}>
            {value}
          </div>
          {trend && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpRight style={{ 
                width: '14px', 
                height: '14px',
                color: '#10b981'
              }} />
              <span className="text-xs" style={{ color: '#10b981' }}>
                {trend.value}%
              </span>
              <span className="text-xs text-muted">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  article: {
    id: string;
    title: string;
  };
  status: "pending" | "approved" | "rejected" | "spam";
  created_at: string;
  likes: number;
  replies: number;
  reported?: boolean;
}

export default function ModernCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingComments, setProcessingComments] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    spam: 0,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  // التحقق من المصادقة
  const checkAuth = async () => {
    try {
      const res = await fetch("/api/user/me", {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          // محاولة تحديث التوكن تلقائياً
          try {
            const r = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
            if (r.ok) {
              return true;
            }
          } catch {}
          toast.error("انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.");
          const next = encodeURIComponent(
            window.location.pathname + window.location.search + window.location.hash
          );
          window.location.href = `/admin/login?next=${next}`;
          return false;
        }
      }

      const user = await res.json();
      if (!user?.isAdmin && !["admin", "moderator"].includes(user?.role)) {
        toast.error("ليس لديك صلاحية للوصول إلى هذه الصفحة.");
        return false;
      }

      return true;
    } catch (e) {
      console.error("خطأ في التحقق من المصادقة:", e);
      return false;
    }
  };

  // تحميل التعليقات
  const fetchComments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", filterStatus || "all");
      if (searchTerm.trim()) params.set("q", searchTerm.trim());
      params.set("page", String(page));
      params.set("limit", String(pageSize));

      const res = await fetch(`/api/comments?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          // محاولة تحديث التوكن تلقائياً ثم إعادة المحاولة مرة واحدة
          try {
            const r = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
            if (r.ok) {
              const retry = await fetch(`/api/comments?${params.toString()}`, {
                cache: "no-store",
                credentials: "include",
                headers: { Accept: "application/json", "Content-Type": "application/json" },
              });
              if (retry.ok) {
                const json = await retry.json().catch(() => ({}));
                if (json && json.success) {
                  const list = json.comments || json.data || [];
                  setComments(list);
                  if (json.stats) setStats(json.stats); else calculateStats(list as any);
                  setTotalPages(json.pagination?.totalPages || 1);
                  setLoading(false);
                  return;
                }
              }
            }
          } catch {}
          toast.error("انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.");
          const next = encodeURIComponent(
            window.location.pathname + window.location.search + window.location.hash
          );
          window.location.href = `/admin/login?next=${next}`;
          return;
        } else if (res.status === 403) {
          toast.error("ليس لديك صلاحية للوصول إلى هذه الصفحة.");
          return;
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json().catch(() => ({}));
      if (json && json.success) {
        const list = json.comments || json.data || [];
        setComments(list);
        if (json.stats) {
          setStats(json.stats);
        } else {
          // احتساب محلي عند غياب stats من الاستجابة
          calculateStats(list as any);
        }
        setTotalPages(json.pagination?.totalPages || 1);
      } else {
        console.warn(
          "فشل في جلب التعليقات:",
          json.error || "استجابة غير صالحة"
        );
        setComments([]);
      }
    } catch (e) {
      console.error("تعذر جلب التعليقات:", e);
      const errorMessage = e instanceof Error ? e.message : "خطأ غير معروف";
      if (
        !errorMessage.includes("HTTP 401") &&
        !errorMessage.includes("HTTP 403")
      ) {
        toast.error(`فشل في تحميل التعليقات: ${errorMessage}`);
      }
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initPage = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        await fetchComments();
      }
    };

    initPage();
  }, [filterStatus, searchTerm, page]);

  const calculateStats = (comments: Comment[]) => {
    const stats = {
      total: comments.length,
      pending: comments.filter((c) => c.status === "pending").length,
      approved: comments.filter((c) => c.status === "approved").length,
      rejected: comments.filter((c) => c.status === "rejected").length,
      spam: comments.filter((c) => c.status === "spam").length,
    };
    setStats(stats);
  };

  const handleApprove = (commentId: string) => {
    updateStatus(commentId, "approved");
  };

  const handleReject = (commentId: string) => {
    updateStatus(commentId, "rejected");
  };

  const handleMarkAsSpam = (commentId: string) => {
    updateStatus(commentId, "spam");
  };

  const updateStatus = async (id: string, status: Comment["status"]) => {
    // إضافة التعليق للقائمة المعالجة
    setProcessingComments((prev) => new Set([...prev, id]));

    // تفاؤليًا
    const prev = comments;
    setComments((list) =>
      list.map((c) => (c.id === id ? { ...c, status } : c))
    );

    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = "فشل التحديث";

        try {
          const json = JSON.parse(errorText);
          errorMessage = json.error || errorMessage;
        } catch {
          if (res.status === 401) {
            errorMessage = "غير مصرح - يرجى تسجيل الدخول مرة أخرى";
          } else if (res.status === 403) {
            errorMessage = "ليس لديك صلاحية للوصول";
          } else {
            errorMessage = `خطأ ${res.status}: ${errorText}`;
          }
        }

        throw new Error(errorMessage);
      }

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "فشل التحديث");
      }

      // إعادة التحميل لتحديث الإحصائيات والبيانات
      await fetchComments();
      toast.success("تم تحديث حالة التعليق بنجاح");
    } catch (e) {
      // تراجع
      setComments(prev);
      const errorMessage = e instanceof Error ? e.message : "حدث خطأ غير متوقع";
      console.error("خطأ في تحديث التعليق:", e);
      toast.error(`حدث خطأ في تحديث التعليق: ${errorMessage}`);
    } finally {
      // إزالة التعليق من القائمة المعالجة
      setProcessingComments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const filteredComments = comments; // التصفية تتم عبر API

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "منذ أقل من ساعة";
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} أيام`;
    return date.toLocaleDateString("ar-SA");
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      approved: 'chip-success',
      pending: 'chip-warning',
      rejected: 'chip-danger',
      spam: 'chip-outline'
    };

    const labels = {
      approved: 'موافق عليه',
      pending: 'في الانتظار',
      rejected: 'مرفوض',
      spam: 'سبام'
    };

    const icons = {
      approved: Check,
      pending: Clock,
      rejected: X,
      spam: Flag
    };

    const StatusIcon = icons[status as keyof typeof icons] || MessageCircle;

    return (
      <span className={`chip chip-sm ${badges[status as keyof typeof badges] || 'chip-outline'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <StatusIcon style={{ width: '12px', height: '12px' }} />
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const handleExportCSV = () => {
    const header = [
      "id,article_id,article_title,author_name,status,created_at,content",
    ];
    const rows = comments.map((c) =>
      [
        c.id,
        c.article.id,
        (c.article.title || "").replaceAll(",", " "),
        (c.author.name || "").replaceAll(",", " "),
        c.status,
        c.created_at,
        (c.content || "").replaceAll("\n", " ").replaceAll(",", " "),
      ].join(",")
    );
    const csv = [...header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comments-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const StatusTabs = () => {
    const tabs: { key: string; label: string; count: number; color: string }[] = [
      { key: "all", label: "الكل", count: stats.total, color: 'hsl(var(--accent))' },
      { key: "pending", label: "الانتظار", count: stats.pending, color: '#f59e0b' },
      { key: "approved", label: "المعتمدة", count: stats.approved, color: '#10b981' },
      { key: "rejected", label: "المرفوضة", count: stats.rejected, color: '#ef4444' },
      { key: "spam", label: "سبام", count: stats.spam, color: '#6b7280' },
    ];
    
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setPage(1);
              setFilterStatus(t.key);
            }}
            className={`btn btn-sm ${filterStatus === t.key ? '' : 'btn-outline'}`}
            style={filterStatus === t.key ? { background: t.color, color: 'white', borderColor: t.color } : {}}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ 
            width: '48px', 
            height: '48px', 
            border: '3px solid hsl(var(--line))',
            borderTopColor: 'hsl(var(--accent))',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p className="text-muted">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(var(--bg))', padding: '40px 20px' }} dir="rtl">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* رسالة الترحيب */}
        <div className="card card-accent" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-hover)))',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MessageCircle style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div>
                <h1 className="heading-2" style={{ marginBottom: '4px' }}>
                  إدارة التعليقات
                </h1>
                <p className="text-muted" style={{ fontSize: '14px' }}>
                  راجع واعتمد التعليقات على الأخبار بسرعة وسهولة
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div className="text-xs text-muted">إجمالي</div>
              <div className="heading-2" style={{ color: 'hsl(var(--accent))' }}>
                {stats.total}
              </div>
            </div>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '16px',
          marginBottom: '32px'
        }}>
          <StatCard
            title="إجمالي التعليقات"
            value={stats.total}
            icon={MessageSquare}
            trend={{ value: 15, label: "هذا الأسبوع" }}
          />
          <StatCard
            title="في الانتظار"
            value={stats.pending}
            icon={Clock}
            color="#f59e0b"
          />
          <StatCard
            title="المعتمدة"
            value={stats.approved}
            icon={Check}
            color="#10b981"
          />
          <StatCard
            title="المرفوضة"
            value={stats.rejected}
            icon={X}
            color="#ef4444"
          />
          <StatCard
            title="سبام"
            value={stats.spam}
            icon={Flag}
            color="#6b7280"
          />
        </div>

        {/* شريط الأدوات */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'none' }} className="hidden md:block">
                <StatusTabs />
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search style={{ 
                    position: 'absolute', 
                    right: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'hsl(var(--muted))',
                    width: '20px',
                    height: '20px'
                  }} />
                  <input
                    type="text"
                    placeholder="ابحث..."
                    value={searchTerm}
                    onChange={(e) => {
                      setPage(1);
                      setSearchTerm(e.target.value);
                    }}
                    className="input"
                    style={{ width: '200px', paddingRight: '40px' }}
                  />
                </div>
                <button onClick={handleExportCSV} className="btn btn-outline">
                  <Download style={{ width: '16px', height: '16px' }} />
                  تصدير CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* تبويبات الحالة للمحمول */}
        <div style={{ marginBottom: '24px' }} className="md:hidden">
          <StatusTabs />
        </div>

        {/* شبكة بطاقات التعليقات */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
          {filteredComments.map((comment) => (
            <div key={comment.id} className="card" data-comment-id={comment.id}>
              <div style={{ padding: '24px' }}>
                {/* رأس البطاقة */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent-hover)))',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600'
                    }}>
                      {comment.author.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="heading-3" style={{ fontSize: '16px' }}>
                          {comment.author.name}
                        </span>
                        {getStatusBadge(comment.status)}
                      </div>
                      <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar style={{ width: '12px', height: '12px' }} />
                        {formatTimeAgo(comment.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  {/* أزرار العمليات */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {comment.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(comment.id)}
                          disabled={processingComments.has(comment.id)}
                          className="btn btn-sm"
                          style={{ 
                            background: '#10b981', 
                            color: 'white',
                            opacity: processingComments.has(comment.id) ? 0.6 : 1,
                            cursor: processingComments.has(comment.id) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {processingComments.has(comment.id) ? (
                            <div className="spinner" style={{ 
                              width: '12px', 
                              height: '12px', 
                              border: '2px solid white',
                              borderTopColor: 'transparent',
                              borderRadius: '50%',
                              animation: 'spin 0.8s linear infinite'
                            }}></div>
                          ) : (
                            <Check style={{ width: '14px', height: '14px' }} />
                          )}
                          موافقة
                        </button>
                        <button
                          onClick={() => handleReject(comment.id)}
                          disabled={processingComments.has(comment.id)}
                          className="btn btn-sm"
                          style={{ 
                            background: '#ef4444', 
                            color: 'white',
                            opacity: processingComments.has(comment.id) ? 0.6 : 1,
                            cursor: processingComments.has(comment.id) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {processingComments.has(comment.id) ? (
                            <div className="spinner" style={{ 
                              width: '12px', 
                              height: '12px', 
                              border: '2px solid white',
                              borderTopColor: 'transparent',
                              borderRadius: '50%',
                              animation: 'spin 0.8s linear infinite'
                            }}></div>
                          ) : (
                            <X style={{ width: '14px', height: '14px' }} />
                          )}
                          رفض
                        </button>
                      </>
                    )}
                    {comment.status !== "spam" && (
                      <button
                        onClick={() => handleMarkAsSpam(comment.id)}
                        disabled={processingComments.has(comment.id)}
                        className="btn btn-sm btn-outline"
                        style={{
                          opacity: processingComments.has(comment.id) ? 0.6 : 1,
                          cursor: processingComments.has(comment.id) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {processingComments.has(comment.id) ? (
                          <div className="spinner" style={{ 
                            width: '12px', 
                            height: '12px', 
                            border: '2px solid hsl(var(--fg))',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite'
                          }}></div>
                        ) : (
                          <Flag style={{ width: '14px', height: '14px' }} />
                        )}
                        سبام
                      </button>
                    )}
                  </div>
                </div>

                {/* المحتوى */}
                <div style={{ marginBottom: '16px' }}>
                  <p className="text-sm" style={{ lineHeight: '1.6' }}>
                    {comment.content}
                  </p>
                </div>

                {/* المقال */}
                <div style={{ 
                  padding: '12px', 
                  background: 'hsl(var(--muted) / 0.1)', 
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--line))'
                }}>
                  <div className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare style={{ width: '14px', height: '14px' }} />
                    <span>تعليق على:</span>
                    <span className="text-sm" style={{ fontWeight: '600', color: 'hsl(var(--fg))' }}>
                      {comment.article.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ترقيم الصفحات */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '32px' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn btn-sm btn-outline"
              style={{ opacity: page <= 1 ? 0.5 : 1 }}
            >
              <ChevronRight style={{ width: '14px', height: '14px' }} />
              السابق
            </button>
            <span className="text-sm text-muted">
              صفحة {page} من {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="btn btn-sm btn-outline"
              style={{ opacity: page >= totalPages ? 0.5 : 1 }}
            >
              التالي
              <ChevronLeft style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        )}

        {/* لا نتائج */}
        {filteredComments.length === 0 && (
          <div className="card" style={{ marginTop: '32px' }}>
            <div style={{ padding: '80px 20px', textAlign: 'center' }}>
              <MessageCircle style={{ width: '64px', height: '64px', color: 'hsl(var(--muted))', margin: '0 auto 16px' }} />
              <h3 className="heading-3" style={{ marginBottom: '8px' }}>لا توجد تعليقات</h3>
              <p className="text-muted">
                لم يتم العثور على تعليقات تطابق معايير البحث المحددة
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @media (min-width: 768px) {
          .hidden.md\\:block {
            display: block !important;
          }
          .md\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

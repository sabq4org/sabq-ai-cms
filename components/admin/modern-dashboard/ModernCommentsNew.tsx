/**
 * صفحة التعليقات الحديثة - تصميم احترافي
 * Modern Comments Page - Professional Design
 */

"use client";

import { DesignComponents } from "@/components/design-system/DesignSystemGuide";
import {
  Calendar,
  Check,
  Clock,
  Flag,
  MessageCircle,
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

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

const ModernCommentsNew: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
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

  // تحميل فعلي من API
  const fetchComments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== "all") params.set("status", filterStatus);
      if (searchTerm.trim()) params.set("q", searchTerm.trim());
      params.set("page", String(page));
      params.set("limit", String(pageSize));
      const res = await fetch(`/api/comments?${params.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json && json.success) {
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
        // عند الفشل، اظهر فراغ ولكن لا تعلّق الواجهة
        setComments([]);
      }
    } catch (e) {
      console.error("تعذر جلب التعليقات:", e);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // تفاؤليًا
    const prev = comments;
    setComments((list) =>
      list.map((c) => (c.id === id ? { ...c, status } : c))
    );
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "فشل التحديث");
      // إعادة التحميل لتحديث الإحصائيات والبيانات
      fetchComments();
    } catch (e) {
      // تراجع
      setComments(prev);
      console.error(e);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      case "spam":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <Check className="w-3 h-3" />;
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "rejected":
        return <X className="w-3 h-3" />;
      case "spam":
        return <Flag className="w-3 h-3" />;
      default:
        return <MessageCircle className="w-3 h-3" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "موافق عليه";
      case "pending":
        return "في الانتظار";
      case "rejected":
        return "مرفوض";
      case "spam":
        return "سبام";
      default:
        return status;
    }
  };

  const ExportCSVButton = () => {
    const handleExport = () => {
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
    return (
      <button onClick={handleExport} className="px-3 py-2 rounded-lg border">
        تصدير CSV
      </button>
    );
  };

  const StatusTabs = () => {
    const tabs: { key: string; label: string; count: number }[] = [
      { key: "all", label: "الكل", count: stats.total },
      { key: "pending", label: "الانتظار", count: stats.pending },
      { key: "approved", label: "المعتمدة", count: stats.approved },
      { key: "rejected", label: "المرفوضة", count: stats.rejected },
      { key: "spam", label: "سبام", count: stats.spam },
    ];
    return (
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setPage(1);
              setFilterStatus(t.key);
            }}
            className={
              "px-3 py-1.5 rounded-full text-sm border " +
              (filterStatus === t.key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50")
            }
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full max-w-none p-6">
        <DesignComponents.StandardCard className="w-full max-w-none p-8">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DesignComponents.StandardCard>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none space-y-6 p-6">
      {/* بطاقة ترحيب على نمط الرئيسية */}
      <DesignComponents.StandardCard className="w-full max-w-none p-6 bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
              إدارة التعليقات
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              راجع واعتمد التعليقات على الأخبار بسرعة وسهولة
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              إجمالي
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {stats.total}
            </div>
          </div>
        </div>
      </DesignComponents.StandardCard>

      {/* ترويسة قسم مع شريط إجراءات (بحث/فلترة/تصدير) */}
      <DesignComponents.SectionHeader
        title="التعليقات"
        description="أحدث التعليقات حسب الفلاتر المختارة"
        action={
          <DesignComponents.ActionBar>
            <div className="hidden md:block">
              <StatusTabs />
            </div>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ابحث..."
                value={searchTerm}
                onChange={(e) => {
                  setPage(1);
                  setSearchTerm(e.target.value);
                }}
                className="w-48 pr-8 pl-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <ExportCSVButton />
          </DesignComponents.ActionBar>
        }
      />

      {/* شبكة الإحصاءات على نمط الرئيسية */}
      <div className="w-full max-w-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {[
          {
            label: "إجمالي التعليقات",
            value: stats.total,
            color: "text-blue-600",
            Icon: MessageSquare,
          },
          {
            label: "في الانتظار",
            value: stats.pending,
            color: "text-yellow-600",
            Icon: Clock,
          },
          {
            label: "المعتمدة",
            value: stats.approved,
            color: "text-green-600",
            Icon: Check,
          },
          {
            label: "المرفوضة",
            value: stats.rejected,
            color: "text-red-600",
            Icon: X,
          },
          {
            label: "سبام",
            value: stats.spam,
            color: "text-gray-600",
            Icon: Flag,
          },
        ].map((s, i) => (
          <DesignComponents.StandardCard
            key={i}
            className="w-full max-w-none p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {s.label}
                </p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800/40 rounded-lg flex items-center justify-center">
                <s.Icon className={`w-6 h-6 ${s.color}`} />
              </div>
            </div>
          </DesignComponents.StandardCard>
        ))}
      </div>

      {/* تبويبات الحالة للمحمول */}
      <div className="md:hidden">
        <StatusTabs />
      </div>

      {/* شبكة بطاقات التعليقات على نمط الرئيسية */}
      <div className="w-full max-w-none grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        {filteredComments.map((comment) => (
          <DesignComponents.StandardCard
            key={comment.id}
            className="w-full max-w-none p-6"
          >
            <div className="flex items-start justify-between gap-4">
              {/* رأس البطاقة */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {comment.author.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {comment.author.name}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        comment.status
                      )}`}
                    >
                      {getStatusIcon(comment.status)}
                      {getStatusText(comment.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{formatTimeAgo(comment.created_at)}</span>
                  </div>
                </div>
              </div>
              {/* أزرار العمليات */}
              <div className="flex items-center gap-2">
                {comment.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(comment.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                      <Check className="w-3 h-3" /> موافقة
                    </button>
                    <button
                      onClick={() => handleReject(comment.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                    >
                      <X className="w-3 h-3" /> رفض
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleMarkAsSpam(comment.id)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <Flag className="w-3 h-3" /> سبام
                </button>
              </div>
            </div>

            {/* المحتوى */}
            <div className="mt-4">
              <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                {comment.content}
              </p>
            </div>

            {/* المقال */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MessageSquare className="w-4 h-4" />
                <span>تعليق على:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {comment.article.title}
                </span>
              </div>
            </div>
          </DesignComponents.StandardCard>
        ))}
      </div>

      {/* ترقيم الصفحات */}
      <div className="flex items-center justify-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 rounded-lg border disabled:opacity-50"
        >
          السابق
        </button>
        <span className="text-sm text-gray-600">
          صفحة {page} من {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 rounded-lg border disabled:opacity-50"
        >
          التالي
        </button>
      </div>

      {/* لا نتائج */}
      {filteredComments.length === 0 && (
        <DesignComponents.StandardCard>
          <div className="p-12 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              لا توجد تعليقات
            </h3>
            <p className="text-gray-500">
              لم يتم العثور على تعليقات تطابق معايير البحث المحددة
            </p>
          </div>
        </DesignComponents.StandardCard>
      )}
    </div>
  );
};

export default ModernCommentsNew;

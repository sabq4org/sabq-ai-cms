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
  Filter,
  Flag,
  Heart,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
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

  // بيانات تجريبية للتعليقات
  const sampleComments: Comment[] = [
    {
      id: "1",
      content: "مقال رائع ومفيد جداً، شكراً لكم على هذا المحتوى القيم",
      author: {
        name: "أحمد محمد",
        email: "ahmed@example.com",
        avatar: "/api/placeholder/40/40",
      },
      article: {
        id: "1",
        title: "آخر التطورات في التكنولوجيا",
      },
      status: "approved",
      created_at: "2025-01-28T10:30:00Z",
      likes: 15,
      replies: 3,
      reported: false,
    },
    {
      id: "2",
      content: "هل يمكن توضيح النقطة الثالثة أكثر؟ لم أفهمها بوضوح",
      author: {
        name: "فاطمة علي",
        email: "fatima@example.com",
      },
      article: {
        id: "2",
        title: "دليل شامل للاستثمار",
      },
      status: "pending",
      created_at: "2025-01-28T09:15:00Z",
      likes: 8,
      replies: 1,
    },
    {
      id: "3",
      content: "المعلومات غير دقيقة، أرجو المراجعة",
      author: {
        name: "سعد الغامدي",
        email: "saad@example.com",
      },
      article: {
        id: "3",
        title: "تحليل السوق المالي",
      },
      status: "pending",
      created_at: "2025-01-28T08:45:00Z",
      likes: 2,
      replies: 0,
      reported: true,
    },
    {
      id: "4",
      content: "محتوى ممتاز، أتطلع للمزيد من هذه المقالات",
      author: {
        name: "نورا أحمد",
        email: "nora@example.com",
      },
      article: {
        id: "4",
        title: "مستقبل الطاقة المتجددة",
      },
      status: "approved",
      created_at: "2025-01-28T07:20:00Z",
      likes: 12,
      replies: 2,
    },
  ];

  useEffect(() => {
    // محاكاة جلب البيانات
    setTimeout(() => {
      setComments(sampleComments);
      calculateStats(sampleComments);
      setLoading(false);
    }, 1000);
  }, []);

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
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, status: "approved" as const }
          : comment
      )
    );
  };

  const handleReject = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, status: "rejected" as const }
          : comment
      )
    );
  };

  const handleMarkAsSpam = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, status: "spam" as const }
          : comment
      )
    );
  };

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.article.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || comment.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

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

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">إدارة التعليقات</h1>
              <p className="text-blue-100">
                إدارة وموافقة التعليقات على المقالات
              </p>
            </div>
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <DesignComponents.StandardCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">إجمالي التعليقات</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </DesignComponents.StandardCard>

          <DesignComponents.StandardCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">في الانتظار</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </DesignComponents.StandardCard>

          <DesignComponents.StandardCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">موافق عليها</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.approved}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </DesignComponents.StandardCard>

          <DesignComponents.StandardCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">مرفوضة</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.rejected}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </DesignComponents.StandardCard>

          <DesignComponents.StandardCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">سبام</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {stats.spam}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Flag className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </DesignComponents.StandardCard>
        </div>

        {/* شريط البحث والفلاتر */}
        <DesignComponents.StandardCard>
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* البحث */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="البحث في التعليقات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* فلتر الحالة */}
              <div className="sm:w-48">
                <div className="relative">
                  <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="pending">في الانتظار</option>
                    <option value="approved">موافق عليها</option>
                    <option value="rejected">مرفوضة</option>
                    <option value="spam">سبام</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </DesignComponents.StandardCard>

        {/* قائمة التعليقات */}
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <DesignComponents.StandardCard key={comment.id}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* معلومات المؤلف */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {comment.author.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {comment.author.name}
                          </span>
                          {comment.reported && (
                            <div title="تم الإبلاغ عن هذا التعليق">
                              <Flag className="w-4 h-4 text-red-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{formatTimeAgo(comment.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* محتوى التعليق */}
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed">
                        {comment.content}
                      </p>
                    </div>

                    {/* معلومات المقال */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MessageSquare className="w-4 h-4" />
                        <span>تعليق على:</span>
                        <span className="font-medium text-gray-900">
                          {comment.article.title}
                        </span>
                      </div>
                    </div>

                    {/* إحصائيات التعليق */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Heart className="w-4 h-4" />
                        <span>{comment.likes} إعجاب</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MessageCircle className="w-4 h-4" />
                        <span>{comment.replies} رد</span>
                      </div>
                    </div>

                    {/* حالة التعليق */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          comment.status
                        )}`}
                      >
                        {getStatusIcon(comment.status)}
                        <span>{getStatusText(comment.status)}</span>
                      </div>

                      {/* أزرار العمليات */}
                      <div className="flex items-center gap-2">
                        {comment.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(comment.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                            >
                              <Check className="w-3 h-3" />
                              <span>موافقة</span>
                            </button>
                            <button
                              onClick={() => handleReject(comment.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            >
                              <X className="w-3 h-3" />
                              <span>رفض</span>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleMarkAsSpam(comment.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          <Flag className="w-3 h-3" />
                          <span>سبام</span>
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DesignComponents.StandardCard>
          ))}
        </div>

        {/* رسالة عدم وجود نتائج */}
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
    </>
  );
};

export default ModernCommentsNew;

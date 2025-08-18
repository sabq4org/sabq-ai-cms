/**
 * بطاقة الأخبار المحسنة للموبايل
 * Enhanced Mobile News Card Component
 */

import React from "react";
import Link from "next/link";
import {
  Edit,
  Trash2,
  Eye,
  Clock,
  User,
  FolderOpen,
  MessageSquare,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { formatDateTime } from "@/lib/date-utils";
import { formatDashboardStat } from "@/lib/format-utils";

interface MobileNewsCardProps {
  article: {
    id: string;
    title: string;
    subtitle?: string;
    excerpt?: string;
    status: "published" | "draft" | "scheduled" | "archived";
    published_at?: string;
    scheduled_for?: string;
    created_at: string;
    author?: { name: string };
    author_name?: string;
    category?: { name: string; id: string };
    featured_image?: string;
    views?: number;
    breaking?: boolean;
    comments_count?: number;
  };
  onToggleBreaking?: (id: string, currentState: boolean) => void;
  onDelete?: (id: string) => void;
}

export default function MobileNewsCard({ article, onToggleBreaking, onDelete }: MobileNewsCardProps) {
  const authorName = article.author?.name || article.author_name || "غير محدد";
  const categoryName = article.category?.name || "غير مصنف";
  
  // تحديد لون الحالة
  const getStatusColor = () => {
    switch (article.status) {
      case "published": return "text-green-600 bg-green-50 dark:bg-green-900/20";
      case "draft": return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
      case "scheduled": return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
      case "archived": return "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
      default: return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const getStatusText = () => {
    switch (article.status) {
      case "published": return "منشور";
      case "draft": return "مسودة";
      case "scheduled": return "مجدول";
      case "archived": return "مؤرشف";
      default: return article.status;
    }
  };

  return (
    <div className="news-card-mobile group">
      {/* الصورة */}
      {article.featured_image && (
        <img
          src={article.featured_image}
          alt={article.title}
          className="news-card-image"
          loading="lazy"
        />
      )}
      {!article.featured_image && (
        <div className="news-card-image bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
          <FolderOpen className="w-8 h-8 text-gray-400" />
        </div>
      )}

      {/* المحتوى */}
      <div className="news-card-content">
        {/* العنوان */}
        <h3 className="news-card-title text-foreground">{article.title}</h3>
        
        {/* البيانات الوصفية */}
        <div className="news-card-meta">
          {/* الحالة */}
          <span className={`news-card-badge ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          
          {/* التصنيف */}
          <span className="flex items-center gap-1">
            <FolderOpen className="w-3 h-3" />
            {categoryName}
          </span>
          
          {/* التاريخ */}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDateTime(article.published_at || article.created_at).split(" ")[0]}
          </span>
        </div>

        {/* الإحصائيات */}
        {(article.views || article.comments_count) && (
          <div className="news-card-meta mt-2">
            {article.views && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatDashboardStat(article.views)}
              </span>
            )}
            {article.comments_count && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {formatDashboardStat(article.comments_count)}
              </span>
            )}
          </div>
        )}

        {/* خبر عاجل */}
        {article.breaking && (
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
              <AlertCircle className="w-3 h-3" />
              خبر عاجل
            </span>
          </div>
        )}
      </div>

      {/* الإجراءات */}
      <div className="news-card-actions">
        <Link
          href={`/admin/news/unified?id=${article.id}`}
          className="news-card-action-btn"
          title="تعديل"
        >
          <Edit className="w-4 h-4" />
        </Link>
        
        <Link
          href={`/news/${article.id}`}
          target="_blank"
          className="news-card-action-btn"
          title="معاينة"
        >
          <Eye className="w-4 h-4" />
        </Link>
        
        {onDelete && (
          <button
            onClick={() => onDelete(article.id)}
            className="news-card-action-btn text-red-500"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

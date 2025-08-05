"use client";

import CloudImage from "@/components/ui/CloudImage";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { formatDateGregorian } from "@/lib/date-utils";
import { AlertTriangle, Clock, X } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface BreakingNews {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  published_at: string;
  reading_time?: number;
  views?: number;
  likes?: number;
  shares?: number;
  breaking: boolean;
  category?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  } | null;
  author?: {
    id: string;
    name: string;
    reporter?: {
      id: string;
      full_name: string;
      slug: string;
      title?: string;
      is_verified?: boolean;
      verification_badge?: string;
    } | null;
  } | null;
}

interface BreakingNewsBarProps {
  className?: string;
  onClose?: () => void;
}

const BreakingNewsBar: React.FC<BreakingNewsBarProps> = ({
  className = "",
  onClose,
}) => {
  const { darkMode } = useDarkModeContext();
  const [breakingNews, setBreakingNews] = useState<BreakingNews | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // جلب الخبر العاجل
  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/breaking-news", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.breakingNews) {
            setBreakingNews(data.breakingNews);
          }
        }
      } catch (error) {
        console.error("خطأ في جلب الخبر العاجل:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakingNews();
  }, []);

  // دالة إغلاق الخبر العاجل
  const handleDismiss = () => {
    setDismissed(true);
    onClose?.();
  };

  // إذا كان محمل أو مرفوض أو لا يوجد خبر عاجل
  if (loading || dismissed || !breakingNews) {
    return null;
  }

  const getArticleLink = () => {
    return `/article/${breakingNews.id}`;
  };

  return (
    <div className={`breaking-news-container ${className}`} style={{ marginTop: 0, paddingTop: 0 }}>
      {/* الخبر العاجل - نسخة الموبايل محذوفة حسب الطلب */}
      {/* تم إزالة نسخة الموبايل من شريط الأخبار العاجلة */}

      {/* الخبر العاجل - نسخة الديسكتوب */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4" style={{ marginTop: 0 }}>
          <div
            className={`relative overflow-hidden rounded-2xl shadow-xl ${
              darkMode
                ? "bg-gradient-to-r from-red-950 via-red-900 to-red-950 border border-red-800"
                : "bg-gradient-to-r from-red-50 via-red-100 to-red-50 border border-red-200"
            }`}
          >
            {/* خلفية متحركة */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent animate-pulse"></div>

            <div className="relative z-10 p-6">
              <Link href={getArticleLink()} className="block">
                <div className="flex items-center gap-6">
                  {/* الشارة والمعلومات */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-full">
                        <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
                        <span className="text-white font-bold">خبر عاجل</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDismiss();
                        }}
                        className={`p-2 rounded-full transition-colors ${
                          darkMode
                            ? "hover:bg-red-800 text-red-300"
                            : "hover:bg-red-100 text-red-600"
                        }`}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* الصورة */}
                  {breakingNews.featured_image && (
                    <div className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden">
                      <CloudImage
                        src={breakingNews.featured_image}
                        alt={breakingNews.title}
                        fill
                        className="w-full h-full object-cover"
                        fallbackType="article"
                      />
                    </div>
                  )}

                  {/* المحتوى */}
                  <div className="flex-1 min-w-0">
                    <h2
                      className={`font-bold text-2xl lg:text-3xl leading-tight mb-3 line-clamp-2 ${
                        darkMode ? "text-red-100" : "text-red-900"
                      }`}
                    >
                      {breakingNews.title}
                    </h2>

                    {/* معلومات تفصيلية */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span
                          className={darkMode ? "text-red-300" : "text-red-600"}
                        >
                          {formatDateGregorian(breakingNews.published_at)}
                        </span>
                      </div>

                      {breakingNews.reading_time && (
                        <span
                          className={darkMode ? "text-red-300" : "text-red-600"}
                        >
                          وقت القراءة: {breakingNews.reading_time} دقيقة
                        </span>
                      )}

                      {breakingNews.category && (
                        <span
                          className={`px-3 py-1 rounded-full ${
                            darkMode
                              ? "bg-gray-700 text-gray-300"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {breakingNews.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsBar;

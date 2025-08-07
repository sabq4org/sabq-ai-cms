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

      {/* الخبر العاجل - نسخة الديسكتوب المحسنة */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6" style={{ marginTop: 0 }}>
          <div
            className={`relative overflow-hidden rounded-3xl shadow-2xl backdrop-blur-sm ${
              darkMode
                ? "bg-gradient-to-r from-red-950/95 via-red-900/95 to-orange-950/95 border border-red-700/50"
                : "bg-gradient-to-r from-red-600/95 via-red-500/95 to-orange-500/95 border border-red-300/50"
            }`}
          >
            {/* خلفية متحركة محسنة */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full bg-repeat bg-[length:60px_60px]" 
                   style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M0 60L60 0H0v60zm60 0V0H0l60 60z'/%3E%3C/g%3E%3C/svg%3E")`
                   }}>
              </div>
            </div>

            {/* إطار مضيء */}
            <div className="absolute inset-0 border-2 border-red-400/30 rounded-3xl animate-pulse"></div>

            <div className="relative z-10 p-8">
              <Link href={getArticleLink()} className="block group">
                <div className="flex items-center gap-8">
                  {/* الشارة والمعلومات المحسنة */}
                  <div className="flex-shrink-0">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <div className="flex items-center gap-3 bg-white/25 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 shadow-lg">
                          <div className="relative">
                            <AlertTriangle className="w-6 h-6 text-white animate-bounce" />
                            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-60 animate-ping"></div>
                          </div>
                          <span className="text-white font-bold text-lg tracking-wide drop-shadow-sm">خبر عاجل</span>
                        </div>
                        {/* نبضة حول الشارة */}
                        <div className="absolute inset-0 bg-red-400/30 rounded-full blur-lg animate-pulse scale-110"></div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDismiss();
                        }}
                        className="p-3 rounded-full transition-all duration-300 bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 hover:scale-110 text-white hover:text-red-100 shadow-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* الصورة المحسنة */}
                  {breakingNews.featured_image && (
                    <div className="flex-shrink-0 w-40 h-40 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/30 backdrop-blur-sm group-hover:scale-105 transition-transform duration-300">
                      <CloudImage
                        src={breakingNews.featured_image}
                        alt={breakingNews.title}
                        fill
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        fallbackType="article"
                      />
                    </div>
                  )}

                  {/* المحتوى المحسن */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-3xl lg:text-4xl text-white leading-tight mb-4 line-clamp-2 drop-shadow-lg group-hover:scale-[1.02] transition-transform duration-300">
                      {breakingNews.title}
                    </h2>

                    {/* معلومات تفصيلية محسنة */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full border border-white/30">
                        <Clock className="w-4 h-4 text-white" />
                        <span className="text-white font-medium">
                          {formatDateGregorian(breakingNews.published_at)}
                        </span>
                      </div>

                      {breakingNews.reading_time && (
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full border border-white/30">
                          <span className="text-white font-medium">
                            وقت القراءة: {breakingNews.reading_time} دقيقة
                          </span>
                        </div>
                      )}

                      {breakingNews.category && (
                        <div className="bg-white/25 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/30 font-medium shadow-lg">
                          {breakingNews.category.name}
                        </div>
                      )}
                    </div>

                    {/* شريط "اقرأ المزيد" */}
                    <div className="mt-4 inline-flex items-center gap-2 bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40 text-white font-semibold group-hover:bg-white/40 transition-all duration-300">
                      <span>اقرأ الخبر كاملاً</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
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

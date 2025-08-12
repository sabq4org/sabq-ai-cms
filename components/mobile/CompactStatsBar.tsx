"use client";

import { formatNumber } from "@/lib/config/localization";
import { Calendar, Newspaper, Tag } from "lucide-react";
import { useEffect, useState } from "react";

interface StatsData {
  totalArticles: number;
  totalCategories: number;
  todayArticles: number;
  dailyChange: number;
  dailyChangePercentage: number;
  trend: "up" | "down" | "stable";
  activeUsers: number;
  lastUpdated: string;
}

interface MobileStatsBarProps {
  darkMode: boolean;
}

export default function CompactStatsBar({ darkMode }: MobileStatsBarProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // تحديث كل 5 دقائق
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats/summary");
      const data = await response.json();

      if (data.success) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!stats && !loading) {
    return null;
  }

  // تحقق من صحة البيانات
  const safeStats = {
    totalArticles: stats?.totalArticles || 0,
    totalCategories: stats?.totalCategories || 0,
    todayArticles: stats?.todayArticles || 0,
  };

  return (
    <div
      className={`w-full py-2.5 px-3 sticky z-30 ${
        darkMode ? "bg-gray-900/85" : "bg-white/90"
      } backdrop-blur-md border-b ${darkMode ? "border-gray-800" : "border-gray-200"}`}
      style={{ top: "var(--header-height)" }}
    >
      {/* خلية واحدة متناسقة */}
      <div className={`flex items-center justify-around`}>
        {/* عدد الأقسام */}
        <a
          href="/categories"
          className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
        >
          <Tag
            className={`w-3.5 h-3.5 ${
              darkMode ? "text-purple-400" : "text-purple-600"
            }`}
          />
          <div className="flex flex-col">
            <span
              className={`text-[10px] leading-tight ${
                darkMode ? "text-gray-500" : "text-gray-500"
              }`}
            >
              الأقسام
            </span>
            <span
              className={`text-base font-semibold leading-tight ${
                darkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              {loading ? (
                <span className="inline-block w-4 h-3.5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></span>
              ) : (
                safeStats.totalCategories
              )}
            </span>
          </div>
        </a>

        {/* فاصل */}
        <div
          className={`h-6 w-[1px] ${
            darkMode ? "bg-gray-700/50" : "bg-gray-300/50"
          }`}
        ></div>

        {/* عدد الأخبار */}
        <a
          href="/news"
          className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
        >
          <Newspaper
            className={`w-3.5 h-3.5 ${
              darkMode ? "text-blue-400" : "text-blue-600"
            }`}
          />
          <div className="flex flex-col">
            <span
              className={`text-[10px] leading-tight ${
                darkMode ? "text-gray-500" : "text-gray-500"
              }`}
            >
              الأخبار
            </span>
            <span
              className={`text-base font-semibold leading-tight ${
                darkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              {loading ? (
                <span className="inline-block w-8 h-3.5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></span>
              ) : (
                formatNumber(safeStats.totalArticles)
              )}
            </span>
          </div>
        </a>

        {/* فاصل */}
        <div
          className={`h-6 w-[1px] ${
            darkMode ? "bg-gray-700/50" : "bg-gray-300/50"
          }`}
        ></div>

        {/* أخبار اليوم */}
        <a
          href="/moment-by-moment"
          className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
        >
          <Calendar
            className={`w-3.5 h-3.5 ${
              darkMode ? "text-green-400" : "text-green-600"
            }`}
          />
          <div className="flex flex-col">
            <span
              className={`text-[10px] leading-tight ${
                darkMode ? "text-gray-500" : "text-gray-500"
              }`}
            >
              أخبار اليوم
            </span>
            <span
              className={`text-base font-semibold leading-tight ${
                darkMode ? "text-gray-100" : "text-gray-800"
              }`}
            >
              {loading ? (
                <span className="inline-block w-4 h-3.5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></span>
              ) : (
                safeStats.todayArticles
              )}
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}

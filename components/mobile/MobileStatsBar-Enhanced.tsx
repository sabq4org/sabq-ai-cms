"use client";

import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { formatNumber } from "@/lib/config/localization";
import {
  Activity,
  Award,
  Calendar,
  Clock,
  Eye,
  Minus,
  Newspaper,
  Tag,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// واجهة محسنة لبيانات الإحصائيات
interface EnhancedStatsData {
  totalArticles: number;
  totalCategories: number;
  todayArticles: number;
  dailyChange: number;
  dailyChangePercentage: number;
  trend: "up" | "down" | "stable";
  activeUsers: number;
  totalViews: number;
  engagementRate: number;
  averageReadingTime: number;
  breakingNews: number;
  featuredArticles: number;
  lastUpdated: string;
  serverHealth: "healthy" | "warning" | "error";
}

// واجهة المكون المحسنة
interface MobileStatsBarProps {
  variant?: "compact" | "full" | "minimal";
  showTrends?: boolean;
  showHealth?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

// Hook لاستدعاء الإحصائيات مع التحكم في التحديث
const useStatsData = (autoRefresh: boolean, refreshInterval: number) => {
  const [stats, setStats] = useState<EnhancedStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/stats/summary-enhanced", {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
        setLastFetch(new Date());
      } else {
        throw new Error(data.message || "Failed to fetch stats");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError(error instanceof Error ? error.message : "Unknown error");

      // استخدام بيانات تجريبية في حالة الخطأ
      setStats({
        totalArticles: 12450,
        totalCategories: 15,
        todayArticles: 24,
        dailyChange: 3,
        dailyChangePercentage: 14.3,
        trend: "up",
        activeUsers: 1234,
        totalViews: 892340,
        engagementRate: 8.5,
        averageReadingTime: 3.2,
        breakingNews: 2,
        featuredArticles: 8,
        lastUpdated: new Date().toISOString(),
        serverHealth: "healthy",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchStats, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchStats, autoRefresh, refreshInterval]);

  return { stats, loading, error, lastFetch, refetch: fetchStats };
};

// Hook لتنسيق الأرقام
const useNumberFormatter = () => {
  return useCallback((num: number, compact: boolean = false): string => {
    if (compact && num >= 1000) {
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}م`;
      }
      if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}ك`;
      }
    }
    return formatNumber(num);
  }, []);
};

// مكون مؤشر الاتجاه المحسن
const TrendIndicator = memo(
  ({
    trend,
    percentage,
    size = "sm",
  }: {
    trend: string;
    percentage: number;
    size?: "xs" | "sm" | "md";
  }) => {
    const iconSize = {
      xs: "w-2.5 h-2.5",
      sm: "w-3 h-3",
      md: "w-4 h-4",
    };

    const textSize = {
      xs: "text-xs",
      sm: "text-xs",
      md: "text-sm",
    };

    const getTrendComponent = () => {
      switch (trend) {
        case "up":
          return {
            icon: <TrendingUp className={`${iconSize[size]} text-green-500`} />,
            color: "text-green-500",
            bgColor: "bg-green-100 dark:bg-green-900/30",
          };
        case "down":
          return {
            icon: <TrendingDown className={`${iconSize[size]} text-red-500`} />,
            color: "text-red-500",
            bgColor: "bg-red-100 dark:bg-red-900/30",
          };
        default:
          return {
            icon: <Minus className={`${iconSize[size]} text-gray-500`} />,
            color: "text-gray-500",
            bgColor: "bg-gray-100 dark:bg-gray-700",
          };
      }
    };

    const trendData = getTrendComponent();

    return (
      <div
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${trendData.bgColor}`}
      >
        {trendData.icon}
        <span className={`${textSize[size]} font-medium ${trendData.color}`}>
          {percentage.toFixed(1)}%
        </span>
      </div>
    );
  }
);

TrendIndicator.displayName = "TrendIndicator";

// مكون حالة الخادم
const ServerHealthIndicator = memo(({ health }: { health: string }) => {
  const healthConfig = {
    healthy: {
      color: "text-green-500",
      bg: "bg-green-100 dark:bg-green-900/30",
      icon: "🟢",
      label: "سليم",
    },
    warning: {
      color: "text-yellow-500",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
      icon: "🟡",
      label: "تحذير",
    },
    error: {
      color: "text-red-500",
      bg: "bg-red-100 dark:bg-red-900/30",
      icon: "🔴",
      label: "خطأ",
    },
  };

  const config =
    healthConfig[health as keyof typeof healthConfig] || healthConfig.healthy;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${config.bg}`}
    >
      <span className="text-xs">{config.icon}</span>
      <span className={`text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
});

ServerHealthIndicator.displayName = "ServerHealthIndicator";

// مكون عنصر الإحصائية المحسن
const StatItem = memo(
  ({
    icon: Icon,
    label,
    value,
    trend,
    percentage,
    href,
    color,
    bgColor,
    loading,
    compact = false,
    showTrend = true,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    trend?: string;
    percentage?: number;
    href?: string;
    color: string;
    bgColor: string;
    loading: boolean;
    compact?: boolean;
    showTrend?: boolean;
  }) => {
    const { darkMode } = useDarkModeContext();

    const content = (
      <div className="flex items-center gap-2 group hover:scale-105 transition-all duration-200">
        {/* الأيقونة */}
        <div
          className={`p-1.5 rounded-xl ${bgColor} group-hover:scale-110 transition-transform duration-200`}
        >
          <Icon className={`${compact ? "w-3 h-3" : "w-4 h-4"} ${color}`} />
        </div>

        {/* المحتوى */}
        <div className="flex-1 min-w-0">
          <p
            className={`${compact ? "text-xs" : "text-xs"} ${
              darkMode ? "text-gray-400" : "text-gray-600"
            } truncate font-medium`}
          >
            {label}
          </p>

          <div className="flex items-center gap-2">
            <p
              className={`${compact ? "text-sm" : "text-base"} font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {loading ? (
                <span
                  className={`inline-block ${
                    compact ? "w-8 h-3" : "w-12 h-4"
                  } bg-gray-300 dark:bg-gray-600 rounded animate-pulse`}
                />
              ) : (
                value
              )}
            </p>

            {/* مؤشر الاتجاه */}
            {!loading &&
              showTrend &&
              trend &&
              percentage !== undefined &&
              trend !== "stable" && (
                <TrendIndicator
                  trend={trend}
                  percentage={percentage}
                  size={compact ? "xs" : "sm"}
                />
              )}
          </div>
        </div>
      </div>
    );

    if (href) {
      return (
        <a href={href} className="block">
          {content}
        </a>
      );
    }

    return content;
  }
);

StatItem.displayName = "StatItem";

// المكون الرئيسي المحسن
const MobileStatsBar = memo(
  ({
    variant = "full",
    showTrends = true,
    showHealth = true,
    autoRefresh = true,
    refreshInterval = 300000, // 5 دقائق
    className = "",
  }: MobileStatsBarProps) => {
    const { darkMode } = useDarkModeContext();
    const { stats, loading, error, lastFetch } = useStatsData(
      autoRefresh,
      refreshInterval
    );
    const formatNumber = useNumberFormatter();

    // تحديد الإحصائيات المعروضة حسب النوع
    const displayStats = useMemo(() => {
      if (!stats) return [];

      const allStats = [
        {
          key: "articles",
          icon: Newspaper,
          label: "الأخبار",
          value: formatNumber(stats.totalArticles, variant === "compact"),
          trend: stats.trend,
          percentage: stats.dailyChangePercentage,
          href: "/news",
          color: "text-blue-500",
          bgColor: darkMode ? "bg-blue-900/30" : "bg-blue-100",
        },
        {
          key: "categories",
          icon: Tag,
          label: "الأقسام",
          value: stats.totalCategories,
          href: "/categories",
          color: "text-purple-500",
          bgColor: darkMode ? "bg-purple-900/30" : "bg-purple-100",
        },
        {
          key: "today",
          icon: Calendar,
          label: "أخبار اليوم",
          value: stats.todayArticles,
          trend: stats.trend,
          percentage: stats.dailyChangePercentage,
          href: "/moment-by-moment",
          color: "text-green-500",
          bgColor: darkMode ? "bg-green-900/30" : "bg-green-100",
        },
        {
          key: "users",
          icon: Users,
          label: "المستخدمون",
          value: formatNumber(stats.activeUsers, true),
          color: "text-orange-500",
          bgColor: darkMode ? "bg-orange-900/30" : "bg-orange-100",
        },
        {
          key: "views",
          icon: Eye,
          label: "المشاهدات",
          value: formatNumber(stats.totalViews, true),
          color: "text-indigo-500",
          bgColor: darkMode ? "bg-indigo-900/30" : "bg-indigo-100",
        },
        {
          key: "breaking",
          icon: Zap,
          label: "عاجل",
          value: stats.breakingNews,
          color: "text-red-500",
          bgColor: darkMode ? "bg-red-900/30" : "bg-red-100",
        },
      ];

      switch (variant) {
        case "compact":
          return allStats.slice(0, 3);
        case "minimal":
          return allStats.slice(0, 2);
        default:
          return allStats;
      }
    }, [stats, variant, formatNumber, darkMode]);

    if (error && !stats) {
      return (
        <div
          className={`w-full py-2 px-3 ${
            darkMode
              ? "bg-red-900/20 border-b border-red-700"
              : "bg-red-50 border-b border-red-200"
          } ${className}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600 dark:text-red-400">
              خطأ في تحميل الإحصائيات
            </span>
          </div>
        </div>
      );
    }

    const containerClasses = `w-full ${
      variant === "minimal" ? "py-1 px-2" : "py-3 px-4"
    } ${
      darkMode
        ? "bg-gradient-to-r from-gray-800 via-gray-850 to-gray-900 border-b border-gray-700"
        : "bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 border-b border-gray-200"
    } ${className}`;

    return (
      <div className={containerClasses}>
        {/* شريط حالة الخادم */}
        {showHealth && stats && variant === "full" && (
          <div className="flex items-center justify-between mb-2">
            <ServerHealthIndicator health={stats.serverHealth} />
            {lastFetch && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">
                  آخر تحديث: {lastFetch.toLocaleTimeString("ar-SA")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* الإحصائيات الرئيسية */}
        <div
          className={`grid ${
            variant === "compact"
              ? "grid-cols-3"
              : variant === "minimal"
              ? "grid-cols-2"
              : "grid-cols-2 sm:grid-cols-3"
          } gap-4`}
        >
          {displayStats.map((stat) => (
            <StatItem
              key={stat.key}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              trend={stat.trend}
              percentage={stat.percentage}
              href={stat.href}
              color={stat.color}
              bgColor={stat.bgColor}
              loading={loading}
              compact={variant !== "full"}
              showTrend={showTrends}
            />
          ))}
        </div>

        {/* معلومات إضافية للنسخة الكاملة */}
        {variant === "full" && stats && !loading && (
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span
                  className={`flex items-center gap-1 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <Activity className="w-3 h-3" />
                  معدل التفاعل: {stats.engagementRate}%
                </span>
                <span
                  className={`flex items-center gap-1 ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  وقت القراءة: {stats.averageReadingTime} د
                </span>
              </div>

              {stats.featuredArticles > 0 && (
                <span
                  className={`flex items-center gap-1 ${
                    darkMode ? "text-yellow-400" : "text-yellow-600"
                  }`}
                >
                  <Award className="w-3 h-3" />
                  {stats.featuredArticles} مميز
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

MobileStatsBar.displayName = "MobileStatsBar";

// مكونات متخصصة
export const CompactMobileStatsBar = memo(
  (props: Omit<MobileStatsBarProps, "variant">) => (
    <MobileStatsBar {...props} variant="compact" />
  )
);

export const MinimalMobileStatsBar = memo(
  (props: Omit<MobileStatsBarProps, "variant">) => (
    <MobileStatsBar
      {...props}
      variant="minimal"
      showTrends={false}
      showHealth={false}
    />
  )
);

CompactMobileStatsBar.displayName = "CompactMobileStatsBar";
MinimalMobileStatsBar.displayName = "MinimalMobileStatsBar";

export default MobileStatsBar;

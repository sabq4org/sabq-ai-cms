"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { 
  Settings, 
  Download, 
  RefreshCw, 
  Filter,
  Calendar,
  TrendingUp,
  Eye,
  MousePointer,
  Palette,
  BarChart3,
  Target,
  Zap
} from "lucide-react";

// تحميل ديناميكي لمكون سحابة الكلمات
const ReactWordcloud = dynamic(() => import("react-wordcloud"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-50">
      <div className="text-center">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
        <p className="text-gray-600">جارٍ تحميل سحابة الكلمات...</p>
      </div>
    </div>
  )
});

interface WordCloudData {
  id: string;
  text: string;
  value: number; // للمكتبة
  size: number;
  weight: number;
  color: string;
  url: string;
  stats: {
    usageCount: number;
    viewsCount: number;
    growthRate: number;
    popularityScore: number;
    articlesCount: number;
    category?: string;
    lastUsed?: string;
  };
}

interface AdvancedWordCloudProps {
  className?: string;
  height?: number;
  autoUpdate?: boolean;
  updateInterval?: number;
  onWordClick?: (word: WordCloudData) => void;
  enableControls?: boolean;
  enableAnalytics?: boolean;
  defaultFilters?: {
    period?: number;
    category?: string;
    colorScheme?: string;
    shape?: string;
  };
}

export default function AdvancedWordCloud({
  className = "",
  height = 500,
  autoUpdate = true,
  updateInterval = 300000, // 5 دقائق
  onWordClick,
  enableControls = true,
  enableAnalytics = true,
  defaultFilters = {}
}: AdvancedWordCloudProps) {
  const [words, setWords] = useState<WordCloudData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // إعدادات التخصيص المتقدمة
  const [filters, setFilters] = useState({
    period: defaultFilters.period || 30,
    category: defaultFilters.category || "",
    colorScheme: defaultFilters.colorScheme || "blue",
    shape: defaultFilters.shape || "cloud",
    limit: 50,
    minUsage: 1,
    sortBy: "popularity",
    fontFamily: "Cairo",
    enableRotation: true,
    enableSpiral: true,
    padding: 5
  });

  // إحصائيات متقدمة
  const [analytics, setAnalytics] = useState({
    totalTags: 0,
    maxPopularity: 0,
    avgGrowthRate: 0,
    totalUsage: 0,
    trendingTags: [] as WordCloudData[],
    topCategories: [] as { category: string; count: number }[]
  });

  // جلب بيانات سحابة الكلمات
  const fetchWordCloudData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        period: filters.period.toString(),
        limit: filters.limit.toString(),
        minUsage: filters.minUsage.toString(),
        colorScheme: filters.colorScheme,
        shape: filters.shape,
        sortBy: filters.sortBy
      });

      if (filters.category) {
        params.append("category", filters.category);
      }

      const response = await fetch(`/api/public/word-cloud?${params}`);
      const result = await response.json();

      if (result.success) {
        // تحويل البيانات لتناسب مكتبة react-wordcloud
        const transformedWords = result.data.map((word: any) => ({
          ...word,
          value: word.stats.popularityScore // استخدام نقاط الشعبية كقيمة
        }));

        setWords(transformedWords);
        setLastUpdate(new Date());

        // حساب الإحصائيات
        if (enableAnalytics) {
          calculateAnalytics(transformedWords);
        }
      } else {
        setError(result.error || "خطأ في جلب البيانات");
      }
    } catch (err: any) {
      setError("خطأ في الاتصال بالخادم");
      console.error("Word cloud fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, enableAnalytics]);

  // حساب الإحصائيات
  const calculateAnalytics = (wordData: WordCloudData[]) => {
    const totalTags = wordData.length;
    const maxPopularity = Math.max(...wordData.map(w => w.stats.popularityScore));
    const avgGrowthRate = totalTags > 0 
      ? wordData.reduce((sum, w) => sum + w.stats.growthRate, 0) / totalTags 
      : 0;
    const totalUsage = wordData.reduce((sum, w) => sum + w.stats.usageCount, 0);

    // الكلمات الرائجة (نمو > 50%)
    const trendingTags = wordData
      .filter(w => w.stats.growthRate > 50)
      .sort((a, b) => b.stats.growthRate - a.stats.growthRate)
      .slice(0, 5);

    // أفضل التصنيفات
    const categoryCount = wordData.reduce((acc, w) => {
      if (w.stats.category) {
        acc[w.stats.category] = (acc[w.stats.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setAnalytics({
      totalTags,
      maxPopularity,
      avgGrowthRate,
      totalUsage,
      trendingTags,
      topCategories
    });
  };

  // إعدادات سحابة الكلمات
  const wordCloudOptions = useMemo(() => {
    const colorSchemes = {
      blue: ["#1e40af", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"],
      green: ["#166534", "#16a34a", "#4ade80", "#86efac", "#dcfce7"],
      red: ["#dc2626", "#ef4444", "#f87171", "#fca5a5", "#fee2e2"],
      purple: ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ede9fe"],
      rainbow: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"]
    };

    return {
      colors: colorSchemes[filters.colorScheme as keyof typeof colorSchemes] || colorSchemes.blue,
      enableTooltip: true,
      deterministic: false,
      fontFamily: filters.fontFamily,
      fontSizes: [14, 64] as [number, number],
      fontStyle: "normal" as const,
      fontWeight: "bold" as const,
      padding: filters.padding,
      rotations: filters.enableRotation ? 3 : 1,
      rotationAngles: filters.enableRotation ? [-45, 45] as [number, number] : [0, 0] as [number, number],
      scale: "sqrt" as const,
      spiral: filters.enableSpiral ? "archimedean" as const : "rectangular" as const,
      transitionDuration: 1000,
    };
  }, [filters]);

  // معالجة النقر على الكلمة
  const handleWordClick = useCallback(async (word: any, event: any) => {
    const wordData = words.find(w => w.text === word.text);
    if (!wordData) return;

    // تسجيل النقرة
    try {
      await fetch("/api/public/word-cloud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId: wordData.id, action: "click" })
      });
    } catch (err) {
      console.error("Error tracking click:", err);
    }

    // تنفيذ الإجراء
    if (onWordClick) {
      onWordClick(wordData);
    } else {
      window.open(wordData.url, "_blank");
    }
  }, [words, onWordClick]);

  // معالجة التمرير فوق الكلمة
  const handleWordHover = useCallback((word: any, event: any) => {
    // يمكن إضافة تأثيرات إضافية هنا
  }, []);

  // تحديث تلقائي
  useEffect(() => {
    fetchWordCloudData();

    if (autoUpdate) {
      const interval = setInterval(fetchWordCloudData, updateInterval);
      return () => clearInterval(interval);
    }
  }, [fetchWordCloudData, autoUpdate, updateInterval]);

  // تصدير البيانات
  const exportData = useCallback((format: "json" | "csv") => {
    const dataToExport = words.map(word => ({
      text: word.text,
      popularity: word.stats.popularityScore,
      usage: word.stats.usageCount,
      growth: word.stats.growthRate,
      views: word.stats.viewsCount,
      category: word.stats.category || "",
      lastUsed: word.stats.lastUsed || ""
    }));

    if (format === "json") {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `word-cloud-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "csv") {
      const headers = ["الكلمة", "الشعبية", "الاستخدام", "النمو", "المشاهدات", "التصنيف", "آخر استخدام"];
      const csvContent = [
        headers.join(","),
        ...dataToExport.map(row => 
          Object.values(row).map(val => `"${val}"`).join(",")
        )
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `word-cloud-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [words]);

  return (
    <div className={`bg-white rounded-xl shadow-lg border overflow-hidden ${className}`}>
      {/* شريط العنوان والتحكم */}
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">سحابة الكلمات التفاعلية</h3>
            <p className="text-sm text-gray-600">
              {lastUpdate && `آخر تحديث: ${lastUpdate.toLocaleTimeString("ar-SA")}`}
            </p>
          </div>
          {loading && (
            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {enableAnalytics && (
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`p-2 rounded-lg transition-colors ${
                showAnalytics 
                  ? "bg-green-100 text-green-600" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              title="عرض الإحصائيات"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={() => setShowControls(!showControls)}
            className={`p-2 rounded-lg transition-colors ${
              showControls 
                ? "bg-blue-100 text-blue-600" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            title="إعدادات العرض"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button
            onClick={fetchWordCloudData}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <div className="relative group">
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg border py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => exportData("json")}
                className="block w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
              >
                تصدير JSON
              </button>
              <button
                onClick={() => exportData("csv")}
                className="block w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
              >
                تصدير CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* لوحة الإحصائيات */}
      {enableAnalytics && showAnalytics && (
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">إجمالي الكلمات</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalTags}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-600">متوسط النمو</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.avgGrowthRate > 0 ? "+" : ""}{analytics.avgGrowthRate.toFixed(1)}%
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-600">إجمالي الاستخدام</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalUsage.toLocaleString()}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-600">الكلمات الرائجة</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{analytics.trendingTags.length}</p>
            </div>
          </div>

          {analytics.trendingTags.length > 0 && (
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                الكلمات الأكثر رواجاً
              </h4>
              <div className="flex flex-wrap gap-2">
                {analytics.trendingTags.map(tag => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium flex items-center gap-1"
                  >
                    {tag.text}
                    <span className="text-xs">+{tag.stats.growthRate.toFixed(0)}%</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* لوحة الإعدادات المتقدمة */}
      {showControls && (
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* الفترة الزمنية */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                الفترة الزمنية
              </label>
              <select
                value={filters.period}
                onChange={(e) => setFilters(prev => ({ ...prev, period: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>آخر يوم</option>
                <option value={7}>آخر أسبوع</option>
                <option value={30}>آخر شهر</option>
                <option value={90}>آخر 3 أشهر</option>
                <option value={365}>آخر سنة</option>
              </select>
            </div>

            {/* نظام الألوان */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Palette className="w-4 h-4 inline mr-1" />
                نظام الألوان
              </label>
              <select
                value={filters.colorScheme}
                onChange={(e) => setFilters(prev => ({ ...prev, colorScheme: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="blue">أزرق</option>
                <option value="green">أخضر</option>
                <option value="red">أحمر</option>
                <option value="purple">بنفسجي</option>
                <option value="rainbow">قوس قزح</option>
              </select>
            </div>

            {/* عدد الكلمات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عدد الكلمات
              </label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={25}>25 كلمة</option>
                <option value={50}>50 كلمة</option>
                <option value={100}>100 كلمة</option>
                <option value={200}>200 كلمة</option>
              </select>
            </div>

            {/* الحد الأدنى للاستخدام */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الحد الأدنى
              </label>
              <input
                type="number"
                min="1"
                value={filters.minUsage}
                onChange={(e) => setFilters(prev => ({ ...prev, minUsage: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* خيارات متقدمة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                خيارات متقدمة
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.enableRotation}
                    onChange={(e) => setFilters(prev => ({ ...prev, enableRotation: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  دوران الكلمات
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.enableSpiral}
                    onChange={(e) => setFilters(prev => ({ ...prev, enableSpiral: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  ترتيب حلزوني
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* منطقة سحابة الكلمات */}
      <div className="relative" style={{ height: `${height}px` }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90 z-10">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">جارٍ تحميل سحابة الكلمات...</p>
              <p className="text-sm text-gray-500 mt-1">قد يستغرق هذا بضع ثوانٍ</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 font-medium mb-2">{error}</p>
              <button
                onClick={fetchWordCloudData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}

        {!loading && !error && words.length > 0 && (
          <div className="h-full">
            <ReactWordcloud
              words={words}
              options={wordCloudOptions}
              callbacks={{
                onWordClick: handleWordClick,
                onWordMouseOver: handleWordHover,
              }}
            />
          </div>
        )}

        {!loading && !error && words.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">لا توجد كلمات لعرضها</p>
              <p className="text-sm text-gray-400 mt-1">جرب تغيير المرشحات أو الفترة الزمنية</p>
            </div>
          </div>
        )}
      </div>

      {/* شريط الإحصائيات السفلي */}
      {!loading && !error && words.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-gray-600">
              <span>عرض {words.length} كلمة من آخر {filters.period} يوم</span>
              <span>•</span>
              <span>إجمالي الاستخدام: {words.reduce((sum, w) => sum + w.stats.usageCount, 0).toLocaleString()}</span>
            </div>
            <div className="text-gray-500">
              آخر تحديث: {lastUpdate?.toLocaleTimeString("ar-SA")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

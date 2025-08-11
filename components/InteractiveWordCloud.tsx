"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { 
  Settings, 
  Download, 
  RefreshCw, 
  Filter,
  Calendar,
  TrendingUp,
  Eye,
  MousePointer,
  Palette
} from "lucide-react";

interface WordCloudData {
  id: string;
  text: string;
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

interface WordCloudProps {
  className?: string;
  height?: number;
  autoUpdate?: boolean;
  updateInterval?: number;
  onWordClick?: (word: WordCloudData) => void;
  enableControls?: boolean;
  defaultFilters?: {
    period?: number;
    category?: string;
    colorScheme?: string;
    shape?: string;
  };
}

export default function InteractiveWordCloud({
  className = "",
  height = 400,
  autoUpdate = true,
  updateInterval = 300000, // 5 دقائق
  onWordClick,
  enableControls = true,
  defaultFilters = {}
}: WordCloudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [words, setWords] = useState<WordCloudData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredWord, setHoveredWord] = useState<WordCloudData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(false);
  
  // إعدادات التخصيص
  const [filters, setFilters] = useState({
    period: defaultFilters.period || 30,
    category: defaultFilters.category || "",
    colorScheme: defaultFilters.colorScheme || "blue",
    shape: defaultFilters.shape || "cloud",
    limit: 50,
    minUsage: 1
  });

  const [animationFrame, setAnimationFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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
        shape: filters.shape
      });

      if (filters.category) {
        params.append("category", filters.category);
      }

      const response = await fetch(`/api/public/word-cloud?${params}`);
      const result = await response.json();

      if (result.success) {
        setWords(result.data);
        setTimeout(() => drawWordCloud(result.data), 100);
      } else {
        setError(result.error || "خطأ في جلب البيانات");
      }
    } catch (err: any) {
      setError("خطأ في الاتصال بالخادم");
      console.error("Word cloud fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // رسم سحابة الكلمات
  const drawWordCloud = useCallback((wordData: WordCloudData[]) => {
    const canvas = canvasRef.current;
    if (!canvas || !wordData.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // تحديد حجم Canvas
    const container = containerRef.current;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = height;
    }

    // مسح الخلفية
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // إعدادات الخط
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 16px Cairo, sans-serif";

    // ترتيب الكلمات حسب الحجم
    const sortedWords = [...wordData].sort((a, b) => b.size - a.size);

    // مصفوفة لتتبع المناطق المستخدمة
    const usedPositions: { x: number; y: number; width: number; height: number }[] = [];

    // رسم الكلمات
    sortedWords.forEach((word, index) => {
      ctx.font = `bold ${word.size}px Cairo, sans-serif`;
      ctx.fillStyle = word.color;

      // قياس النص
      const metrics = ctx.measureText(word.text);
      const textWidth = metrics.width;
      const textHeight = word.size;

      // العثور على موقع مناسب
      let x, y, attempts = 0;
      let position: { x: number; y: number; width: number; height: number };

      do {
        if (filters.shape === "circle") {
          // ترتيب دائري
          const angle = (index / sortedWords.length) * 2 * Math.PI;
          const radius = Math.min(canvas.width, canvas.height) * 0.3;
          x = canvas.width / 2 + Math.cos(angle) * radius * (1 - word.weight / 10);
          y = canvas.height / 2 + Math.sin(angle) * radius * (1 - word.weight / 10);
        } else {
          // ترتيب حر أو مستطيل
          x = Math.random() * (canvas.width - textWidth) + textWidth / 2;
          y = Math.random() * (canvas.height - textHeight) + textHeight / 2;
        }

        position = {
          x: x - textWidth / 2,
          y: y - textHeight / 2,
          width: textWidth,
          height: textHeight
        };

        attempts++;
      } while (
        attempts < 50 && 
        usedPositions.some(pos => 
          position.x < pos.x + pos.width + 10 &&
          position.x + position.width + 10 > pos.x &&
          position.y < pos.y + pos.height + 10 &&
          position.y + position.height + 10 > pos.y
        )
      );

      // رسم النص
      ctx.fillText(word.text, x, y);
      
      // إضافة الموقع للمستخدم
      usedPositions.push(position);

      // حفظ معلومات الكلمة للتفاعل
      (word as any).bounds = position;
    });

    // تطبيق التأثيرات
    if (isAnimating) {
      const progress = (animationFrame % 60) / 60;
      ctx.globalAlpha = 0.7 + 0.3 * Math.sin(progress * Math.PI * 2);
    }

  }, [height, filters.shape, isAnimating, animationFrame]);

  // معالجة حركة الفأرة
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x: e.clientX, y: e.clientY });

    // البحث عن الكلمة تحت المؤشر
    const hoveredWord = words.find(word => {
      const bounds = (word as any).bounds;
      return bounds &&
        x >= bounds.x && x <= bounds.x + bounds.width &&
        y >= bounds.y && y <= bounds.y + bounds.height;
    });

    setHoveredWord(hoveredWord || null);
    canvas.style.cursor = hoveredWord ? "pointer" : "default";
  }, [words]);

  // معالجة النقر
  const handleWordClick = useCallback(async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!hoveredWord) return;

    // تسجيل النقرة
    try {
      await fetch("/api/public/word-cloud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId: hoveredWord.id, action: "click" })
      });
    } catch (err) {
      console.error("Error tracking click:", err);
    }

    // تنفيذ الإجراء
    if (onWordClick) {
      onWordClick(hoveredWord);
    } else {
      window.open(hoveredWord.url, "_blank");
    }
  }, [hoveredWord, onWordClick]);

  // تحديث تلقائي
  useEffect(() => {
    fetchWordCloudData();

    if (autoUpdate) {
      const interval = setInterval(fetchWordCloudData, updateInterval);
      return () => clearInterval(interval);
    }
  }, [fetchWordCloudData, autoUpdate, updateInterval]);

  // رسم أولي
  useEffect(() => {
    if (words.length > 0) {
      drawWordCloud(words);
    }
  }, [words, drawWordCloud]);

  // تأثير الحجم المتجاوب
  useEffect(() => {
    const handleResize = () => {
      if (words.length > 0) {
        setTimeout(() => drawWordCloud(words), 100);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [words, drawWordCloud]);

  // تأثير الرسوم المتحركة
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setAnimationFrame(prev => prev + 1);
      }, 16); // 60 FPS

      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  return (
    <div className={`relative bg-white rounded-lg shadow-sm border ${className}`}>
      {/* شريط التحكم */}
      {enableControls && (
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">سحابة الكلمات الشائعة</h3>
            {loading && (
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowControls(!showControls)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
              title="إعدادات العرض"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            <button
              onClick={fetchWordCloudData}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* لوحة الإعدادات */}
      {showControls && (
        <div className="p-4 bg-gray-50 border-b space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* الفترة الزمنية */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                الفترة الزمنية
              </label>
              <select
                value={filters.period}
                onChange={(e) => setFilters(prev => ({ ...prev, period: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Palette className="w-4 h-4 inline mr-1" />
                نظام الألوان
              </label>
              <select
                value={filters.colorScheme}
                onChange={(e) => setFilters(prev => ({ ...prev, colorScheme: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="blue">أزرق</option>
                <option value="green">أخضر</option>
                <option value="red">أحمر</option>
                <option value="purple">بنفسجي</option>
                <option value="rainbow">قوس قزح</option>
                <option value="growth">حسب النمو</option>
              </select>
            </div>

            {/* الشكل */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                شكل السحابة
              </label>
              <select
                value={filters.shape}
                onChange={(e) => setFilters(prev => ({ ...prev, shape: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="cloud">حر</option>
                <option value="circle">دائري</option>
                <option value="rectangle">مستطيل</option>
              </select>
            </div>

            {/* عدد الكلمات */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                عدد الكلمات
              </label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value={25}>25 كلمة</option>
                <option value={50}>50 كلمة</option>
                <option value={100}>100 كلمة</option>
                <option value={200}>200 كلمة</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* منطقة السحابة */}
      <div ref={containerRef} className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75 z-10">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">جارٍ تحميل البيانات...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-red-600">
            <p>{error}</p>
            <button
              onClick={fetchWordCloudData}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={800}
          height={height}
          onMouseMove={handleMouseMove}
          onClick={handleWordClick}
          onMouseLeave={() => setHoveredWord(null)}
          className="w-full block"
          style={{ height: `${height}px` }}
        />

        {/* Tooltip للكلمة المحددة */}
        {hoveredWord && (
          <div
            className="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none"
            style={{
              left: mousePos.x + 10,
              top: mousePos.y - 40,
              transform: mousePos.x > window.innerWidth - 200 ? "translateX(-100%)" : "none"
            }}
          >
            <div className="font-semibold mb-1">{hoveredWord.text}</div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                استخدمت في {hoveredWord.stats.articlesCount} مقال
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-3 h-3" />
                {hoveredWord.stats.viewsCount.toLocaleString()} مشاهدة
              </div>
              <div className="flex items-center gap-2">
                <MousePointer className="w-3 h-3" />
                نمو: {hoveredWord.stats.growthRate > 0 ? "+" : ""}{hoveredWord.stats.growthRate}%
              </div>
              {hoveredWord.stats.category && (
                <div className="text-gray-300">
                  التصنيف: {hoveredWord.stats.category}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* إحصائيات سريعة */}
      {words.length > 0 && !loading && (
        <div className="px-4 py-3 bg-gray-50 border-t">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>عرض {words.length} كلمة من آخر {filters.period} يوم</span>
            <span>آخر تحديث: {new Date().toLocaleTimeString("ar-SA")}</span>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Brain,
  Clock,
  Globe,
  Headphones,
  Lightbulb,
  MessageSquare,
  Mic,
  Pause,
  Play,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDarkMode } from "@/hooks/useDarkMode";

interface AudioNewsletter {
  id: string;
  title: string;
  content: string;
  audioUrl: string;
  voice_name: string;
  created_at: string;
  play_count: number;
}

// مكون النشرة الصوتية (يدعم تخطيطين: مضغوط وعمود جانبي)
function CompactPodcastSection({
  layout = "compact",
}: {
  layout?: "compact" | "sidebar";
}) {
  const [newsletter, setNewsletter] = useState<AudioNewsletter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // جلب النشرة الرئيسية
  useEffect(() => {
    fetchMainNewsletter();
  }, []);

  const fetchMainNewsletter = async () => {
    try {
      setError(null);
      const response = await fetch("/api/audio/newsletters/main-page");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.newsletter) {
        setNewsletter(data.newsletter);
        setDuration(data.newsletter.duration);
      } else {
        setNewsletter(null);
      }
    } catch (error) {
      console.error("❌ خطأ في جلب النشرة:", error);
      setError(
        error instanceof Error ? error.message : "خطأ في جلب النشرة الصوتية"
      );
      setNewsletter(null);
    } finally {
      setIsLoading(false);
    }
  };

  // معالجة تشغيل/إيقاف الصوت
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // تحديث الوقت الحالي
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // عند انتهاء التشغيل
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // تنسيق الوقت
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // إذا كان في حالة التحميل
  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-center rounded-2xl",
          layout === "sidebar" ? "h-64" : "h-[160px]",
          darkMode
            ? "bg-gray-800/50 border-2 border-dashed border-gray-600 text-gray-300"
            : "bg-blue-50/50 border-2 border-dashed border-blue-200 text-gray-600"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="text-sm font-medium">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  // إذا حدث خطأ أو لا توجد نشرة
  if (error || !newsletter) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center text-center p-4 rounded-2xl",
          layout === "sidebar" ? "h-64" : "h-[160px]",
          darkMode
            ? "bg-gray-800/50 border-2 border-dashed border-gray-600 text-gray-300"
            : "bg-amber-50/50 border-2 border-dashed border-amber-200 text-gray-600"
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <Mic className="w-6 h-6 text-blue-600" />
          <h3 className="text-base font-bold">النشرة الصوتية</h3>
        </div>
        <p className="text-xs opacity-75 mb-2">
          {error ? "خطأ في التحميل" : "لا توجد نشرة حالياً"}
        </p>
        <button
          onClick={fetchMainNewsletter}
          className={cn(
            "px-3 py-1 rounded-lg text-xs font-medium transition-colors",
            darkMode
              ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
              : "bg-amber-100 hover:bg-amber-200 text-amber-700"
          )}
        >
          🔄 تحديث
        </button>
      </div>
    );
  }

  if (layout === "sidebar") {
    return (
      <div className="py-2 px-2">
        {/* رأس بصري في الوسط */}
        <div className="flex flex-col items-center text-center mb-3 sm:mb-4">
          <div
            className={cn(
              "w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-xl mb-2 sm:mb-3",
              darkMode
                ? "bg-gradient-to-br from-blue-600 to-blue-800"
                : "bg-gradient-to-br from-blue-500 to-blue-700"
            )}
          >
            <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h3
            className={cn(
              "text-base sm:text-lg font-bold",
              darkMode ? "text-white" : "text-gray-900"
            )}
          >
            النشرة الصوتية
          </h3>
          <div
            className={cn(
              "text-[11px] sm:text-xs mt-1 flex items-center gap-1",
              darkMode ? "text-blue-200/80" : "text-blue-700/80"
            )}
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            تأتيكم من سبق AI
          </div>
        </div>

        {/* المشغل */}
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 w-full">
            <Button
              onClick={togglePlayPause}
              size="sm"
              className={cn(
                "rounded-full w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 shadow-lg",
                isPlaying
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
              aria-label={isPlaying ? "إيقاف" : "تشغيل"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
              )}
            </Button>
            <div className="flex-1">
              <div className="flex items-center justify-between text-[11px] sm:text-xs mb-1 text-gray-500 dark:text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div
                className={cn(
                  "h-1.5 sm:h-2 rounded-full overflow-hidden",
                  darkMode ? "bg-gray-700" : "bg-gray-300"
                )}
              >
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  style={{
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* العنوان */}
          <div className="w-full mt-1 sm:mt-2">
            <h4
              className={cn(
                "text-[13px] sm:text-sm font-semibold line-clamp-2 text-center",
                darkMode ? "text-white" : "text-gray-800"
              )}
            >
              {newsletter.title}
            </h4>
          </div>

          {/* المؤشرات */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full mt-1.5 sm:mt-2">
            <div
              className={cn(
                "rounded-xl p-1.5 sm:p-2 text-center border",
                darkMode
                  ? "bg-gray-800/40 border-gray-700 text-gray-200"
                  : "bg-[#f8f8f7]/70 border-gray-200 text-gray-700"
              )}
            >
              <div className="flex items-center justify-center gap-1 text-[11px] sm:text-xs">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>المدة</span>
              </div>
              <div className="text-[12px] sm:text-sm font-bold mt-0.5">
                {formatTime(duration)}
              </div>
            </div>
            <div
              className={cn(
                "rounded-xl p-1.5 sm:p-2 text-center border",
                darkMode
                  ? "bg-gray-800/40 border-gray-700 text-gray-200"
                  : "bg-[#f8f8f7]/70 border-gray-200 text-gray-700"
              )}
            >
              <div className="flex items-center justify-center gap-1 text-[11px] sm:text-xs">
                <Headphones className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>استماع</span>
              </div>
              <div className="text-[12px] sm:text-sm font-bold mt-0.5">
                {newsletter.play_count}
              </div>
            </div>
            <div
              className={cn(
                "rounded-xl p-1.5 sm:p-2 text-center border",
                darkMode
                  ? "bg-gray-800/40 border-gray-700 text-gray-200"
                  : "bg-[#f8f8f7]/70 border-gray-200 text-gray-700"
              )}
            >
              <div className="flex items-center justify-center gap-1 text-[11px] sm:text-xs">
                <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>الصوت</span>
              </div>
              <div className="text-[11px] sm:text-xs font-semibold mt-0.5 line-clamp-1">
                {newsletter.voice_name}
              </div>
            </div>
          </div>
        </div>

        {/* عنصر الصوت */}
        <audio
          ref={audioRef}
          src={newsletter.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={(e) => {
            const audio = e.target as HTMLAudioElement;
            setDuration(audio.duration);
          }}
        />
      </div>
    );
  }

  // التخطيط المضغوط الافتراضي
  return (
    <div
      className={cn(
        "py-4 px-6 shadow-sm transition-colors duration-300",
        darkMode
          ? "bg-gray-800/50 border border-gray-700"
          : "bg-blue-50/80 border border-blue-200"
      )}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* معلومات النشرة */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Mic className="w-4 h-4 text-blue-600" />
            <h3
              className={cn(
                "text-sm font-bold",
                darkMode ? "text-gray-100" : "text-gray-700"
              )}
            >
              {newsletter.title}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Headphones className="w-3 h-3" />
              {newsletter.play_count} استماع
            </span>
            <Link
              href="/audio-archive"
              className="underline text-blue-500 hover:text-blue-600"
            >
              الأرشيف
            </Link>
          </div>
        </div>

        {/* مشغل الصوت */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* زر التشغيل */}
          <Button
            onClick={togglePlayPause}
            size="sm"
            className={cn(
              "rounded-full w-10 h-10 flex-shrink-0 shadow-md",
              isPlaying
                ? "bg-gray-800 hover:bg-gray-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>

          {/* شريط التقدم */}
          <div className="flex-1 md:w-48">
            <div className="flex items-center justify-between text-xs mb-1 text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div
              className={cn(
                "h-1.5 rounded-full overflow-hidden",
                darkMode ? "bg-gray-700" : "bg-gray-300"
              )}
            >
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* عنصر الصوت المخفي */}
      <audio
        ref={audioRef}
        src={newsletter.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={(e) => {
          const audio = e.target as HTMLAudioElement;
          setDuration(audio.duration);
        }}
      />
    </div>
  );
}

// مكون الوحدة الذكية - محسن بناءً على ملاحظات المستخدم
function SmartModule() {
  const [activeModule, setActiveModule] = useState<"sentiment" | "fact">(
    "sentiment"
  );
  const [sentimentData, setSentimentData] = useState({
    topic: "القرار الاقتصادي الجديد",
    sentiment: "إيجابي",
    percentage: 92,
    trend: "صاعد",
  });

  const [factData, setFactData] = useState({
    title: "معلومة ذكية",
    fact: "السعودية تحتل المرتبة الأولى عالمياً في إنتاج ماء الورد، بإنتاج يصل إلى 300 طن سنوياً من منطقة الطائف.",
    source: "الهيئة العامة للإحصاء",
  });

  useEffect(() => {
    // محاكاة تحديث البيانات كل 30 ثانية
    const interval = setInterval(() => {
      if (activeModule === "sentiment") {
        setSentimentData((prev) => ({
          ...prev,
          percentage: Math.floor(Math.random() * 20) + 80, // 80-100%
        }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeModule]);

  return (
    <div
      className={cn(
        "h-[160px] p-4 border transition-all duration-300 w-full max-w-full",
        darkMode
          ? "bg-gradient-to-tr from-purple-900/20 via-purple-800/10 to-slate-800 border-purple-700/30"
          : "bg-gradient-to-tr from-purple-100 via-white to-white border-purple-200 shadow-md"
      )}
    >
      {/* رأس الوحدة الذكية - محسن */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-full flex-shrink-0 shadow-sm",
              darkMode
                ? "bg-purple-700/30 border border-purple-600/20"
                : "bg-purple-100 border border-purple-200"
            )}
          >
            <Brain
              className={cn(
                "w-5 h-5",
                darkMode ? "text-purple-300" : "text-purple-700"
              )}
            />
          </div>
          <div>
            <span
              className={cn(
                "text-xs px-3 py-1 rounded-full font-semibold",
                darkMode
                  ? "bg-purple-800/40 text-purple-200 border border-purple-600/30"
                  : "bg-purple-200 text-purple-900"
              )}
            >
              وحدة ذكية
            </span>
          </div>
        </div>

        {/* أزرار التبديل - محسنة */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveModule("sentiment")}
            className={cn(
              "p-2 rounded-lg transition-all duration-200 text-xs border",
              activeModule === "sentiment"
                ? darkMode
                  ? "bg-purple-700 text-white border-purple-600 shadow-sm"
                  : "bg-purple-600 text-white border-purple-600 shadow-sm"
                : darkMode
                ? "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border-slate-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300"
            )}
            title="تحليل رأي الجمهور"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveModule("fact")}
            className={cn(
              "p-2 rounded-lg transition-all duration-200 text-xs border",
              activeModule === "fact"
                ? darkMode
                  ? "bg-purple-700 text-white border-purple-600 shadow-sm"
                  : "bg-purple-600 text-white border-purple-600 shadow-sm"
                : darkMode
                ? "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border-slate-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300"
            )}
            title="معلومة ذكية"
          >
            <Lightbulb className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* محتوى الوحدة - محسن */}
      <div className="h-[90px] overflow-hidden">
        {activeModule === "sentiment" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
              <h4
                className={cn(
                  "text-sm font-bold",
                  darkMode ? "text-slate-100" : "text-gray-900"
                )}
              >
                تحليل رأي الجمهور
              </h4>
            </div>

            <div
              className={cn(
                "p-3 rounded-xl border",
                darkMode
                  ? "bg-slate-800/60 border-slate-600/30"
                  : "bg-[#f8f8f7]/90 border-gray-200 shadow-sm"
              )}
            >
              <p
                className={cn(
                  "text-sm mb-3 font-medium",
                  darkMode ? "text-slate-200" : "text-gray-800"
                )}
              >
                "{sentimentData.topic}"
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-12 h-2 rounded-full overflow-hidden",
                      darkMode ? "bg-slate-700" : "bg-gray-200"
                    )}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-700"
                      style={{ width: `${sentimentData.percentage}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      darkMode ? "text-green-400" : "text-green-600"
                    )}
                  >
                    {sentimentData.percentage}% {sentimentData.sentiment}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "text-xs px-2 py-1 rounded-full font-medium",
                      darkMode
                        ? "bg-green-900/30 text-green-400"
                        : "bg-green-100 text-green-700"
                    )}
                  >
                    🔍 {sentimentData.percentage}% دقة
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <h4
                className={cn(
                  "text-sm font-bold",
                  darkMode ? "text-slate-100" : "text-gray-900"
                )}
              >
                معلومة ذكية
              </h4>
            </div>

            <div
              className={cn(
                "p-3 rounded-xl border",
                darkMode
                  ? "bg-slate-800/60 border-slate-600/30"
                  : "bg-[#f8f8f7]/90 border-gray-200 shadow-sm"
              )}
            >
              <p
                className={cn(
                  "text-sm mb-2 line-clamp-2 leading-relaxed",
                  darkMode ? "text-slate-200" : "text-gray-800"
                )}
              >
                <strong className="text-yellow-600">هل تعلم؟</strong>{" "}
                {factData.fact.substring(0, 80)}...
              </p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-blue-500" />
                  <span
                    className={cn(
                      "text-xs",
                      darkMode ? "text-slate-400" : "text-gray-600"
                    )}
                  >
                    {factData.source}
                  </span>
                </div>
                <button
                  className={cn(
                    "text-xs font-medium hover:underline transition-colors",
                    darkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-500"
                  )}
                >
                  عرض التفاصيل
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// المكون الرئيسي
interface SmartAudioBlockProps {
  variant?: "default" | "sidebar";
  className?: string;
}

export default function SmartAudioBlock({
  variant = "default",
  className,
}: SmartAudioBlockProps) {
  const { darkMode } = useDarkMode();

  return (
    <div
      className={cn(
        "w-full",
        variant === "default" ? "mb-6 px-2 sm:px-0" : "p-0",
        className
      )}
    >
      <div>
        <CompactPodcastSection
          layout={variant === "sidebar" ? "sidebar" : "compact"}
        />
      </div>
    </div>
  );
}

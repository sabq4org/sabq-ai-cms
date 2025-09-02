"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Archive,
  Clock,
  Download,
  Mic,
  Pause,
  Play,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface AudioNewsletter {
  id: string;
  title: string;
  content: string;
  audioUrl: string;
  duration: number;
  voice_name: string;
  created_at: string;
  play_count: number;
}

export default function PodcastBlock() {
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
      setError(null); // إعادة تعيين الخطأ
      console.log("🎙️ جاري جلب النشرة الصوتية للصفحة الرئيسية...");

      const response = await fetch("/api/audio/newsletters/main-page");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📥 استجابة API:", data);

      if (data.success && data.newsletter) {
        console.log("✅ تم العثور على نشرة صوتية:", data.newsletter.title);
        setNewsletter(data.newsletter);
        setDuration(data.newsletter.duration);
      } else {
        console.log("⚠️ لم يتم العثور على نشرة صوتية للصفحة الرئيسية");
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
      <div className="w-full mb-4 sm:mb-6 px-2 sm:px-0">
        <div
          className={`p-6 border-2 border-dashed transition-all ${
            darkMode
              ? "bg-gray-800/50 border-gray-600 text-gray-300"
              : "bg-blue-50/50 border-blue-200 text-gray-600"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-sm font-medium">
              جاري تحميل النشرة الصوتية...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // إذا حدث خطأ، نعرض رسالة خطأ مع زر إعادة المحاولة
  if (error) {
    return (
      <div className="w-full mb-4 sm:mb-6 px-2 sm:px-0">
        <div
          className={`p-6 border-2 border-dashed transition-all ${
            darkMode
              ? "bg-red-900/20 border-red-800 text-red-300"
              : "bg-red-50/50 border-red-200 text-red-600"
          }`}
        >
          <div className="text-center">
            <div className="mb-3">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-bold mb-2">
              خطأ في تحميل النشرة الصوتية
            </h3>
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={fetchMainNewsletter}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                darkMode
                  ? "bg-red-800 hover:bg-red-700 text-red-100"
                  : "bg-red-100 hover:bg-red-200 text-red-700"
              }`}
            >
              🔄 إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  // إذا لم توجد نشرة، نعرض رسالة بدلاً من إخفاء البلوك
  if (!newsletter) {
    return (
      <div className="w-full mb-4 sm:mb-6 px-2 sm:px-0">
        <div
          className={`p-6 border-2 border-dashed transition-all ${
            darkMode
              ? "bg-gray-800/50 border-gray-600 text-gray-300"
              : "bg-amber-50/50 border-amber-200 text-gray-600"
          }`}
        >
          <div className="text-center">
            <div className="mb-3">
              <span className="text-2xl">🎙️</span>
            </div>
            <h3 className="text-lg font-bold mb-2">النشرة الصوتية</h3>
            <p className="text-sm mb-3">لا توجد نشرة صوتية منشورة حالياً</p>
            <div className="text-xs opacity-75 mb-4">
              سيتم عرض النشرة الصوتية هنا عند توفرها
            </div>
            <button
              onClick={fetchMainNewsletter}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-amber-100 hover:bg-amber-200 text-amber-700"
              }`}
            >
              🔄 تحديث
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-4 sm:mb-6 px-2 sm:px-0">
      <Card
        className={cn(
          "transition-all duration-300",
          darkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
        )}
      >
        <div className="p-4 sm:p-6">
          {/* الرأس */}
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={cn(
                  "p-2 sm:p-3 rounded-lg flex-shrink-0",
                  darkMode ? "bg-blue-900/30" : "bg-blue-100"
                )}
              >
                <Mic className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Mic className="w-4 h-4 text-blue-600" />
                  <h3
                    className={cn(
                      "text-base sm:text-lg font-bold line-clamp-2",
                      darkMode ? "text-gray-100" : "text-gray-900"
                    )}
                  >
                    {newsletter.title}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    <Radio className="w-3 h-3 mr-1" />
                    نشرة إذاعية
                  </Badge>
                  <span
                    className={cn(
                      "text-xs",
                      darkMode ? "text-gray-400" : "text-gray-600"
                    )}
                  >
                    {new Date(newsletter.created_at).toLocaleDateString("ar")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* مشغل الصوت */}
          <div
            className={cn(
              "p-3 sm:p-4 rounded-lg mb-3 sm:mb-4",
              darkMode ? "bg-gray-900/50" : "bg-white/80"
            )}
          >
            <div className="flex items-center gap-2 sm:gap-4">
              {/* زر التشغيل */}
              <Button
                onClick={togglePlayPause}
                size="lg"
                className={cn(
                  "rounded-full w-12 sm:w-14 h-12 sm:h-14 flex-shrink-0",
                  isPlaying
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isPlaying ? (
                  <Pause className="w-5 sm:w-6 h-5 sm:h-6" />
                ) : (
                  <Play className="w-5 sm:w-6 h-5 sm:h-6 ml-0.5 sm:ml-1" />
                )}
              </Button>

              {/* شريط التقدم */}
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {formatTime(currentTime)}
                  </span>
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {formatTime(duration)}
                  </span>
                </div>
                <div
                  className={cn(
                    "h-2 rounded-full overflow-hidden",
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  )}
                >
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
              </div>

              {/* زر التحميل */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(newsletter.audioUrl, "_blank")}
                className="flex-shrink-0 p-2 sm:px-3"
              >
                <Download className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span className="hidden sm:inline mr-1">تحميل</span>
              </Button>
            </div>
          </div>

          {/* الإحصائيات والأزرار */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <span
                className={cn(
                  "flex items-center gap-1",
                  darkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                {formatTime(duration)}
              </span>
              <span
                className={cn(
                  "flex items-center gap-1",
                  darkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                <Play className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                {newsletter.play_count} استماع
              </span>
            </div>

            <Link href="/audio-archive">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                <Archive className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">أرشيف النشرات</span>
                <span className="sm:hidden">الأرشيف</span>
              </Button>
            </Link>
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
      </Card>
    </div>
  );
}

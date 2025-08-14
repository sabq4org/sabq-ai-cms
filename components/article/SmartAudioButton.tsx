"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SmartAudioButtonProps {
  articleId: string;
  title: string;
  content: string;
  className?: string;
  variant?: "floating" | "inline";
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export default function SmartAudioButton({
  articleId,
  title,
  content,
  className = "",
  variant = "floating",
  position = "bottom-right",
}: SmartAudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // تحميل الصوت من localStorage إن وجد
  useEffect(() => {
    const cachedAudio = localStorage.getItem(`article-audio-${articleId}`);
    if (cachedAudio) {
      try {
        const { url, timestamp } = JSON.parse(cachedAudio);
        // التحقق من صلاحية الكاش (24 ساعة)
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setAudioUrl(url);
        } else {
          localStorage.removeItem(`article-audio-${articleId}`);
        }
      } catch (e) {
        console.error("Error loading cached audio:", e);
      }
    }
  }, [articleId]);

  // استعادة موضع التشغيل
  useEffect(() => {
    const savedPosition = localStorage.getItem(`article-audio-position-${articleId}`);
    if (savedPosition && audioRef.current) {
      audioRef.current.currentTime = parseFloat(savedPosition);
    }
  }, [articleId, audioUrl]);

  // حفظ موضع التشغيل
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current && isPlaying) {
        setCurrentTime(audioRef.current.currentTime);
        localStorage.setItem(
          `article-audio-position-${articleId}`,
          audioRef.current.currentTime.toString()
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, articleId]);

  const generateAudio = async () => {
    if (audioUrl) {
      togglePlayPause();
      return;
    }

    setIsLoading(true);
    try {
      // استدعاء API لتوليد الصوت
      const response = await fetch("/api/tts/elevenlabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content.substring(0, 1000), // أول 1000 حرف
          title,
          articleId,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate audio");

      const data = await response.json();
      setAudioUrl(data.audioUrl);

      // حفظ في الكاش المحلي
      localStorage.setItem(
        `article-audio-${articleId}`,
        JSON.stringify({
          url: data.audioUrl,
          timestamp: Date.now(),
        })
      );

      // بدء التشغيل تلقائياً
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }, 100);
    } catch (error) {
      console.error("Error generating audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioUrl) {
        generateAudio();
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    localStorage.removeItem(`article-audio-position-${articleId}`);
  };

  // أنماط الموضع للزر العائم
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-20 right-6",
    "top-left": "top-20 left-6",
  };

  if (variant === "floating") {
    return (
      <>
        <div
          className={cn(
            "fixed z-40 transition-all duration-300",
            positionClasses[position],
            className
          )}
        >
          <Button
            onClick={togglePlayPause}
            disabled={isLoading}
            className={cn(
              "h-14 w-14 rounded-full shadow-lg",
              "bg-gradient-to-r from-purple-600 to-blue-600",
              "hover:from-purple-700 hover:to-blue-700",
              "text-white border-2 border-white/20",
              "transform transition-all duration-300",
              isPlaying && "scale-110 animate-pulse"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </Button>

          {/* مؤشر التشغيل */}
          {audioUrl && duration > 0 && (
            <div className="absolute -top-1 left-0 right-0 h-1 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          )}

          {/* تلميح عند التحميل */}
          {isLoading && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs bg-black/80 text-white px-2 py-1 rounded">
                جارٍ تحضير الصوت...
              </span>
            </div>
          )}
        </div>

        {/* عنصر الصوت المخفي */}
        <audio
          ref={audioRef}
          src={audioUrl || undefined}
          onEnded={handleAudioEnd}
          onLoadedMetadata={(e) => {
            const audio = e.target as HTMLAudioElement;
            setDuration(audio.duration);
          }}
          className="hidden"
        />
      </>
    );
  }

  // النسخة المدمجة (inline)
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Button
        onClick={togglePlayPause}
        disabled={isLoading}
        size="sm"
        className={cn(
          "h-9 px-3 rounded-full",
          isPlaying
            ? "bg-purple-600 hover:bg-purple-700"
            : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            <span className="text-sm">تحضير...</span>
          </>
        ) : isPlaying ? (
          <>
            <Pause className="h-4 w-4 mr-1.5" />
            <span className="text-sm">إيقاف</span>
          </>
        ) : (
          <>
            <Volume2 className="h-4 w-4 mr-1.5" />
            <span className="text-sm">استمع للمقال</span>
          </>
        )}
      </Button>

      {/* عنصر الصوت المخفي */}
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onEnded={handleAudioEnd}
        onLoadedMetadata={(e) => {
          const audio = e.target as HTMLAudioElement;
          setDuration(audio.duration);
        }}
        className="hidden"
      />
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDarkModeContext } from "@/contexts/DarkModeContext";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Download,
  Loader2,
  Mic,
  Pause,
  Play,
  Radio,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";

interface AudioNewsletter {
  id: string;
  title: string;
  content: string;
  audioUrl: string;
  duration: number;
  voice_name: string;
  created_at: string;
  play_count: number;
  is_featured: boolean;
  is_main_page: boolean;
}

export default function AudioArchivePage() {
  const { darkMode } = useDarkModeContext();
  const [newsletters, setNewsletters] = useState<AudioNewsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [totalDurationSec, setTotalDurationSec] = useState<number>(0);
  const [audioLoading, setAudioLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchNewsletters();
  }, []);

  useEffect(() => {
    // تنظيف الصوت عند تغيير المشغل أو عند التفكيك
    return () => {
      if (currentAudio) {
        try {
          currentAudio.onended = null;
          currentAudio.ontimeupdate = null;
          currentAudio.onloadedmetadata = null;
          currentAudio.pause();
          currentAudio.src = "";
        } catch (_) {}
      }
    };
  }, [currentAudio]);

  const fetchNewsletters = async () => {
    try {
      const response = await fetch("/api/audio/newsletters");
      const data = await response.json();

      if (data.success) {
        // فلتر النشرات المنشورة فقط
        const publishedNewsletters = data.newsletters.filter(
          (nl: any) => nl.is_published
        );
        setNewsletters(publishedNewsletters);
      }
    } catch (error) {
      console.error("خطأ في جلب النشرات:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = (newsletter: AudioNewsletter) => {
    if (playingId === newsletter.id) {
      // إيقاف التشغيل
      if (currentAudio) {
        currentAudio.pause();
        setPlayingId(null);
        setAudioLoading(false);
      }
      return;
    }

    // تشغيل جديد
    if (currentAudio) {
      try {
        currentAudio.onended = null;
        currentAudio.ontimeupdate = null;
        currentAudio.onloadedmetadata = null;
        currentAudio.pause();
        currentAudio.src = "";
      } catch (_) {}
    }

    const audio = new Audio(newsletter.audioUrl);
    setAudioLoading(true);
    setCurrentTimeSec(0);

    audio.onloadedmetadata = () => {
      const total = Math.floor(
        Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration
          : newsletter.duration || 0
      );
      setTotalDurationSec(total);
      setAudioLoading(false);
    };
    audio.ontimeupdate = () => {
      setCurrentTimeSec(Math.floor(audio.currentTime || 0));
    };
    audio.onended = () => {
      setPlayingId(null);
      setCurrentTimeSec(0);
    };

    audio.play();
    setCurrentAudio(audio);
    setPlayingId(newsletter.id);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const filteredNewsletters = newsletters.filter(
    (nl) =>
      nl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nl.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={cn(
        "min-h-screen py-8 px-2 sm:px-4",
        darkMode ? "bg-gray-900" : "bg-gray-50"
      )}
    >
      <div className="max-w-6xl mx-auto">
        {/* الهيدر */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div
              className={cn(
                "p-4 rounded-full",
                darkMode ? "bg-blue-900/30" : "bg-blue-100"
              )}
            >
              <Radio className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1
            className={cn(
              "text-3xl sm:text-4xl font-bold mb-2",
              darkMode ? "text-gray-100" : "text-gray-900"
            )}
          >
            أرشيف النشرات الصوتية
          </h1>
          <p
            className={cn(
              "text-base sm:text-lg",
              darkMode ? "text-gray-400" : "text-gray-600"
            )}
          >
            استمع إلى جميع النشرات الإخبارية الصوتية
          </p>
        </div>

        {/* شريط البحث */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search
              className={cn(
                "absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}
            />
            <Input
              type="text"
              placeholder="ابحث عن نشرة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "pr-10 w-full",
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white"
              )}
            />
          </div>
        </div>

        {/* قائمة النشرات */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredNewsletters.length === 0 ? (
          <div className="text-center py-12">
            <p
              className={cn(
                "text-lg",
                darkMode ? "text-gray-400" : "text-gray-600"
              )}
            >
              لم يتم العثور على نشرات
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredNewsletters.map((newsletter) => (
              <Card
                key={newsletter.id}
                className={cn(
                  "overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 rounded-2xl",
                  darkMode
                    ? "bg-gray-850 bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200",
                  newsletter.is_main_page && "ring-2 ring-blue-500"
                )}
              >
                {/* هيدر متدرّج ناعم */}
                <div
                  className={cn(
                    "px-4 sm:px-5 py-4 border-b",
                    darkMode
                      ? "bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border-gray-700"
                      : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner",
                          darkMode
                            ? "bg-blue-600/30 text-blue-200"
                            : "bg-blue-600/10 text-blue-700"
                        )}
                      >
                        <Mic className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3
                          className={cn(
                            "font-bold text-base truncate",
                            darkMode ? "text-gray-100" : "text-gray-900"
                          )}
                        >
                          {newsletter.title}
                        </h3>
                        <div
                          className={cn(
                            "flex flex-wrap items-center gap-2 text-xs",
                            darkMode ? "text-gray-400" : "text-gray-600"
                          )}
                        >
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(newsletter.created_at).toLocaleDateString(
                              "ar-SA",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                          <span
                            className={cn(
                              "mx-1",
                              darkMode ? "text-gray-600" : "text-gray-300"
                            )}
                          >
                            •
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(newsletter.duration)}
                          </span>
                          <span
                            className={cn(
                              "mx-1",
                              darkMode ? "text-gray-600" : "text-gray-300"
                            )}
                          >
                            •
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {newsletter.play_count} استماع
                          </span>
                        </div>
                      </div>
                    </div>
                    {newsletter.is_main_page && (
                      <Badge variant="default" className="bg-blue-600">
                        نشرة رئيسية
                      </Badge>
                    )}
                  </div>
                </div>

                {/* جسم البطاقة */}
                <div className="p-4 sm:p-5">
                  {/* وصف مختصر */}
                  <p
                    className={cn(
                      "text-sm mb-4 line-clamp-3",
                      darkMode ? "text-gray-300" : "text-gray-700"
                    )}
                  >
                    {newsletter.content}
                  </p>

                  {/* أزرار التحكم */}
                  <div className="flex items-center gap-2 mb-3">
                    <Button
                      aria-label={
                        playingId === newsletter.id ? "إيقاف" : "تشغيل"
                      }
                      onClick={() => togglePlay(newsletter)}
                      className={cn(
                        "flex-1 text-sm",
                        playingId === newsletter.id
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      )}
                    >
                      {audioLoading && playingId === newsletter.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 ml-1 animate-spin" />
                          جارٍ التحميل
                        </>
                      ) : playingId === newsletter.id ? (
                        <>
                          <Pause className="w-3.5 h-3.5 ml-1" />
                          إيقاف
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 ml-1" />
                          استماع
                        </>
                      )}
                    </Button>
                    <Button
                      aria-label="تحميل الملف الصوتي"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(newsletter.audioUrl, "_blank")}
                      className="px-3"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* شريط التقدم والتوقيت */}
                  <div>
                    <div
                      className={cn(
                        "w-full h-1.5 rounded-full overflow-hidden",
                        darkMode ? "bg-gray-700" : "bg-gray-200"
                      )}
                    >
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          darkMode
                            ? "bg-gradient-to-r from-blue-500 to-purple-500"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600"
                        )}
                        style={{
                          width:
                            playingId === newsletter.id
                              ? `${Math.min(
                                  100,
                                  (currentTimeSec /
                                    (totalDurationSec ||
                                      newsletter.duration ||
                                      1)) *
                                    100
                                ).toFixed(2)}%`
                              : "0%",
                        }}
                      />
                    </div>
                    <div
                      className={cn(
                        "mt-1.5 flex items-center justify-between text-[11px]",
                        darkMode ? "text-gray-400" : "text-gray-500"
                      )}
                    >
                      <span>
                        {playingId === newsletter.id
                          ? formatTime(currentTimeSec)
                          : "0:00"}
                      </span>
                      <span>
                        {formatTime(
                          Math.floor(
                            totalDurationSec || newsletter.duration || 0
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

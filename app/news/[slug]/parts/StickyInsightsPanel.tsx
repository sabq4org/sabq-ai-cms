"use client";
import { useMemo, useRef, useState } from "react";
import { BarChart, Bell, Bookmark, Share2, Sparkles, ChevronDown, ChevronUp, Headphones, Play, Pause, Loader2, Tag } from "lucide-react";
import dynamic from "next/dynamic";

const PersonalizedForYou = dynamic(() => import("./PersonalizedForYou"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm animate-pulse h-64" />
  ),
});

type Insights = {
  views: number;
  readsCompleted: number;
  avgReadTimeSec: number;
  interactions: { likes: number; comments: number; shares: number };
  ai: {
    shortSummary: string;
    sentiment: "إيجابي" | "سلبي" | "محايد";
    topic: string;
    readerFitScore: number;
    recommendations: { id: string; title: string; url: string }[];
  };
};

export default function StickyInsightsPanel({ insights, article }: { insights: Insights; article: { id: string; summary?: string | null; categories?: { name: string } | null; tags?: any[]; likes?: number; shares?: number; saves?: number } }) {
  const avgMinutes = useMemo(() => Math.max(1, Math.round(insights.avgReadTimeSec / 60)), [insights.avgReadTimeSec]);
  
  // تسجيل للتحقق من البيانات
  if (typeof window !== 'undefined') {
    console.log('StickyInsightsPanel - article.tags:', article.tags);
  }
  const [expanded, setExpanded] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const loadOrToggleAudio = async () => {
    // إذا كان لدينا رابط بالفعل، بدّل التشغيل/الإيقاف
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (e) {
          console.error("تعذر تشغيل الصوت:", e);
        }
      }
      return;
    }

    // وإلا: ولّد الصوت من API الملخّص القديم
    try {
      setIsAudioLoading(true);
      const res = await fetch(`/api/voice-summary?articleId=${article.id}`);
      const data = await res.json();
      if (data?.audioUrl) {
        setAudioUrl(data.audioUrl);
        // شغّل فورًا بعد التعيين
        setTimeout(async () => {
          if (audioRef.current) {
            try {
              await audioRef.current.play();
              setIsPlaying(true);
            } catch (e) {
              console.error("تعذر تشغيل الصوت بعد التحميل:", e);
            }
          }
        }, 50);
      }
    } finally {
      setIsAudioLoading(false);
    }
  };

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      {/* الموجز الذكي */}
      {article.summary && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-neutral-900 dark:text-neutral-100">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold">الموجز الذكي</h3>
            {/* زر الاستماع للموجز - مستوحى من الصفحة القديمة */}
            <button
              type="button"
              onClick={loadOrToggleAudio}
              className="ml-auto inline-flex items-center gap-1 rounded-full border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title={isPlaying ? "إيقاف الاستماع" : "استمع للموجز"}
            >
              {isAudioLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : audioUrl ? (
                <Play className="w-4 h-4" />
              ) : (
                <Headphones className="w-4 h-4" />
              )}
              <span>{isPlaying ? "إيقاف" : audioUrl ? "تشغيل" : "استمع"}</span>
            </button>
          </div>
          <p id="smart-summary" className={"text-sm text-neutral-700 dark:text-neutral-300 leading-6 " + (expanded ? "" : "line-clamp-3")}>{article.summary}</p>
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls="smart-summary"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 inline-flex items-center gap-1 text-[12px] text-blue-600 dark:text-blue-400 hover:underline"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{expanded ? "إظهار أقل" : "إظهار المزيد"}</span>
          </button>
          {/* عنصر الصوت المخفي */}
          <audio
            ref={audioRef}
            src={audioUrl || undefined}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      )}
      
      {/* إجراءات */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          <ActionBtn icon={<Bell className="w-4 h-4" />} label="تنبيه" />
          <ActionBtn icon={<Bookmark className="w-4 h-4" />} label="حفظ" />
          <ActionBtn icon={<Share2 className="w-4 h-4" />} label="مشاركة" />
        </div>
      </div>
      
      {/* الكلمات المفتاحية */}
      {article.tags && article.tags.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-neutral-900 dark:text-neutral-100">
            <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold">الكلمات المفتاحية</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag: any, index: number) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
                style={{
                  background: 'var(--theme-primary-lighter, rgb(219 234 254))',
                  color: 'var(--theme-primary-dark, rgb(55 48 163))',
                  border: '1px solid var(--theme-primary-light, rgb(147 197 253))',
                }}
              >
                #{tag.name || tag}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* نظرة سريعة */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-neutral-900 dark:text-neutral-100">
          <BarChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold">نظرة سريعة</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="المشاهدات" value={insights.views.toLocaleString("ar-SA")} />
          <Stat label="إكمال القراءة" value={insights.readsCompleted.toLocaleString("ar-SA")} />
          <Stat label="متوسط الوقت" value={`${avgMinutes} د`} />
          <Stat label="التفاعل" value={`${insights.interactions.shares + insights.interactions.comments + insights.interactions.likes}`} />
        </div>
      </div>

      {/* تحليلات الذكاء الاصطناعي */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-neutral-900 dark:text-neutral-100">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-semibold">تحليلات AI</h3>
        </div>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-6">
          {insights.ai.shortSummary}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
          <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{insights.ai.sentiment}</span>
          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">{insights.ai.topic}</span>
          <span className="px-2 py-1 rounded-full bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300">ملاءمة {insights.ai.readerFitScore}%</span>
        </div>
      </div>
      
      {/* مخصص لك بذكاء */}
      <PersonalizedForYou 
        articleId={article.id}
        categoryName={article.categories?.name}
        tags={article.tags}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3">
      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{label}</div>
      <div className="text-sm font-semibold mt-1 text-neutral-900 dark:text-neutral-100">{value}</div>
    </div>
  );
}

function ActionBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button 
      className="inline-flex items-center justify-center gap-1 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm transition-all hover:scale-105 text-neutral-900 dark:text-neutral-100 hover:bg-blue-50 dark:hover:bg-blue-900/20"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}



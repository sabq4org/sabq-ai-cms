"use client";
import { useMemo } from "react";
import { BarChart, Bell, Bookmark, Share2, Sparkles } from "lucide-react";

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

export default function StickyInsightsPanel({ insights, article }: { insights: Insights; article: { id: string } }) {
  const avgMinutes = useMemo(() => Math.max(1, Math.round(insights.avgReadTimeSec / 60)), [insights.avgReadTimeSec]);

  return (
    <div className="lg:sticky lg:top-24 space-y-4">
      {/* نظرة سريعة */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-neutral-700 dark:text-neutral-200">
          <BarChart className="w-5 h-5" />
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
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-neutral-700 dark:text-neutral-200">
          <Sparkles className="w-5 h-5" />
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

      {/* إجراءات */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          <ActionBtn icon={<Bell className="w-4 h-4" />} label="تنبيه" />
          <ActionBtn icon={<Bookmark className="w-4 h-4" />} label="حفظ" />
          <ActionBtn icon={<Share2 className="w-4 h-4" />} label="مشاركة" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 p-3">
      <div className="text-[11px] text-neutral-500 dark:text-neutral-400">{label}</div>
      <div className="text-sm font-semibold mt-1">{value}</div>
    </div>
  );
}

function ActionBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="inline-flex items-center justify-center gap-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800">
      {icon}
      <span>{label}</span>
    </button>
  );
}



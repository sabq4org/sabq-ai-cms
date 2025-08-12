"use client";

import React, { useMemo, useState } from "react";
import { Check, Clipboard, Loader2, MessageCircleQuestion, RefreshCw, ChevronDown } from "lucide-react";

interface Props {
  content: string;
}

const AIQuestions: React.FC<Props> = ({ content }) => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answerLoading, setAnswerLoading] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [copiedFor, setCopiedFor] = useState<string | null>(null);
  const [pollSubmitting, setPollSubmitting] = useState<string | null>(null);
  const [pollResults, setPollResults] = useState<Record<string, { counts: number[]; total: number }>>({});
  const [open, setOpen] = useState(false);

  const canGenerate = useMemo(() => (content?.length || 0) > 30, [content]);

  const generate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/news/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (json.success) setQuestions(json.questions || []);
    } finally {
      setLoading(false);
    }
  };

  const ask = async (q: string) => {
    if (!q) return;
    setAnswerLoading(q);
    try {
      const res = await fetch("/api/ai/news/generate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, content }),
      });
      const json = await res.json();
      if (json.success) setAnswers((prev) => ({ ...prev, [q]: json.answer }));
    } finally {
      setAnswerLoading(null);
    }
  };

  const vote = async (qObj: any, optionIndex: number) => {
    const qText = qObj?.question || String(qObj);
    if (!qText || !Array.isArray(qObj?.options)) return;
    setPollSubmitting(qText);
    try {
      const articleIdMatch = typeof window !== 'undefined' ? window.location.pathname.match(/\/article\/([^\/]+)/) : null;
      const articleId = articleIdMatch?.[1] || '';
      const res = await fetch('/api/ai/news/poll-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          question: qText,
          options: qObj.options,
          optionIndex,
        })
      });
      const json = await res.json();
      if (json.success) {
        setPollResults((prev) => ({ ...prev, [qText]: { counts: json.counts, total: json.total } }));
      }
    } finally {
      setPollSubmitting(null);
    }
  };

  const copyAnswer = async (q: string) => {
    const a = answers[q];
    if (!a) return;
    try {
      await navigator.clipboard.writeText(a);
      setCopiedFor(q);
      setTimeout(() => setCopiedFor(null), 1500);
    } catch {}
  };

  return (
    <section className="relative mt-10 overflow-hidden rounded-2xl border border-purple-200/60 dark:border-purple-900/40 bg-gradient-to-b from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {/* زخرفة خلفية ناعمة */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-purple-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="relative p-6 sm:p-8">
        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-sm">
            <MessageCircleQuestion className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-300 dark:to-indigo-300">
              مكون الذكاء الاصطناعي للأخبار
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              اسأل الذكاء الاصطناعي عن هذا الخبر واحصل على إجابات مبنية على المحتوى
            </p>
          </div>
          <div className="flex items-center gap-2">
            {questions.length > 0 && (
              <button
                onClick={generate}
                className="inline-flex items-center gap-1 text-sm text-purple-700 dark:text-purple-300 hover:text-purple-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> إعادة التوليد
              </button>
            )}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              title={open ? "إخفاء" : "إظهار"}
            >
              <span className="hidden sm:inline">{open ? "إخفاء" : "إظهار"}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : "rotate-0"}`} />
            </button>
          </div>
        </div>

        {/* الحالة الأولية */}
        {open && questions.length === 0 ? (
          <div className="mt-3">
            <button
              onClick={generate}
              disabled={!canGenerate || loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 active:scale-[0.99] transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "جاري التوليد..." : "توليد الأسئلة الذكية"}
            </button>
            {!canGenerate && (
              <p className="text-xs text-gray-500 mt-2">أضف محتوى أطول قليلاً لتفعيل التوليد</p>
            )}
          </div>
        ) : open && (
          <div className="mt-4">
            <div className="grid gap-3 sm:gap-4">
              {questions.map((q) => (
                <div
                  key={q?.question || String(q)}
                  className="group rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/70 backdrop-blur transition-colors"
                >
                  <button
                    onClick={() => ask(q?.question || String(q))}
                    className="w-full text-right px-4 sm:px-5 py-3 sm:py-4 font-medium text-gray-800 dark:text-gray-100 hover:text-purple-700 dark:hover:text-purple-300 flex items-center justify-between gap-3"
                  >
                    <span className="leading-relaxed">
                      {q?.icon ? <span className="ml-1">{q.icon}</span> : null}
                      {q?.question || String(q)}
                    </span>
                    <span className="text-xs text-gray-400">{q?.type === 'poll' ? 'صوّت وشاهد النتائج' : 'اضغط لعرض الإجابة'}</span>
                  </button>

                  {/* الإجابة */}
                  {answers[q?.question || String(q)] && (
                    <div className="px-4 sm:px-5 pb-4">
                      <div className="rounded-lg border border-purple-200/60 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-900/10 p-3 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                        {answers[q?.question || String(q)]}
                      </div>
                      <div className="mt-2 flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyAnswer(q?.question || String(q))}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          {copiedFor === (q?.question || String(q)) ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-600" />
                              <span>تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Clipboard className="w-3.5 h-3.5" />
                              <span>نسخ الإجابة</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {answerLoading === (q?.question || String(q)) && (
                    <div className="px-4 sm:px-5 pb-4 -mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري توليد الإجابة...
                      </div>
                    </div>
                  )}

                  {/* استطلاع رأي */}
                  {q?.type === 'poll' && Array.isArray(q?.options) && (
                    <div className="px-4 sm:px-5 pb-4 -mt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => vote(q, idx)}
                            disabled={pollSubmitting === (q?.question || String(q))}
                            className="w-full text-right px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      {pollResults[q?.question || String(q)] && (
                        <div className="mt-3 text-xs text-gray-600 dark:text-gray-300">
                          <div className="flex flex-col gap-1">
                            {q.options.map((opt: string, idx: number) => {
                              const res = pollResults[q?.question || String(q)];
                              const count = res.counts[idx] || 0;
                              const total = res.total || 0;
                              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                              return (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className="w-24 truncate">{opt}</span>
                                  <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                    <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="w-10 text-left">{pct}%</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AIQuestions;



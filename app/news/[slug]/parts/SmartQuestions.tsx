"use client";

import React, { useMemo, useState } from "react";
import { Check, Clipboard, Loader2, MessageCircleQuestion, RefreshCw, ChevronDown } from "lucide-react";

interface Props {
  articleId: string;
  articleTitle: string;
  content?: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
}

const SmartQuestions: React.FC<Props> = ({ articleId, articleTitle, content = "", author }) => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answerLoading, setAnswerLoading] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [copiedFor, setCopiedFor] = useState<string | null>(null);
  const [pollSubmitting, setPollSubmitting] = useState<string | null>(null);
  const [pollResults, setPollResults] = useState<Record<string, { counts: number[]; total: number }>>({});
  const [open, setOpen] = useState(false);

  const canGenerate = useMemo(() => content.length > 30 || articleTitle.length > 10, [content, articleTitle]);

  const generate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, title: articleTitle, content })
      });
      if (!res.ok) throw new Error('فشل في توليد الأسئلة');
      const data = await res.json();
      const list = Array.isArray(data?.questions) ? data.questions : [];
      setQuestions(list);
      if (list.length === 0) {
        // بديل محلي بسيط يعتمد على العنوان لتقليل التكرار
        const base = (articleTitle || '').split(' ').slice(0, 6).join(' ');
        setQuestions([
          { question: `ما الخلفية والسياق المرتبط بـ: ${base}?`, type: 'context', icon: '🧩' },
          { question: `لماذا يعد هذا الخبر مهمًا الآن؟`, type: 'why', icon: '🧭' },
          { question: `ما التأثير المحتمل على القرّاء أو السوق؟`, type: 'impact', icon: '📈' },
          { question: `ما السيناريوهات التالية المتوقعة؟`, type: 'what_next', icon: '➡️' },
          { question: `ما الأسئلة المفتوحة التي ما زالت بلا إجابة؟`, type: 'analysis', icon: '❓' }
        ]);
      }
    } catch (e) {
      // فشل كامل: بديل محلي
      const base = (articleTitle || '').split(' ').slice(0, 6).join(' ');
      setQuestions([
        { question: `ما الخلفية والسياق المرتبط بـ: ${base}?`, type: 'context', icon: '🧩' },
        { question: `لماذا يعد هذا الخبر مهمًا الآن؟`, type: 'why', icon: '🧭' },
        { question: `ما التأثير المحتمل على القرّاء أو السوق؟`, type: 'impact', icon: '📈' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const ask = async (qObj: any) => {
    const q = qObj?.question || String(qObj);
    const qType = qObj?.type;
    if (!q) return;
    setAnswerLoading(q);
    try {
      // محاكاة إنشاء إجابة - يمكن استبدالها بـ API حقيقي لاحقاً
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAnswers: Record<string, string> = {
        "ما هي النقاط الرئيسية في هذا الخبر؟": "يتناول هذا الخبر عدة نقاط مهمة تشمل التطورات الأخيرة في الموضوع، والتأثيرات المحتملة على المجتمع، بالإضافة إلى آراء الخبراء والمختصين في هذا المجال.",
        "من هم الأطراف المعنية بهذا الخبر؟": "الأطراف المعنية تشمل الجهات الحكومية المسؤولة، والمواطنين المتأثرين بشكل مباشر، بالإضافة إلى المؤسسات والشركات ذات العلاقة بالموضوع.",
        "ما هي التوقعات المستقبلية لهذا الموضوع؟": "بناءً على التحليلات والمعطيات الحالية، من المتوقع أن نشهد تطورات إيجابية في المستقبل القريب، مع احتمالية حدوث تغييرات تدريجية في السياسات والإجراءات المتعلقة."
      };
      
      setAnswers((prev) => ({ ...prev, [q]: mockAnswers[q] || "جاري العمل على إجابة مفصلة لهذا السؤال..." }));
    } finally {
      setAnswerLoading(null);
    }
  };

  const vote = async (qObj: any, optionIndex: number) => {
    const qText = qObj?.question || String(qObj);
    if (!qText || !Array.isArray(qObj?.options)) return;
    setPollSubmitting(qText);
    try {
      // محاكاة التصويت
      await new Promise(resolve => setTimeout(resolve, 500));
      setPollResults((prev) => ({ 
        ...prev, 
        [qText]: { 
          counts: [35, 15, 40, 10], // نتائج تجريبية
          total: 100 
        } 
      }));
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
    <section className="relative mt-8 overflow-hidden rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60">
      {/* زخرفة خلفية ناعمة */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-purple-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="relative p-4 sm:p-6">
        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white flex items-center justify-center shadow-sm">
            <MessageCircleQuestion className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
              أسئلة ذكية حول الخبر
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
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
              className="inline-flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors"
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
              <p className="text-xs text-neutral-500 mt-2">أضف محتوى أطول قليلاً لتفعيل التوليد</p>
            )}
            {/* رسالة ملاحظات عند الفشل لاحقًا */}
            {!loading && canGenerate && (
              <p className="text-[11px] text-neutral-500 mt-1">في حال تعذّر التوليد عبر الذكاء، سيتم عرض أسئلة بديلة تلقائيًا.</p>
            )}
          </div>
        ) : open && (
          <div className="mt-4">
            <div className="grid gap-2 sm:gap-3">
              {questions.map((q) => (
                <div
                  key={q?.question || String(q)}
                  className="group rounded-lg border border-neutral-200/60 dark:border-neutral-700/50"
                >
                  <button
                    onClick={() => ask(q)}
                    className="w-full text-right px-3 sm:px-4 py-2.5 sm:py-3 text-[13px] sm:text-sm font-medium text-neutral-800 dark:text-neutral-100 hover:text-blue-700 dark:hover:text-blue-300 flex items-center justify-between gap-2"
                  >
                    <span className="leading-relaxed">
                      {q?.icon ? <span className="ml-1">{q.icon}</span> : null}
                      {q?.question || String(q)}
                    </span>
                    <span className="text-[10px] sm:text-xs text-neutral-400">{q?.type === 'poll' ? 'صوّت وشاهد النتائج' : 'عرض الإجابة'}</span>
                  </button>

                  {/* الإجابة */}
                  {answers[q?.question || String(q)] && (
                    <div className="px-3 sm:px-4 pb-3">
                      <div className="rounded-md border border-neutral-200/60 dark:border-neutral-700/60 bg-neutral-50/60 dark:bg-neutral-900/60 p-2.5 text-[13px] leading-relaxed text-neutral-800 dark:text-neutral-200">
                        {answers[q?.question || String(q)]}
                      </div>
                      <div className="mt-1.5 flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyAnswer(q?.question || String(q))}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700"
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
                    <div className="px-3 sm:px-4 pb-3 -mt-1">
                      <div className="flex items-center gap-2 text-[12px] text-neutral-500 dark:text-neutral-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        جاري توليد الإجابة...
                      </div>
                    </div>
                  )}

                  {/* استطلاع رأي */}
                  {q?.type === 'poll' && Array.isArray(q?.options) && (
                    <div className="px-3 sm:px-4 pb-3 -mt-1">
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => vote(q, idx)}
                            disabled={pollSubmitting === (q?.question || String(q))}
                            className="w-full text-right px-3 py-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-[12px]"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      {pollResults[q?.question || String(q)] && (
                        <div className="mt-2 text-[11px] text-neutral-600 dark:text-neutral-300">
                          <div className="flex flex-col gap-1">
                            {q.options.map((opt: string, idx: number) => {
                              const res = pollResults[q?.question || String(q)];
                              const count = res.counts[idx] || 0;
                              const total = res.total || 0;
                              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                              return (
                                <div key={idx} className="flex items-center gap-2">
                                  <span className="w-24 truncate">{opt}</span>
                                  <div className="flex-1 h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
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

export default SmartQuestions;
"use client";

import React, { useMemo, useState } from "react";
import { Loader2, MessageCircleQuestion, RefreshCw } from "lucide-react";

interface Props {
  content: string;
}

const AIQuestions: React.FC<Props> = ({ content }) => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answerLoading, setAnswerLoading] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

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

  return (
    <section className="mt-10 border rounded-xl p-5 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <MessageCircleQuestion className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">اسأل الذكاء الاصطناعي عن هذا الخبر</h2>
          <p className="text-sm text-gray-500">أسئلة ذكية وإجابات مبنية على محتوى الخبر</p>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="mt-4">
          <button
            onClick={generate}
            disabled={!canGenerate || loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "جاري التوليد..." : "توليد الأسئلة الذكية"}
          </button>
          {!canGenerate && (
            <p className="text-xs text-gray-500 mt-2">أضف محتوى أطول قليلاً لتفعيل التوليد</p>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">الأسئلة المولدة</h3>
            <button
              onClick={generate}
              className="inline-flex items-center gap-1 text-purple-700"
            >
              <RefreshCw className="w-4 h-4" /> إعادة التوليد
            </button>
          </div>
          <div className="space-y-2">
            {questions.map((q) => (
              <div key={q} className="border rounded-lg p-3">
                <button
                  onClick={() => ask(q)}
                  className="text-right w-full font-medium text-gray-800 hover:text-purple-700"
                >
                  {q}
                </button>
                {answers[q] && (
                  <div className="text-sm text-gray-700 mt-2 leading-relaxed">
                    {answers[q]}
                  </div>
                )}
                {answerLoading === q && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري توليد الإجابة...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default AIQuestions;



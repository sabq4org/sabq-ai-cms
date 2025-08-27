"use client";
import { useState } from "react";
import { MessageCircle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface SmartQuestionsProps {
  articleId: string;
  articleTitle: string;
}

export default function SmartQuestions({ articleId, articleTitle }: SmartQuestionsProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  // أسئلة تجريبية - يمكن استبدالها بـ API لتوليد أسئلة ذكية
  const questions = [
    {
      id: 1,
      question: "ما هي النقاط الرئيسية في هذا الخبر؟",
      answer: "يتناول هذا الخبر عدة نقاط مهمة تشمل التطورات الأخيرة في الموضوع، والتأثيرات المحتملة على المجتمع، بالإضافة إلى آراء الخبراء والمختصين في هذا المجال."
    },
    {
      id: 2,
      question: "من هم الأطراف المعنية بهذا الخبر؟",
      answer: "الأطراف المعنية تشمل الجهات الحكومية المسؤولة، والمواطنين المتأثرين بشكل مباشر، بالإضافة إلى المؤسسات والشركات ذات العلاقة بالموضوع."
    },
    {
      id: 3,
      question: "ما هي التوقعات المستقبلية لهذا الموضوع؟",
      answer: "بناءً على التحليلات والمعطيات الحالية، من المتوقع أن نشهد تطورات إيجابية في المستقبل القريب، مع احتمالية حدوث تغييرات تدريجية في السياسات والإجراءات المتعلقة."
    },
    {
      id: 4,
      question: "كيف يمكن أن يؤثر هذا على الحياة اليومية؟",
      answer: "التأثير على الحياة اليومية قد يكون ملحوظاً في عدة جوانب، خاصة فيما يتعلق بالخدمات والتسهيلات المقدمة، مما قد يحسن من جودة الحياة بشكل عام."
    }
  ];

  return (
    <div className="mt-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-bold">أسئلة ذكية حول الخبر</h3>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
        >
          {expanded ? (
            <>
              <span>إخفاء</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>عرض الأسئلة</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="space-y-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedQuestion(selectedQuestion === q.id ? null : q.id)}
            >
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-neutral-500 dark:text-neutral-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    {q.question}
                  </p>
                  {selectedQuestion === q.id && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed animate-in slide-in-from-top duration-200">
                      {q.answer}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  {selectedQuestion === q.id ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!expanded && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          اضغط لعرض {questions.length} أسئلة شائعة حول هذا الخبر
        </p>
      )}
    </div>
  );
}

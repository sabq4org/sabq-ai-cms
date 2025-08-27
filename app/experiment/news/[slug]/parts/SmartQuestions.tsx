"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, ChevronDown, ChevronUp, Sparkles, Send, Mic, MicOff } from "lucide-react";

interface SmartQuestionsProps {
  articleId: string;
  articleTitle: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
}

export default function SmartQuestions({ articleId, articleTitle, author }: SmartQuestionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [questionSent, setQuestionSent] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // تحديث ارتفاع textarea تلقائياً
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [question]);

  // إرسال السؤال
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    // محاكاة إرسال السؤال
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setQuestionSent(true);
    setQuestion('');
    setIsSubmitting(false);
    
    // إخفاء رسالة النجاح بعد 3 ثواني
    setTimeout(() => {
      setQuestionSent(false);
    }, 3000);
  };

  // بدء/إيقاف التسجيل الصوتي
  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // محاكاة التسجيل
      setTimeout(() => {
        setIsRecording(false);
        setQuestion(prev => prev + (prev ? ' ' : '') + '[تم إدراج تسجيل صوتي]');
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  // اقتراحات الأسئلة السريعة
  const quickQuestions = [
    'ما رأيك في التطورات الحديثة؟',
    'كيف تحلل الوضع الحالي؟',
    'ما توقعاتك للمستقبل؟',
    'ما نصيحتك للقراء؟'
  ];

  // أسئلة شائعة سابقة
  const popularQuestions = [
    {
      id: 1,
      text: "هل هناك تفاصيل إضافية حول هذا الموضوع؟",
      author_name: "أحمد محمد",
      created_at: "منذ 3 ساعات",
      likes: 24,
      answer: "نعم، هناك تفاصيل إضافية مهمة تتعلق بالجوانب الفنية والتقنية للموضوع، وسيتم نشر تقرير مفصل قريباً."
    },
    {
      id: 2,
      text: "ما هي المصادر التي اعتمدت عليها في هذا الخبر؟",
      author_name: "فاطمة الزهراء",
      created_at: "منذ 5 ساعات",
      likes: 18,
      answer: "اعتمدت على مصادر رسمية متعددة تشمل البيانات الحكومية والتقارير الدولية المتخصصة."
    },
    {
      id: 3,
      text: "هل يمكن توضيح الأثر المتوقع على المواطنين؟",
      author_name: "خالد العمري",
      created_at: "منذ 8 ساعات",
      likes: 31,
      answer: "التأثير المباشر سيكون إيجابياً على المدى الطويل، خاصة فيما يتعلق بتحسين الخدمات وتسهيل الإجراءات."
    }
  ];

  return (
    <div className="mt-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
      {/* الهيدر */}
      <div
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">اسأل الكاتب</h3>
              {author && (
                <p className="text-blue-100 text-sm">
                  {author.name} • {author.role || "مراسل صحفي"}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 animate-pulse" />
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* المحتوى القابل للطي */}
      {isExpanded && (
        <div className="p-4 space-y-4 bg-neutral-50 dark:bg-neutral-900/50">
          {/* رسالة النجاح */}
          {questionSent && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 text-green-700 dark:text-green-300 text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              تم إرسال سؤالك بنجاح! سيتم الرد عليك قريباً.
            </div>
          )}

          {/* نموذج السؤال */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="اكتب سؤالك هنا..."
                className="w-full px-4 py-3 pr-12 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none
                         text-neutral-900 dark:text-neutral-100 placeholder-neutral-500"
                rows={1}
                disabled={isSubmitting}
              />
              
              {/* زر التسجيل الصوتي */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`absolute left-3 top-3 p-2 rounded-lg transition-colors ${
                  isRecording 
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 animate-pulse' 
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* اقتراحات الأسئلة السريعة */}
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setQuestion(q)}
                  className="px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 
                           rounded-full text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors
                           text-neutral-700 dark:text-neutral-300"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* زر الإرسال */}
            <button
              type="submit"
              disabled={!question.trim() || isSubmitting}
              className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                question.trim() && !isSubmitting
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-[1.02]'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  إرسال السؤال
                </>
              )}
            </button>
          </form>

          {/* عرض/إخفاء الأسئلة الشائعة */}
          <button
            onClick={() => setShowQuestions(!showQuestions)}
            className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center gap-1"
          >
            {showQuestions ? 'إخفاء' : 'عرض'} الأسئلة الشائعة ({popularQuestions.length})
            {showQuestions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* الأسئلة الشائعة */}
          {showQuestions && (
            <div className="space-y-3">
              {popularQuestions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                        {q.text}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span>{q.author_name}</span>
                        <span>•</span>
                        <span>{q.created_at}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          ❤️ {q.likes}
                        </span>
                      </div>
                      {q.answer && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-900 dark:text-blue-100">
                            <strong>الرد:</strong> {q.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
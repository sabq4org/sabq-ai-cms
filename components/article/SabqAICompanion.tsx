"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  MessageSquare, 
  VolumeX, 
  Volume2, 
  Link as LinkIcon, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Send,
  Loader,
  Maximize2,
  Minimize2,
  Share2,
  BookmarkPlus,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check
} from "lucide-react";
import Link from "next/link";

interface SabqAICompanionProps {
  articleId: string;
  articleTitle: string;
  articleContent: string;
  articleCategory: string;
  articleTags?: string[];
  articleAuthor?: string;
  articlePublishedAt?: Date;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function SabqAICompanion({
  articleId,
  articleTitle,
  articleContent,
  articleCategory,
  articleTags = [],
  articleAuthor,
  articlePublishedAt
}: SabqAICompanionProps) {
  // حالة المساعد
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "links" | "audio" | "chat">("summary");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [smartLinks, setSmartLinks] = useState<{ title: string; url: string; relevance: number }[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // محاكاة تحميل البيانات
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // محاكاة API call للملخص
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // ملخص ذكي للمقال
      setSummary(
        `يتناول المقال ${articleTitle} أهم التطورات في ${articleCategory} مع التركيز على التأثيرات المستقبلية. يشير الكاتب إلى ثلاث نقاط رئيسية: أولاً، التحولات الجذرية في المجال خلال السنوات الأخيرة. ثانياً، التحديات التي تواجه القطاع في ظل المتغيرات العالمية. ثالثاً، الفرص المتاحة للمملكة للريادة في هذا المجال ضمن رؤية 2030.`
      );
      
      // روابط ذكية متعلقة بالمقال
      setSmartLinks([
        {
          title: "تقرير شامل: مستقبل " + articleCategory + " في المملكة",
          url: "/analysis/future-of-" + articleCategory.toLowerCase(),
          relevance: 0.95
        },
        {
          title: "رؤية 2030 و" + articleCategory,
          url: "/vision-2030/" + articleCategory.toLowerCase(),
          relevance: 0.87
        },
        {
          title: "آخر تطورات " + articleCategory + " عالمياً",
          url: "/news/global-" + articleCategory.toLowerCase(),
          relevance: 0.82
        },
        {
          title: "مقابلة حصرية مع خبير في " + articleCategory,
          url: "/interviews/expert-" + articleCategory.toLowerCase(),
          relevance: 0.78
        }
      ]);
      
      // رسالة ترحيبية من المساعد
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `مرحباً! أنا مساعد سبق الذكي. يمكنني مساعدتك في فهم هذا المقال عن ${articleCategory} أو الإجابة على أسئلتك المتعلقة به. كيف يمكنني مساعدتك اليوم؟`,
          timestamp: new Date()
        }
      ]);
      
      setIsLoading(false);
    };
    
    loadData();
  }, [articleTitle, articleCategory]);

  // تمرير الدردشة إلى الأسفل عند إضافة رسائل جديدة
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // إرسال رسالة جديدة
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    // إضافة رسالة المستخدم
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);
    
    // محاكاة استجابة المساعد
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // إنشاء رد مخصص بناءً على سؤال المستخدم
    let response = "";
    const lowerCaseInput = userInput.toLowerCase();
    
    if (lowerCaseInput.includes("ملخص") || lowerCaseInput.includes("لخص")) {
      response = `هذا المقال يتناول ${articleTitle} ويركز على ${articleCategory}. النقاط الرئيسية هي: 1) ${articleTags[0] || "التطورات الحديثة"} 2) التحديات والفرص 3) الرؤية المستقبلية.`;
    } else if (lowerCaseInput.includes("من هو") || lowerCaseInput.includes("الكاتب") || lowerCaseInput.includes("المؤلف")) {
      response = `كتب هذا المقال ${articleAuthor || "أحد محرري سبق المتخصصين"} وهو من الكتاب المتخصصين في مجال ${articleCategory}.`;
    } else if (lowerCaseInput.includes("متى") || lowerCaseInput.includes("تاريخ") || lowerCaseInput.includes("نشر")) {
      const publishDate = articlePublishedAt ? new Date(articlePublishedAt).toLocaleDateString('ar-SA') : "مؤخراً";
      response = `تم نشر هذا المقال بتاريخ ${publishDate}.`;
    } else if (lowerCaseInput.includes("مقالات") || lowerCaseInput.includes("مشابهة") || lowerCaseInput.includes("ذات صلة")) {
      response = `يمكنك الاطلاع على مقالات ذات صلة في قسم الروابط الذكية. أنصحك بقراءة "تقرير شامل: مستقبل ${articleCategory} في المملكة" فهو يقدم نظرة متعمقة حول الموضوع.`;
    } else {
      response = `شكراً على سؤالك حول ${userInput}. بناءً على المقال، يمكنني القول أن ${articleCategory} يشهد تطورات مهمة في هذا المجال. هل ترغب في معرفة المزيد عن جانب معين من الموضوع؟`;
    }
    
    // إضافة رد المساعد
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: response,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  // نسخ الملخص
  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // تشغيل/إيقاف الصوت
  const toggleAudio = () => {
    if (!audioRef.current) {
      // إنشاء عنصر الصوت إذا لم يكن موجوداً
      audioRef.current = new Audio();
      audioRef.current.src = `/api/text-to-speech?text=${encodeURIComponent(articleTitle + ". " + articleContent.substring(0, 500))}&lang=ar`;
      audioRef.current.onended = () => setIsPlaying(false);
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      {/* زر فتح المساعد */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsOpen(true)}
          className="fixed left-6 bottom-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center z-50"
          aria-label="فتح مساعد سبق الذكي"
        >
          <Sparkles className="h-6 w-6" />
        </motion.button>
      )}

      {/* المساعد الذكي */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed ${
              isExpanded ? "inset-4 md:inset-10" : "left-4 bottom-4 w-80 md:w-96"
            } bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col transition-all duration-300`}
            style={{ maxHeight: isExpanded ? "calc(100vh - 80px)" : "500px" }}
          >
            {/* رأس المساعد */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  مساعد سبق الذكي
                </h3>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                  aria-label={isExpanded ? "تصغير" : "تكبير"}
                >
                  {isExpanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                  aria-label="إغلاق"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* التبويبات */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("summary")}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === "summary"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                } transition-colors duration-200`}
              >
                الملخص الذكي
              </button>
              <button
                onClick={() => setActiveTab("links")}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === "links"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                } transition-colors duration-200`}
              >
                روابط ذكية
              </button>
              <button
                onClick={() => setActiveTab("audio")}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === "audio"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                } transition-colors duration-200`}
              >
                استمع للمقال
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === "chat"
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                } transition-colors duration-200`}
              >
                اسأل المساعد
              </button>
            </div>

            {/* محتوى التبويبات */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    جاري تحليل المقال...
                  </p>
                </div>
              ) : (
                <>
                  {/* الملخص الذكي */}
                  {activeTab === "summary" && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                          {summary}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <button
                            onClick={handleCopySummary}
                            className="flex items-center space-x-1 rtl:space-x-reverse text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                          >
                            {isCopied ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            <span>{isCopied ? "تم النسخ" : "نسخ الملخص"}</span>
                          </button>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <button
                            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                            aria-label="أعجبني"
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                            aria-label="لم يعجبني"
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* الروابط الذكية */}
                  {activeTab === "links" && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        محتوى ذو صلة بالمقال:
                      </p>
                      <ul className="space-y-3">
                        {smartLinks.map((link, index) => (
                          <li key={index}>
                            <Link
                              href={link.url}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            >
                              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                    <LinkIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {link.title}
                                  </h4>
                                  <div className="mt-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                    <div
                                      className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full"
                                      style={{ width: `${link.relevance * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* استمع للمقال */}
                  {activeTab === "audio" && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                          استمع إلى المقال بصوت واضح وطبيعي. يمكنك الاستماع أثناء القيام بمهام أخرى.
                        </p>
                        <div className="flex items-center justify-center">
                          <button
                            onClick={toggleAudio}
                            className={`w-16 h-16 rounded-full flex items-center justify-center ${
                              isPlaying
                                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            } transition-colors duration-200`}
                            aria-label={isPlaying ? "إيقاف" : "تشغيل"}
                          >
                            {isPlaying ? (
                              <VolumeX className="h-8 w-8" />
                            ) : (
                              <Volume2 className="h-8 w-8" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          خيارات إضافية:
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="space-x-2 rtl:space-x-reverse">
                            <select
                              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              disabled={isPlaying}
                            >
                              <option value="male">صوت ذكوري</option>
                              <option value="female">صوت أنثوي</option>
                            </select>
                            <select
                              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              disabled={isPlaying}
                            >
                              <option value="1">سرعة عادية</option>
                              <option value="0.8">بطيء</option>
                              <option value="1.2">سريع</option>
                            </select>
                          </div>
                          <button
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 flex items-center space-x-1 rtl:space-x-reverse"
                            disabled={isPlaying}
                          >
                            <BookmarkPlus className="h-4 w-4" />
                            <span>حفظ كملف صوتي</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* اسأل المساعد */}
                  {activeTab === "chat" && (
                    <div className="flex flex-col h-full">
                      <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto space-y-4 mb-4"
                      >
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.role === "user" ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.role === "user"
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div
                                className={`text-xs mt-1 ${
                                  message.role === "user"
                                    ? "text-blue-200"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {message.timestamp.toLocaleTimeString("ar-SA", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-[80%]">
                              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <div className="flex space-x-1 rtl:space-x-reverse">
                                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  جاري الكتابة...
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-auto">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage();
                          }}
                          className="flex items-center space-x-2 rtl:space-x-reverse"
                        >
                          <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="اسأل عن المقال..."
                            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            disabled={isLoading}
                          />
                          <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            disabled={!userInput.trim() || isLoading}
                          >
                            <Send className="h-5 w-5" />
                          </button>
                        </form>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          المساعد مدعوم بالذكاء الاصطناعي وقد يحتوي على أخطاء. يرجى التحقق من المعلومات المهمة.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* شريط الإجراءات السفلي */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                  aria-label="مشاركة"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
                  aria-label="حفظ"
                >
                  <BookmarkPlus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                مدعوم بتقنية سبق الذكية
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

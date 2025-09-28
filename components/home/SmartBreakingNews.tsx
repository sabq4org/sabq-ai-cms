"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, Sparkles, Clock } from "lucide-react";
import Link from "next/link";

interface BreakingNewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  timestamp: Date;
  category: string;
  isPersonalized: boolean;
  urgencyLevel: "high" | "medium" | "low";
}

interface SmartBreakingNewsProps {
  user?: {
    interests?: string[];
    location?: string;
  } | null;
}

export default function SmartBreakingNews({ user }: SmartBreakingNewsProps) {
  const [breakingNews, setBreakingNews] = useState<BreakingNewsItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // محاكاة جلب الأخبار العاجلة المخصصة
  useEffect(() => {
    const fetchBreakingNews = async () => {
      setIsLoading(true);
      
      // محاكاة API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockNews: BreakingNewsItem[] = [
        {
          id: "1",
          title: "إطلاق مشروع نيوم الجديد للذكاء الاصطناعي",
          summary: "المملكة تعلن عن استثمار 50 مليار ريال في تقنيات الذكاء الاصطناعي",
          url: "/news/neom-ai-project",
          timestamp: new Date(),
          category: "تقنية",
          isPersonalized: user?.interests?.includes("تقنية") || false,
          urgencyLevel: "high"
        },
        {
          id: "2", 
          title: "ارتفاع أسعار النفط إلى مستويات قياسية",
          summary: "برميل النفط يتجاوز 95 دولار للمرة الأولى هذا العام",
          url: "/news/oil-prices-rise",
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          category: "اقتصاد",
          isPersonalized: user?.interests?.includes("اقتصاد") || false,
          urgencyLevel: "medium"
        },
        {
          id: "3",
          title: "فوز المنتخب السعودي في كأس آسيا",
          summary: "الأخضر يحقق انتصاراً تاريخياً ويتأهل للنهائي",
          url: "/news/saudi-team-victory",
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          category: "رياضة",
          isPersonalized: user?.interests?.includes("رياضة") || false,
          urgencyLevel: "medium"
        }
      ];

      // فلترة الأخبار بناءً على اهتمامات المستخدم
      const filteredNews = user?.interests?.length 
        ? mockNews.filter(news => news.isPersonalized)
        : mockNews;

      setBreakingNews(filteredNews.length > 0 ? filteredNews : mockNews.slice(0, 2));
      setIsLoading(false);
    };

    fetchBreakingNews();
  }, [user]);

  // تدوير الأخبار تلقائياً
  useEffect(() => {
    if (breakingNews.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % breakingNews.length);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [breakingNews.length]);

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-orange-500";
      default:
        return "bg-blue-500";
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "الآن";
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    return "أمس";
  };

  if (!isVisible || isLoading || breakingNews.length === 0) {
    return null;
  }

  const currentNews = breakingNews[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-l-4 border-red-500"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-4 rtl:space-x-reverse flex-1">
            {/* مؤشر العاجل */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className={`w-2 h-2 rounded-full ${getUrgencyColor(currentNews.urgencyLevel)} animate-pulse`}></div>
              <span className="text-red-600 dark:text-red-400 font-bold text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                عاجل
              </span>
            </div>

            {/* محتوى الخبر */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentNews.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center space-x-4 rtl:space-x-reverse"
                >
                  <Link 
                    href={currentNews.url}
                    className="flex-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {currentNews.title}
                      </h3>
                      
                      {/* مؤشر التخصيص */}
                      {currentNews.isPersonalized && (
                        <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                          <Sparkles className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">مخصص لك</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
                      {currentNews.summary}
                    </p>
                  </Link>

                  {/* معلومات إضافية */}
                  <div className="flex items-center space-x-3 rtl:space-x-reverse text-xs text-gray-500 dark:text-gray-400">
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {currentNews.category}
                    </span>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeAgo(currentNews.timestamp)}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* مؤشرات التنقل وإغلاق */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* مؤشرات النقاط */}
            {breakingNews.length > 1 && (
              <div className="flex space-x-1 rtl:space-x-reverse">
                {breakingNews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      index === currentIndex 
                        ? "bg-red-500" 
                        : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                    }`}
                    aria-label={`الخبر ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* زر الإغلاق */}
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              aria-label="إغلاق"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

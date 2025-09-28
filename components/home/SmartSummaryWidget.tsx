"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Clock, TrendingUp, Eye, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";

interface SummaryItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  readTime: number;
  views: number;
  trending: boolean;
  url: string;
  timestamp: Date;
}

interface SmartSummaryWidgetProps {
  user?: {
    interests?: string[];
    readingHistory?: string[];
  } | null;
}

export default function SmartSummaryWidget({ user }: SmartSummaryWidgetProps) {
  const [summaryItems, setSummaryItems] = useState<SummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // جلب الملخص الذكي
  useEffect(() => {
    const fetchSmartSummary = async () => {
      setIsLoading(true);
      
      // محاكاة API call للملخص الذكي
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockSummary: SummaryItem[] = [
        {
          id: "1",
          title: "تطورات الذكاء الاصطناعي في المملكة",
          summary: "إطلاق مبادرات جديدة لتطوير تقنيات الذكاء الاصطناعي ضمن رؤية 2030، مع استثمارات تتجاوز 20 مليار ريال في القطاع التقني.",
          category: "تقنية",
          readTime: 3,
          views: 15420,
          trending: true,
          url: "/news/ai-developments-saudi",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: "2",
          title: "نمو الاقتصاد السعودي يتجاوز التوقعات",
          summary: "تحقيق نمو اقتصادي بنسبة 8.7% في الربع الثالث، مدفوعاً بقطاعات التقنية والسياحة والطاقة المتجددة.",
          category: "اقتصاد",
          readTime: 4,
          views: 12350,
          trending: true,
          url: "/news/economic-growth-saudi",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
        },
        {
          id: "3",
          title: "مشاريع نيوم الجديدة تجذب استثمارات عالمية",
          summary: "إعلان عن مشاريع جديدة في نيوم بقيمة 100 مليار دولار، تشمل مدن ذكية ومراكز للابتكار التقني.",
          category: "استثمار",
          readTime: 5,
          views: 18900,
          trending: false,
          url: "/news/neom-new-projects",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000)
        },
        {
          id: "4",
          title: "إنجازات المنتخب السعودي في كأس آسيا",
          summary: "تأهل الأخضر لنصف النهائي بعد فوز مثير على اليابان، ويستعد لمواجهة كوريا الجنوبية.",
          category: "رياضة",
          readTime: 2,
          views: 25600,
          trending: true,
          url: "/news/saudi-team-asia-cup",
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
        },
        {
          id: "5",
          title: "مبادرات الطاقة المتجددة في المملكة",
          summary: "تدشين أكبر محطة للطاقة الشمسية في الشرق الأوسط، ضمن خطة لتوليد 50% من الطاقة من مصادر متجددة بحلول 2030.",
          category: "بيئة",
          readTime: 4,
          views: 9800,
          trending: false,
          url: "/news/renewable-energy-saudi",
          timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000)
        }
      ];

      // ترتيب الأخبار بناءً على اهتمامات المستخدم
      const sortedSummary = user?.interests?.length 
        ? mockSummary.sort((a, b) => {
            const aRelevant = user.interests!.some(interest => 
              a.category.includes(interest) || a.title.includes(interest)
            );
            const bRelevant = user.interests!.some(interest => 
              b.category.includes(interest) || b.title.includes(interest)
            );
            
            if (aRelevant && !bRelevant) return -1;
            if (!aRelevant && bRelevant) return 1;
            return b.views - a.views; // ترتيب بالمشاهدات كمعيار ثانوي
          })
        : mockSummary.sort((a, b) => b.views - a.views);

      setSummaryItems(sortedSummary.slice(0, 5));
      setLastUpdated(new Date());
      setIsLoading(false);
    };

    fetchSmartSummary();
  }, [user]);

  const refreshSummary = () => {
    setIsLoading(true);
    // إعادة جلب البيانات
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1000);
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}م`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}ك`;
    }
    return views.toString();
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "منذ دقائق";
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `منذ ${diffInDays} يوم`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* رأس الويدجت */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                موجز سبق الذكي
              </h2>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
              آخر تحديث: {lastUpdated.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <button
            onClick={refreshSummary}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 disabled:opacity-50"
            aria-label="تحديث الموجز"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* محتوى الموجز */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {summaryItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link href={item.url} className="block">
                  <div className="flex items-start space-x-4 rtl:space-x-reverse p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                    {/* رقم الترتيب */}
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>

                    {/* المحتوى */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                          {item.title}
                        </h3>
                        {item.trending && (
                          <TrendingUp className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {item.summary}
                      </p>
                      
                      {/* معلومات إضافية */}
                      <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs text-gray-500 dark:text-gray-400">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {item.category}
                        </span>
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <Clock className="h-3 w-3" />
                          <span>{item.readTime} دقائق</span>
                        </div>
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <Eye className="h-3 w-3" />
                          <span>{formatViews(item.views)}</span>
                        </div>
                        <span>{formatTimeAgo(item.timestamp)}</span>
                      </div>
                    </div>

                    {/* سهم التنقل */}
                    <div className="flex-shrink-0">
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* رابط عرض المزيد */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/smart-summary"
            className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
          >
            <span>عرض الموجز الكامل</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

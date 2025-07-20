'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, ArrowUpRight, Zap, Radio, Dot
} from 'lucide-react';

interface BreakingNews {
  id: string;
  title: string;
  summary?: string;
  created_at: string;
  views?: number;
  category?: {
    name: string;
    color?: string;
  };
}

interface InterestBasedBreakingNewsProps {
  className?: string;
}

export default function InterestBasedBreakingNews({ 
  className = ""
}: InterestBasedBreakingNewsProps) {
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  const [breakingNews, setBreakingNews] = useState<BreakingNews | null>(null);
  const [loading, setLoading] = useState(true);

  // جلب آخر خبر عاجل
  useEffect(() => {
    fetchLatestBreakingNews();
    
    // تحديث دوري كل 30 ثانية
    const interval = setInterval(fetchLatestBreakingNews, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLatestBreakingNews = async () => {
    try {
      // محاكاة بيانات للخبر العاجل
      const mockNews: BreakingNews = {
        id: 'breaking-1',
        title: 'عاجل: تطورات اقتصادية مهمة تؤثر على الأسواق العالمية وتتطلب متابعة فورية',
        summary: 'أحداث عاجلة تتطور بسرعة في الأسواق المالية',
        created_at: new Date(Date.now() - 3 * 60000).toISOString(), // منذ 3 دقائق
        views: 8750,
        category: {
          name: 'اقتصاد',
          color: '#10B981'
        }
      };
      
      setBreakingNews(mockNews);
    } catch (error) {
      console.error('خطأ في جلب الخبر العاجل:', error);
    } finally {
      setLoading(false);
    }
  };

  // دالة تنسيق الوقت
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const newsDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - newsDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `${diffInMinutes} د`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} س`;
    return `${Math.floor(diffInMinutes / 1440)} ي`;
  };

  // إذا لم يوجد خبر عاجل، لا تظهر البلوك
  if (!loading && !breakingNews) {
    return null;
  }

  // حالة التحميل
  if (loading) {
    return (
      <div className={`${className}`}>
        <Card className="bg-red-50 border border-red-100 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-red-200 animate-pulse"></div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-6 bg-red-200 animate-pulse rounded-full"></div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-red-200 animate-pulse rounded"></div>
                    <div className="h-4 bg-red-200 animate-pulse rounded w-4/5"></div>
                    <div className="h-3 bg-red-200 animate-pulse rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <Card 
        className={`
          cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02]
          bg-red-50 border border-red-100 overflow-hidden group
          ${darkMode ? 'dark:bg-red-950/50 dark:border-red-800/50' : ''}
        `}
        onClick={() => router.push(`/news/${breakingNews?.id}`)}
      >
        <CardContent className="p-0">
          {/* شريط علوي متحرك */}
          <div className="relative h-1 bg-red-500 overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-red-300 to-transparent"
              style={{
                animation: 'newsSlide 3s infinite linear'
              }}
            />
          </div>

          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* ليبل "عاجل" على اليمين */}
              <div className="flex-shrink-0 order-2">
                <Badge 
                  className={`
                    bg-red-600 hover:bg-red-700 text-white text-xs font-bold 
                    px-2.5 py-1 rounded-full shadow-sm border-0 
                    flex items-center gap-1 animate-pulse
                  `}
                >
                  <Dot className="w-3 h-3 text-red-200 animate-ping" />
                  عاجل
                </Badge>
              </div>

              {/* محتوى الخبر على اليسار */}
              <div className="flex-1 min-w-0 order-1">
                {/* العنوان */}
                <h3 className={`
                  font-bold text-base leading-snug mb-2
                  ${darkMode ? 'text-red-100' : 'text-red-900'}
                  line-clamp-3
                `}>
                  {breakingNews?.title}
                </h3>

                {/* الملخص */}
                {breakingNews?.summary && (
                  <p className={`
                    text-sm leading-relaxed mb-3
                    ${darkMode ? 'text-red-200/90' : 'text-red-700/90'}
                    line-clamp-2
                  `}>
                    {breakingNews.summary}
                  </p>
                )}

                {/* شريط المعلومات السفلي */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* الوقت مع مؤشر مباشر */}
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <Clock className={`w-3.5 h-3.5 ${
                          darkMode ? 'text-red-300' : 'text-red-600'
                        }`} />
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                      </div>
                      <span className={`text-sm font-semibold ${
                        darkMode ? 'text-red-300' : 'text-red-600'
                      }`}>
                        {formatTimeAgo(breakingNews?.created_at || '')}
                      </span>
                    </div>

                    {/* التصنيف */}
                    {breakingNews?.category && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                          darkMode 
                            ? 'border-red-400/50 text-red-200 bg-red-900/30' 
                            : 'border-red-300 text-red-700 bg-white/70'
                        }`}
                      >
                        {breakingNews.category.name}
                      </Badge>
                    )}

                    {/* مؤشر المباشر */}
                    <div className="flex items-center gap-1">
                      <Radio className={`w-3 h-3 text-red-500 animate-pulse`} />
                      <span className={`text-xs font-bold ${
                        darkMode ? 'text-red-300' : 'text-red-600'
                      }`}>
                        مباشر
                      </span>
                    </div>
                  </div>

                  {/* سهم الانتقال */}
                  <div className="flex items-center gap-1 group-hover:gap-2 transition-all">
                    <span className={`text-xs font-semibold ${
                      darkMode ? 'text-red-300' : 'text-red-600'
                    }`}>
                      التفاصيل
                    </span>
                    <ArrowUpRight className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      darkMode ? 'text-red-300' : 'text-red-600'
                    }`} />
                  </div>
                </div>
              </div>
            </div>

            {/* خط فاصل مع تأثير نابض */}
            <div className="mt-3 pt-3 border-t border-red-200/50 dark:border-red-800/50">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                  <span className={`text-xs font-medium ${
                    darkMode ? 'text-red-400' : 'text-red-600'
                  }`}>
                    يتم التحديث تلقائياً
                  </span>
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSS للرسوم المتحركة */}
      <style jsx>{`
        @keyframes newsSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

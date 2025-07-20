'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, Clock, ChevronRight, TrendingUp, 
  AlertTriangle, Eye, MessageSquare, Radio
} from 'lucide-react';

interface BreakingNews {
  id: string;
  title: string;
  summary?: string;
  created_at: string;
  views?: number;
  urgency?: 'high' | 'medium' | 'low';
  category?: {
    name: string;
    color?: string;
  };
}

interface MobileBreakingNewsBlockProps {
  className?: string;
  maxItems?: number;
  showStats?: boolean;
}

export default function MobileBreakingNewsBlock({ 
  className = "",
  maxItems = 1,
  showStats = false
}: MobileBreakingNewsBlockProps) {
  const router = useRouter();
  const { darkMode } = useDarkModeContext();
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب الأخبار العاجلة
  useEffect(() => {
    fetchBreakingNews();
    
    // تحديث دوري كل 30 ثانية للأخبار العاجلة
    const interval = setInterval(fetchBreakingNews, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchBreakingNews = async () => {
    try {
      if (!loading) setLoading(true);
      
      // محاكاة استدعاء API للحصول على آخر الأخبار العاجلة
      // في التطبيق الحقيقي، سيكون هذا استدعاء فعلي للـ API
      
      // بيانات تجريبية للعرض
      const mockBreakingNews: BreakingNews[] = [
        {
          id: '1',
          title: 'عاجل: أحداث مهمة تتطور في المنطقة وتؤثر على الوضع الاقتصادي العالمي',
          summary: 'تطورات سريعة ومهمة تحدث الآن وتتطلب متابعة عاجلة من الجميع',
          created_at: new Date(Date.now() - 5 * 60000).toISOString(), // منذ 5 دقائق
          views: 15420,
          urgency: 'high',
          category: {
            name: 'اقتصاد',
            color: '#10B981'
          }
        }
      ];
      
      setBreakingNews(mockBreakingNews);
    } catch (error) {
      console.error('خطأ في جلب الأخبار العاجلة:', error);
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
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
  };

  // دالة تنسيق عدد المشاهدات
  const formatViews = (views?: number) => {
    if (!views) return '0';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}م`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}ك`;
    return views.toString();
  };

  // إذا لم توجد أخبار عاجلة، لا تظهر البلوك
  if (!loading && breakingNews.length === 0) {
    return null;
  }

  // حالة التحميل
  if (loading) {
    return (
      <div className={`${className}`}>
        <Card className="bg-red-50 border-red-200 border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-6 bg-red-200 animate-pulse rounded"></div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-red-200 animate-pulse rounded"></div>
                <div className="h-3 bg-red-200 animate-pulse rounded w-3/4"></div>
                <div className="h-3 bg-red-200 animate-pulse rounded w-1/2"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {breakingNews.map((news, index) => (
        <Card 
          key={news.id}
          className={`
            cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1
            bg-gradient-to-r from-red-50 to-red-100 border-red-200 border-l-4 border-l-red-500
            ${darkMode ? 'dark:from-red-950 dark:to-red-900 dark:border-red-800 dark:border-l-red-600' : ''}
            ${index > 0 ? 'mt-3' : ''}
            relative overflow-hidden
          `}
          onClick={() => router.push(`/news/${news.id}`)}
        >
          {/* تأثير الضوء المتحرك */}
          <div 
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500"
            style={{
              background: 'linear-gradient(90deg, #ef4444 0%, #f87171 50%, #ef4444 100%)',
              animation: 'pulse 2s infinite'
            }}
          />
          
          <CardContent className="p-4 pt-5">
            <div className="flex items-start gap-3">
              {/* ليبل "عاجل" مع أيقونة */}
              <div className="flex-shrink-0">
                <Badge 
                  className={`
                    bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full
                    shadow-md border-0 flex items-center gap-1.5 animate-pulse
                  `}
                >
                  <Radio className="w-3 h-3 animate-ping" />
                  عاجل
                </Badge>
              </div>

              {/* محتوى الخبر */}
              <div className="flex-1 min-w-0">
                {/* العنوان */}
                <h3 className={`
                  font-bold text-base leading-tight mb-2 line-clamp-3
                  ${darkMode ? 'text-red-100' : 'text-red-900'}
                `}>
                  {news.title}
                </h3>

                {/* الملخص (إذا وُجد) */}
                {news.summary && (
                  <p className={`
                    text-sm leading-relaxed mb-3 line-clamp-2
                    ${darkMode ? 'text-red-200' : 'text-red-700'}
                  `}>
                    {news.summary}
                  </p>
                )}

                {/* شريط المعلومات */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* الوقت مع أيقونة نبضة */}
                    <div className="flex items-center gap-1.5">
                      <div className="relative">
                        <Clock className={`w-3.5 h-3.5 ${
                          darkMode ? 'text-red-300' : 'text-red-600'
                        }`} />
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                      </div>
                      <span className={`text-sm font-medium ${
                        darkMode ? 'text-red-300' : 'text-red-600'
                      }`}>
                        {formatTimeAgo(news.created_at)}
                      </span>
                    </div>

                    {/* إحصائيات المشاهدات */}
                    {showStats && news.views && (
                      <div className="flex items-center gap-1.5">
                        <Eye className={`w-3.5 h-3.5 ${
                          darkMode ? 'text-red-300' : 'text-red-600'
                        }`} />
                        <span className={`text-sm font-medium ${
                          darkMode ? 'text-red-300' : 'text-red-600'
                        }`}>
                          {formatViews(news.views)}
                        </span>
                      </div>
                    )}

                    {/* التصنيف */}
                    {news.category && (
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-medium px-2 py-1 rounded-md ${
                          darkMode 
                            ? 'border-red-400 text-red-200 bg-red-900/30' 
                            : 'border-red-400 text-red-700 bg-red-50'
                        }`}
                      >
                        {news.category.name}
                      </Badge>
                    )}
                  </div>

                  {/* سهم التفاصيل مع تأثير */}
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-medium ${
                      darkMode ? 'text-red-300' : 'text-red-600'
                    }`}>
                      اقرأ المزيد
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                      darkMode ? 'text-red-300' : 'text-red-600'
                    }`} />
                  </div>
                </div>
              </div>
            </div>

            {/* شريط التقدم السفلي */}
            <div className="mt-4 pt-3 border-t border-red-200 dark:border-red-800">
              <div className="relative h-1.5 bg-red-200 dark:bg-red-800 rounded-full overflow-hidden">
                {/* خط التقدم المتحرك */}
                <div 
                  className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-red-500 to-red-600"
                  style={{ 
                    width: '75%',
                    animation: 'progressPulse 2s infinite alternate'
                  }}
                />
                
                {/* تأثير اللمعان */}
                <div 
                  className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 rounded-full"
                  style={{
                    animation: 'shine 3s infinite linear'
                  }}
                />
              </div>
              
              {/* نص تفاعلي */}
              <div className="flex justify-between items-center mt-2">
                <span className={`text-xs font-medium ${
                  darkMode ? 'text-red-300' : 'text-red-600'
                }`}>
                  🔴 مباشر
                </span>
                <span className={`text-xs ${
                  darkMode ? 'text-red-400' : 'text-red-500'
                }`}>
                  يتم التحديث كل 30 ثانية
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* CSS للرسوم المتحركة */}
      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        
        @keyframes progressPulse {
          0% { opacity: 0.8; transform: scaleX(1); }
          100% { opacity: 1; transform: scaleX(1.02); }
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

'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock3, Heart, Bookmark, Brain, User, Calendar, Search, Share2, TrendingUp, Globe, FileText, ChevronLeft } from "lucide-react";
import { useDarkMode } from '@/hooks/useDarkMode';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DeepInsight {
  id: string;
  title: string;
  summary: string;
  author: string;
  createdAt: string;
  readTime: number;
  views: number;
  aiConfidence: number;
  tags: string[];
  type: 'AI' | 'تحرير بشري';
  url: string;
  isNew?: boolean;
  qualityScore?: number;
  category?: string;
}

interface DeepAnalysisWidgetProps {
  insights: DeepInsight[];
}

export default function DeepAnalysisWidget({ insights }: DeepAnalysisWidgetProps) {
  const { darkMode } = useDarkMode();
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  const [readItems, setReadItems] = useState<string[]>([]);

  useEffect(() => {
    // قراءة العناصر المقروءة من localStorage
    const read = localStorage.getItem('readAnalysis');
    if (read) {
      setReadItems(JSON.parse(read));
    }
  }, []);

  const handleSave = (id: string) => {
    if (savedItems.includes(id)) {
      setSavedItems(savedItems.filter(item => item !== id));
      toast.success('تم إزالة التحليل من المحفوظات');
    } else {
      setSavedItems([...savedItems, id]);
      toast.success('تم حفظ التحليل');
    }
  };

  const handleLike = (id: string) => {
    if (likedItems.includes(id)) {
      setLikedItems(likedItems.filter(item => item !== id));
    } else {
      setLikedItems([...likedItems, id]);
      toast.success('تم الإعجاب بالتحليل');
    }
  };

  const handleShare = (item: DeepInsight) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.summary,
        url: window.location.origin + item.url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + item.url);
      toast.success('تم نسخ الرابط');
    }
  };

  const markAsRead = (id: string) => {
    const newReadItems = [...readItems, id];
    setReadItems(newReadItems);
    localStorage.setItem('readAnalysis', JSON.stringify(newReadItems));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
    }
  };

  const truncateAuthor = (author: string) => {
    if (author.length > 15) {
      return author.substring(0, 15) + '...';
    }
    return author;
  };

  // تحديد ما إذا كان التحليل جديد (خلال آخر 24 ساعة)
  const isNewInsight = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    return diffInHours < 24;
  };

  // اختيار الأيقونة بناءً على نوع التحليل
  const getInsightIcon = (category?: string) => {
    switch(category?.toLowerCase()) {
      case 'research':
      case 'أبحاث':
        return '🧠';
      case 'report':
      case 'تقارير':
        return '📊';
      case 'global':
      case 'عالمي':
        return '🌍';
      case 'tech':
      case 'تقنية':
        return '💻';
      case 'economy':
      case 'اقتصاد':
        return '💰';
      default:
        return '📈';
    }
  };

  return (
    <TooltipProvider>
      <section id="deep-analysis-highlight" className={`py-12 md:py-16 transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="container px-4 mx-auto max-w-7xl">
          {/* العنوان والوصف */}
          <div className="text-center mb-12">
            {/* أيقونة فوق العنوان */}
            <div className="mb-4">
              <Brain className={`w-16 h-16 mx-auto ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            
            <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              التحليل العميق من سبق
            </h2>
            <p className={`text-lg ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              رؤى استراتيجية ودراسات معمقة بالذكاء الاصطناعي والخبرة البشرية
            </p>
          </div>

          {/* البطاقات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {insights.map((item) => {
              const isUnread = !readItems.includes(item.id);
              const isAI = item.type === 'AI';
              const isNew = isNewInsight(item.createdAt);
              
              return (
                <div 
                  key={item.id} 
                  className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1 group ${
                    darkMode 
                      ? 'bg-gray-800 shadow-lg hover:shadow-xl' 
                      : 'bg-white shadow-md hover:shadow-lg'
                  }`}
                  style={{
                    boxShadow: darkMode 
                      ? '0 2px 6px rgba(0, 0, 0, 0.3)' 
                      : '0 2px 6px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div className="p-6">
                    {/* مؤشر جديد - نقطة حمراء صغيرة */}
                    {isNew && (
                      <div className="absolute top-4 left-4">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      </div>
                    )}

                    {/* الشريط العلوي مع الأيقونة الدلالية */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        {/* أيقونة دلالية */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          darkMode 
                            ? 'bg-gray-700/50' 
                            : 'bg-gray-100'
                        }`}>
                          {getInsightIcon(item.category)}
                        </div>
                        
                        {/* بادج تحليل عميق - محدث بتدرج ناعم */}
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: 'linear-gradient(135deg, #d0e3ff 0%, #84aef3 100%)',
                            color: '#1e40af'
                          }}>
                          تحليل عميق
                        </span>
                        
                        {isAI && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            AI
                          </span>
                        )}
                      </div>
                    </div>

                    {/* العنوان */}
                    <h3 className={`font-bold text-xl leading-tight mb-3 line-clamp-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h3>

                    {/* الملخص - محسّن */}
                    <p className={`text-base mb-4 line-clamp-3 leading-relaxed ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {item.summary}
                    </p>

                    {/* الوسوم */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span 
                          key={idx} 
                          className={`text-xs px-2 py-0.5 rounded-md ${
                            darkMode 
                              ? 'bg-gray-700/50 text-gray-200' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* الإحصائيات - مبسطة */}
                    <div className={`flex items-center justify-between text-sm mb-5 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <span className="flex items-center gap-2">
                        <Clock3 className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-gray-400'}`} /> 
                        {item.readTime} دقيقة • {formatDate(item.createdAt)}
                      </span>
                    </div>

                    {/* زر القراءة - محسّن */}
                    <div className="mb-4">
                      <a href={item.url} onClick={() => markAsRead(item.id)}>
                        <button className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                          darkMode 
                            ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/30' 
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                        }`}>
                          <span>اقرأ التحليل</span>
                          <TrendingUp className="w-4 h-4" />
                        </button>
                      </a>
                    </div>

                    {/* عناصر التفاعل - محسّنة */}
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleShare(item)}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          darkMode 
                            ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700/50' 
                            : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'
                        }`}
                        title="مشاركة"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleSave(item.id)}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          savedItems.includes(item.id) 
                            ? 'text-blue-500' 
                            : darkMode 
                              ? 'text-gray-400 hover:text-purple-400 hover:bg-gray-700/50' 
                              : 'text-gray-400 hover:text-purple-600 hover:bg-gray-100'
                        }`}
                        title="حفظ"
                      >
                        <Bookmark className={`w-4 h-4 ${
                          savedItems.includes(item.id) ? 'fill-current' : ''
                        }`} />
                      </button>
                      
                      <button
                        onClick={() => handleLike(item.id)}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          likedItems.includes(item.id) 
                            ? 'text-red-500' 
                            : darkMode 
                              ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700/50' 
                              : 'text-gray-400 hover:text-red-600 hover:bg-gray-100'
                        }`}
                        title="إعجاب"
                      >
                        <Heart className={`w-4 h-4 ${
                          likedItems.includes(item.id) ? 'fill-current' : ''
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* زر استكشاف المزيد */}
          <div className="text-center">
            <a href="/insights/deep" className="inline-block">
              <button className={`px-8 py-3 rounded-xl font-medium text-base transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                darkMode 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
              }`}>
                <Search className="w-5 h-5" />
                استكشف جميع التحليلات العميقة
              </button>
            </a>
          </div>
          
          {/* نص إضافي */}
          <div className="text-center mt-6">
            <p className={`text-sm ${
              darkMode ? 'text-gray-500' : 'text-gray-500'
            }`}>
              • يتم تحديث تحليلات جديدة يومياً
            </p>
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
} 
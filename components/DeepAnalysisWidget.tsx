'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock3, Heart, Bookmark, Brain, User, Calendar, Search } from "lucide-react";
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
              
              return (
                <div 
                  key={item.id} 
                  className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:scale-[1.02] ${
                    darkMode 
                      ? 'bg-gray-800 shadow-xl' 
                      : 'bg-white shadow-lg hover:shadow-xl'
                  } ${isAI ? 'ring-1 ring-purple-200' : ''} ${isUnread ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
                >
                  <div className="p-6">
                    {/* مؤشر جديد */}
                    {isUnread && (
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                          جديد
                        </span>
                      </div>
                    )}

                    {/* الشريط العلوي */}
                    <div className="flex items-center gap-2 mb-5">
                      {isAI && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          AI 🤖
                        </span>
                      )}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        darkMode 
                          ? 'bg-blue-900/50 text-blue-300' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        تحليل عميق
                      </span>
                    </div>

                    {/* العنوان - مكبر */}
                    <h3 className={`font-bold text-xl leading-relaxed mb-4 line-clamp-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h3>

                    {/* الملخص */}
                    <p className={`text-sm mb-5 line-clamp-2 leading-relaxed ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {item.summary}
                    </p>

                    {/* الوسوم */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span 
                          key={idx} 
                          className={`text-xs px-2.5 py-1 rounded-md ${
                            darkMode 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* الإحصائيات */}
                    <div className={`flex items-center gap-4 text-xs mb-6 ${
                      darkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="flex items-center gap-1 cursor-help">
                            <User className="w-3.5 h-3.5" />
                            {truncateAuthor(item.author)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{item.author}</p>
                        </TooltipContent>
                      </Tooltip>
                      <span className="flex items-center gap-1">
                        <Clock3 className="w-3.5 h-3.5" /> 
                        {item.readTime} دقيقة
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    {/* الأزرار - إعادة ترتيب */}
                    <div className="flex items-center gap-2">
                      {/* زر اقرأ التحليل */}
                      <a href={item.url} className="flex-1" onClick={() => markAsRead(item.id)}>
                        <button className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${
                          darkMode 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}>
                          اقرأ التحليل
                        </button>
                      </a>
                      
                      {/* أزرار الإعجاب والحفظ */}
                      <button
                        onClick={() => handleLike(item.id)}
                        className={`p-2.5 rounded-lg transition-all duration-300 ${
                          likedItems.includes(item.id) 
                            ? 'bg-red-50 text-red-600 border border-red-200' 
                            : darkMode 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title="إعجاب"
                      >
                        <Heart className={`w-4 h-4 ${
                          likedItems.includes(item.id) ? 'fill-current' : ''
                        }`} />
                      </button>
                      <button
                        onClick={() => handleSave(item.id)}
                        className={`p-2.5 rounded-lg transition-all duration-300 ${
                          savedItems.includes(item.id) 
                            ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                            : darkMode 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title="حفظ"
                      >
                        <Bookmark className={`w-4 h-4 ${
                          savedItems.includes(item.id) ? 'fill-current' : ''
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
'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock3, Heart, Bookmark, Share2, Brain, User, Calendar, MessageSquare } from "lucide-react";
import { useDarkMode } from '@/hooks/useDarkMode';
import { useState } from 'react';
import toast from 'react-hot-toast';

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
}

interface DeepAnalysisWidgetProps {
  insights: DeepInsight[];
}

export default function DeepAnalysisWidget({ insights }: DeepAnalysisWidgetProps) {
  const { darkMode } = useDarkMode();
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [likedItems, setLikedItems] = useState<string[]>([]);

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

  const handleShare = async (insight: DeepInsight) => {
    try {
      await navigator.share({
        title: insight.title,
        text: insight.summary,
        url: window.location.origin + insight.url,
      });
    } catch (err) {
      // Fallback to copying link
      navigator.clipboard.writeText(window.location.origin + insight.url);
      toast.success('تم نسخ الرابط');
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
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

  return (
    <section id="deep-analysis-highlight" className={`py-12 md:py-16 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="container px-4 mx-auto max-w-7xl">
        {/* العنوان والوصف */}
        <div className="text-center mb-10">
          <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            🧠 التحليل العميق من سبق
          </h2>
          <p className={`text-lg ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            رؤى استراتيجية ودراسات معمقة بالذكاء الاصطناعي والخبرة البشرية
          </p>
        </div>

        {/* البطاقات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {insights.map((item) => (
            <div 
              key={item.id} 
              className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:scale-[1.02] ${
                darkMode 
                  ? 'bg-gray-800 shadow-xl' 
                  : 'bg-white shadow-lg hover:shadow-xl'
              }`}
            >
              <div className="p-6">
                {/* الشريط العلوي */}
                <div className="flex items-center gap-2 mb-4">
                  {item.type === "AI" && (
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

                {/* العنوان */}
                <h3 className={`font-bold text-lg leading-relaxed mb-3 line-clamp-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.title}
                </h3>

                {/* الملخص */}
                <p className={`text-sm mb-4 line-clamp-2 leading-relaxed ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {item.summary}
                </p>

                {/* الوسوم */}
                <div className="flex flex-wrap gap-2 mb-5">
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
                <div className={`flex items-center gap-4 text-xs mb-5 ${
                  darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {item.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 className="w-3.5 h-3.5" /> 
                    {item.readTime} دقيقة
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                {/* الأزرار */}
                <div className="flex items-center justify-between">
                  <a href={item.url} className="flex-1 ml-3">
                    <button className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-300 ${
                      darkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}>
                      اقرأ التحليل كاملاً
                    </button>
                  </a>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSave(item.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        savedItems.includes(item.id) 
                          ? 'text-blue-600 bg-blue-50' 
                          : darkMode 
                            ? 'text-gray-400 hover:bg-gray-700' 
                            : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${
                        savedItems.includes(item.id) ? 'fill-current' : ''
                      }`} />
                    </button>
                    <button
                      onClick={() => handleLike(item.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        likedItems.includes(item.id) 
                          ? 'text-red-500 bg-red-50' 
                          : darkMode 
                            ? 'text-gray-400 hover:bg-gray-700' 
                            : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${
                        likedItems.includes(item.id) ? 'fill-current' : ''
                      }`} />
                    </button>
                  </div>
                </div>

                {/* شريط التفاعل السفلي */}
                <div className={`flex items-center justify-between mt-4 pt-4 border-t ${
                  darkMode ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <div className="flex items-center gap-4 text-xs">
                    <span className={`flex items-center gap-1 ${
                      darkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      <Eye className="w-3.5 h-3.5" />
                      {formatViews(item.views)}
                    </span>
                    <span className={`flex items-center gap-1 ${
                      darkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      <MessageSquare className="w-3.5 h-3.5" />
                      {Math.floor(item.views / 10)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleShare(item)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      darkMode 
                        ? 'text-gray-400 hover:bg-gray-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* زر استكشاف المزيد */}
        <div className="text-center">
          <a href="/dashboard/deep-analysis" className="inline-block">
            <button className={`px-8 py-3 rounded-xl font-medium text-base transition-all duration-300 transform hover:scale-105 ${
              darkMode 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
            }`}>
              📚 استكشف جميع التحليلات العميقة
            </button>
          </a>
        </div>
        
        {/* نص إضافي */}
        <div className="text-center mt-6">
          <p className={`text-sm ${
            darkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>
            • يتم تتم تحليلات جديدة يومياً
          </p>
        </div>
      </div>
    </section>
  );
} 
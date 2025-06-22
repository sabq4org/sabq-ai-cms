'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock3, Heart, Bookmark, Share2, Brain } from "lucide-react";
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

  return (
    <section id="deep-analysis-highlight" className={`py-8 md:py-12 transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="container px-4 mx-auto">
        {/* العنوان والوصف */}
        <div className="text-center mb-8">
          <h2 className={`text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            التحليل العميق من سبق 
            <Brain className="w-8 h-8 text-purple-600" />
          </h2>
          <p className={`text-lg ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            رؤى استراتيجية ودراسات معمقة بالذكاء الاصطناعي والخبرة البشرية
          </p>
        </div>

        {/* البطاقات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insights.map((item) => (
            <Card 
              key={item.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                  : item.type === 'AI'
                    ? 'bg-purple-50 border-purple-200 hover:border-purple-300'
                    : 'bg-blue-50 border-blue-200 hover:border-blue-300'
              }`}
            >
              <CardContent className="p-5">
                {/* الشريط العلوي */}
                <div className="flex justify-between items-center mb-3">
                  <Badge 
                    variant="secondary" 
                    className={`flex items-center gap-1 ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-200' 
                        : 'bg-white/80 text-gray-700'
                    }`}
                  >
                    <Brain className="w-3 h-3" />
                    تحليل عميق
                  </Badge>
                  {item.type === "AI" && (
                    <Badge 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0"
                      variant="outline"
                    >
                      AI
                    </Badge>
                  )}
                </div>

                {/* العنوان */}
                <h3 className={`font-bold text-lg leading-snug mb-2 line-clamp-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.title}
                </h3>

                {/* الملخص */}
                <p className={`text-sm mb-3 line-clamp-3 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {item.summary}
                </p>

                {/* الوسوم */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.slice(0, 3).map((tag, idx) => (
                    <span 
                      key={idx} 
                      className={`text-xs rounded-full px-3 py-1 ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* الإحصائيات */}
                <div className={`flex items-center text-xs gap-4 mb-4 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> 
                    {formatViews(item.views)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock3 className="w-3.5 h-3.5" /> 
                    {item.readTime} دقيقة
                  </span>
                  <span className="truncate flex-1">
                    {item.author}
                  </span>
                </div>

                {/* الأزرار */}
                <div className="flex gap-2 flex-wrap">
                  <a href={item.url} className="flex-1">
                    <Button 
                      variant="outline" 
                      className={`text-sm px-4 w-full ${
                        darkMode 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      اقرأ التحليل كاملاً
                    </Button>
                  </a>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSave(item.id)}
                      className={`p-2 ${
                        savedItems.includes(item.id) 
                          ? 'text-purple-600' 
                          : darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${
                        savedItems.includes(item.id) ? 'fill-current' : ''
                      }`} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleShare(item)}
                      className={`p-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleLike(item.id)}
                      className={`p-2 ${
                        likedItems.includes(item.id) 
                          ? 'text-red-500' 
                          : darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${
                        likedItems.includes(item.id) ? 'fill-current' : ''
                      }`} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* زر استكشاف المزيد */}
        <div className="text-center mt-8">
          <a href="/dashboard/deep-analysis">
            <Button 
              className={`text-base px-6 py-2 ${
                darkMode 
                  ? 'border-gray-600 hover:bg-gray-800' 
                  : ''
              }`} 
              variant="outline"
            >
              استكشف جميع التحليلات العميقة
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
} 
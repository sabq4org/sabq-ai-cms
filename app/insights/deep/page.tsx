'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Eye, User, Clock3, Sparkles, Search, Filter } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import Link from 'next/link';

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
  category: string;
}

export default function DeepInsightsPage() {
  const { darkMode } = useDarkMode();
  const [insights, setInsights] = useState<DeepInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/deep-insights?limit=20');
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInsights = insights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || insight.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  // إحصائيات سريعة
  const totalAnalyses = insights.length;
  const aiAnalyses = insights.filter(i => i.type === 'AI').length;
  const totalViews = insights.reduce((sum, i) => sum + i.views, 0);
  const avgReadTime = insights.length > 0 
    ? Math.round(insights.reduce((sum, i) => sum + i.readTime, 0) / insights.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700">
      {/* الهيدر */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
        <div className="relative container mx-auto px-4 py-16">
          {/* رجوع إلى الرئيسية */}
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors">
            <span>←</span>
            <span>الرئيسية</span>
          </Link>

          {/* الأيقونة والعنوان */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">التحليل العميق</h1>
            <p className="text-xl text-white/80">من صحيفة سبق</p>
            <p className="text-lg text-white/60 mt-4 max-w-2xl mx-auto">
              رؤى استراتيجية ودراسات معمقة تقيم الأحداث وتحلل القضايا المعاصرة بمنهجية علمية وأسلوب صحفي احترافي
            </p>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <Sparkles className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{aiAnalyses}</div>
              <div className="text-white/60 text-sm">تحليل بالذكاء الاصطناعي</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <User className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{totalAnalyses - aiAnalyses}</div>
              <div className="text-white/60 text-sm">خبراء ومحللين</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <Eye className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{formatViews(totalViews)}</div>
              <div className="text-white/60 text-sm">إجمالي المشاهدات</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <Clock3 className="w-8 h-8 text-white mx-auto mb-2" />
              <div className="text-3xl font-bold text-white">{avgReadTime}</div>
              <div className="text-white/60 text-sm">متوسط وقت القراءة</div>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          {/* شريط البحث والفلاتر */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="البحث في التحليلات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pr-10 pl-4 py-3 rounded-xl border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-6 py-3 rounded-xl border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="all">جميع التصنيفات</option>
                <option value="سياسة">سياسة</option>
                <option value="اقتصاد">اقتصاد</option>
                <option value="تقنية">تقنية</option>
                <option value="رياضة">رياضة</option>
                <option value="ثقافة">ثقافة</option>
              </select>
            </div>
          </div>

          {/* قائمة التحليلات */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInsights.map((insight) => (
                <Link href={insight.url} key={insight.id}>
                  <div className={`rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:scale-[1.02] cursor-pointer ${
                    darkMode 
                      ? 'bg-gray-800 shadow-xl' 
                      : 'bg-white shadow-lg hover:shadow-xl'
                  }`}>
                    <div className="p-6">
                      {/* الشارات */}
                      <div className="flex items-center gap-2 mb-4">
                        {insight.type === 'AI' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Brain className="w-3 h-3 ml-1" />
                            ذكاء اصطناعي
                          </span>
                        )}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          darkMode 
                            ? 'bg-blue-900/50 text-blue-300' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {insight.category || 'تحليل عميق'}
                        </span>
                      </div>

                      {/* العنوان */}
                      <h3 className={`font-bold text-xl mb-3 line-clamp-2 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {insight.title}
                      </h3>

                      {/* الملخص */}
                      <p className={`text-sm mb-4 line-clamp-3 leading-relaxed ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {insight.summary}
                      </p>

                      {/* الوسوم */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {insight.tags.slice(0, 3).map((tag, idx) => (
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

                      {/* المعلومات السفلية */}
                      <div className={`flex items-center justify-between text-xs ${
                        darkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {insight.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock3 className="w-3.5 h-3.5" /> 
                            {insight.readTime} دقيقة
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {formatViews(insight.views)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* رسالة عند عدم وجود نتائج */}
          {!loading && filteredInsights.length === 0 && (
            <div className="text-center py-12">
              <Brain className={`w-16 h-16 mx-auto mb-4 ${
                darkMode ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p className={`text-lg ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                لا توجد تحليلات مطابقة للبحث
              </p>
            </div>
          )}
        </div>
      </div>

      {/* الفوتر */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className={`text-sm ${
            darkMode ? 'text-gray-500' : 'text-gray-600'
          }`}>
            متوسط وقت القراءة: {avgReadTime} دقيقة
          </p>
          <p className={`text-xs mt-2 ${
            darkMode ? 'text-gray-600' : 'text-gray-500'
          }`}>
            يتم تحديث المحتوى يومياً
          </p>
        </div>
      </div>
    </div>
  );
} 
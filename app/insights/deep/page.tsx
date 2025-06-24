'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Eye, User, Clock3, Sparkles, Search, Filter, ArrowLeft, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      
      {/* الهيدر مع خلفية ناعمة */}
      <div className={`relative ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800' 
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50'
      }`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          {/* رجوع إلى الرئيسية */}
          <Link href="/" className={`inline-flex items-center gap-2 mb-8 transition-colors ${
            darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
          }`}>
            <ArrowLeft className="w-4 h-4" />
            <span>الرئيسية</span>
          </Link>

          {/* الأيقونة والعنوان */}
          <div className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${
              darkMode ? 'bg-blue-900/30' : 'bg-white shadow-lg'
            }`}>
              <Brain className={`w-10 h-10 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              التحليل العميق
            </h1>
            <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              من صحيفة سبق
            </p>
            <p className={`text-lg mt-4 max-w-2xl mx-auto ${
              darkMode ? 'text-gray-500' : 'text-gray-600'
            }`}>
              رؤى استراتيجية ودراسات معمقة تقيم الأحداث وتحلل القضايا المعاصرة بمنهجية علمية وأسلوب صحفي احترافي
            </p>
          </div>

          {/* الإحصائيات */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className={`rounded-2xl p-6 text-center ${
              darkMode ? 'bg-gray-800' : 'bg-white shadow-md'
            }`}>
              <Sparkles className={`w-8 h-8 mx-auto mb-2 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
              <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {aiAnalyses}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                تحليل بالذكاء الاصطناعي
              </div>
            </div>
            
            <div className={`rounded-2xl p-6 text-center ${
              darkMode ? 'bg-gray-800' : 'bg-white shadow-md'
            }`}>
              <User className={`w-8 h-8 mx-auto mb-2 ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {totalAnalyses - aiAnalyses}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                خبراء ومحللين
              </div>
            </div>
            
            <div className={`rounded-2xl p-6 text-center ${
              darkMode ? 'bg-gray-800' : 'bg-white shadow-md'
            }`}>
              <Eye className={`w-8 h-8 mx-auto mb-2 ${
                darkMode ? 'text-green-400' : 'text-green-600'
              }`} />
              <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatViews(totalViews)}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                إجمالي المشاهدات
              </div>
            </div>
            
            <div className={`rounded-2xl p-6 text-center ${
              darkMode ? 'bg-gray-800' : 'bg-white shadow-md'
            }`}>
              <Clock3 className={`w-8 h-8 mx-auto mb-2 ${
                darkMode ? 'text-orange-400' : 'text-orange-600'
              }`} />
              <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {avgReadTime}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                متوسط وقت القراءة
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="container mx-auto px-4 py-12">
        {/* شريط البحث والفلاتر */}
        <div className={`rounded-2xl p-6 mb-8 ${
          darkMode ? 'bg-gray-800' : 'bg-white shadow-sm'
        }`}>
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
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-6 py-3 rounded-xl border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInsights.map((insight) => (
              <Link href={insight.url} key={insight.id}>
                <div className={`rounded-2xl overflow-hidden transition-all duration-300 hover:transform hover:scale-[1.02] cursor-pointer ${
                  darkMode 
                    ? 'bg-gray-800 shadow-xl hover:shadow-2xl' 
                    : 'bg-white shadow-md hover:shadow-lg'
                }`}>
                  <div className="p-6">
                    {/* الشارات */}
                    <div className="flex items-center gap-2 mb-4">
                      {insight.type === 'AI' && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          darkMode
                            ? 'bg-purple-900/30 text-purple-300'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          <Brain className="w-3 h-3 ml-1" />
                          ذكاء اصطناعي
                        </span>
                      )}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        darkMode 
                          ? 'bg-blue-900/30 text-blue-300' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {insight.category || 'تحليل عميق'}
                      </span>
                    </div>

                    {/* العنوان */}
                    <h3 className={`font-bold text-2xl mb-3 line-clamp-2 leading-tight ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {insight.title}
                    </h3>

                    {/* الملخص */}
                    <p className={`text-base mb-4 line-clamp-3 leading-relaxed ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
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
                              ? 'bg-gray-700/50 text-gray-200' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* المعلومات السفلية - مبسطة */}
                    <div className={`flex items-center justify-between pt-4 border-t ${
                      darkMode ? 'border-gray-700' : 'border-gray-100'
                    }`}>
                      <div className={`flex items-center gap-2 text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <Clock3 className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-gray-400'}`} /> 
                        <span>{insight.readTime} دقيقة • {formatDate(insight.createdAt)}</span>
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <Eye className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-gray-400'}`} />
                        <span>{formatViews(insight.views)}</span>
                      </div>
                    </div>

                    {/* زر اقرأ التحليل - محسّن */}
                    <div className="mt-4">
                      <button className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        darkMode 
                          ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/30' 
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                      }`}>
                        <span>اقرأ التحليل</span>
                        <TrendingUp className="w-4 h-4" />
                      </button>
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

      <Footer />
    </div>
  );
} 
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Search, Filter, MessageCircle, MessageSquare, Clock, Eye, User, AlertCircle } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import { useTheme } from "@/contexts/ThemeContext";

interface SearchResult {
  id: string;
  type: 'topic' | 'reply';
  title?: string;
  content: string;
  topicTitle?: string;
  url: string;
  category: {
    name: string;
    slug: string;
    color: string;
  };
  author: string;
  createdAt: string;
  views?: number;
  isPinned?: boolean;
  isLocked?: boolean;
  relativeTime: string;
}

export default function ForumSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'topics' | 'replies'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // جلب قيمة البحث من URL
  useEffect(() => {
    const query = searchParams.get('q');
    const type = searchParams.get('type') as 'all' | 'topics' | 'replies' || 'all';
    
    if (query) {
      setSearchQuery(query);
      setSearchType(type);
      performSearch(query, type, 1);
    }
  }, [searchParams]);

  // تنفيذ البحث
  const performSearch = async (query: string, type: string, page: number = 1) => {
    if (!query || query.trim().length < 2) {
      setError('يجب أن يكون البحث أكثر من حرفين');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query.trim(),
        type,
        page: page.toString(),
        limit: '20'
      });

      const response = await fetch(`/api/forum/search?${params}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
        setTotalResults(data.pagination?.total || 0);
        setCurrentPage(page);
      } else {
        setError(data.error || 'حدث خطأ في البحث');
      }
    } catch (error) {
      console.error('Error searching:', error);
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // التعامل مع إرسال نموذج البحث
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams({
        q: searchQuery.trim(),
        type: searchType
      });
      router.push(`/forum/search?${params}`);
    }
  };

  // تغيير نوع البحث
  const handleTypeChange = (newType: 'all' | 'topics' | 'replies') => {
    setSearchType(newType);
    if (searchQuery.trim()) {
      const params = new URLSearchParams({
        q: searchQuery.trim(),
        type: newType
      });
      router.push(`/forum/search?${params}`);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`} dir="rtl">
      {/* الهيدر الرسمي للصحيفة */}
      <Header />
      
      {/* رأس الصفحة */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/forum" className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'} transition-colors`}>
              <ArrowRight className="w-4 h-4" />
              العودة للمنتدى
            </Link>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                darkMode ? 'bg-gradient-to-br from-blue-600 to-blue-700' : 'bg-gradient-to-br from-blue-500 to-blue-600'
              } shadow-md`}>
                <Search className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>البحث في المنتدى</h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ابحث في المواضيع والردود</p>
              </div>
            </div>
          </div>

          {/* نموذج البحث */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="ابحث في المواضيع والردود..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pr-10 text-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
              <Button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                بحث
              </Button>
            </div>
            
            {/* فلاتر نوع البحث */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>البحث في:</span>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'الكل' },
                  { value: 'topics', label: 'المواضيع' },
                  { value: 'replies', label: 'الردود' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleTypeChange(option.value as any)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      searchType === option.value
                        ? 'bg-blue-500 text-white'
                        : darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* نتائج البحث */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* عرض حالة البحث */}
        {searchQuery && (
          <div className="mb-6">
            <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              نتائج البحث عن "{searchQuery}"
            </h2>
            {!loading && (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {totalResults > 0 
                  ? `تم العثور على ${totalResults.toLocaleString()} نتيجة`
                  : 'لم يتم العثور على نتائج'
                }
              </p>
            )}
          </div>
        )}

        {/* عرض الأخطاء */}
        {error && (
          <Card className={`mb-6 ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className={`${darkMode ? 'text-red-400' : 'text-red-700'}`}>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* حالة التحميل */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} animate-pulse`}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className={`h-5 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4`}></div>
                    <div className={`h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2`}></div>
                    <div className={`h-16 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* عرض النتائج */}
        {!loading && results.length > 0 && (
          <div className="space-y-4">
            {results.map((result) => (
              <Link key={`${result.type}-${result.id}`} href={result.url}>
                <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {/* نوع النتيجة والفئة */}
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                          result.type === 'topic' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {result.type === 'topic' ? (
                            <>
                              <MessageCircle className="w-3 h-3" />
                              موضوع
                            </>
                          ) : (
                            <>
                              <MessageSquare className="w-3 h-3" />
                              رد
                            </>
                          )}
                        </div>
                        <div 
                          className="inline-flex items-center px-2 py-1 text-xs text-white rounded-md"
                          style={{ backgroundColor: result.category.color }}
                        >
                          {result.category.name}
                        </div>
                      </div>

                      {/* العنوان أو السياق */}
                      {result.type === 'topic' ? (
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {result.title}
                        </h3>
                      ) : (
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            رد على: {result.topicTitle}
                          </p>
                        </div>
                      )}

                      {/* المحتوى مع التمييز */}
                      <div 
                        className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm leading-relaxed`}
                        dangerouslySetInnerHTML={{ __html: result.content }}
                      />

                      {/* معلومات إضافية */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className={`flex items-center gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{result.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{result.relativeTime}</span>
                          </div>
                          {result.type === 'topic' && result.views && (
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{result.views} مشاهدة</span>
                            </div>
                          )}
                        </div>
                        
                        {result.type === 'topic' && (result.isPinned || result.isLocked) && (
                          <div className="flex items-center gap-2">
                            {result.isPinned && (
                              <span className="text-orange-500 text-xs">مثبت</span>
                            )}
                            {result.isLocked && (
                              <span className="text-red-500 text-xs">مغلق</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* حالة عدم وجود نتائج */}
        {!loading && !error && searchQuery && results.length === 0 && (
          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-12 text-center">
              <Search className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                لا توجد نتائج
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
                لم نتمكن من العثور على نتائج لبحثك "{searchQuery}"
              </p>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} space-y-2`}>
                <p>جرب:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>استخدام كلمات مختلفة أو أكثر عمومية</li>
                  <li>التحقق من الإملاء</li>
                  <li>البحث في نوع محتوى مختلف (مواضيع أو ردود)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* حالة البداية (لا يوجد بحث) */}
        {!searchQuery && !loading && (
          <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <CardContent className="p-12 text-center">
              <Search className={`w-16 h-16 ${darkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ابحث في المنتدى
              </h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
                ابحث في المواضيع والردود للعثور على المحتوى الذي تريده
              </p>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} space-y-2`}>
                <p>يمكنك البحث عن:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>عناوين المواضيع ومحتواها</li>
                  <li>نصوص الردود والتعليقات</li>
                  <li>أسماء المؤلفين</li>
                  <li>فئات محددة</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 
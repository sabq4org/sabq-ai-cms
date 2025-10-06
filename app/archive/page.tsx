'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Search, Filter, TrendingUp, Clock, Eye, Sparkles, ChevronDown, Grid3x3, List, BarChart3, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import CloudImage from '@/components/ui/CloudImage';
import { getSafeImageUrl } from '@/lib/image-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  category?: {
    id: number;
    name: string;
    slug: string;
    color?: string;
  };
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  views?: number;
  published_at: string;
  ai_score?: number;
  trending?: boolean;
}

interface ArchiveStats {
  totalArticles: number;
  todayArticles: number;
  weeklyGrowth: number;
  topCategory: string;
  activeAuthors: number;
}

export default function ArchivePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'ai'>('date');
  const [stats, setStats] = useState<ArchiveStats | null>(null);
  const [categories, setCategories] = useState<Array<{id: string; name: string; count: number}>>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // جلب البيانات
  useEffect(() => {
    fetchArchiveData();
  }, [selectedMonth]);

  const fetchArchiveData = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(selectedMonth);
      const end = endOfMonth(selectedMonth);
      
      const response = await fetch(`/api/archive?start=${start.toISOString()}&end=${end.toISOString()}`);
      const data = await response.json();
      
      if (data.articles) {
        const enrichedArticles = data.articles.map((a: any) => ({
          ...a,
          image: getSafeImageUrl(a.image || a.featured_image, 'article'),
          ai_score: Math.random() * 100, // محاكاة نقاط AI
          trending: Math.random() > 0.8
        }));
        setArticles(enrichedArticles);
        setFilteredArticles(enrichedArticles);
      }
      
      if (data.stats) setStats(data.stats);
      if (data.categories) setCategories(data.categories);
      
      // محاكاة اقتراحات AI
      setAiSuggestions([
        'أخبار التقنية الأكثر قراءة',
        'تحليلات الأسبوع الماضي',
        'مقالات ذات صلة بالذكاء الاصطناعي',
        'الأخبار العاجلة لهذا الشهر'
      ]);
    } catch (error) {
      console.error('Error fetching archive:', error);
    } finally {
      setLoading(false);
    }
  };

  // فلترة وترتيب
  useEffect(() => {
    let filtered = [...articles];
    
    // بحث
    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // تصنيف
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category?.slug === selectedCategory);
    }
    
    // ترتيب
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'ai':
          return (b.ai_score || 0) - (a.ai_score || 0);
        default:
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      }
    });
    
    setFilteredArticles(filtered);
  }, [articles, searchQuery, selectedCategory, sortBy]);

  // مكون التقويم
  const CalendarView = () => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    return (
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            التقويم الشهري
          </h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
            >
              الشهر السابق
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
            >
              الشهر التالي
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(day => (
            <div key={day} className="text-xs font-medium text-center p-2 text-gray-600 dark:text-gray-400">
              {day}
            </div>
          ))}
          {days.map(day => {
            const dayArticles = articles.filter(a => 
              format(parseISO(a.published_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
            );
            return (
              <motion.div
                key={day.toString()}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  "relative p-2 h-20 border rounded-lg cursor-pointer transition-all",
                  isToday(day) && "bg-blue-100 dark:bg-blue-900 border-blue-500",
                  !isSameMonth(day, selectedMonth) && "opacity-50",
                  dayArticles.length > 0 && "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                )}
                onClick={() => setSelectedDate(day)}
              >
                <div className="text-sm font-medium">{format(day, 'd')}</div>
                {dayArticles.length > 0 && (
                  <div className="absolute bottom-1 right-1">
                    <Badge variant="secondary" className="text-xs">
                      {dayArticles.length}
                    </Badge>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </Card>
    );
  };

  // مكون الإحصائيات
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">إجمالي المقالات</p>
              <p className="text-2xl font-bold">{stats?.totalArticles || 0}</p>
            </div>
            <Grid3x3 className="w-8 h-8 opacity-50" />
          </div>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">مقالات اليوم</p>
              <p className="text-2xl font-bold">{stats?.todayArticles || 0}</p>
            </div>
            <Clock className="w-8 h-8 opacity-50" />
          </div>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-4 bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">نمو أسبوعي</p>
              <p className="text-2xl font-bold">+{stats?.weeklyGrowth || 0}%</p>
            </div>
            <TrendingUp className="w-8 h-8 opacity-50" />
          </div>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">القسم الأنشط</p>
              <p className="text-lg font-bold">{stats?.topCategory || 'محليات'}</p>
            </div>
            <Zap className="w-8 h-8 opacity-50" />
          </div>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-4 bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">كتّاب نشطون</p>
              <p className="text-2xl font-bold">{stats?.activeAuthors || 0}</p>
            </div>
            <BarChart3 className="w-8 h-8 opacity-50" />
          </div>
        </Card>
      </motion.div>
    </div>
  );

  // مكون بطاقة المقال
  const ArticleCard = ({ article }: { article: Article }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Link href={`/news/${article.slug}`}>
        <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300">
          <div className="relative h-48 overflow-hidden">
            {article.image ? (
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
            )}
            {article.trending && (
              <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                <TrendingUp className="w-3 h-3 mr-1" />
                رائج
              </Badge>
            )}
            {article.ai_score && article.ai_score > 80 && (
              <Badge className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                مميز AI
              </Badge>
            )}
          </div>
          <CardContent className="p-4">
            {article.category && (
              <Badge 
                variant="secondary" 
                className="mb-2"
                style={{ backgroundColor: article.category.color || '#3B82F6' }}
              >
                {article.category.name}
              </Badge>
            )}
            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {article.excerpt}
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(parseISO(article.published_at), 'dd MMM', { locale: ar })}
                </span>
                {article.views && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.views.toLocaleString()}
                  </span>
                )}
              </div>
              {article.author && (
                <span className="font-medium">{article.author.name}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );

  // مكون اقتراحات AI
  const AISuggestions = () => (
    <Card className="p-4 mb-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold">اقتراحات AI الذكية</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {aiSuggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors"
              onClick={() => setSearchQuery(suggestion)}
            >
              {suggestion}
            </Badge>
          </motion.div>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* الهيدر */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">أرشيف الأخبار الذكي</h1>
            <p className="text-xl opacity-90">استكشف آلاف المقالات بقوة الذكاء الاصطناعي</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* الإحصائيات */}
        <StatsCards />

        {/* اقتراحات AI */}
        <AISuggestions />

        {/* أدوات البحث والفلترة */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="ابحث في الأرشيف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="جميع الأقسام" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأقسام</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name} ({cat.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger>
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">الأحدث</SelectItem>
                <SelectItem value="views">الأكثر مشاهدة</SelectItem>
                <SelectItem value="ai">نقاط AI</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button
                size="icon"
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant={viewMode === 'timeline' ? 'default' : 'outline'}
                onClick={() => setViewMode('timeline')}
              >
                <Clock className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* المحتوى الرئيسي */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {viewMode === 'grid' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {filteredArticles.map(article => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </motion.div>
                )}
                
                {viewMode === 'list' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {filteredArticles.map(article => (
                      <Card key={article.id} className="p-4 hover:shadow-lg transition-shadow">
                        <Link href={`/news/${article.slug}`} className="flex gap-4">
                          <div className="relative w-32 h-24 flex-shrink-0">
                            {article.image ? (
                              <Image
                                src={article.image}
                                alt={article.title}
                                fill
                                className="object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1 hover:text-blue-600 transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {article.excerpt}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{format(parseISO(article.published_at), 'dd MMM yyyy', { locale: ar })}</span>
                              {article.views && <span>{article.views} مشاهدة</span>}
                            </div>
                          </div>
                        </Link>
                      </Card>
                    ))}
                  </motion.div>
                )}
                
                {viewMode === 'timeline' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative"
                  >
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700"></div>
                    {filteredArticles.map((article, index) => (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-12 pb-8"
                      >
                        <div className="absolute left-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <Card className="p-4">
                          <div className="text-xs text-gray-500 mb-2">
                            {format(parseISO(article.published_at), 'dd MMMM yyyy - HH:mm', { locale: ar })}
                          </div>
                          <Link href={`/news/${article.slug}`}>
                            <h3 className="font-bold text-lg hover:text-blue-600 transition-colors">
                              {article.title}
                            </h3>
                          </Link>
                          {article.category && (
                            <Badge variant="secondary" className="mt-2">
                              {article.category.name}
                            </Badge>
                          )}
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            
            {filteredArticles.length === 0 && !loading && (
              <Card className="p-12 text-center">
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">لا توجد نتائج</h3>
                <p className="text-gray-600 dark:text-gray-400">جرب تغيير معايير البحث أو الفلاتر</p>
              </Card>
            )}
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            {/* التقويم */}
            <CalendarView />
            
            {/* الأقسام الشائعة */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                الأقسام الشائعة
              </h3>
              <div className="space-y-2">
                {categories.slice(0, 5).map(cat => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    <span className="font-medium">{cat.name}</span>
                    <Badge variant="secondary">{cat.count}</Badge>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* نصائح AI */}
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                نصائح من AI
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>استخدم كلمات مفتاحية محددة للحصول على نتائج أفضل</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>جرب البحث بالتاريخ للعثور على أخبار فترة معينة</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>المقالات ذات نقاط AI عالية تحتوي على محتوى مميز</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

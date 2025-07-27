/**
 * 📱 صفحة إدارة المقالات - النسخة المحمولة
 * مصممة خصيصًا للهواتف الذكية مع تجربة مستخدم محسنة
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MobileButton, 
  MobileSearchBar, 
  MobileDropdown,
  PullToRefresh 
} from '@/components/mobile/MobileComponents';
import { 
  Plus, 
  Filter, 
  Edit3, 
  Eye, 
  Trash2, 
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  User,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  Search,
  RefreshCw
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  status: 'published' | 'draft' | 'pending' | 'archived';
  category: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  comments: number;
  readingTime: number;
  featured: boolean;
}

export default function MobileArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // تحميل المقالات
  useEffect(() => {
    loadArticles();
  }, []);

  // تطبيق الفلترة والبحث
  useEffect(() => {
    let filtered = articles;

    // فلترة حسب الحالة
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(article => article.status === selectedFilter);
    }

    // البحث في العنوان والمحتوى
    if (searchQuery) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
  }, [articles, selectedFilter, searchQuery]);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      // محاكاة تحميل البيانات من API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockArticles: Article[] = [
        {
          id: '1',
          title: 'تطورات الذكاء الاصطناعي في 2025',
          excerpt: 'نظرة شاملة على أحدث التطورات في مجال الذكاء الاصطناعي والتعلم الآلي...',
          status: 'published',
          category: 'التقنية',
          author: 'أحمد محمد',
          publishedAt: '2025-07-27',
          updatedAt: '2025-07-27',
          views: 1250,
          likes: 45,
          comments: 12,
          readingTime: 5,
          featured: true
        },
        {
          id: '2',
          title: 'الاقتصاد السعودي في نمو مستمر',
          excerpt: 'تقرير شامل عن النمو الاقتصادي في المملكة العربية السعودية...',
          status: 'published',
          category: 'الاقتصاد',
          author: 'فاطمة أحمد',
          publishedAt: '2025-07-26',
          updatedAt: '2025-07-26',
          views: 890,
          likes: 32,
          comments: 8,
          readingTime: 7,
          featured: false
        },
        {
          id: '3',
          title: 'مسودة مقال عن التعليم الإلكتروني',
          excerpt: 'مقال قيد التحرير حول مستقبل التعليم الإلكتروني في العالم العربي...',
          status: 'draft',
          category: 'التعليم',
          author: 'محمد علي',
          publishedAt: '',
          updatedAt: '2025-07-27',
          views: 0,
          likes: 0,
          comments: 0,
          readingTime: 4,
          featured: false
        }
      ];

      setArticles(mockArticles);
    } catch (error) {
      console.error('خطأ في تحميل المقالات:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadArticles();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { color: 'bg-green-500', text: 'منشور', icon: CheckCircle },
      draft: { color: 'bg-yellow-500', text: 'مسودة', icon: FileText },
      pending: { color: 'bg-blue-500', text: 'معلق', icon: Clock },
      archived: { color: 'bg-gray-500', text: 'مؤرشف', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const filterOptions = [
    { label: 'جميع المقالات', value: 'all', icon: <FileText className="w-4 h-4" /> },
    { label: 'منشور', value: 'published', icon: <CheckCircle className="w-4 h-4" /> },
    { label: 'مسودة', value: 'draft', icon: <Edit3 className="w-4 h-4" /> },
    { label: 'معلق', value: 'pending', icon: <Clock className="w-4 h-4" /> },
    { label: 'مؤرشف', value: 'archived', icon: <AlertCircle className="w-4 h-4" /> }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            جاري تحميل المقالات...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* شريط علوي */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                إدارة المقالات
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {filteredArticles.length} مقال
              </p>
            </div>
          </div>

          <MobileButton
            size="sm"
            icon={<Plus className="w-4 h-4" />}
          >
            جديد
          </MobileButton>
        </div>

        {/* شريط البحث والفلترة */}
        <div className="px-4 pb-4">
          <MobileSearchBar
            placeholder="البحث في المقالات..."
            onSearch={setSearchQuery}
            onFilter={() => setShowFilterModal(true)}
          />
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="p-4 space-y-4">
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {filterOptions.slice(1).map((option) => {
              const count = articles.filter(a => a.status === option.value).length;
              return (
                <Card 
                  key={option.value}
                  className={`p-3 text-center cursor-pointer transition-all ${
                    selectedFilter === option.value 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : ''
                  }`}
                  onClick={() => setSelectedFilter(option.value)}
                >
                  <div className="flex flex-col items-center gap-1">
                    {option.icon}
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {count}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {option.label}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* قائمة المقالات */}
          {filteredArticles.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery ? 'لا توجد مقالات تطابق البحث' : 'لا توجد مقالات'}
              </p>
              <MobileButton size="sm">
                <Plus className="w-4 h-4 mr-2" />
                إنشاء مقال جديد
              </MobileButton>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="border-0 shadow-md bg-white dark:bg-gray-800">
                  <CardContent className="p-4">
                    {/* رأس البطاقة */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(article.status)}
                          {article.featured && (
                            <Badge variant="outline" className="text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              مميز
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {article.excerpt}
                        </p>
                      </div>

                      <MobileDropdown
                        trigger={
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        }
                        items={[
                          { label: 'تحرير', value: 'edit', icon: <Edit3 className="w-4 h-4" /> },
                          { label: 'معاينة', value: 'preview', icon: <Eye className="w-4 h-4" /> },
                          { label: 'حذف', value: 'delete', icon: <Trash2 className="w-4 h-4" /> }
                        ]}
                      />
                    </div>

                    {/* معلومات إضافية */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{article.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{article.publishedAt || article.updatedAt}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                    </div>

                    {/* إحصائيات */}
                    {article.status === 'published' && (
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{article.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{article.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{article.comments}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{article.readingTime} دقائق</span>
                        </div>
                      </div>
                    )}

                    {/* أزرار الإجراءات */}
                    <div className="flex gap-2">
                      <MobileButton
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        icon={<Edit3 className="w-4 h-4" />}
                      >
                        تحرير
                      </MobileButton>
                      
                      {article.status === 'published' && (
                        <MobileButton
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-4 h-4" />}
                        >
                          معاينة
                        </MobileButton>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* مساحة إضافية للتمرير */}
          <div className="h-20"></div>
        </div>
      </PullToRefresh>

      {/* زر إضافة مقال عائم */}
      <Button
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg z-40"
        onClick={() => console.log('إنشاء مقال جديد')}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* نافذة الفلترة */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="w-full bg-white dark:bg-gray-800 rounded-t-2xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                فلترة المقالات
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilterModal(false)}
                className="w-8 h-8 p-0"
              >
                ×
              </Button>
            </div>

            <div className="space-y-3">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedFilter === option.value ? 'default' : 'ghost'}
                  className="w-full justify-start h-12"
                  onClick={() => {
                    setSelectedFilter(option.value);
                    setShowFilterModal(false);
                  }}
                >
                  {option.icon}
                  <span className="mr-3">{option.label}</span>
                  {selectedFilter === option.value && (
                    <CheckCircle className="w-4 h-4 mr-auto" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

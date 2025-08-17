'use client';

import React, { useState, useEffect } from 'react';
import ResponsiveCard, { ResponsiveGrid } from './ResponsiveCard';
import { 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc, 
  Grid, 
  List, 
  Loader2,
  RefreshCw,
  Plus,
  Settings
} from 'lucide-react';

// أنواع الفلترة والترتيب
type SortOption = 'newest' | 'oldest' | 'most-viewed' | 'most-commented';
type ViewMode = 'grid' | 'list';
type FilterCategory = 'all' | 'news' | 'articles' | 'analysis' | 'featured';

// خصائص المقال (مطابقة للبطاقة)
interface Article {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  image?: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readingTime?: number;
  views?: number;
  comments?: number;
  category?: string;
  tags?: string[];
  featured?: boolean;
}

// خصائص مدير المحتوى
interface ResponsiveContentManagerProps {
  articles: Article[];
  loading?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  onCreateNew?: () => void;
  onArticleClick?: (article: Article) => void;
  showCreateButton?: boolean;
  showFilters?: boolean;
  showSearch?: boolean;
  className?: string;
}

export default function ResponsiveContentManager({
  articles = [],
  loading = false,
  onLoadMore,
  onRefresh,
  onCreateNew,
  onArticleClick,
  showCreateButton = true,
  showFilters = true,
  showSearch = true,
  className = ''
}: ResponsiveContentManagerProps) {
  // حالات المكون
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(articles);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // تحديث المقالات المفلترة عند تغيير المرشحات
  useEffect(() => {
    let result = [...articles];

    // البحث
    if (searchQuery.trim()) {
      result = result.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.author.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // الفلترة حسب الفئة
    if (filterCategory !== 'all') {
      result = result.filter(article => {
        switch (filterCategory) {
          case 'featured':
            return article.featured;
          case 'news':
            return article.category?.toLowerCase() === 'news' || article.category?.toLowerCase() === 'أخبار';
          case 'articles':
            return article.category?.toLowerCase() === 'articles' || article.category?.toLowerCase() === 'مقالات';
          case 'analysis':
            return article.category?.toLowerCase() === 'analysis' || article.category?.toLowerCase() === 'تحليل';
          default:
            return true;
        }
      });
    }

    // الترتيب
    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'oldest':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case 'most-viewed':
          return (b.views || 0) - (a.views || 0);
        case 'most-commented':
          return (b.comments || 0) - (a.comments || 0);
        default:
          return 0;
      }
    });

    setFilteredArticles(result);
  }, [articles, searchQuery, sortOption, filterCategory]);

  // خيارات الترتيب
  const sortOptions = [
    { value: 'newest', label: 'الأحدث أولاً', icon: SortDesc },
    { value: 'oldest', label: 'الأقدم أولاً', icon: SortAsc },
    { value: 'most-viewed', label: 'الأكثر مشاهدة', icon: SortDesc },
    { value: 'most-commented', label: 'الأكثر تفاعلاً', icon: SortDesc },
  ];

  // خيارات الفئات
  const categoryOptions = [
    { value: 'all', label: 'جميع الفئات' },
    { value: 'featured', label: 'المميزة' },
    { value: 'news', label: 'الأخبار' },
    { value: 'articles', label: 'المقالات' },
    { value: 'analysis', label: 'التحليلات' },
  ];

  return (
    <div className={`responsive-content-manager ${className}`}>
      {/* شريط الأدوات */}
      <div className="content-toolbar bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* الصف العلوي */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                إدارة المحتوى ({filteredArticles.length} عنصر)
              </h2>
              {loading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">جاري التحميل...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* زر الإنشاء */}
              {showCreateButton && (
                <button
                  onClick={onCreateNew}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">إنشاء جديد</span>
                </button>
              )}

              {/* زر التحديث */}
              <button
                onClick={onRefresh}
                className="btn btn-secondary btn-sm"
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">تحديث</span>
              </button>

              {/* زر الفلاتر للموبايل */}
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="btn btn-secondary btn-sm sm:hidden"
              >
                <Filter size={16} />
              </button>
            </div>
          </div>

          {/* شريط البحث والفلاتر */}
          <div className={`flex flex-col gap-4 ${isFiltersOpen ? 'block' : 'hidden sm:flex'}`}>
            {/* البحث */}
            {showSearch && (
              <div className="flex-1">
                <div className="search-container max-w-md">
                  <input
                    type="text"
                    placeholder="ابحث في المحتوى..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input w-full"
                  />
                  <Search className="search-icon" size={16} />
                </div>
              </div>
            )}

            {/* الفلاتر والترتيب */}
            {showFilters && (
              <div className="flex flex-col sm:flex-row gap-4">
                {/* فلتر الفئة */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* ترتيب */}
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* وضع العرض */}
                <div className="flex rounded-md border border-gray-300 overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 text-sm ${
                      viewMode === 'grid'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    title="عرض الشبكة"
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 text-sm ${
                      viewMode === 'list'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    title="عرض القائمة"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="content-area">
        {filteredArticles.length === 0 ? (
          <div className="empty-state text-center py-12">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 size={48} className="text-blue-500 animate-spin" />
                <p className="text-gray-600">جاري تحميل المحتوى...</p>
              </div>
            ) : searchQuery || filterCategory !== 'all' ? (
              <div className="flex flex-col items-center gap-4">
                <Search size={48} className="text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    لم يتم العثور على نتائج
                  </h3>
                  <p className="text-gray-600 mb-4">
                    جرب تغيير معايير البحث أو الفلتر
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterCategory('all');
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    إعادة تعيين الفلاتر
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <Settings size={48} className="text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    لا يوجد محتوى بعد
                  </h3>
                  <p className="text-gray-600 mb-4">
                    ابدأ بإنشاء أول مقال أو خبر
                  </p>
                  {showCreateButton && (
                    <button onClick={onCreateNew} className="btn btn-primary">
                      <Plus size={16} />
                      إنشاء محتوى جديد
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <ResponsiveGrid
            articles={filteredArticles}
            variant="default"
            onCardClick={onArticleClick}
            className="fade-in"
          />
        ) : (
          <div className="space-y-4 fade-in">
            {filteredArticles.map((article) => (
              <ResponsiveCard
                key={article.id}
                article={article}
                variant="list"
                onClick={() => onArticleClick?.(article)}
                className="hover:shadow-md transition-shadow"
              />
            ))}
          </div>
        )}

        {/* زر تحميل المزيد */}
        {filteredArticles.length > 0 && onLoadMore && (
          <div className="text-center mt-8">
            <button
              onClick={onLoadMore}
              disabled={loading}
              className="btn btn-secondary"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  جاري التحميل...
                </>
              ) : (
                'تحميل المزيد'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

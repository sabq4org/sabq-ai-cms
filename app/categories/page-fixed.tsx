'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Loader2, AlertCircle, Search, Grid, List, BookOpen, 
  Tag, TrendingUp, Activity, Layers
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  articles_count?: number;
}

export default function CategoriesPageFixed() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('🔄 بدء جلب التصنيفات...');
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/categories', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-cache'
      });
      
      console.log('📄 استجابة API:', {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 بيانات مستلمة:', data);

      if (data.success && Array.isArray(data.categories)) {
        const activeCategories = data.categories.filter((cat: Category) => cat.is_active);
        setCategories(activeCategories);
        console.log('✅ تم تحميل', activeCategories.length, 'تصنيف');
      } else {
        throw new Error(data.error || 'تنسيق البيانات غير صحيح');
      }
      
    } catch (error: any) {
      console.error('❌ خطأ في جلب التصنيفات:', error);
      setError(error.message || 'فشل في تحميل التصنيفات');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalArticles = categories.reduce((acc, cat) => acc + (cat.articles_count || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <Layers className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              الأقسام
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              استكشف محتوانا المنظم في تصنيفات متنوعة
            </p>

            {/* Stats */}
            {!loading && categories.length > 0 && (
              <div className="inline-flex items-center gap-6 bg-gray-50 dark:bg-gray-700 rounded-lg px-6 py-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {categories.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">قسم</div>
                </div>
                
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalArticles}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">مقال</div>
                </div>
              </div>
            )}

            {loading && (
              <div className="inline-flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري تحميل الإحصائيات...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث في الأقسام..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* View Mode */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
                <button 
                  onClick={fetchCategories}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  إعادة المحاولة
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">جاري تحميل الأقسام...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              لا توجد أقسام
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'لا توجد أقسام تطابق البحث' : 'لا توجد أقسام متاحة حالياً'}
            </p>
          </div>
        ) : (
          /* Categories Display */
          <>
            {/* Results Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {searchTerm ? 
                    `${filteredCategories.length} قسم مطابق للبحث` :
                    `${filteredCategories.length} قسم متاح`
                  }
                </span>
              </div>
            </div>

            {/* Categories Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Tag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </h3>
                      </div>
                      
                      {category.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm">{category.articles_count || 0} مقال</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {filteredCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="block"
                  >
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Tag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {category.name}
                            </h3>
                            {category.description && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {category.articles_count || 0}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">مقال</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
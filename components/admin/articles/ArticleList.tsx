/**
 * مكون محسن لعرض المقالات مع تحسين الأداء
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner, SkeletonCard } from '@/components/ui/loading';
import { useArticles } from '@/hooks/useDataFetch';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  User,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  status: 'published' | 'draft' | 'archived';
  views: number;
  category: string;
  tags: string[];
  featuredImage?: string;
}

interface ArticleListProps {
  searchable?: boolean;
  filterable?: boolean;
  pageSize?: number;
  showActions?: boolean;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  searchable = true,
  filterable = true,
  pageSize = 10,
  showActions = true
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [page, setPage] = useState(1);

  // إعداد فلاتر البحث
  const filters = useMemo(() => ({
    page,
    limit: pageSize,
    search: search.trim(),
    status: statusFilter === 'all' ? undefined : statusFilter
  }), [search, statusFilter, page, pageSize]);

  // جلب المقالات باستخدام Hook محسن
  const { data: articlesData, loading, error, refetch } = useArticles(filters);
  
  const articles = (articlesData as any)?.articles || [];
  const totalPages = Math.ceil(((articlesData as any)?.total || 0) / pageSize);

  // معالج البحث مع debounce
  const handleSearchChange = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSearch(value);
        setPage(1); // العودة للصفحة الأولى عند البحث
      }, 300);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'منشور';
      case 'draft':
        return 'مسودة';
      case 'archived':
        return 'مؤرشف';
      default:
        return 'غير محدد';
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-4">خطأ في تحميل المقالات: {error}</div>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* شريط البحث والفلاتر */}
      {(searchable || filterable) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {searchable && (
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="البحث في المقالات..."
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
              )}
              
              {filterable && (
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as any);
                      setPage(1);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="published">منشور</option>
                    <option value="draft">مسودة</option>
                    <option value="archived">مؤرشف</option>
                  </select>
                  
                  <Button onClick={refetch} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* قائمة المقالات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>المقالات ({(articlesData as any)?.total || 0})</span>
            {showActions && (
              <Link href="/admin/articles/create">
                <Button>
                  <Edit className="w-4 h-4 ml-2" />
                  مقال جديد
                </Button>
              </Link>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">لا توجد مقالات متاحة</div>
              {showActions && (
                <Link href="/admin/articles/create">
                  <Button>
                    إنشاء مقال جديد
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article: Article) => (
                <div key={article.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* صورة المقال */}
                    {article.featuredImage && (
                      <div className="flex-shrink-0">
                        <Image
                          src={article.featuredImage}
                          alt={article.title}
                          width={120}
                          height={80}
                          className="rounded-lg object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    
                    {/* محتوى المقال */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                          {article.title}
                        </h3>
                        <Badge className={`${getStatusColor(article.status)} border mr-2`}>
                          {getStatusText(article.status)}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {article.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(article.publishedAt).toLocaleDateString('ar-SA')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views.toLocaleString()} مشاهدة
                        </div>
                      </div>
                      
                      {/* العلامات */}
                      {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {article.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{article.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* الإجراءات */}
                    {showActions && (
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/articles/${article.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-blue-100"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        
                        <Link href={`/admin/articles/${article.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-purple-100"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        
                        {article.status === 'published' && (
                          <Link href={`/article/${article.id}`} target="_blank">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-green-100"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-red-100 text-red-600"
                          onClick={() => {
                            if (confirm('هل أنت متأكد من حذف هذا المقال؟')) {
                              // معالج الحذف
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* التصفح */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600">
                صفحة {page} من {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticleList;

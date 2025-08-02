/**
 * صفحة إدارة المقالات المحسنة
 * Enhanced Articles Management Page
 *
 * مثال على تطبيق نظام التصميم الموحد
 */

'use client';

import {
    Calendar,
    Clock,
    Edit,
    Eye,
    FileText,
    Globe,
    Plus,
    Trash2,
    User
} from 'lucide-react';
import { useEffect, useState } from 'react';

// استيراد المكونات الموحدة
import {
    DataTable,
    EmptyState,
    ErrorState,
    LoadingState,
    PageHeader,
    SearchAndFilterBar,
    StatsGrid
} from '@/components/design-system/DashboardComponents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// أنواع البيانات
interface Article {
  id: string;
  title: string;
  author: string;
  status: 'published' | 'draft' | 'archived';
  publishedAt?: string;
  views: number;
  category: string;
  featured: boolean;
}

interface ArticleStats {
  total: number;
  published: number;
  drafts: number;
  thisMonth: number;
}

export default function EnhancedArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<ArticleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // تحميل البيانات
  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        // محاكاة API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockArticles: Article[] = [
          {
            id: '1',
            title: 'مستقبل الذكاء الاصطناعي في التعليم',
            author: 'أحمد محمد',
            status: 'published',
            publishedAt: '2024-01-15',
            views: 1250,
            category: 'تقنية',
            featured: true
          },
          {
            id: '2',
            title: 'التطورات الحديثة في الطب النانوي',
            author: 'فاطمة أحمد',
            status: 'published',
            publishedAt: '2024-01-14',
            views: 890,
            category: 'طب',
            featured: false
          },
          {
            id: '3',
            title: 'الاستدامة البيئية والطاقة المتجددة',
            author: 'عبدالله سالم',
            status: 'draft',
            publishedAt: undefined,
            views: 0,
            category: 'بيئة',
            featured: false
          },
          {
            id: '4',
            title: 'ثورة البلوك تشين في القطاع المصرفي',
            author: 'مريم علي',
            status: 'published',
            publishedAt: '2024-01-10',
            views: 2150,
            category: 'مالية',
            featured: true
          },
          {
            id: '5',
            title: 'تأثير وسائل التواصل على الشباب',
            author: 'خالد عبدالرحمن',
            status: 'archived',
            publishedAt: '2023-12-20',
            views: 450,
            category: 'اجتماعي',
            featured: false
          }
        ];

        setArticles(mockArticles);
        setFilteredArticles(mockArticles);

        // إحصائيات
        const published = mockArticles.filter(a => a.status === 'published').length;
        const drafts = mockArticles.filter(a => a.status === 'draft').length;
        const thisMonth = mockArticles.filter(a =>
          a.publishedAt && new Date(a.publishedAt).getMonth() === new Date().getMonth()
        ).length;

        setStats({
          total: mockArticles.length,
          published,
          drafts,
          thisMonth
        });

      } catch (err) {
        setError('حدث خطأ في تحميل المقالات');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  // تصفية المقالات
  useEffect(() => {
    let filtered = articles;

    // تصفية حسب النص
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // تصفية حسب الحالة
    if (statusFilter !== 'all') {
      filtered = filtered.filter(article => article.status === statusFilter);
    }

    setFilteredArticles(filtered);
  }, [articles, searchQuery, statusFilter]);

  // معالجات الأحداث
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleEdit = (articleId: string) => {
    console.log('Edit article:', articleId);
    // التنقل إلى صفحة التحرير
  };

  const handleDelete = (articleId: string) => {
    console.log('Delete article:', articleId);
    // تأكيد الحذف
  };

  const handleView = (articleId: string) => {
    console.log('View article:', articleId);
    // فتح المقال في نافذة جديدة
  };

  const handleAddNew = () => {
    console.log('Add new article');
    // التنقل إلى صفحة إنشاء مقال جديد
  };

  const handleExport = () => {
    console.log('Export articles');
    // تصدير البيانات
  };

  const handleFilter = () => {
    console.log('Open filter menu');
    // فتح قائمة التصفية المتقدمة
  };

  // تحديد أعمدة الجدول
  const columns = [
    {
      key: 'title',
      label: 'العنوان',
      render: (value: string, item: Article) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {value}
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <User className="w-3 h-3" />
              {item.author}
            </div>
          </div>
          {item.featured && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
              مميز
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'category',
      label: 'التصنيف',
      width: '120px',
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'status',
      label: 'الحالة',
      width: '100px',
      render: (value: 'published' | 'draft' | 'archived') => {
        const variants = {
          published: { label: 'منشور', className: 'bg-green-100 text-green-800 border-green-200' },
          draft: { label: 'مسودة', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
          archived: { label: 'مؤرشف', className: 'bg-gray-100 text-gray-800 border-gray-200' }
        };
        const variant = variants[value];
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variant.className}`}>
            {variant.label}
          </span>
        );
      }
    },
    {
      key: 'publishedAt',
      label: 'تاريخ النشر',
      width: '120px',
      render: (value: string | undefined) => (
        <div className="text-sm text-gray-500">
          {value ? (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(value).toLocaleDateString('ar-SA')}
            </div>
          ) : (
            <span>غير منشور</span>
          )}
        </div>
      )
    },
    {
      key: 'views',
      label: 'المشاهدات',
      width: '100px',
      render: (value: number) => (
        <div className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {value.toLocaleString('ar')}
        </div>
      )
    }
  ];

  // معالجات الإجراءات
  const getActions = (item: Article) => [
    {
      label: 'عرض',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => handleView(item.id)
    },
    {
      label: 'تحرير',
      icon: <Edit className="w-4 h-4" />,
      onClick: () => handleEdit(item.id)
    },
    {
      label: 'حذف',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => handleDelete(item.id),
      variant: 'danger' as const
    }
  ];

  // عرض حالة التحميل
  if (loading) {
    return <LoadingState message="جاري تحميل المقالات..." />;
  }

  // عرض حالة الخطأ
  if (error) {
    return (
      <ErrorState
        title="خطأ في تحميل المقالات"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // إعداد الإحصائيات
  const statsData = stats ? [
    {
      title: 'إجمالي المقالات',
      value: stats.total,
      icon: <FileText className="w-6 h-6" />,
      color: 'blue' as const
    },
    {
      title: 'المنشورة',
      value: stats.published,
      icon: <Globe className="w-6 h-6" />,
      color: 'green' as const
    },
    {
      title: 'المسودات',
      value: stats.drafts,
      icon: <Clock className="w-6 h-6" />,
      color: 'yellow' as const
    },
    {
      title: 'هذا الشهر',
      value: stats.thisMonth,
      icon: <Calendar className="w-6 h-6" />,
      color: 'purple' as const
    }
  ] : [];

  return (
    <div className="space-y-8">
      {/* عنوان الصفحة */}
      <PageHeader
        title="إدارة المقالات"
        description="عرض وإدارة جميع المقالات في المنصة"
        breadcrumbs={[
          { label: 'الرئيسية', href: '/dashboard' },
          { label: 'المحتوى' },
          { label: 'المقالات' }
        ]}
        actions={
          <Button variant="primary" onClick={handleAddNew}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة مقال جديد
          </Button>
        }
      />

      {/* الإحصائيات */}
      {stats && (
        <section>
          <StatsGrid stats={statsData} />
        </section>
      )}

      {/* أدوات البحث والتصفية */}
      <Card className="p-6">
        <SearchAndFilterBar
          onSearch={handleSearch}
          onFilter={handleFilter}
          onExport={handleExport}
          searchPlaceholder="البحث في المقالات..."
        />

        {/* فلاتر سريعة */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-2">
            تصفية سريعة:
          </span>
          {[
            { key: 'all', label: 'الكل' },
            { key: 'published', label: 'المنشور' },
            { key: 'draft', label: 'المسودات' },
            { key: 'archived', label: 'المؤرشف' }
          ].map(filter => (
            <Button
              key={filter.key}
              variant={statusFilter === filter.key ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(filter.key)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* جدول المقالات */}
      <section>
        {filteredArticles.length === 0 && !loading ? (
          <EmptyState
            title="لا توجد مقالات"
            message={searchQuery ? 'لم يتم العثور على مقالات تطابق البحث' : 'لم يتم إنشاء أي مقالات بعد'}
            action={{
              label: 'إنشاء مقال جديد',
              onClick: handleAddNew
            }}
            icon={<FileText className="w-16 h-16" />}
          />
        ) : (
          <DataTable
            data={filteredArticles}
            columns={columns}
            actions={getActions}
            emptyMessage="لا توجد مقالات تطابق المعايير المحددة"
          />
        )}
      </section>
    </div>
  );
}

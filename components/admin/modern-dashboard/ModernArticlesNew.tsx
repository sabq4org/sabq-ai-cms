/**
 * صفحة إدارة المقالات الحديثة - التصميم الاحترافي
 * Modern Articles Management Page - Professional Design
 */

'use client';

import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import { DesignComponents } from '@/components/design-system/DesignSystemGuide';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
    ArrowUpRight,
    Clock,
    Download,
    Edit,
    Eye,
    FileText,
    Filter,
    Globe,
    Heart,
    MessageSquare,
    Plus,
    Search,
    Sparkles,
    Trash2,
    User
} from 'lucide-react';
import { useState } from 'react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  status: 'published' | 'draft' | 'pending' | 'archived';
  publishDate: Date;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
  readTime: number;
}

const articlesData: Article[] = [
  {
    id: '1',
    title: 'التطورات الاقتصادية في المملكة العربية السعودية 2025',
    excerpt: 'نظرة شاملة على أحدث التطورات الاقتصادية والاستثمارية في المملكة والفرص الواعدة للمستثمرين',
    author: 'أحمد محمد',
    category: 'اقتصاد',
    status: 'published',
    publishDate: new Date(Date.now() - 1000 * 60 * 60 * 2),
    views: 15420,
    likes: 234,
    comments: 45,
    tags: ['اقتصاد', 'استثمار', 'السعودية'],
    readTime: 8
  },
  {
    id: '2',
    title: 'مستقبل الذكاء الاصطناعي في الشرق الأوسط',
    excerpt: 'تحليل معمق لاتجاهات الذكاء الاصطناعي وتطبيقاته المستقبلية في المنطقة وأثرها على مختلف القطاعات',
    author: 'سارة أحمد',
    category: 'تقنية',
    status: 'draft',
    publishDate: new Date(),
    views: 8290,
    likes: 156,
    comments: 28,
    tags: ['ذكاء اصطناعي', 'تقنية', 'مستقبل'],
    readTime: 12
  },
  {
    id: '3',
    title: 'قمة العشرين: نتائج ومخرجات مهمة',
    excerpt: 'أبرز النتائج والقرارات التي صدرت عن قمة مجموعة العشرين وتأثيرها على الاقتصاد العالمي',
    author: 'محمد علي',
    category: 'سياسة',
    status: 'pending',
    publishDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    views: 12750,
    likes: 189,
    comments: 34,
    tags: ['سياسة', 'دولية', 'قمم'],
    readTime: 10
  },
  {
    id: '4',
    title: 'كأس العالم قطر 2022: ذكريات لا تُنسى',
    excerpt: 'مراجعة شاملة لأهم لحظات كأس العالم في قطر وأثرها على الرياضة العربية',
    author: 'فاطمة سالم',
    category: 'رياضة',
    status: 'published',
    publishDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    views: 9850,
    likes: 312,
    comments: 67,
    tags: ['كأس العالم', 'قطر', 'رياضة'],
    readTime: 6
  },
  {
    id: '5',
    title: 'الفن الرقمي: ثورة جديدة في الإبداع',
    excerpt: 'استكشاف تطور الفن الرقمي وتأثير التقنيات الحديثة على الإبداع الفني المعاصر',
    author: 'نور الدين',
    category: 'ثقافة',
    status: 'archived',
    publishDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    views: 5420,
    likes: 98,
    comments: 15,
    tags: ['فن رقمي', 'إبداع', 'ثقافة'],
    readTime: 9
  }
];

export default function ModernArticlesNew() {
  const [selectedTab, setSelectedTab] = useState('all');

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}ك`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'pending': return 'info';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'منشور';
      case 'draft': return 'مسودة';
      case 'pending': return 'في الانتظار';
      case 'archived': return 'مؤرشف';
      default: return status;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'اقتصاد': return 'blue';
      case 'تقنية': return 'purple';
      case 'سياسة': return 'red';
      case 'رياضة': return 'green';
      case 'ثقافة': return 'orange';
      default: return 'gray';
    }
  };

  const getArticleStats = () => {
    const total = articlesData.length;
    const published = articlesData.filter(article => article.status === 'published').length;
    const drafts = articlesData.filter(article => article.status === 'draft').length;
    const totalViews = articlesData.reduce((sum, article) => sum + article.views, 0);

    return { total, published, drafts, totalViews };
  };

  const stats = getArticleStats();

  const statsCards = [
    {
      title: 'إجمالي المقالات',
      value: stats.total.toString(),
      icon: FileText,
      change: '+5',
      changeType: 'increase' as const,
      color: 'blue'
    },
    {
      title: 'المقالات المنشورة',
      value: stats.published.toString(),
      icon: Globe,
      change: '+3',
      changeType: 'increase' as const,
      color: 'green'
    },
    {
      title: 'المسودات',
      value: stats.drafts.toString(),
      icon: Edit,
      change: '+1',
      changeType: 'increase' as const,
      color: 'orange'
    },
    {
      title: 'إجمالي المشاهدات',
      value: formatNumber(stats.totalViews),
      icon: Eye,
      change: '+18%',
      changeType: 'increase' as const,
      color: 'purple'
    }
  ];

  const filteredArticles = selectedTab === 'all'
    ? articlesData
    : articlesData.filter(article => article.status === selectedTab);

  return (
    <DashboardLayout
      pageTitle="إدارة المقالات"
      pageDescription="إدارة وتحرير المحتوى الإعلامي"
    >
      <div className="space-y-8 w-full max-w-none">
        {/* رسالة الترحيب الاحترافية */}
        <DesignComponents.StandardCard className="p-6 bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                إدارة المقالات
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                إنشاء وتحرير وإدارة المحتوى الإعلامي بطريقة احترافية
              </p>
              <div className="flex gap-3">
                <DesignComponents.StatusIndicator
                  status="success"
                  text={`${stats.published} مقال منشور`}
                />
                <DesignComponents.StatusIndicator
                  status="warning"
                  text={`${stats.drafts} مسودة`}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">آخر تحديث</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </DesignComponents.StandardCard>

        {/* الإحصائيات الرئيسية */}
        <div>
          <DesignComponents.SectionHeader
            title="إحصائيات المقالات"
            description="نظرة سريعة على أداء المحتوى"
            action={
              <DesignComponents.ActionBar>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 ml-2" />
                  تصفية
                </Button>
                <Button size="sm">
                  <Plus className="w-4 h-4 ml-2" />
                  مقال جديد
                </Button>
              </DesignComponents.ActionBar>
            }
          />

          <DesignComponents.DynamicGrid minItemWidth="280px" className="mb-8">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              const ChangeIcon = ArrowUpRight;
              return (
                <DesignComponents.StandardCard key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {stat.value}
                        </p>
                        <div className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                          <ChangeIcon className="w-3 h-3" />
                          {stat.change}
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center",
                      stat.color === 'blue' && "bg-blue-100 dark:bg-blue-900/30",
                      stat.color === 'green' && "bg-green-100 dark:bg-green-900/30",
                      stat.color === 'orange' && "bg-orange-100 dark:bg-orange-900/30",
                      stat.color === 'purple' && "bg-purple-100 dark:bg-purple-900/30"
                    )}>
                      <Icon className={cn(
                        "w-6 h-6",
                        stat.color === 'blue' && "text-blue-600 dark:text-blue-400",
                        stat.color === 'green' && "text-blue-600 dark:text-blue-400",
                        stat.color === 'orange' && "text-orange-600 dark:text-orange-400",
                        stat.color === 'purple' && "text-purple-600 dark:text-purple-400"
                      )} />
                    </div>
                  </div>
                </DesignComponents.StandardCard>
              );
            })}
          </DesignComponents.DynamicGrid>
        </div>

        {/* التبويبات والمقالات */}
        <div>
          <DesignComponents.SectionHeader
            title="قائمة المقالات"
            description="جميع المقالات والمحتوى المتاح"
            action={
              <DesignComponents.ActionBar>
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 ml-2" />
                  بحث
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير
                </Button>
              </DesignComponents.ActionBar>
            }
          />

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">الكل ({articlesData.length})</TabsTrigger>
              <TabsTrigger value="published">المنشور ({stats.published})</TabsTrigger>
              <TabsTrigger value="draft">المسودات ({stats.drafts})</TabsTrigger>
              <TabsTrigger value="pending">في الانتظار</TabsTrigger>
              <TabsTrigger value="archived">المؤرشف</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="space-y-4">
              <DesignComponents.DynamicGrid minItemWidth="400px">
                {filteredArticles.map((article) => (
                  <DesignComponents.StandardCard key={article.id} className="p-6 hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getStatusColor(article.status) as any}
                          className="text-xs"
                        >
                          {getStatusText(article.status)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            getCategoryColor(article.category) === 'blue' && "border-blue-200 text-blue-700 bg-blue-50",
                            getCategoryColor(article.category) === 'purple' && "border-purple-200 text-purple-700 bg-purple-50",
                            getCategoryColor(article.category) === 'red' && "border-red-200 text-red-700 bg-red-50",
                            getCategoryColor(article.category) === 'green' && "border-green-200 text-green-700 bg-green-50",
                            getCategoryColor(article.category) === 'orange' && "border-orange-200 text-orange-700 bg-orange-50"
                          )}
                        >
                          {article.category}
                        </Badge>
                      </div>
                      <DesignComponents.ActionBar>
                        <button className="text-gray-400 hover:text-blue-600 p-1">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-blue-600 p-1">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </DesignComponents.ActionBar>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{article.readTime} دقائق</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{formatNumber(article.views)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{formatNumber(article.likes)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{article.comments}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {article.publishDate.toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  </DesignComponents.StandardCard>
                ))}
              </DesignComponents.DynamicGrid>
            </TabsContent>
          </Tabs>
        </div>

        {/* رسالة النجاح */}
        <DesignComponents.StandardCard className="p-6 bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                محتوى غني ومتنوع!
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                مكتبة مقالات شاملة تغطي مختلف المواضيع بجودة عالية
              </p>
            </div>
            <DesignComponents.StatusIndicator status="success" text="محتوى متميز" />
          </div>
        </DesignComponents.StandardCard>
      </div>
    </DashboardLayout>
  );
}

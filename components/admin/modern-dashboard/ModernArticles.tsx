/**
 * صفحة إدارة المقالات الحديثة
 * Modern Articles Management Page
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Share2,
  Calendar,
  User,
  Heart,
  MessageSquare,
  TrendingUp,
  FileText,
  Image,
  Clock,
  Globe,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  image?: string;
  tags: string[];
  readTime: number;
}

const articlesData: Article[] = [
  {
    id: '1',
    title: 'التطورات الاقتصادية في المملكة العربية السعودية 2025',
    excerpt: 'نظرة شاملة على أحدث التطورات الاقتصادية والاستثمارية في المملكة...',
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
    excerpt: 'تحليل معمق لاتجاهات الذكاء الاصطناعي وتطبيقاته المستقبلية...',
    author: 'سارة أحمد',
    category: 'تقنية',
    status: 'draft',
    publishDate: new Date(),
    views: 0,
    likes: 0,
    comments: 0,
    tags: ['ذكاء اصطناعي', 'تقنية', 'مستقبل'],
    readTime: 12
  },
  {
    id: '3',
    title: 'قمة العشرين: نتائج ومخرجات مهمة',
    excerpt: 'أبرز النتائج والقرارات التي صدرت عن قمة مجموعة العشرين...',
    author: 'محمد علي',
    category: 'سياسة',
    status: 'pending',
    publishDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    views: 8750,
    likes: 167,
    comments: 23,
    tags: ['سياسة', 'دولية', 'قمم'],
    readTime: 6
  }
];

export default function ModernArticles() {
  const [articles, setArticles] = useState(articlesData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const getStatusColor = (status: Article['status']) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'archived': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: Article['status']) => {
    switch (status) {
      case 'published': return 'منشور';
      case 'draft': return 'مسودة';
      case 'pending': return 'قيد المراجعة';
      case 'archived': return 'مؤرشف';
      default: return status;
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || article.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}ك`;
    }
    return num.toString();
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `منذ ${days} يوم`;
    if (hours > 0) return `منذ ${hours} ساعة`;
    if (minutes > 0) return `منذ ${minutes} دقيقة`;
    return 'الآن';
  };

  return (
    <DashboardLayout 
      pageTitle="إدارة المقالات"
      pageDescription="إنشاء وإدارة المحتوى الإعلامي والمقالات"
    >
      <div className="space-y-6">
        {/* شريط الأدوات العلوي */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              مقال جديد
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              تصفية
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="البحث في المقالات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: 'إجمالي المقالات', value: articles.length.toString(), icon: FileText, color: 'blue' },
            { title: 'منشورة', value: articles.filter(a => a.status === 'published').length.toString(), icon: Globe, color: 'green' },
            { title: 'مسودات', value: articles.filter(a => a.status === 'draft').length.toString(), icon: Edit, color: 'gray' },
            { title: 'قيد المراجعة', value: articles.filter(a => a.status === 'pending').length.toString(), icon: Clock, color: 'yellow' }
          ].map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={cn(
                    "h-8 w-8",
                    stat.color === 'blue' && "text-blue-500",
                    stat.color === 'green' && "text-green-500",
                    stat.color === 'gray' && "text-gray-500",
                    stat.color === 'yellow' && "text-yellow-500"
                  )} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* التبويبات والمحتوى */}
        <Tabs defaultValue="list">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">قائمة المقالات</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {/* فلاتر */}
            <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="space-y-2">
                <Label className="text-sm">التصنيف</Label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">جميع التصنيفات</option>
                  <option value="اقتصاد">اقتصاد</option>
                  <option value="تقنية">تقنية</option>
                  <option value="سياسة">سياسة</option>
                  <option value="رياضة">رياضة</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">الحالة</Label>
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="published">منشور</option>
                  <option value="draft">مسودة</option>
                  <option value="pending">قيد المراجعة</option>
                  <option value="archived">مؤرشف</option>
                </select>
              </div>
            </div>

            {/* قائمة المقالات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
                  {/* صورة المقال */}
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image className="h-12 w-12 text-blue-500/50" />
                    </div>
                    <Badge className={cn("absolute top-3 right-3", getStatusColor(article.status))}>
                      {getStatusText(article.status)}
                    </Badge>
                  </div>

                  <CardContent className="p-4">
                    {/* العنوان والوصف */}
                    <div className="space-y-2 mb-3">
                      <h3 className="font-semibold line-clamp-2 text-lg leading-tight">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>

                    {/* التصنيف والعلامات */}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {article.category}
                      </Badge>
                      {article.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* معلومات المؤلف والتاريخ */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>{getTimeAgo(article.publishDate)}</span>
                      </div>
                    </div>

                    {/* إحصائيات التفاعل */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{formatNumber(article.views)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{formatNumber(article.likes)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{article.comments}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{article.readTime} دقائق</span>
                      </div>
                    </div>

                    {/* أزرار الإجراءات */}
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        تحرير
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            مشاركة
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Star className="h-4 w-4 mr-2" />
                            إضافة لمميز
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>أداء المقالات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {articles.slice(0, 5).map((article) => (
                      <div key={article.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium text-sm line-clamp-1">{article.title}</p>
                          <p className="text-xs text-gray-500">{formatNumber(article.views)} مشاهدة</p>
                        </div>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>أشهر التصنيفات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['اقتصاد', 'تقنية', 'سياسة', 'رياضة'].map((category) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm">{category}</span>
                        <Badge variant="secondary">
                          {articles.filter(a => a.category === category).length}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات المحتوى</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>التصنيف الافتراضي</Label>
                    <select className="w-full p-2 border rounded-lg">
                      <option>عام</option>
                      <option>اقتصاد</option>
                      <option>تقنية</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>حالة النشر الافتراضية</Label>
                    <select className="w-full p-2 border rounded-lg">
                      <option>مسودة</option>
                      <option>قيد المراجعة</option>
                      <option>منشور</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

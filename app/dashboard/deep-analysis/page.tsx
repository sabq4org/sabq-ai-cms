'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, Sparkles, FileText, BarChart3, Search, Filter, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeepAnalysis {
  id: string;
  title: string;
  status: 'published' | 'draft' | 'editing' | 'analyzing';
  source: 'manual' | 'gpt' | 'hybrid';
  rating: number;
  author: string;
  categories: string[];
  articleId?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  shares: number;
}

const statusLabels = {
  published: { label: 'منشور', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  draft: { label: 'مسودة', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' },
  editing: { label: 'تحت التحرير', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
  analyzing: { label: 'قيد التحليل', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' }
};

const sourceIcons = {
  manual: FileText,
  gpt: Sparkles,
  hybrid: BarChart3
};

// بيانات تجريبية
const mockAnalyses: DeepAnalysis[] = [
  {
    id: '1',
    title: 'تحليل تأثير الذكاء الاصطناعي على سوق العمل السعودي',
    status: 'published',
    source: 'gpt',
    rating: 4.8,
    author: 'محمد الأحمد',
    categories: ['تقنية', 'اقتصاد'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    views: 1250,
    shares: 45
  },
  {
    id: '2',
    title: 'الآثار الاقتصادية لرؤية 2030 على القطاع الخاص',
    status: 'analyzing',
    source: 'hybrid',
    rating: 0,
    author: 'سارة العتيبي',
    categories: ['اقتصاد', 'سياسة'],
    createdAt: '2024-01-14T15:30:00Z',
    updatedAt: '2024-01-14T15:30:00Z',
    views: 0,
    shares: 0
  },
  {
    id: '3',
    title: 'دراسة معمقة: تحول الطاقة في المملكة',
    status: 'draft',
    source: 'manual',
    rating: 4.2,
    author: 'عبدالله الشمري',
    categories: ['بيئة', 'اقتصاد'],
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-14T11:20:00Z',
    views: 320,
    shares: 12
  }
];

export default function DeepAnalysisPage() {
  const [analyses, setAnalyses] = useState<DeepAnalysis[]>(mockAnalyses);
  const [loading, setLoading] = useState(false);
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    status: '',
    source: '',
    category: ''
  });

  useEffect(() => {
    // في الإنتاج، سيتم جلب البيانات من API
    // fetchAnalyses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التحليل؟')) return;
    setAnalyses(analyses.filter(a => a.id !== id));
  };

  const handleSelectAll = () => {
    if (selectedAnalyses.length === filteredAnalyses.length) {
      setSelectedAnalyses([]);
    } else {
      setSelectedAnalyses(filteredAnalyses.map(a => a.id));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedAnalyses.includes(id)) {
      setSelectedAnalyses(selectedAnalyses.filter(sid => sid !== id));
    } else {
      setSelectedAnalyses([...selectedAnalyses, id]);
    }
  };

  const filteredAnalyses = analyses.filter(analysis => {
    if (searchTerm && !analysis.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filter.status && analysis.status !== filter.status) return false;
    if (filter.source && analysis.source !== filter.source) return false;
    if (filter.category && !analysis.categories.some(cat => cat.toLowerCase().includes(filter.category.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            التحليل العميق
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            إدارة التحليلات الاستراتيجية والرؤى المعمقة
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/deep-analysis/settings">
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              الإعدادات
            </Button>
          </Link>
          <Link href="/dashboard/deep-analysis/create">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              تحليل جديد
            </Button>
          </Link>
        </div>
      </div>

      {/* فلاتر البحث */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="البحث في التحليلات..."
                  className="w-full pr-10 pl-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <select
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">جميع الحالات</option>
              <option value="published">منشور</option>
              <option value="draft">مسودة</option>
              <option value="editing">تحت التحرير</option>
              <option value="analyzing">قيد التحليل</option>
            </select>

            <select
              className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
              value={filter.source}
              onChange={(e) => setFilter({ ...filter, source: e.target.value })}
            >
              <option value="">جميع المصادر</option>
              <option value="manual">يدوي</option>
              <option value="gpt">ذكاء اصطناعي</option>
              <option value="hybrid">مزيج</option>
            </select>

            <Button
              variant="outline"
              onClick={() => setFilter({ status: '', source: '', category: '' })}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              مسح الفلاتر
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* جدول التحليلات */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">جاري تحميل التحليلات...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                  <tr>
                    <th className="p-4 text-right">
                      <input
                        type="checkbox"
                        checked={selectedAnalyses.length === filteredAnalyses.length && filteredAnalyses.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="p-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">العنوان</th>
                    <th className="p-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">الحالة</th>
                    <th className="p-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">المصدر</th>
                    <th className="p-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">الكاتب</th>
                    <th className="p-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">التصنيفات</th>
                    <th className="p-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">الإحصائيات</th>
                    <th className="p-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">التاريخ</th>
                    <th className="p-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAnalyses.map((analysis) => {
                    const Icon = sourceIcons[analysis.source];
                    return (
                      <tr key={analysis.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedAnalyses.includes(analysis.id)}
                            onChange={() => handleSelect(analysis.id)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Icon 
                              size={16} 
                              className={cn(
                                analysis.source === 'gpt' && 'text-purple-500',
                                analysis.source === 'manual' && 'text-gray-500',
                                analysis.source === 'hybrid' && 'text-blue-500'
                              )}
                            />
                            <Link 
                              href={`/dashboard/deep-analysis/${analysis.id}`} 
                              className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
                            >
                              {analysis.title}
                            </Link>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={statusLabels[analysis.status].color}>
                            {statusLabels[analysis.status].label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {analysis.source === 'manual' && 'يدوي'}
                            {analysis.source === 'gpt' && 'ذكاء اصطناعي'}
                            {analysis.source === 'hybrid' && 'مزيج'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {analysis.author}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 flex-wrap">
                            {analysis.categories.map((cat, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span>{analysis.views} قراءة</span>
                            <span className="mx-2">·</span>
                            <span>{analysis.shares} مشاركة</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(analysis.createdAt).toLocaleDateString('ar-SA')}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Link href={`/dashboard/deep-analysis/${analysis.id}`}>
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/deep-analysis/${analysis.id}/edit`}>
                              <Button size="sm" variant="ghost">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(analysis.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredAnalyses.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">لا توجد تحليلات تطابق معايير البحث</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* إجراءات جماعية */}
      {selectedAnalyses.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {selectedAnalyses.length} عنصر محدد
          </span>
          <Button variant="outline" size="sm">
            نشر المحدد
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            حذف المحدد
          </Button>
        </div>
      )}
    </div>
  );
} 
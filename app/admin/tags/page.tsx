/**
 * صفحة العلامات
 * Tags Management Page
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// تم إزالة DashboardLayout - تستخدم الصفحة layout.tsx الأساسي
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  Hash,
  FileText
} from 'lucide-react';

interface TagData {
  id: string;
  name: string;
  slug: string;
  articlesCount: number;
  color: string;
  isPopular: boolean;
  createdAt: string;
}

const tagsData: TagData[] = [
  {
    id: '1',
    name: 'أخبار عاجلة',
    slug: 'breaking-news',
    articlesCount: 234,
    color: 'red',
    isPopular: true,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'رؤية 2030',
    slug: 'vision-2030',
    articlesCount: 189,
    color: 'green',
    isPopular: true,
    createdAt: '2024-01-02'
  },
  {
    id: '3',
    name: 'تقنية',
    slug: 'technology',
    articlesCount: 156,
    color: 'blue',
    isPopular: true,
    createdAt: '2024-01-03'
  },
  {
    id: '4',
    name: 'الذكاء الاصطناعي',
    slug: 'artificial-intelligence',
    articlesCount: 134,
    color: 'purple',
    isPopular: true,
    createdAt: '2024-01-04'
  },
  {
    id: '5',
    name: 'صحة',
    slug: 'health',
    articlesCount: 98,
    color: 'pink',
    isPopular: false,
    createdAt: '2024-01-05'
  },
  {
    id: '6',
    name: 'تعليم',
    slug: 'education',
    articlesCount: 87,
    color: 'orange',
    isPopular: false,
    createdAt: '2024-01-06'
  }
];

export default function TagsPage() {
  const [tags, setTags] = useState(tagsData);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'bg-red-100 text-red-700 border-red-200';
      case 'green': return 'bg-green-100 text-green-700 border-green-200';
      case 'blue': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'purple': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'pink': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'orange': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const sortedTags = [...filteredTags].sort((a, b) => b.articlesCount - a.articlesCount);

  return (
    <div className="space-y-6">
        {/* شريط الأدوات العلوي */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              علامة جديدة
            </Button>
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              العلامات الشائعة
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="البحث في العلامات..."
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
            { title: 'إجمالي العلامات', value: tags.length.toString(), icon: Tag },
            { title: 'العلامات الشائعة', value: tags.filter(t => t.isPopular).length.toString(), icon: Star },
            { title: 'إجمالي المقالات', value: tags.reduce((sum, t) => sum + t.articlesCount, 0).toString(), icon: FileText },
            { title: 'متوسط المقالات', value: Math.round(tags.reduce((sum, t) => sum + t.articlesCount, 0) / tags.length).toString(), icon: Hash }
          ].map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* العلامات الشائعة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              العلامات الأكثر استخداماً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sortedTags.slice(0, 10).map((tag) => (
                <Badge 
                  key={tag.id} 
                  className={`${getColorClass(tag.color)} text-sm py-2 px-3 cursor-pointer hover:shadow-md transition-all`}
                >
                  <Hash className="h-3 w-3 mr-1" />
                  {tag.name}
                  <span className="mr-2 text-xs opacity-75">({tag.articlesCount})</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* قائمة العلامات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTags.map((tag) => (
            <Card key={tag.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* اسم العلامة */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-500" />
                      <h3 className="font-semibold text-lg">{tag.name}</h3>
                      {tag.isPopular && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Slug */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                    {tag.slug}
                  </p>

                  {/* اللون */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getColorClass(tag.color)}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 bg-current`} />
                    {tag.color}
                  </div>

                  {/* إحصائيات */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>{tag.articlesCount} مقال</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(tag.createdAt).toLocaleDateString('ar-SA')}
                    </div>
                  </div>

                  {/* شريط التقدم */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((tag.articlesCount / Math.max(...tags.map(t => t.articlesCount))) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* إضافة علامة جديدة */}
        <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
          <CardContent className="p-8 text-center">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium">إضافة علامة جديدة</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  قم بإنشاء علامة جديدة لتصنيف المحتوى
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                إنشاء علامة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

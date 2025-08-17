/**
 * صفحة البيانات الخارجية
 * External Data Management Page
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// تم إزالة DashboardLayout - تستخدم الصفحة layout.tsx الأساسي
import {
  Globe,
  Plus,
  Search,
  Settings,
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface DataSource {
  id: string;
  name: string;
  type: 'RSS' | 'API' | 'CSV' | 'JSON';
  url: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: string;
  recordsCount: number;
  description: string;
}

const dataSourcesData: DataSource[] = [
  {
    id: '1',
    name: 'وكالة الأنباء السعودية',
    type: 'RSS',
    url: 'https://www.spa.gov.sa/rss.xml',
    status: 'active',
    lastSync: '2024-01-26T10:30:00Z',
    recordsCount: 1247,
    description: 'تغذية رسمية من وكالة الأنباء السعودية'
  },
  {
    id: '2',
    name: 'بيانات الطقس',
    type: 'API',
    url: 'https://api.weather.com/saudi',
    status: 'active',
    lastSync: '2024-01-26T10:25:00Z',
    recordsCount: 856,
    description: 'بيانات الطقس والمناخ للمملكة'
  },
  {
    id: '3',
    name: 'أسعار النفط',
    type: 'JSON',
    url: 'https://api.oilprices.com/live',
    status: 'error',
    lastSync: '2024-01-26T09:15:00Z',
    recordsCount: 324,
    description: 'أسعار النفط العالمية'
  },
  {
    id: '4',
    name: 'الأسهم السعودية',
    type: 'CSV',
    url: 'https://tadawul.com.sa/data/stocks.csv',
    status: 'inactive',
    lastSync: '2024-01-25T16:00:00Z',
    recordsCount: 195,
    description: 'بيانات الأسهم من السوق المالية السعودية'
  }
];

export default function ExternalDataPage() {
  const [dataSources, setDataSources] = useState(dataSourcesData);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSources = dataSources.filter(source =>
    source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'error': return AlertCircle;
      case 'inactive': return Clock;
      default: return Database;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'inactive': return 'text-gray-500';
      default: return 'text-blue-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-700">نشط</Badge>;
      case 'error': return <Badge variant="destructive">خطأ</Badge>;
      case 'inactive': return <Badge variant="secondary">معطل</Badge>;
      default: return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'RSS': return Wifi;
      case 'API': return Globe;
      case 'CSV': return Download;
      case 'JSON': return Database;
      default: return Database;
    }
  };

  return (
    <div className="space-y-6">
        {/* شريط الأدوات العلوي */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              مصدر جديد
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              مزامنة الكل
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              إعدادات التكامل
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="البحث في المصادر..."
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
            { title: 'إجمالي المصادر', value: dataSources.length.toString(), icon: Database },
            { title: 'نشط', value: dataSources.filter(s => s.status === 'active').length.toString(), icon: CheckCircle },
            { title: 'يحتاج إصلاح', value: dataSources.filter(s => s.status === 'error').length.toString(), icon: AlertCircle },
            { title: 'إجمالي السجلات', value: dataSources.reduce((sum, s) => sum + s.recordsCount, 0).toString(), icon: Download }
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

        {/* قائمة مصادر البيانات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSources.map((source) => {
            const StatusIcon = getStatusIcon(source.status);
            const TypeIcon = getTypeIcon(source.type);
            
            return (
              <Card key={source.id} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* اسم المصدر والحالة */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <TypeIcon className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{source.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {source.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(source.status)}
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(source.status)}`} />
                      </div>
                    </div>

                    {/* الوصف */}
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {source.description}
                    </p>

                    {/* الرابط */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <code className="text-xs text-gray-600 dark:text-gray-400 break-all">
                        {source.url}
                      </code>
                    </div>

                    {/* الإحصائيات */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">آخر مزامنة:</span>
                        <p className="font-medium">
                          {new Date(source.lastSync).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">عدد السجلات:</span>
                        <p className="font-medium">{source.recordsCount.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* الإجراءات */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-4 w-4 mr-1" />
                          مزامنة
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-1" />
                          إعدادات
                        </Button>
                      </div>
                      <Button size="sm" variant="outline">
                        عرض البيانات
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* إضافة مصدر جديد */}
        <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
          <CardContent className="p-8 text-center">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium">إضافة مصدر بيانات جديد</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  قم بربط مصدر بيانات خارجي جديد
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                إضافة مصدر
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

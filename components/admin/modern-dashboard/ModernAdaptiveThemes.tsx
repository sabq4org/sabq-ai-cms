/**
 * صفحة إدارة السمات التكيفية الحديثة
 * Modern Adaptive Themes Management Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import {
  Palette,
  Eye,
  Download,
  Upload,
  Settings,
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle,
  AlertTriangle,
  Star,
  Brush,
  Sun,
  Moon,
  Contrast,
  Type,
  Layout,
  Zap,
  Shield,
  Globe,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

// بيانات السمات الوهمية
const themesData = [
  {
    id: 'modern-light',
    name: 'حديث فاتح',
    name_ar: 'حديث فاتح',
    description: 'سمة حديثة ونظيفة مع ألوان فاتحة',
    category: 'light',
    isActive: true,
    isDefault: true,
    rating: 4.8,
    downloads: 1247,
    preview: '/themes/modern-light.jpg',
    colors: {
      primary: '#3B82F6',
      secondary: '#64748B',
      background: '#FFFFFF',
      surface: '#F8FAFC'
    },
    performance: {
      size: '45 KB',
      loadTime: '120ms',
      score: 95
    },
    accessibility: {
      contrast: 'AA',
      score: 92
    }
  },
  {
    id: 'modern-dark',
    name: 'حديث مظلم',
    name_ar: 'حديث مظلم',
    description: 'سمة مظلمة أنيقة مريحة للعين',
    category: 'dark',
    isActive: false,
    isDefault: false,
    rating: 4.6,
    downloads: 892,
    preview: '/themes/modern-dark.jpg',
    colors: {
      primary: '#60A5FA',
      secondary: '#94A3B8',
      background: '#0F172A',
      surface: '#1E293B'
    },
    performance: {
      size: '47 KB',
      loadTime: '135ms',
      score: 93
    },
    accessibility: {
      contrast: 'AAA',
      score: 96
    }
  },
  {
    id: 'news-premium',
    name: 'إخباري مميز',
    name_ar: 'إخباري مميز',
    description: 'سمة مخصصة للمواقع الإخبارية',
    category: 'news',
    isActive: false,
    isDefault: false,
    rating: 4.9,
    downloads: 1567,
    preview: '/themes/news-premium.jpg',
    colors: {
      primary: '#DC2626',
      secondary: '#7F1D1D',
      background: '#FFFFFF',
      surface: '#FEF2F2'
    },
    performance: {
      size: '52 KB',
      loadTime: '145ms',
      score: 89
    },
    accessibility: {
      contrast: 'AA',
      score: 88
    }
  }
];

export default function ModernAdaptiveThemes() {
  const [selectedTheme, setSelectedTheme] = useState(themesData[0]);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('gallery');

  // فلترة السمات حسب البحث
  const filteredThemes = themesData.filter(theme =>
    theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    theme.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout 
      pageTitle="السمات التكيفية"
      pageDescription="إدارة وتخصيص مظهر الموقع مع التكيف الذكي"
    >
      <div className="space-y-6">
        {/* شريط الأدوات العلوي */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              سمة جديدة
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              استيراد
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              تصدير
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="البحث في السمات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: 'السمات المتاحة', value: '12', icon: Palette, color: 'blue' },
            { title: 'السمة النشطة', value: 'حديث فاتح', icon: CheckCircle, color: 'green' },
            { title: 'معدل الأداء', value: '94%', icon: Zap, color: 'yellow' },
            { title: 'درجة الوصول', value: '92/100', icon: Shield, color: 'purple' }
          ].map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={cn(
                    "h-8 w-8",
                    stat.color === 'blue' && "text-blue-500",
                    stat.color === 'green' && "text-green-500",
                    stat.color === 'yellow' && "text-yellow-500",
                    stat.color === 'purple' && "text-purple-500"
                  )} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* التبويبات الرئيسية */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gallery">معرض السمات</TabsTrigger>
            <TabsTrigger value="preview">المعاينة</TabsTrigger>
            <TabsTrigger value="customizer">التخصيص</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          </TabsList>

          {/* معرض السمات */}
          <TabsContent value="gallery" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredThemes.map((theme) => (
                <Card 
                  key={theme.id} 
                  className={cn(
                    "relative overflow-hidden cursor-pointer transition-all duration-200",
                    "hover:shadow-lg hover:scale-105",
                    theme.isActive && "ring-2 ring-blue-500"
                  )}
                  onClick={() => setSelectedTheme(theme)}
                >
                  {theme.isActive && (
                    <Badge className="absolute top-3 right-3 z-10 bg-blue-600">
                      نشط
                    </Badge>
                  )}
                  
                  {/* معاينة السمة */}
                  <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 relative">
                    <div className="absolute inset-0 p-4">
                      <div className="w-full h-full rounded-lg" style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                      }}>
                        <div className="p-3">
                          <div className="w-full h-2 bg-white/30 rounded mb-2"></div>
                          <div className="w-3/4 h-2 bg-white/30 rounded mb-2"></div>
                          <div className="w-1/2 h-2 bg-white/30 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{theme.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{theme.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {theme.description}
                    </p>

                    <div className="flex justify-between items-center mb-3">
                      <Badge variant="outline" className="text-xs">
                        {theme.category === 'light' && 'فاتح'}
                        {theme.category === 'dark' && 'مظلم'}
                        {theme.category === 'news' && 'إخباري'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {theme.downloads} تحميل
                      </span>
                    </div>

                    {/* مؤشرات الأداء */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>الأداء</span>
                        <span className="font-medium">{theme.performance.score}%</span>
                      </div>
                      <Progress value={theme.performance.score} className="h-1" />
                      
                      <div className="flex justify-between text-xs">
                        <span>الوصول</span>
                        <span className="font-medium">{theme.accessibility.score}%</span>
                      </div>
                      <Progress value={theme.accessibility.score} className="h-1" />
                    </div>

                    {/* أزرار الإجراءات */}
                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        variant={theme.isActive ? "secondary" : "default"}
                      >
                        {theme.isActive ? 'نشط' : 'تفعيل'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* المعاينة */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>معاينة السمة: {selectedTheme.name}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      اختبر السمة على أجهزة مختلفة
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewDevice('mobile')}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewDevice('tablet')}
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPreviewDevice('desktop')}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg p-4 transition-all duration-300",
                  previewDevice === 'mobile' && "max-w-sm",
                  previewDevice === 'tablet' && "max-w-2xl",
                  previewDevice === 'desktop' && "max-w-full"
                )}>
                  <div 
                    className="w-full h-96 rounded-lg p-6"
                    style={{ backgroundColor: selectedTheme.colors.background }}
                  >
                    <div className="space-y-4">
                      <div 
                        className="h-12 rounded-lg flex items-center px-4"
                        style={{ backgroundColor: selectedTheme.colors.primary }}
                      >
                        <div className="w-8 h-8 bg-white/20 rounded-full mr-3"></div>
                        <div className="text-white font-semibold">سبق الذكية</div>
                      </div>
                      
                      <div 
                        className="p-4 rounded-lg"
                        style={{ backgroundColor: selectedTheme.colors.surface }}
                      >
                        <div className="w-3/4 h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="w-1/2 h-4 bg-gray-300 rounded mb-4"></div>
                        <div className="space-y-2">
                          <div className="w-full h-3 bg-gray-200 rounded"></div>
                          <div className="w-5/6 h-3 bg-gray-200 rounded"></div>
                          <div className="w-4/6 h-3 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* التخصيص */}
          <TabsContent value="customizer" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">إعدادات الألوان</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(selectedTheme.colors).map(([key, color]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="text-sm">
                          {key === 'primary' && 'اللون الأساسي'}
                          {key === 'secondary' && 'اللون الثانوي'}
                          {key === 'background' && 'الخلفية'}
                          {key === 'surface' && 'السطح'}
                        </Label>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-lg border-2 border-gray-200"
                            style={{ backgroundColor: color }}
                          ></div>
                          <Input 
                            value={color} 
                            className="w-20 text-xs"
                            onChange={() => {}}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">إعدادات الخط</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>الخط الأساسي</Label>
                      <select className="w-full p-2 border rounded-lg">
                        <option>Cairo</option>
                        <option>Tajawal</option>
                        <option>Amiri</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>حجم الخط الأساسي</Label>
                      <Input type="range" min="12" max="20" defaultValue="16" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">معاينة مباشرة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="w-full h-96 rounded-lg p-6 transition-all duration-300"
                      style={{ backgroundColor: selectedTheme.colors.background }}
                    >
                      {/* محتوى المعاينة المباشرة */}
                      <div className="space-y-4">
                        <h1 
                          className="text-2xl font-bold"
                          style={{ color: selectedTheme.colors.primary }}
                        >
                          عنوان رئيسي
                        </h1>
                        <div 
                          className="p-4 rounded-lg"
                          style={{ backgroundColor: selectedTheme.colors.surface }}
                        >
                          <p className="text-gray-700 dark:text-gray-300">
                            هذا نص تجريبي لمعاينة شكل المحتوى مع السمة المختارة.
                            يمكنك رؤية كيف تبدو الألوان والخطوط معاً.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* التحليلات */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">أداء السمات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {themesData.map((theme) => (
                      <div key={theme.id} className="flex justify-between items-center">
                        <span className="text-sm">{theme.name}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={theme.performance.score} className="w-16 h-2" />
                          <span className="text-sm font-medium">{theme.performance.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">إمكانية الوصول</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {themesData.map((theme) => (
                      <div key={theme.id} className="flex justify-between items-center">
                        <span className="text-sm">{theme.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={theme.accessibility.score >= 90 ? 'default' : 'secondary'}>
                            {theme.accessibility.contrast}
                          </Badge>
                          <span className="text-sm font-medium">{theme.accessibility.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">إحصائيات الاستخدام</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {themesData.map((theme) => (
                      <div key={theme.id} className="flex justify-between items-center">
                        <span className="text-sm">{theme.name}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">{theme.downloads}</div>
                          <div className="text-xs text-gray-500">تحميل</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

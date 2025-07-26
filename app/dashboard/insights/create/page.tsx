/**
 * صفحة إنشاء تحليل عميق جديد
 * Deep Analysis Creation Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import {
  BarChart3,
  Brain,
  Save,
  Eye,
  TrendingUp,
  Users,
  Calendar,
  Tag,
  FileText,
  Activity,
  Target,
  Zap,
  Globe,
  MessageSquare,
  Heart,
  Share2,
  Clock,
  Settings,
  Database,
  Filter,
  Search,
  Download,
  Upload
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AnalysisData {
  title: string;
  description: string;
  dataSource: string;
  timeRange: string;
  analysisType: string;
  keywords: string[];
  categories: string[];
  isPublic: boolean;
  autoUpdate: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metrics: string[];
  filters: {
    minViews: number;
    minEngagement: number;
    dateFrom: string;
    dateTo: string;
  };
}

const analysisTypes = [
  { value: 'sentiment', label: 'تحليل المشاعر', icon: Heart, color: 'text-red-500' },
  { value: 'engagement', label: 'تحليل التفاعل', icon: Activity, color: 'text-blue-500' },
  { value: 'trending', label: 'تحليل الاتجاهات', icon: TrendingUp, color: 'text-green-500' },
  { value: 'audience', label: 'تحليل الجمهور', icon: Users, color: 'text-purple-500' },
  { value: 'content', label: 'تحليل المحتوى', icon: FileText, color: 'text-orange-500' },
  { value: 'performance', label: 'تحليل الأداء', icon: Target, color: 'text-cyan-500' }
];

const dataSources = [
  { value: 'articles', label: 'المقالات والأخبار' },
  { value: 'social', label: 'وسائل التواصل الاجتماعي' },
  { value: 'comments', label: 'التعليقات' },
  { value: 'analytics', label: 'Google Analytics' },
  { value: 'was', label: 'وكالة الأنباء السعودية' },
  { value: 'all', label: 'جميع المصادر' }
];

const availableMetrics = [
  { value: 'views', label: 'المشاهدات', icon: Eye },
  { value: 'likes', label: 'الإعجابات', icon: Heart },
  { value: 'shares', label: 'المشاركات', icon: Share2 },
  { value: 'comments', label: 'التعليقات', icon: MessageSquare },
  { value: 'engagement_rate', label: 'معدل التفاعل', icon: Activity },
  { value: 'bounce_rate', label: 'معدل الارتداد', icon: Target },
  { value: 'time_on_page', label: 'الوقت في الصفحة', icon: Clock },
  { value: 'click_through', label: 'معدل النقر', icon: TrendingUp }
];

export default function CreateDeepAnalysisPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  
  const [analysisData, setAnalysisData] = useState<AnalysisData>({
    title: '',
    description: '',
    dataSource: 'all',
    timeRange: '30',
    analysisType: 'engagement',
    keywords: [],
    categories: [],
    isPublic: false,
    autoUpdate: true,
    priority: 'medium',
    metrics: ['views', 'likes', 'shares', 'engagement_rate'],
    filters: {
      minViews: 100,
      minEngagement: 1,
      dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0]
    }
  });

  const handleInputChange = (field: keyof AnalysisData, value: any) => {
    setAnalysisData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterChange = (field: keyof AnalysisData['filters'], value: any) => {
    setAnalysisData(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [field]: value
      }
    }));
  };

  const handleAddKeyword = () => {
    if (currentKeyword.trim() && !analysisData.keywords.includes(currentKeyword.trim())) {
      setAnalysisData(prev => ({
        ...prev,
        keywords: [...prev.keywords, currentKeyword.trim()]
      }));
      setCurrentKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setAnalysisData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleAddCategory = () => {
    if (currentCategory.trim() && !analysisData.categories.includes(currentCategory.trim())) {
      setAnalysisData(prev => ({
        ...prev,
        categories: [...prev.categories, currentCategory.trim()]
      }));
      setCurrentCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setAnalysisData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  const handleMetricToggle = (metric: string) => {
    setAnalysisData(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metric)
        ? prev.metrics.filter(m => m !== metric)
        : [...prev.metrics, metric]
    }));
  };

  const handleCreateAnalysis = async () => {
    if (!analysisData.title.trim()) {
      toast.error('يرجى إدخال عنوان للتحليل');
      return;
    }

    setIsLoading(true);
    try {
      // محاكاة إنشاء التحليل
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('تم إنشاء التحليل العميق بنجاح!');
      
      // إعادة توجيه إلى صفحة التحليلات
      setTimeout(() => {
        router.push('/dashboard/insights');
      }, 1500);
      
    } catch (error) {
      toast.error('حدث خطأ أثناء إنشاء التحليل');
    } finally {
      setIsLoading(false);
    }
  };

  const previewAnalysis = () => {
    toast.success('سيتم فتح معاينة التحليل...');
  };

  const selectedAnalysisType = analysisTypes.find(type => type.value === analysisData.analysisType);

  return (
    <DashboardLayout 
      pageTitle="إنشاء تحليل عميق جديد"
      pageDescription="إنشاء تحليل متقدم للبيانات والمحتوى"
    >
      <div className="space-y-6">
        {/* شريط الأدوات العلوي */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">تحليل عميق جديد</h1>
              <p className="text-gray-600 dark:text-gray-400">إنشاء تحليل متقدم بالذكاء الاصطناعي</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={previewAnalysis}
              disabled={isLoading}
            >
              <Eye className="h-4 w-4 mr-2" />
              معاينة
            </Button>
            <Button 
              onClick={handleCreateAnalysis}
              disabled={isLoading || !analysisData.title}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  إنشاء التحليل
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* المحتوى الرئيسي */}
          <div className="lg:col-span-2 space-y-6">
            {/* معلومات التحليل الأساسية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  معلومات التحليل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">عنوان التحليل *</Label>
                  <Input
                    id="title"
                    placeholder="مثال: تحليل أداء المحتوى خلال الشهر الماضي"
                    value={analysisData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">وصف التحليل</Label>
                  <Textarea
                    id="description"
                    placeholder="وصف تفصيلي لأهداف ونطاق التحليل..."
                    value={analysisData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataSource">مصدر البيانات</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-1"
                      value={analysisData.dataSource} 
                      onChange={(e) => handleInputChange('dataSource', e.target.value)}
                    >
                      {dataSources.map((source) => (
                        <option key={source.value} value={source.value}>
                          {source.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="timeRange">النطاق الزمني (أيام)</Label>
                    <Input
                      id="timeRange"
                      type="number"
                      min="1"
                      max="365"
                      value={analysisData.timeRange}
                      onChange={(e) => handleInputChange('timeRange', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* نوع التحليل */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  نوع التحليل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysisTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = analysisData.analysisType === type.value;
                    
                    return (
                      <div
                        key={type.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleInputChange('analysisType', type.value)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${type.color}`} />
                          <span className="font-medium">{type.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* المقاييس والمعايير */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  المقاييس المطلوبة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableMetrics.map((metric) => {
                    const Icon = metric.icon;
                    const isSelected = analysisData.metrics.includes(metric.value);
                    
                    return (
                      <div
                        key={metric.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleMetricToggle(metric.value)}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{metric.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            {/* إعدادات التحليل */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  إعدادات التحليل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="priority">الأولوية</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                    value={analysisData.priority} 
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                  >
                    <option value="low">منخفضة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">عالية</option>
                    <option value="urgent">عاجلة</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isPublic">تحليل عام</Label>
                  <Switch
                    id="isPublic"
                    checked={analysisData.isPublic}
                    onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="autoUpdate">تحديث تلقائي</Label>
                  <Switch
                    id="autoUpdate"
                    checked={analysisData.autoUpdate}
                    onCheckedChange={(checked) => handleInputChange('autoUpdate', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* الفلاتر */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  فلاتر البيانات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="minViews">الحد الأدنى للمشاهدات</Label>
                  <Input
                    id="minViews"
                    type="number"
                    min="0"
                    value={analysisData.filters.minViews}
                    onChange={(e) => handleFilterChange('minViews', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="minEngagement">الحد الأدنى للتفاعل (%)</Label>
                  <Input
                    id="minEngagement"
                    type="number"
                    min="0"
                    max="100"
                    value={analysisData.filters.minEngagement}
                    onChange={(e) => handleFilterChange('minEngagement', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="dateFrom">من تاريخ</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={analysisData.filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="dateTo">إلى تاريخ</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={analysisData.filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* الكلمات المفتاحية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  الكلمات المفتاحية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="أضف كلمة مفتاحية..."
                    value={currentKeyword}
                    onChange={(e) => setCurrentKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                  />
                  <Button onClick={handleAddKeyword} size="sm">
                    إضافة
                  </Button>
                </div>
                
                {analysisData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {analysisData.keywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveKeyword(keyword)}
                      >
                        {keyword} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* التصنيفات */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  التصنيفات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="أضف تصنيف..."
                    value={currentCategory}
                    onChange={(e) => setCurrentCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <Button onClick={handleAddCategory} size="sm">
                    إضافة
                  </Button>
                </div>
                
                {analysisData.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {analysisData.categories.map((category) => (
                      <Badge
                        key={category}
                        variant="outline"
                        className="cursor-pointer"
                        onClick={() => handleRemoveCategory(category)}
                      >
                        {category} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/**
 * نظام السمات التكيفية - واجهة لوحة المراقبة
 * Adaptive Themes Dashboard Component
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Code,
  Zap,
  Shield,
  Gauge,
  RefreshCw,
  Play,
  Square,
  Copy,
  Trash2,
  Edit,
  ExternalLink
} from 'lucide-react';
import { Theme, ThemePreview, ThemeValidationResult, ThemePerformanceReport, AccessibilityReport } from '@/lib/modules/adaptive-themes/types';

interface ThemeCardProps {
  theme: Theme;
  onActivate: (id: string) => void;
  onPreview: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ 
  theme, 
  onActivate, 
  onPreview, 
  onEdit, 
  onDelete, 
  onDuplicate 
}) => {
  return (
    <Card className={`relative ${theme.is_active ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{theme.name_ar}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{theme.description_ar}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={theme.is_active ? 'default' : 'secondary'}>
                {theme.is_active ? 'نشط' : 'غير نشط'}
              </Badge>
              <Badge variant="outline">{theme.category}</Badge>
              {theme.is_premium && <Badge variant="destructive">مميز</Badge>}
              {theme.is_default && <Badge variant="outline">افتراضي</Badge>}
            </div>
          </div>
          {theme.thumbnail_url && (
            <img 
              src={theme.thumbnail_url} 
              alt={theme.name} 
              className="w-16 h-12 object-cover rounded border"
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="text-xs text-gray-500 mb-3">
          المؤلف: {theme.author} | الإصدار: {theme.version}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {theme.tags.map((tag, index) => (
            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPreview(theme.id)}
            >
              <Eye className="h-4 w-4 mr-1" />
              معاينة
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(theme.id)}
            >
              <Edit className="h-4 w-4 mr-1" />
              تحرير
            </Button>
          </div>
          
          <div className="flex gap-2">
            {!theme.is_active && (
              <Button
                size="sm"
                onClick={() => onActivate(theme.id)}
              >
                <Play className="h-4 w-4 mr-1" />
                تفعيل
              </Button>
            )}
            {theme.is_active && (
              <Button
                size="sm"
                variant="outline"
                disabled
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                نشط
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AdaptiveThemesDashboard() {
  const [loading, setLoading] = useState(true);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [preview, setPreview] = useState<ThemePreview | null>(null);
  const [validation, setValidation] = useState<ThemeValidationResult | null>(null);
  const [performance, setPerformance] = useState<ThemePerformanceReport | null>(null);
  const [accessibility, setAccessibility] = useState<AccessibilityReport | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      
      const [themesResponse, activeThemeResponse] = await Promise.all([
        fetch('/api/adaptive-themes?action=get_all_themes'),
        fetch('/api/adaptive-themes?action=get_active_theme')
      ]);

      if (themesResponse.ok) {
        const themesData = await themesResponse.json();
        if (themesData.success) {
          setThemes(themesData.data);
        }
      }

      if (activeThemeResponse.ok) {
        const activeData = await activeThemeResponse.json();
        if (activeData.success && activeData.data) {
          setActiveTheme(activeData.data);
          setSelectedTheme(activeData.data);
        }
      }

    } catch (error) {
      console.error('Error loading themes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const activateTheme = async (themeId: string) => {
    try {
      const response = await fetch('/api/adaptive-themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate_theme', theme_id: themeId })
      });

      if (response.ok) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error activating theme:', error);
    }
  };

  const previewTheme = async (themeId: string) => {
    try {
      const response = await fetch(`/api/adaptive-themes?action=preview_theme&id=${themeId}&device=${previewDevice}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPreview(data.data);
        }
      }
    } catch (error) {
      console.error('Error previewing theme:', error);
    }
  };

  const validateTheme = async (themeId: string) => {
    try {
      const response = await fetch(`/api/adaptive-themes?action=validate_theme&id=${themeId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setValidation(data.data);
        }
      }
    } catch (error) {
      console.error('Error validating theme:', error);
    }
  };

  const getPerformanceReport = async (themeId: string) => {
    try {
      const response = await fetch(`/api/adaptive-themes?action=performance_report&id=${themeId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPerformance(data.data);
        }
      }
    } catch (error) {
      console.error('Error getting performance report:', error);
    }
  };

  const getAccessibilityReport = async (themeId: string) => {
    try {
      const response = await fetch(`/api/adaptive-themes?action=accessibility_report&id=${themeId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAccessibility(data.data);
        }
      }
    } catch (error) {
      console.error('Error getting accessibility report:', error);
    }
  };

  const exportCSS = async (themeId: string) => {
    try {
      const response = await fetch(`/api/adaptive-themes?action=compile_css&id=${themeId}`);
      if (response.ok) {
        const css = await response.text();
        const blob = new Blob([css], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `theme-${themeId}.css`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting CSS:', error);
    }
  };

  const createThemeFromBrand = async () => {
    try {
      const brandGuidelines = {
        brand_name: 'سمة جديدة',
        logo_files: [],
        primary_colors: ['#0ea5e9', '#6b7280', '#ef4444'],
        secondary_colors: ['#f8fafc', '#1e293b'],
        typography: {
          primary_font: 'Inter',
          secondary_font: 'Arabic UI Text',
          font_weights: [400, 500, 600, 700],
          font_sizes: ['14px', '16px', '18px', '24px'],
          line_heights: [1.4, 1.5, 1.6]
        },
        imagery_style: {
          style: 'photography',
          color_treatment: 'full_color',
          composition: 'centered'
        },
        tone_of_voice: {
          formality: 'professional',
          energy: 'calm',
          personality: 'trustworthy'
        },
        layout_preferences: {
          complexity: 'moderate',
          whitespace: 'balanced',
          hierarchy: 'clear',
          symmetry: 'balanced'
        }
      };

      const response = await fetch('/api/adaptive-themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_from_brand', brand_guidelines: brandGuidelines })
      });

      if (response.ok) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error creating theme from brand:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام السمات التكيفية</h1>
          <p className="text-gray-600 mt-1">إدارة وتخصيص سمات الموقع مع ميزات التكيف التلقائي</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button onClick={createThemeFromBrand}>
            <Brush className="h-4 w-4 mr-2" />
            إنشاء سمة جديدة
          </Button>
        </div>
      </div>

      {/* Active Theme Overview */}
      {activeTheme && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-blue-600" />
              السمة النشطة: {activeTheme.name_ar}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">v{activeTheme.version}</div>
                <div className="text-sm text-gray-600">الإصدار</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{activeTheme.category}</div>
                <div className="text-sm text-gray-600">الفئة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{activeTheme.tags.length}</div>
                <div className="text-sm text-gray-600">العلامات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{activeTheme.author}</div>
                <div className="text-sm text-gray-600">المطور</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="themes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="themes">السمات ({themes.length})</TabsTrigger>
          <TabsTrigger value="preview">المعاينة</TabsTrigger>
          <TabsTrigger value="validation">التحقق</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="customization">التخصيص</TabsTrigger>
        </TabsList>

        {/* Themes Tab */}
        <TabsContent value="themes" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">جميع السمات</h2>
              <p className="text-gray-600">تصفح وإدارة السمات المتاحة</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                استيراد سمة
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تصدير سمة
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                onActivate={activateTheme}
                onPreview={(id) => {
                  setSelectedTheme(theme);
                  previewTheme(id);
                }}
                onEdit={(id) => console.log('Edit theme:', id)}
                onDelete={(id) => console.log('Delete theme:', id)}
                onDuplicate={(id) => console.log('Duplicate theme:', id)}
              />
            ))}
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">معاينة السمة</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>الجهاز:</Label>
                <div className="flex gap-1">
                  <Button
                    variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('tablet')}
                  >
                    <Tablet className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {selectedTheme && (
                <Button onClick={() => previewTheme(selectedTheme.id)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  تحديث المعاينة
                </Button>
              )}
            </div>
          </div>

          {preview ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">معاينة السمة</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        فتح في نافذة جديدة
                      </Button>
                      {selectedTheme && (
                        <Button variant="outline" size="sm" onClick={() => exportCSS(selectedTheme.id)}>
                          <Download className="h-4 w-4 mr-2" />
                          تصدير CSS
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{preview.accessibility_score.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">نتيجة إمكانية الوصول</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{preview.performance_score.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">نتيجة الأداء</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{preview.responsive_score.toFixed(1)}%</div>
                      <div className="text-sm text-gray-600">نتيجة التجاوب</div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden bg-white">
                    <div className="bg-gray-100 p-3 border-b flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-sm text-gray-600">{preview.preview_url}</div>
                    </div>
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">معاينة السمة ستظهر هنا</p>
                        <p className="text-sm text-gray-500">الجهاز: {previewDevice}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">اختر سمة للمعاينة</h3>
                <p className="text-gray-600">قم بتحديد سمة من قائمة السمات لعرض المعاينة</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">التحقق من السمة</h2>
            {selectedTheme && (
              <Button onClick={() => validateTheme(selectedTheme.id)}>
                <Shield className="h-4 w-4 mr-2" />
                تشغيل التحقق
              </Button>
            )}
          </div>

          {validation ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {validation.valid ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                    نتيجة التحقق
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${validation.valid ? 'text-green-600' : 'text-red-600'}`}>
                        {validation.valid ? 'صالح' : 'غير صالح'}
                      </div>
                      <div className="text-sm text-gray-600">الحالة</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{validation.errors.length}</div>
                      <div className="text-sm text-gray-600">الأخطاء</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{validation.warnings.length}</div>
                      <div className="text-sm text-gray-600">التحذيرات</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{validation.suggestions.length}</div>
                      <div className="text-sm text-gray-600">الاقتراحات</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {validation.errors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">الأخطاء</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {validation.errors.map((error, index) => (
                        <Alert key={index} className="border-red-200">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>{error.code}:</strong> {error.message}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {validation.suggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-600">الاقتراحات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {validation.suggestions.map((suggestion, index) => (
                        <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <div className="flex items-center justify-between">
                            <p className="text-sm">{suggestion.message}</p>
                            <Badge variant={suggestion.priority === 'high' ? 'destructive' : 'secondary'}>
                              {suggestion.priority === 'high' ? 'عالي' : suggestion.priority === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">تشغيل فحص التحقق</h3>
                <p className="text-gray-600">اختر سمة وقم بتشغيل فحص التحقق لعرض النتائج</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">تقرير الأداء</h2>
            {selectedTheme && (
              <Button onClick={() => getPerformanceReport(selectedTheme.id)}>
                <Gauge className="h-4 w-4 mr-2" />
                تشغيل اختبار الأداء
              </Button>
            )}
          </div>

          {performance ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600">{performance.overall_score.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">النتيجة الإجمالية</div>
                    <Progress value={performance.overall_score} className="mt-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-600">{performance.load_time.toFixed(1)}ms</div>
                    <div className="text-sm text-gray-600">زمن التحميل</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600">{(performance.bundle_size / 1024).toFixed(1)}KB</div>
                    <div className="text-sm text-gray-600">حجم الحزمة</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-orange-600">{performance.unused_css_percentage.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">CSS غير مستخدم</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>توصيات التحسين</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {performance.recommendations.map((rec, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{rec.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={rec.impact === 'high' ? 'destructive' : rec.impact === 'medium' ? 'secondary' : 'outline'}>
                                تأثير {rec.impact === 'high' ? 'عالي' : rec.impact === 'medium' ? 'متوسط' : 'منخفض'}
                              </Badge>
                              <Badge variant="outline">
                                جهد {rec.effort === 'easy' ? 'سهل' : rec.effort === 'medium' ? 'متوسط' : 'صعب'}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-sm text-green-600 font-medium">
                            {rec.potential_savings}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Gauge className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">تشغيل اختبار الأداء</h3>
                <p className="text-gray-600">اختر سمة وقم بتشغيل اختبار الأداء لعرض التقرير المفصل</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Customization Tab */}
        <TabsContent value="customization" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">تخصيص السمة</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تصدير التخصيصات
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                استيراد التخصيصات
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>الألوان الأساسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>اللون الأساسي</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input type="color" defaultValue="#0ea5e9" className="w-16 h-10" />
                    <Input defaultValue="#0ea5e9" className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label>اللون الثانوي</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input type="color" defaultValue="#6b7280" className="w-16 h-10" />
                    <Input defaultValue="#6b7280" className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label>لون التمييز</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input type="color" defaultValue="#ef4444" className="w-16 h-10" />
                    <Input defaultValue="#ef4444" className="flex-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إعدادات الخط</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>الخط الأساسي</Label>
                  <Input defaultValue="Inter" className="mt-1" />
                </div>
                <div>
                  <Label>الخط العربي</Label>
                  <Input defaultValue="Noto Sans Arabic" className="mt-1" />
                </div>
                <div>
                  <Label>حجم الخط الأساسي</Label>
                  <Input type="number" defaultValue="16" min="12" max="24" className="mt-1" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تخطيط الصفحة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>شريط جانبي</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>رأس ثابت</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>خطة الشبكة</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ميزات إمكانية الوصول</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>نمط التباين العالي</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>تقليل الحركة</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>دعم قارئ الشاشة</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>CSS مخصص</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-48 p-3 border rounded-md font-mono text-sm"
                placeholder="/* أضف CSS مخصص هنا */"
              />
              <div className="flex justify-end mt-4">
                <Button>
                  <Code className="h-4 w-4 mr-2" />
                  تطبيق التغييرات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
// تم إزالة DashboardLayout - تستخدم الصفحة layout.tsx الأساسي
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Clock, 
  Brain,
  RefreshCw,
  Calendar,
  Target,
  Zap,
  PieChart
} from 'lucide-react';

interface AnalyticsData {
  // الإحصائيات العامة
  total_corners: number;
  total_articles: number;
  total_interactions: number;
  total_views: number;
  unique_viewers: number;
  
  // المتوسطات
  avg_read_time: number;
  avg_scroll_depth: number;
  avg_completion_rate: number;
  avg_view_duration: number;
  
  // إحصائيات حديثة (30 يوم)
  new_articles_30d: number;
  new_interactions_30d: number;
  new_views_30d: number;
  
  // توزيع الأنماط
  sentiment_distribution: Array<{
    ai_sentiment: string;
    count: number;
  }>;
}

export default function MuqtarabAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalyicsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/muqtarab/stats');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('خطأ في جلب البيانات التحليلية:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    color = 'blue' 
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: any;
    trend?: string;
    color?: string;
  }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600 bg-blue-100 text-blue-600',
      green: 'from-green-500 to-green-600 bg-green-100 text-green-600',
      purple: 'from-purple-500 to-purple-600 bg-purple-100 text-purple-600',
      orange: 'from-orange-500 to-orange-600 bg-orange-100 text-orange-600',
      indigo: 'from-indigo-500 to-indigo-600 bg-indigo-100 text-indigo-600'
    };

    const colors = colorClasses[color as keyof typeof colorClasses];

    return (
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
              )}
              {trend && (
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">{trend}</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-xl ${colors.split(' ')[1]} ${colors.split(' ')[2]}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل البيانات التحليلية...</p>
          </div>
        </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">تحليلات مُقترَب</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              نظرة شاملة على أداء المحتوى الإبداعي والتفاعل مع القراء
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">آخر 7 أيام</SelectItem>
                <SelectItem value="30d">آخر 30 يوم</SelectItem>
                <SelectItem value="90d">آخر 3 أشهر</SelectItem>
                <SelectItem value="1y">آخر سنة</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchAnalyticsData} variant="outline">
              <RefreshCw className="w-4 h-4 ml-2" />
              تحديث
            </Button>
          </div>
        </div>

        {analytics && (
          <>
            {/* الإحصائيات الرئيسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="إجمالي الزوايا"
                value={analytics.total_corners}
                subtitle="زاوية إبداعية نشطة"
                icon={Zap}
                color="blue"
              />
              <StatCard
                title="إجمالي المقالات"
                value={analytics.total_articles}
                subtitle={`+${analytics.new_articles_30d} هذا الشهر`}
                icon={BarChart3}
                trend={`+${Math.round((analytics.new_articles_30d / Math.max(analytics.total_articles - analytics.new_articles_30d, 1)) * 100)}%`}
                color="green"
              />
              <StatCard
                title="إجمالي المشاهدات"
                value={analytics.total_views.toLocaleString()}
                subtitle={`${analytics.unique_viewers} قارئ فريد`}
                icon={Eye}
                color="purple"
              />
              <StatCard
                title="إجمالي التفاعلات"
                value={analytics.total_interactions.toLocaleString()}
                subtitle={`+${analytics.new_interactions_30d} هذا الشهر`}
                icon={TrendingUp}
                trend={`+${Math.round((analytics.new_interactions_30d / Math.max(analytics.total_interactions - analytics.new_interactions_30d, 1)) * 100)}%`}
                color="orange"
              />
            </div>

            {/* مقاييس الأداء */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* متوسط الوقت والتفاعل */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    مقاييس الأداء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">متوسط وقت القراءة</span>
                          <span className="text-lg font-bold text-blue-600">{analytics.avg_read_time} دقيقة</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((analytics.avg_read_time / 10) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">عمق التمرير</span>
                          <span className="text-lg font-bold text-green-600">{Math.round(analytics.avg_scroll_depth * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${analytics.avg_scroll_depth * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">معدل الإكمال</span>
                          <span className="text-lg font-bold text-purple-600">{Math.round(analytics.avg_completion_rate * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${analytics.avg_completion_rate * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">مدة المشاهدة</span>
                          <span className="text-lg font-bold text-orange-600">{Math.round(analytics.avg_view_duration / 60)} ثانية</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((analytics.avg_view_duration / 300) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* إحصائيات سريعة */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    إحصائيات سريعة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">نمو المقالات</p>
                      <p className="text-lg font-bold text-blue-700">{analytics.new_articles_30d}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="text-sm text-green-600 font-medium">نمو المشاهدات</p>
                      <p className="text-lg font-bold text-green-700">{analytics.new_views_30d}</p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Eye className="w-4 h-4 text-green-600" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">نمو التفاعلات</p>
                      <p className="text-lg font-bold text-purple-700">{analytics.new_interactions_30d}</p>
                    </div>
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* توزيع أنماط المحتوى */}
            {analytics.sentiment_distribution && analytics.sentiment_distribution.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    توزيع أنماط المحتوى (تحليل الذكاء الاصطناعي)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {analytics.sentiment_distribution.map((item, index) => {
                      const total = analytics.sentiment_distribution.reduce((sum, s) => sum + Number(s.count), 0);
                      const percentage = Math.round((Number(item.count) / total) * 100);
                      
                      const sentimentConfig = {
                        'ساخر': { icon: '😏', color: 'bg-yellow-500' },
                        'تأملي': { icon: '🤔', color: 'bg-blue-500' },
                        'عاطفي': { icon: '❤️', color: 'bg-red-500' },
                        'تحليلي': { icon: '🔍', color: 'bg-green-500' },
                        'إلهامي': { icon: '✨', color: 'bg-purple-500' }
                      };

                      const config = sentimentConfig[item.ai_sentiment as keyof typeof sentimentConfig] || 
                        { icon: '📝', color: 'bg-gray-500' };

                      return (
                        <div key={index} className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className={`w-12 h-12 ${config.color} rounded-full flex items-center justify-center text-white text-xl mx-auto mb-2`}>
                            {config.icon}
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.ai_sentiment}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.count}</p>
                          <p className="text-sm text-gray-500">({percentage}%)</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ملاحظات مفيدة */}
            <Card>
              <CardHeader>
                <CardTitle>نصائح لتحسين الأداء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">📈 نصائح للنمو:</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• انشر المقالات في أوقات الذروة (8-10 صباحاً، 7-9 مساءً)</li>
                      <li>• استخدم عناوين جذابة تحتوي على كلمات مفتاحية</li>
                      <li>• اكتب مقدمات قوية لزيادة معدل الإكمال</li>
                      <li>• ادعم المقالات بالصور والوسائط التفاعلية</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 dark:text-white">🎯 تحسين التفاعل:</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• شجع التعليقات بطرح أسئلة في نهاية المقال</li>
                      <li>• استخدم التحليل الذكي لفهم تفضيلات القراء</li>
                      <li>• نوع في أنماط المحتوى (ساخر، تأملي، إلهامي)</li>
                      <li>• تفاعل مع تعليقات القراء لبناء مجتمع</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
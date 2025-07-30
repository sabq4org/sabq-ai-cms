'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/admin/modern-dashboard/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Search, Filter, BarChart3, TrendingUp, Eye, Edit, 
  Trash2, ExternalLink, User, Users, MapPin, Calendar,
  Star, Brain, Target, Globe, Zap, CheckCircle, Award,
  FileText, Heart, Share2, Clock
} from 'lucide-react';
import CloudImage from '@/components/ui/CloudImage';
import { formatDateGregorian } from '@/lib/date-utils';
import { useDarkModeContext } from '@/contexts/DarkModeContext';
import toast from 'react-hot-toast';

interface Reporter {
  id: string;
  user_id: string;
  full_name: string;
  slug: string;
  title: string;
  bio: string;
  avatar_url: string;
  is_verified: boolean;
  verification_badge: string;
  specializations: string[];
  coverage_areas: string[];
  languages: string[];
  total_articles: number;
  total_views: number;
  total_likes: number;
  total_shares: number;
  engagement_rate: number;
  is_active: boolean;
  show_stats: boolean;
  show_contact: boolean;
  created_at: string;
  updated_at: string;
  user: {
    email: string;
    name: string;
    role: string;
  };
}

interface ReporterStats {
  totalReporters: number;
  verifiedReporters: number;
  totalArticles: number;
  totalViews: number;
  topSpecializations: Array<{ name: string; count: number }>;
}

export default function ReportersManagement() {
  const { darkMode } = useDarkModeContext();
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [stats, setStats] = useState<ReporterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingReporter, setEditingReporter] = useState<Reporter | null>(null);
  const [activeTab, setActiveTab] = useState('reporters');

  // نموذج للمراسل الجديد
  const [newReporter, setNewReporter] = useState({
    user_id: '',
    full_name: '',
    slug: '',
    title: '',
    bio: '',
    avatar_url: '',
    is_verified: false,
    verification_badge: 'verified',
    specializations: [] as string[],
    coverage_areas: [] as string[],
    languages: ['ar'] as string[],
    twitter_url: '',
    linkedin_url: '',
    website_url: '',
    email_public: '',
    show_stats: true,
    show_contact: false
  });

  useEffect(() => {
    fetchReporters();
  }, []);

  const fetchReporters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reporters');
      const data = await response.json();
      
      if (data.success) {
        setReporters(data.reporters);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('خطأ في جلب المراسلين:', error);
      toast.error('فشل في جلب بيانات المراسلين');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReporter = async () => {
    try {
      if (!newReporter.user_id || !newReporter.full_name || !newReporter.slug) {
        toast.error('يرجى ملء الحقول المطلوبة');
        return;
      }

      const response = await fetch('/api/reporters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReporter),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('تم إنشاء بروفايل المراسل بنجاح');
        setShowAddDialog(false);
        resetNewReporter();
        fetchReporters();
      } else {
        toast.error(data.error || 'فشل في إنشاء بروفايل المراسل');
      }
    } catch (error) {
      console.error('خطأ في إنشاء المراسل:', error);
      toast.error('حدث خطأ في إنشاء بروفايل المراسل');
    }
  };

  const handleDeleteReporter = async (reporterId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المراسل؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/reporters/${reporterId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('تم حذف المراسل بنجاح');
        fetchReporters();
      } else {
        toast.error(data.error || 'فشل في حذف المراسل');
      }
    } catch (error) {
      console.error('خطأ في حذف المراسل:', error);
      toast.error('حدث خطأ في حذف المراسل');
    }
  };

  const resetNewReporter = () => {
    setNewReporter({
      user_id: '',
      full_name: '',
      slug: '',
      title: '',
      bio: '',
      avatar_url: '',
      is_verified: false,
      verification_badge: 'verified',
      specializations: [],
      coverage_areas: [],
      languages: ['ar'],
      twitter_url: '',
      linkedin_url: '',
      website_url: '',
      email_public: '',
      show_stats: true,
      show_contact: false
    });
  };

  const getVerificationIcon = (badge: string) => {
    switch (badge) {
      case 'expert': return <Award className="w-4 h-4 text-purple-600" />;
      case 'senior': return <Star className="w-4 h-4 text-yellow-600" />;
      default: return <CheckCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  const filteredReporters = reporters.filter(reporter => {
    const matchesSearch = reporter.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reporter.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reporter.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = selectedSpecialization === 'all' || 
                                 reporter.specializations.includes(selectedSpecialization);
    
    return matchesSearch && matchesSpecialization;
  });

  const renderStatsCards = () => {
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  إجمالي المراسلين
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalReporters}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  المراسلين المعتمدين
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.verifiedReporters}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  إجمالي المقالات
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalArticles.toLocaleString()}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  إجمالي المشاهدات
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
              <Eye className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderReporterCard = (reporter: Reporter) => {
    return (
      <Card key={reporter.id} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} hover:shadow-lg transition-shadow`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* صورة المراسل */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                {reporter.avatar_url ? (
                  <CloudImage
                    src={reporter.avatar_url}
                    alt={reporter.full_name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              {reporter.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1">
                  {getVerificationIcon(reporter.verification_badge)}
                </div>
              )}
            </div>

            {/* معلومات المراسل */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {reporter.full_name}
                  </h3>
                  
                  {reporter.title && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                      {reporter.title}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {reporter.user.email}
                  </p>
                  
                  {reporter.bio && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                      {reporter.bio}
                    </p>
                  )}
                  
                  {/* التخصصات */}
                  {reporter.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {reporter.specializations.slice(0, 3).map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {reporter.specializations.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{reporter.specializations.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/reporter/${reporter.slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingReporter(reporter)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteReporter(reporter.id)}>
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </Button>
                </div>
              </div>

              {/* إحصائيات سريعة */}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {reporter.total_articles} مقال
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {reporter.total_views.toLocaleString()} مشاهدة
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {(reporter.engagement_rate * 100).toFixed(1)}%
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDateGregorian(reporter.created_at)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAddReporterDialog = () => {
    return (
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة مراسل جديد</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* المعلومات الأساسية */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">معرف المستخدم *</label>
                <Input
                  placeholder="أدخل معرف المستخدم"
                  value={newReporter.user_id}
                  onChange={(e) => setNewReporter({...newReporter, user_id: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">الاسم الكامل *</label>
                <Input
                  placeholder="أدخل الاسم الكامل"
                  value={newReporter.full_name}
                  onChange={(e) => setNewReporter({...newReporter, full_name: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">المعرف الفريد (Slug) *</label>
                <Input
                  placeholder="مثال: ahmed-hassan"
                  value={newReporter.slug}
                  onChange={(e) => setNewReporter({...newReporter, slug: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">المسمى الوظيفي</label>
                <Input
                  placeholder="مثل: مراسل ميداني، محرر اقتصادي"
                  value={newReporter.title}
                  onChange={(e) => setNewReporter({...newReporter, title: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">النبذة المهنية</label>
              <Textarea
                placeholder="نبذة مختصرة عن المراسل وخبرته..."
                value={newReporter.bio}
                onChange={(e) => setNewReporter({...newReporter, bio: e.target.value})}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">رابط الصورة الشخصية</label>
              <Input
                placeholder="https://example.com/avatar.jpg"
                value={newReporter.avatar_url}
                onChange={(e) => setNewReporter({...newReporter, avatar_url: e.target.value})}
              />
            </div>

            {/* إعدادات التحقق */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">حالة التحقق</label>
                <Select value={newReporter.is_verified.toString()} onValueChange={(value) => setNewReporter({...newReporter, is_verified: value === 'true'})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">غير معتمد</SelectItem>
                    <SelectItem value="true">معتمد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">نوع الشارة</label>
                <Select value={newReporter.verification_badge} onValueChange={(value) => setNewReporter({...newReporter, verification_badge: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">مراسل معتمد</SelectItem>
                    <SelectItem value="expert">خبير معتمد</SelectItem>
                    <SelectItem value="senior">محرر أول</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* روابط التواصل */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">حساب تويتر</label>
                <Input
                  placeholder="https://twitter.com/username"
                  value={newReporter.twitter_url}
                  onChange={(e) => setNewReporter({...newReporter, twitter_url: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">حساب لينكدإن</label>
                <Input
                  placeholder="https://linkedin.com/in/username"
                  value={newReporter.linkedin_url}
                  onChange={(e) => setNewReporter({...newReporter, linkedin_url: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">الموقع الشخصي</label>
                <Input
                  placeholder="https://website.com"
                  value={newReporter.website_url}
                  onChange={(e) => setNewReporter({...newReporter, website_url: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">البريد العام</label>
                <Input
                  placeholder="reporter@example.com"
                  value={newReporter.email_public}
                  onChange={(e) => setNewReporter({...newReporter, email_public: e.target.value})}
                />
              </div>
            </div>

            {/* إعدادات العرض */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show_stats"
                  checked={newReporter.show_stats}
                  onChange={(e) => setNewReporter({...newReporter, show_stats: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="show_stats" className="text-sm font-medium">
                  عرض الإحصائيات
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show_contact"
                  checked={newReporter.show_contact}
                  onChange={(e) => setNewReporter({...newReporter, show_contact: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="show_contact" className="text-sm font-medium">
                  عرض معلومات التواصل
                </label>
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddReporter}>
                إنشاء المراسل
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">جاري تحميل بيانات المراسلين...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* العنوان */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              إدارة المراسلين
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              إدارة بروفايلات المراسلين والكتاب في المنصة
            </p>
          </div>
          
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            إضافة مراسل جديد
          </Button>
        </div>

        {/* بطاقات الإحصائيات */}
        {renderStatsCards()}

        {/* التبويبات الرئيسية */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reporters">المراسلين</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          {/* تبويب المراسلين */}
          <TabsContent value="reporters" className="mt-6">
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>قائمة المراسلين ({filteredReporters.length})</CardTitle>
                  
                  {/* فلاتر البحث */}
                  <div className="flex flex-wrap gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="البحث في المراسلين..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    
                    <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="تصفية حسب التخصص" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع التخصصات</SelectItem>
                        {stats?.topSpecializations.map(spec => (
                          <SelectItem key={spec.name} value={spec.name}>
                            {spec.name} ({spec.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredReporters.length > 0 ? (
                  <div className="grid gap-4">
                    {filteredReporters.map(renderReporterCard)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      لا توجد مراسلين
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      لم يتم العثور على مراسلين يطابقون معايير البحث
                    </p>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      إضافة مراسل جديد
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب التحليلات */}
          <TabsContent value="analytics" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* أكثر التخصصات شيوعاً */}
              {stats?.topSpecializations && (
                <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      أكثر التخصصات شيوعاً
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.topSpecializations.map((spec, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-600 rounded-full flex-shrink-0"></div>
                            <span className="text-gray-900 dark:text-white">{spec.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {spec.count} مراسل
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* معلومات إضافية */}
              <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    معلومات إضافية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        تحليلات متقدمة
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        ستتم إضافة المزيد من التحليلات والإحصائيات قريباً
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب الإعدادات */}
          <TabsContent value="settings" className="mt-6">
            <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader>
                <CardTitle>إعدادات النظام</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">ستتم إضافة إعدادات النظام قريباً...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* نافذة إضافة مراسل */}
        {renderAddReporterDialog()}
      </div>
    </DashboardLayout>
  );
}
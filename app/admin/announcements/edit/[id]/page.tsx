'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Calendar,
  Users,
  Bell,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// أنواع الإعلانات (نفس المصفوفة من صفحة إنشاء الإعلان)
const ANNOUNCEMENT_TYPES = [
  { value: 'ANNOUNCEMENT', label: '📢 إعلان عام', description: 'إعلان عادي للفريق' },
  { value: 'CRITICAL', label: '🚨 إعلان حرج', description: 'إعلان عاجل يتطلب اهتمام فوري' },
  { value: 'GUIDELINE', label: '📋 إرشادات', description: 'توجيهات وإرشادات العمل' },
  { value: 'ASSET_APPROVED', label: '✅ موافقة', description: 'إشعار بالموافقة على شيء ما' },
  { value: 'MAINTENANCE', label: '🔧 صيانة', description: 'إشعار صيانة النظام' },
  { value: 'FEATURE', label: '✨ ميزة جديدة', description: 'إعلان عن ميزة أو تحديث جديد' },
  { value: 'POLICY', label: '📜 سياسة', description: 'تحديث في السياسات أو القوانين' },
];

const PRIORITIES = [
  { value: 'LOW', label: '⚪ منخفضة', color: 'bg-gray-100 text-gray-700' },
  { value: 'NORMAL', label: '🔵 عادية', color: 'bg-blue-100 text-blue-700' },
  { value: 'HIGH', label: '🟠 عالية', color: 'bg-orange-100 text-orange-700' },
  { value: 'CRITICAL', label: '🔴 حرجة', color: 'bg-red-100 text-red-700' },
];

const AVAILABLE_ROLES = [
  { value: 'admin', label: '👑 المدير العام' },
  { value: 'editor', label: '✏️ محرر' },
  { value: 'reporter', label: '📰 مراسل' },
  { value: 'moderator', label: '🛡️ مشرف' },
  { value: 'analyst', label: '📊 محلل' },
];

interface AnnouncementFormData {
  title: string;
  bodyMd: string;
  type: string;
  priority: string;
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'ARCHIVED';
  isPinned: boolean;
  startAt?: string;
  endAt?: string;
  audienceRoles: string[];
}

/**
 * صفحة تعديل الإعلان
 * Edit Announcement Page
 */
export default function EditAnnouncementPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    bodyMd: '',
    type: 'ANNOUNCEMENT',
    priority: 'NORMAL',
    status: 'DRAFT',
    isPinned: false,
    audienceRoles: [],
  });

  const announcementId = params.id as string;

  // جلب بيانات الإعلان الحالية
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await fetch(`/api/admin/announcements/${announcementId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'فشل في جلب الإعلان');
        }

        if (data.success && data.data) {
          const announcement = data.data;
          setFormData({
            title: announcement.title || '',
            bodyMd: announcement.bodyMd || '',
            type: announcement.type || 'ANNOUNCEMENT',
            priority: announcement.priority || 'NORMAL',
            status: announcement.status || 'DRAFT',
            isPinned: announcement.isPinned || false,
            startAt: announcement.startAt ? new Date(announcement.startAt).toISOString().slice(0, 16) : '',
            endAt: announcement.endAt ? new Date(announcement.endAt).toISOString().slice(0, 16) : '',
            audienceRoles: announcement.audienceRoles || [],
          });
        } else {
          throw new Error('بيانات الإعلان غير صحيحة');
        }
      } catch (error) {
        console.error('❌ خطأ في جلب الإعلان:', error);
        toast.error(`❌ فشل في جلب الإعلان\n⚠️ ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, {
          duration: 8000,
          style: {
            background: '#EF4444',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
        router.push('/admin/announcements');
      } finally {
        setLoading(false);
      }
    };

    if (announcementId) {
      fetchAnnouncement();
    }
  }, [announcementId, router]);

  // تحديث حقول النموذج
  const updateField = <K extends keyof AnnouncementFormData>(
    field: K, 
    value: AnnouncementFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // إضافة/إزالة دور من الجمهور المستهدف
  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      audienceRoles: prev.audienceRoles.includes(role)
        ? prev.audienceRoles.filter(r => r !== role)
        : [...prev.audienceRoles, role]
    }));
  };

  // حفظ التعديلات
  const handleSubmit = async (action: 'save' | 'publish') => {
    setSaving(true);

    try {
      // التحقق من صحة البيانات
      if (!formData.title.trim()) {
        toast.error('⚠️ يرجى إدخال عنوان الإعلان');
        return;
      }

      if (!formData.bodyMd.trim()) {
        toast.error('⚠️ يرجى إدخال محتوى الإعلان');
        return;
      }

      // تحديد الحالة بناءً على الإجراء
      const finalStatus = action === 'publish' ? 'ACTIVE' : formData.status;

      // إعداد البيانات للإرسال
      const submitData = {
        ...formData,
        status: finalStatus,
        startAt: formData.startAt || undefined,
        endAt: formData.endAt || undefined,
      };

      console.log('📤 تحديث بيانات الإعلان:', submitData);

      // إرسال البيانات
      const response = await fetch(`/api/admin/announcements/${announcementId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'فشل في تحديث الإعلان');
      }

      // إشعار النجاح
      if (action === 'publish') {
        toast.success('🎉 تم نشر الإعلان بنجاح!\n✅ التعديلات محفوظة والإعلان متاح للفريق', {
          duration: 6000,
          style: {
            background: '#10B981',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
      } else {
        toast.success('💾 تم حفظ التعديلات بنجاح!\n✅ جميع التغييرات محفوظة', {
          duration: 6000,
          style: {
            background: '#3B82F6',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
      }

      // الانتقال لصفحة عرض الإعلان
      router.push(`/admin/announcements/${announcementId}`);

    } catch (error) {
      console.error('❌ خطأ في تحديث الإعلان:', error);
      toast.error(`❌ فشل في تحديث الإعلان\n⚠️ ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, {
        duration: 8000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/announcements/${announcementId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للإعلان
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              تعديل الإعلان
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              تعديل معلومات ومحتوى الإعلان
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => handleSubmit('save')}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 ml-2" />
            )}
            حفظ التعديلات
          </Button>
          <Button
            onClick={() => handleSubmit('publish')}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 ml-2" />
            )}
            حفظ ونشر
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* النموذج الرئيسي */}
        <div className="lg:col-span-2 space-y-6">
          {/* المعلومات الأساسية */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* العنوان */}
              <div>
                <Label htmlFor="title" className="text-sm font-medium">
                  عنوان الإعلان *
                </Label>
                <Input
                  id="title"
                  placeholder="أدخل عنوان الإعلان..."
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* المحتوى */}
              <div>
                <Label htmlFor="bodyMd" className="text-sm font-medium">
                  محتوى الإعلان *
                </Label>
                <Textarea
                  id="bodyMd"
                  placeholder="أدخل محتوى الإعلان بتنسيق Markdown..."
                  value={formData.bodyMd}
                  onChange={(e) => updateField('bodyMd', e.target.value)}
                  rows={8}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  يمكنك استخدام تنسيق Markdown للنص المنسق
                </p>
              </div>
            </CardContent>
          </Card>

          {/* التوقيت والجدولة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                التوقيت والجدولة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* تاريخ البداية */}
                <div>
                  <Label htmlFor="startAt" className="text-sm font-medium">
                    تاريخ البداية (اختياري)
                  </Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    value={formData.startAt || ''}
                    onChange={(e) => updateField('startAt', e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* تاريخ النهاية */}
                <div>
                  <Label htmlFor="endAt" className="text-sm font-medium">
                    تاريخ النهاية (اختياري)
                  </Label>
                  <Input
                    id="endAt"
                    type="datetime-local"
                    value={formData.endAt || ''}
                    onChange={(e) => updateField('endAt', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="isPinned"
                  checked={formData.isPinned}
                  onCheckedChange={(checked) => updateField('isPinned', checked)}
                />
                <Label htmlFor="isPinned" className="text-sm font-medium">
                  تثبيت الإعلان (يظهر في أعلى القائمة)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* الجمهور المستهدف */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                الجمهور المستهدف
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                اختر الأدوار التي يجب أن ترى هذا الإعلان (اتركه فارغاً لعرضه للجميع)
              </p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ROLES.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => toggleRole(role.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.audienceRoles.includes(role.value)
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
              {formData.audienceRoles.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500">
                    سيظهر هذا الإعلان للأدوار المحددة فقط
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* الشريط الجانبي */}
        <div className="space-y-6">
          {/* نوع الإعلان */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">نوع الإعلان</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.type}
                onValueChange={(value) => updateField('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANNOUNCEMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* الأولوية */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">الأولوية</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.priority}
                onValueChange={(value) => updateField('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* حالة النشر */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">حالة النشر</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.status}
                onValueChange={(value: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'ARCHIVED') => 
                  updateField('status', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">✏️ مسودة</SelectItem>
                  <SelectItem value="SCHEDULED">🕒 مجدول</SelectItem>
                  <SelectItem value="ACTIVE">✅ نشط</SelectItem>
                  <SelectItem value="EXPIRED">⏰ منتهي</SelectItem>
                  <SelectItem value="ARCHIVED">🗂️ مؤرشف</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* معاينة */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">معاينة التعديلات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.title && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">العنوان:</p>
                  <p className="font-medium text-sm">{formData.title}</p>
                </div>
              )}
              
              {formData.bodyMd && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">المحتوى:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {formData.bodyMd.substring(0, 100)}
                    {formData.bodyMd.length > 100 && '...'}
                  </p>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">
                  {ANNOUNCEMENT_TYPES.find(t => t.value === formData.type)?.label}
                </Badge>
                <Badge 
                  variant="outline"
                  className={PRIORITIES.find(p => p.value === formData.priority)?.color}
                >
                  {PRIORITIES.find(p => p.value === formData.priority)?.label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Calendar,
  Users,
  Pin,
  Clock,
  User,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const priorityColors = {
  CRITICAL: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-300',
  HIGH: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-300',
  NORMAL: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-300',
  LOW: 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-300',
};

const statusColors = {
  DRAFT: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-300',
  SCHEDULED: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-300',
  ACTIVE: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-300',
  EXPIRED: 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-300',
  ARCHIVED: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-300',
};

const statusLabels = {
  DRAFT: '✏️ مسودة',
  SCHEDULED: '🕒 مجدول',
  ACTIVE: '✅ نشط',
  EXPIRED: '⏰ منتهي',
  ARCHIVED: '🗂️ مؤرشف',
};

const priorityLabels = {
  CRITICAL: '🔴 حرجة',
  HIGH: '🟠 عالية',
  NORMAL: '🔵 عادية',
  LOW: '⚪ منخفضة',
};

const typeLabels = {
  ANNOUNCEMENT: '📢 إعلان',
  CRITICAL: '🚨 حرج',
  GUIDELINE: '📋 إرشادات',
  ASSET_APPROVED: '✅ موافقة',
  MAINTENANCE: '🔧 صيانة',
  FEATURE: '✨ ميزة جديدة',
  POLICY: '📜 سياسة',
};

interface Announcement {
  id: string;
  title: string;
  bodyMd: string;
  type: string;
  priority: string;
  status: string;
  isPinned: boolean;
  startAt?: string;
  endAt?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    email?: string;
  };
  audienceRoles: string[];
  attachments?: any[];
}

/**
 * صفحة عرض الإعلان الفردي
 * Individual Announcement View Page
 */
export default function AnnouncementViewPage() {
  const params = useParams();
  const router = useRouter();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const announcementId = params.id as string;

  // جلب بيانات الإعلان
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await fetch(`/api/admin/announcements/${announcementId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'فشل في جلب الإعلان');
        }

        if (data.success && data.data) {
          setAnnouncement(data.data);
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

  // حذف الإعلان
  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch(`/api/admin/announcements/${announcementId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في حذف الإعلان');
      }

      toast.success('🎉 تم حذف الإعلان بنجاح!\n✅ تم حذف الإعلان نهائياً من النظام', {
        duration: 6000,
        style: {
          background: '#10B981',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
        },
      });

      router.push('/admin/announcements');
    } catch (error) {
      console.error('❌ خطأ في حذف الإعلان:', error);
      toast.error(`❌ فشل في حذف الإعلان\n⚠️ ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, {
        duration: 8000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    } finally {
      setActionLoading(false);
    }
  };

  // تغيير حالة الإعلان
  const changeStatus = async (newStatus: string) => {
    setActionLoading(true);

    try {
      const response = await fetch(`/api/admin/announcements/${announcementId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل في تحديث الحالة');
      }

      if (data.success && data.data) {
        setAnnouncement(data.data);
        toast.success(`✅ تم تحديث حالة الإعلان إلى "${statusLabels[newStatus as keyof typeof statusLabels]}"`, {
          duration: 4000,
          style: {
            background: '#10B981',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
      }
    } catch (error) {
      console.error('❌ خطأ في تحديث الحالة:', error);
      toast.error(`❌ فشل في تحديث الحالة\n⚠️ ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, {
        duration: 8000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
    } finally {
      setActionLoading(false);
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

  if (!announcement) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            الإعلان غير موجود
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            لم يتم العثور على الإعلان المطلوب
          </p>
          <Link href="/admin/announcements">
            <Button>
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للإعلانات
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/announcements">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للإعلانات
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              {announcement.title}
              {announcement.isPinned && (
                <Pin className="w-5 h-5 text-orange-500" />
              )}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className={statusColors[announcement.status as keyof typeof statusColors]}
              >
                {statusLabels[announcement.status as keyof typeof statusLabels]}
              </Badge>
              <Badge
                variant="outline"
                className={priorityColors[announcement.priority as keyof typeof priorityColors]}
              >
                {priorityLabels[announcement.priority as keyof typeof priorityLabels]}
              </Badge>
              <Badge variant="outline">
                {typeLabels[announcement.type as keyof typeof typeLabels]}
              </Badge>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={actionLoading}>
              <MoreVertical className="w-4 h-4 ml-2" />
              الإجراءات
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={() => router.push(`/admin/announcements/edit/${announcementId}`)}
            >
              <Edit className="w-4 h-4 ml-3" />
              تعديل الإعلان
            </DropdownMenuItem>

            {announcement.status === 'DRAFT' && (
              <DropdownMenuItem onClick={() => changeStatus('ACTIVE')}>
                <Calendar className="w-4 h-4 ml-3" />
                تفعيل الإعلان
              </DropdownMenuItem>
            )}

            {announcement.status === 'ACTIVE' && (
              <DropdownMenuItem onClick={() => changeStatus('ARCHIVED')}>
                <Clock className="w-4 h-4 ml-3" />
                أرشفة الإعلان
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4 ml-3" />
              حذف الإعلان
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* المحتوى الرئيسي */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>محتوى الإعلان</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap">
                  {announcement.bodyMd}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الشريط الجانبي */}
        <div className="space-y-6">
          {/* معلومات الإعلان */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات الإعلان</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">المؤلف</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{announcement.author?.name || 'غير محدد'}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">تاريخ الإنشاء</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">
                    {format(new Date(announcement.createdAt), 'PPP p', { locale: ar })}
                  </span>
                </div>
              </div>

              {announcement.updatedAt !== announcement.createdAt && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">آخر تحديث</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {format(new Date(announcement.updatedAt), 'PPP p', { locale: ar })}
                    </span>
                  </div>
                </div>
              )}

              {announcement.startAt && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">تاريخ البداية</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className="text-sm">
                      {format(new Date(announcement.startAt), 'PPP p', { locale: ar })}
                    </span>
                  </div>
                </div>
              )}

              {announcement.endAt && (
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">تاريخ النهاية</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <span className="text-sm">
                      {format(new Date(announcement.endAt), 'PPP p', { locale: ar })}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* الجمهور المستهدف */}
          {announcement.audienceRoles && announcement.audienceRoles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  الجمهور المستهدف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {announcement.audienceRoles.map((role, index) => (
                    <Badge key={index} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* المرفقات */}
          {announcement.attachments && announcement.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>المرفقات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {announcement.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <span className="text-sm">{attachment.filename}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

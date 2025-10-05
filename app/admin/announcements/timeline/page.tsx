'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { useAnnouncements } from '@/hooks/useAnnouncements';
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

const typeLabels = {
  ANNOUNCEMENT: '📢',
  CRITICAL: '🚨',
  GUIDELINE: '📋',
  ASSET_APPROVED: '✅',
  MAINTENANCE: '🔧',
  FEATURE: '✨',
  POLICY: '📜',
};

/**
 * صفحة الخط الزمني للإعلانات
 * Announcements Timeline Page
 */
export default function AnnouncementsTimelinePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading } = useAnnouncements('timeline');

  const timelineData = data?.data || [];

  // فلترة البيانات بناءً على البحث
  const filteredData = timelineData.filter((item: any) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.bodyMd?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // تجميع البيانات حسب التاريخ
  const groupedData = filteredData.reduce((groups: any, item: any) => {
    const date = format(new Date(item.createdAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {});

  // ترتيب التواريخ (الأحدث أولاً)
  const sortedDates = Object.keys(groupedData).sort().reverse();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
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
              <Clock className="w-6 h-6" />
              الخط الزمني للإعلانات
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              عرض زمني لجميع الإعلانات والتنبيهات
            </p>
          </div>
        </div>

        <Link href="/admin/announcements/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 ml-2" />
            إعلان جديد
          </Button>
        </Link>
      </div>

      {/* شريط البحث والفلاتر */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="البحث في الإعلانات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 ml-2" />
              فلترة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* الخط الزمني */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            لا توجد إعلانات
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm.trim() 
              ? `لا توجد نتائج للبحث "${searchTerm}"`
              : 'لم يتم إنشاء أي إعلانات بعد'
            }
          </p>
          <Link href="/admin/announcements/new">
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              إنشاء إعلان جديد
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((date) => {
            const dayItems = groupedData[date];
            const formattedDate = format(new Date(date), 'EEEE، d MMMM yyyy', { locale: ar });

            return (
              <div key={date} className="relative">
                {/* خط التاريخ */}
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        {formattedDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 mr-4"></div>
                </div>

                {/* إعلانات اليوم */}
                <div className="space-y-4 mr-8">
                  {dayItems.map((announcement: any, index: number) => (
                    <Card key={announcement.id} className="relative hover:shadow-md transition-shadow">
                      {/* خط الربط */}
                      <div className="absolute -right-8 top-6 w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-900"></div>
                      {index < dayItems.length - 1 && (
                        <div className="absolute -right-6 top-10 w-px h-full bg-gray-200 dark:bg-gray-700"></div>
                      )}

                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">
                                {typeLabels[announcement.type as keyof typeof typeLabels]}
                              </span>
                              <h3 className="font-semibold text-lg">
                                <Link 
                                  href={`/admin/announcements/${announcement.id}`}
                                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                  {announcement.title}
                                </Link>
                              </h3>
                              {announcement.isPinned && (
                                <Badge variant="secondary" className="text-xs">
                                  📌 مثبت
                                </Badge>
                              )}
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                              {announcement.bodyMd?.substring(0, 200)}
                              {announcement.bodyMd?.length > 200 && '...'}
                            </p>

                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{announcement.author?.name || 'غير محدد'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {format(new Date(announcement.createdAt), 'HH:mm')}
                                </span>
                              </div>
                              {announcement.audienceRoles?.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <span>🎯 {announcement.audienceRoles.length} دور</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 flex-col items-end">
                            <div className="flex gap-2">
                              <Badge
                                variant="outline"
                                className={priorityColors[announcement.priority as keyof typeof priorityColors]}
                              >
                                {announcement.priority}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={statusColors[announcement.status as keyof typeof statusColors]}
                              >
                                {announcement.status}
                              </Badge>
                            </div>

                            <div className="flex gap-1 mt-2">
                              <Link href={`/admin/announcements/${announcement.id}`}>
                                <Button variant="outline" size="sm">
                                  عرض
                                </Button>
                              </Link>
                              <Link href={`/admin/announcements/edit/${announcement.id}`}>
                                <Button variant="ghost" size="sm">
                                  تعديل
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* إحصائيات سريعة */}
      {!isLoading && filteredData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">إحصائيات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
                <div className="text-gray-600 dark:text-gray-400">إجمالي الإعلانات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredData.filter((item: any) => item.status === 'ACTIVE').length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">النشطة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {filteredData.filter((item: any) => item.priority === 'CRITICAL').length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">الحرجة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Object.keys(groupedData).length}
                </div>
                <div className="text-gray-600 dark:text-gray-400">الأيام</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

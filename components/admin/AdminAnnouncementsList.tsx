'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Eye, 
  Trash2, 
  MoreVertical,
  Bell,
  Pin,
  Users,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { formatDashboardStat } from "@/lib/format-utils";
import Link from 'next/link';

const formatNumber = (num: number): string => {
  return formatDashboardStat(num);
};

const formatDateTimeLocal = (date: string | Date) => {
  const dateTime = format(new Date(date), 'PPP p', { locale: ar });
  const [datePart, timePart] = dateTime.split(' في ');
  return { date: datePart, time: timePart || '' };
};

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

/**
 * قائمة الإعلانات الكاملة
 * Full announcements list component
 */
export function AdminAnnouncementsList() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    q: '',
    type: '',
    priority: '',
    status: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_LIMIT = 20;

  const { data, isLoading, mutate } = useAnnouncements('list', {
    ...filters,
    page: currentPage,
    limit: PAGE_LIMIT,
  });

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, q: value }));
    setCurrentPage(1);
  };

  const filteredAnnouncements = data?.data || [];
  const stats = {
    total: data?.pagination?.total || 0,
    active: filteredAnnouncements.filter((a: any) => a.status === 'ACTIVE').length,
    draft: filteredAnnouncements.filter((a: any) => a.status === 'DRAFT').length,
    critical: filteredAnnouncements.filter((a: any) => a.priority === 'CRITICAL').length,
  };

  return (
    <TooltipProvider>
      <div className="card min-h-[600px]">
        {/* Header */}
        <div className="p-4 border-b border-[hsl(var(--line))]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[hsl(var(--muted))]">
                عرض الإعلانات:
              </span>
              <Badge
                variant="outline"
                className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-300"
              >
                📢 جميع الإعلانات
              </Badge>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                ({filteredAnnouncements.length} إعلان)
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              إجمالي: {stats.total} إعلان
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="البحث في الإعلانات..."
                value={filters.q}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-10 bg-[hsl(var(--bg-card))] border border-[hsl(var(--line))] text-[hsl(var(--fg))] rounded-lg"
              />
            </div>

            <Select
              value={filters.type || '__all'}
              onValueChange={(value) => setFilters({ ...filters, type: value === '__all' ? '' : value })}
            >
              <SelectTrigger className="bg-[hsl(var(--bg-card))] border border-[hsl(var(--line))] text-[hsl(var(--fg))]">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">جميع الأنواع</SelectItem>
                <SelectItem value="ANNOUNCEMENT">📢 إعلان</SelectItem>
                <SelectItem value="CRITICAL">🚨 حرج</SelectItem>
                <SelectItem value="GUIDELINE">📋 إرشادات</SelectItem>
                <SelectItem value="ASSET_APPROVED">✅ موافقة</SelectItem>
                <SelectItem value="MAINTENANCE">🔧 صيانة</SelectItem>
                <SelectItem value="FEATURE">✨ ميزة جديدة</SelectItem>
                <SelectItem value="POLICY">📜 سياسة</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority || '__all'}
              onValueChange={(value) => setFilters({ ...filters, priority: value === '__all' ? '' : value })}
            >
              <SelectTrigger className="bg-[hsl(var(--bg-card))] border border-[hsl(var(--line))] text-[hsl(var(--fg))]">
                <SelectValue placeholder="الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">جميع الأولويات</SelectItem>
                <SelectItem value="LOW">⚪ منخفضة</SelectItem>
                <SelectItem value="NORMAL">🔵 عادية</SelectItem>
                <SelectItem value="HIGH">🟠 عالية</SelectItem>
                <SelectItem value="CRITICAL">🔴 حرجة</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status || '__all'}
              onValueChange={(value) => setFilters({ ...filters, status: value === '__all' ? '' : value })}
            >
              <SelectTrigger className="bg-[hsl(var(--bg-card))] border border-[hsl(var(--line))] text-[hsl(var(--fg))]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all">جميع الحالات</SelectItem>
                <SelectItem value="DRAFT">✏️ مسودة</SelectItem>
                <SelectItem value="SCHEDULED">🕒 مجدول</SelectItem>
                <SelectItem value="ACTIVE">✅ نشط</SelectItem>
                <SelectItem value="EXPIRED">⏰ منتهي</SelectItem>
                <SelectItem value="ARCHIVED">🗂️ مؤرشف</SelectItem>
              </SelectContent>
            </Select>

            <Link href="/admin/announcements/new">
              <Button className="w-full bg-[hsl(var(--accent))] text-white hover:bg-[hsl(var(--accent))]/90">
                <Plus className="h-4 w-4 ml-2" />
                إعلان جديد
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-0 flex-1 flex flex-col">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              <p className="mt-2 text-[hsl(var(--muted))]">
                جاري التحميل...
              </p>
            </div>
          ) : !filteredAnnouncements || filteredAnnouncements.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-[hsl(var(--fg))] mb-2">
                  لا توجد إعلانات
                </h3>
                <p className="text-[hsl(var(--muted))] mb-6">
                  {filters.q.trim()
                    ? `لا توجد نتائج للبحث "${filters.q}"`
                    : "لا توجد إعلانات في هذا القسم"}
                </p>
                <Link href="/admin/announcements/new">
                  <Button className="bg-[hsl(var(--accent))] text-white">
                    <Plus className="w-4 h-4 ml-2" />
                    إنشاء إعلان جديد
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto flex-1">
                <Table>
                  <TableHeader className="bg-[hsl(var(--bg-card))] border-b border-[hsl(var(--line))]">
                    <TableRow>
                      <TableHead className="text-right w-12 text-[hsl(var(--muted))]">
                        #
                      </TableHead>
                      <TableHead className="text-right text-[hsl(var(--muted))]">
                        العنوان
                      </TableHead>
                      <TableHead className="text-center text-[hsl(var(--muted))]">
                        النوع
                      </TableHead>
                      <TableHead className="text-center text-[hsl(var(--muted))]">
                        الأولوية
                      </TableHead>
                      <TableHead className="text-center text-[hsl(var(--muted))]">
                        الحالة
                      </TableHead>
                      <TableHead className="text-center text-[hsl(var(--muted))]">
                        المؤلف
                      </TableHead>
                      <TableHead className="text-center text-[hsl(var(--muted))]">
                        تاريخ الإنشاء
                      </TableHead>
                      <TableHead className="text-center text-[hsl(var(--muted))]">
                        الإجراءات
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnnouncements.map((announcement: any, index: number) => {
                      const dateTime = formatDateTimeLocal(announcement.createdAt);
                      
                      return (
                        <TableRow
                          key={announcement.id}
                          className="hover:bg-[hsl(var(--accent))]/5 border-b border-[hsl(var(--line))]"
                        >
                          <TableCell className="py-3 text-right font-medium text-[hsl(var(--fg))] text-xs">
                            {((currentPage - 1) * PAGE_LIMIT) + index + 1}
                          </TableCell>

                          <TableCell className="py-3 text-right">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-[hsl(var(--fg))] line-clamp-2">
                                  {announcement.title}
                                </p>
                                {announcement.isPinned && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Pin className="w-3 h-3 text-orange-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>إعلان مثبت</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                              <p className="text-xs text-[hsl(var(--muted))] line-clamp-1">
                                {announcement.bodyMd?.substring(0, 80)}
                                {announcement.bodyMd?.length > 80 && '...'}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell className="py-3 text-center">
                            <div className="chip bg-[hsl(var(--accent))]/5 text-[hsl(var(--accent))] border border-[hsl(var(--accent))]/15">
                              {typeLabels[announcement.type as keyof typeof typeLabels] || announcement.type}
                            </div>
                          </TableCell>

                          <TableCell className="py-3 text-center">
                            <Badge
                              variant="outline"
                              className={priorityColors[announcement.priority as keyof typeof priorityColors]}
                            >
                              {priorityLabels[announcement.priority as keyof typeof priorityLabels] || announcement.priority}
                            </Badge>
                          </TableCell>

                          <TableCell className="py-3 text-center">
                            <Badge
                              variant="outline"
                              className={statusColors[announcement.status as keyof typeof statusColors]}
                            >
                              {statusLabels[announcement.status as keyof typeof statusLabels] || announcement.status}
                            </Badge>
                          </TableCell>

                          <TableCell className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Users className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                              <span className="text-xs font-medium text-[hsl(var(--fg))]">
                                {announcement.author?.name || 'غير محدد'}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="py-3 text-center">
                            <div className="text-xs">
                              <div className="font-medium text-[hsl(var(--fg))]">
                                {dateTime.date}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400 text-[10px] mt-0.5">
                                {dateTime.time}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="py-3">
                            <DropdownMenu modal={false}>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-[hsl(var(--bg-card))] border border-[hsl(var(--line))] text-[hsl(var(--fg))]"
                                >
                                  <MoreVertical className="w-3 h-3 ml-1" />
                                  إجراءات
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-56 bg-[hsl(var(--bg-card))] border border-[hsl(var(--line))] rounded-lg shadow-lg"
                              >
                                <DropdownMenuItem
                                  onClick={() => router.push(`/admin/announcements/${announcement.id}`)}
                                  className="p-3 text-[hsl(var(--fg))] hover:bg-[hsl(var(--accent))]/5"
                                >
                                  <Eye className="w-4 h-4 ml-3 text-[hsl(var(--accent))]" />
                                  <span className="font-medium">عرض الإعلان</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => router.push(`/admin/announcements/edit/${announcement.id}`)}
                                  className="p-3 text-[hsl(var(--fg))] hover:bg-[hsl(var(--accent))]/5"
                                >
                                  <Edit className="w-4 h-4 ml-3 text-[hsl(var(--muted))]" />
                                  <span className="font-medium">تعديل الإعلان</span>
                                </DropdownMenuItem>

                                {announcement.status === 'DRAFT' && (
                                  <DropdownMenuItem
                                    onClick={() => {/* TODO: Implement publish */}}
                                    className="p-3 text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/5"
                                  >
                                    <Calendar className="w-4 h-4 ml-3 text-[hsl(var(--accent))]" />
                                    <span className="font-medium">تفعيل الإعلان</span>
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator className="bg-[hsl(var(--line))] my-1" />

                                <DropdownMenuItem
                                  onClick={() => {/* TODO: Implement delete */}}
                                  className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4 ml-3 text-red-600" />
                                  <span className="font-medium">حذف الإعلان</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 p-6 border-t border-[hsl(var(--line))]">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1 || isLoading}
                    className="bg-[hsl(var(--bg-card))] border border-[hsl(var(--line))] text-[hsl(var(--fg))]"
                  >
                    السابق
                  </Button>
                  <div className="text-sm text-[hsl(var(--muted))]">
                    صفحة {currentPage} من {data.pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                    disabled={currentPage >= data.pagination.totalPages || isLoading}
                    className="bg-[hsl(var(--bg-card))] border border-[hsl(var(--line))] text-[hsl(var(--fg))]"
                  >
                    التالي
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { Search, Plus, Filter, Edit, Eye, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const priorityColors = {
  CRITICAL: 'destructive' as const,
  HIGH: 'default' as const,
  NORMAL: 'secondary' as const,
  LOW: 'outline' as const,
};

const statusColors = {
  DRAFT: 'secondary' as const,
  SCHEDULED: 'default' as const,
  ACTIVE: 'default' as const,
  EXPIRED: 'outline' as const,
  ARCHIVED: 'outline' as const,
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

  const { data, isLoading, mutate } = useAnnouncements('list', filters);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, q: value }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            جميع الإعلانات
            {data?.pagination?.total && (
              <Badge variant="secondary">
                {data.pagination.total}
              </Badge>
            )}
          </CardTitle>
          <Button onClick={() => router.push('/admin/announcements/new')}>
            <Plus className="h-4 w-4 ml-2" />
            إعلان جديد
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث في الإعلانات..."
              value={filters.q}
              onChange={(e) => handleSearch(e.target.value)}
              className="pr-10 bg-[hsl(var(--bg-card))] border border-[hsl(var(--line))]"
            />
          </div>

          <Select
            value={filters.type || '__all'}
            onValueChange={(value) => setFilters({ ...filters, type: value === '__all' ? '' : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">الكل</SelectItem>
              <SelectItem value="ANNOUNCEMENT">إعلان</SelectItem>
              <SelectItem value="CRITICAL">حرج</SelectItem>
              <SelectItem value="GUIDELINE">إرشادات</SelectItem>
              <SelectItem value="ASSET_APPROVED">موافقة</SelectItem>
              <SelectItem value="MAINTENANCE">صيانة</SelectItem>
              <SelectItem value="FEATURE">ميزة جديدة</SelectItem>
              <SelectItem value="POLICY">سياسة</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority || '__all'}
            onValueChange={(value) => setFilters({ ...filters, priority: value === '__all' ? '' : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="الأولوية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">الكل</SelectItem>
              <SelectItem value="LOW">منخفضة</SelectItem>
              <SelectItem value="NORMAL">عادية</SelectItem>
              <SelectItem value="HIGH">عالية</SelectItem>
              <SelectItem value="CRITICAL">حرجة</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status || '__all'}
            onValueChange={(value) => setFilters({ ...filters, status: value === '__all' ? '' : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">الكل</SelectItem>
              <SelectItem value="DRAFT">مسودة</SelectItem>
              <SelectItem value="SCHEDULED">مجدول</SelectItem>
              <SelectItem value="ACTIVE">نشط</SelectItem>
              <SelectItem value="EXPIRED">منتهي</SelectItem>
              <SelectItem value="ARCHIVED">مؤرشف</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {!data?.data || data.data.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Filter className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-1">لا توجد إعلانات</p>
            <p className="text-sm text-muted-foreground">
              جرب تعديل الفلاتر أو أنشئ إعلان جديد
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.data.map((announcement: any) => (
              <div
                key={announcement.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg truncate">
                        {announcement.title}
                      </h3>
                      {announcement.isPinned && (
                        <Badge variant="secondary" className="text-xs">
                          📌 مثبت
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {announcement.bodyMd.substring(0, 150)}
                      {announcement.bodyMd.length > 150 && '...'}
                    </p>
                    
                    <div className="flex gap-2 flex-wrap mb-3">
                      <Badge variant="outline">
                        {announcement.type}
                      </Badge>
                      <Badge variant={priorityColors[announcement.priority as keyof typeof priorityColors]}>
                        {announcement.priority}
                      </Badge>
                      <Badge variant={statusColors[announcement.status as keyof typeof statusColors]}>
                        {announcement.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        بواسطة {announcement.author?.name || 'غير معروف'}
                      </span>
                      <span>•</span>
                      <span>
                        {format(new Date(announcement.createdAt), 'PPP', { locale: ar })}
                      </span>
                      {announcement.startAt && (
                        <>
                          <span>•</span>
                          <span>
                            يبدأ {format(new Date(announcement.startAt), 'PPP', { locale: ar })}
                          </span>
                        </>
                      )}
                    </div>

                    {announcement.attachments && announcement.attachments.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          📎 {announcement.attachments.length} مرفق
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 ml-1" />
                      عرض
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 ml-1" />
                      تعديل
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {data.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  عرض {((data.pagination.page - 1) * data.pagination.limit) + 1} - {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} من {data.pagination.total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.pagination.page === 1}
                  >
                    السابق
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.pagination.page === data.pagination.totalPages}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

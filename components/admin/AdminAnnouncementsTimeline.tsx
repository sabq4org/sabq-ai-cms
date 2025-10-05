'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { Pin, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const priorityConfig = {
  CRITICAL: { 
    color: 'destructive' as const, 
    icon: AlertTriangle,
    label: 'حرج'
  },
  HIGH: { 
    color: 'default' as const, 
    icon: AlertTriangle,
    label: 'عالي'
  },
  NORMAL: { 
    color: 'secondary' as const, 
    icon: CheckCircle,
    label: 'عادي'
  },
  LOW: { 
    color: 'outline' as const, 
    icon: CheckCircle,
    label: 'منخفض'
  },
};

const typeLabels: Record<string, string> = {
  ANNOUNCEMENT: 'إعلان',
  CRITICAL: 'حرج',
  GUIDELINE: 'إرشادات',
  ASSET_APPROVED: 'موافقة',
  MAINTENANCE: 'صيانة',
  FEATURE: 'ميزة جديدة',
  POLICY: 'سياسة',
};

const statusIcons = {
  ACTIVE: CheckCircle,
  SCHEDULED: Clock,
  DRAFT: Clock,
  EXPIRED: AlertTriangle,
  ARCHIVED: AlertTriangle,
};

/**
 * الخط الزمني للإعلانات المهمة
 * Timeline component for important announcements
 */
export function AdminAnnouncementsTimeline() {
  const { data: timeline, isLoading } = useAnnouncements('timeline');

  if (isLoading) {
    return (
      <Card className="sticky top-4 h-fit">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-4 h-4 rounded-full mt-1" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <Card className="sticky top-4 h-fit">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            الخط الزمني
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              لا توجد إعلانات حالياً
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4 h-fit">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          الخط الزمني للأهم
          <Badge variant="secondary" className="mr-auto">
            {timeline.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px] px-6">
          <div className="space-y-4 pb-4">
            {timeline.map((item: any, index: number) => {
              const PriorityIcon = priorityConfig[item.priority as keyof typeof priorityConfig].icon;
              const StatusIcon = statusIcons[item.status as keyof typeof statusIcons];
              
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 text-sm pb-4 border-b last:border-0 hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="mt-1 relative">
                    {item.isPinned && (
                      <Pin className="w-3 h-3 text-blue-500 absolute -top-2 -right-2 fill-blue-500" />
                    )}
                    <StatusIcon 
                      className={`w-4 h-4 ${
                        item.status === 'ACTIVE' ? 'text-green-500' :
                        item.status === 'SCHEDULED' ? 'text-yellow-500' :
                        'text-gray-400'
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-foreground">
                      {item.title}
                    </p>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.startAt 
                        ? formatDistanceToNow(new Date(item.startAt), { 
                            addSuffix: true,
                            locale: ar 
                          })
                        : formatDistanceToNow(new Date(item.createdAt), {
                            addSuffix: true,
                            locale: ar
                          })
                      }
                    </p>

                    <div className="flex gap-1 mt-2 flex-wrap">
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                      >
                        {typeLabels[item.type] || item.type}
                      </Badge>
                      <Badge 
                        variant={priorityConfig[item.priority as keyof typeof priorityConfig].color}
                        className="text-xs"
                      >
                        {priorityConfig[item.priority as keyof typeof priorityConfig].label}
                      </Badge>
                      {item.isPinned && (
                        <Badge variant="secondary" className="text-xs">
                          📌 مثبت
                        </Badge>
                      )}
                    </div>

                    {item.author && (
                      <p className="text-xs text-muted-foreground mt-2">
                        بواسطة {item.author.name}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

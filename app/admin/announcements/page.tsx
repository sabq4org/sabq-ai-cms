"use client";

import { AdminAnnouncementsBanner } from '@/components/admin/AdminAnnouncementsBanner';
import { AdminAnnouncementsList } from '@/components/admin/AdminAnnouncementsList';
import { AdminAnnouncementsTimeline } from '@/components/admin/AdminAnnouncementsTimeline';
import { DesignComponents } from "@/components/design-system/DesignSystemGuide";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Plus,
  Users,
  XCircle,
  Bell,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { formatDashboardStat } from "@/lib/format-utils";

// دالة تنسيق الأرقام
const formatNumber = (num: number): string => {
  return formatDashboardStat(num);
};

/**
 * صفحة الإعلانات الإدارية
 * Admin Announcements Page
 */
export default function AnnouncementsPage() {
  // جلب الإحصائيات
  const { data: statsData } = useAnnouncements('list', { limit: 1000 });

  // حساب الإحصائيات
  const stats = {
    total: statsData?.pagination?.total || 0,
    active: statsData?.data?.filter((a: any) => a.status === 'ACTIVE').length || 0,
    draft: statsData?.data?.filter((a: any) => a.status === 'DRAFT').length || 0,
    scheduled: statsData?.data?.filter((a: any) => a.status === 'SCHEDULED').length || 0,
    archived: statsData?.data?.filter((a: any) => a.status === 'ARCHIVED').length || 0,
    critical: statsData?.data?.filter((a: any) => a.priority === 'CRITICAL').length || 0,
  };

  return (
    <div className="news-page-container w-full max-w-full m-0 p-0">
      <div className="space-y-8 bg-[hsl(var(--bg))] min-h-screen p-0 w-full">
        {/* رسالة الترحيب */}
        <div className="card card-accent bg-[hsl(var(--bg-card))] border border-[hsl(var(--accent))] border-opacity-20 border-l-4 p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                نظام إدارة الإعلانات والتنبيهات
              </h2>
              <p className="text-muted mb-4">
                إدارة شاملة للإعلانات الإدارية والتنبيهات مع أدوات متقدمة للتواصل الفعال
              </p>
              <div className="flex gap-3">
                <DesignComponents.StatusIndicator
                  status="success"
                  text={`${formatNumber(stats?.active || 0)} إعلان نشط`}
                />
                <DesignComponents.StatusIndicator
                  status="info"
                  text={`${formatNumber(stats?.total || 0)} إجمالي`}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/announcements/timeline">
                <button className="btn bg-[hsl(var(--bg-card))] border border-[hsl(var(--line))] text-[hsl(var(--fg))]">
                  <Clock className="w-4 h-4 ml-2" />
                  الخط الزمني
                </button>
              </Link>
              <Link href="/admin/announcements/new">
                <button className="btn btn-primary bg-[hsl(var(--accent))] text-white">
                  <Plus className="w-4 h-4 ml-2" />
                  إعلان جديد
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* شريط البانر للإعلانات العاجلة */}
        <AdminAnnouncementsBanner />

        {/* إحصائيات الإعلانات */}
        <div>
          <DesignComponents.SectionHeader
            title="إحصائيات الإعلانات"
            description="نظرة عامة على حالة الإعلانات والتنبيهات"
            action={
              <div className="flex gap-2">
                <button className="btn btn-sm border border-[hsl(var(--line))]">
                  <Filter className="w-4 h-4 ml-2" />
                  تصفية
                </button>
                <button className="btn btn-sm btn-primary">
                  <Download className="w-4 h-4 ml-2" />
                  تصدير
                </button>
              </div>
            }
          />

          {/* بطاقات إحصائيات الإعلانات */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-6 gap-4 sm:gap-6 mb-8">
            {/* بطاقة الإعلانات النشطة */}
            <div className="card cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[hsl(var(--accent))] bg-opacity-10 rounded-xl flex items-center justify-center text-[hsl(var(--accent))]">
                  <CheckCircle className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="text-xs text-muted mb-1">الإعلانات النشطة</div>
                  <div className="heading-3 my-1 text-[hsl(var(--accent))]">
                    {formatNumber(stats?.active || 0)}
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-xs text-green-500">
                      +8.3%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* بطاقة المسودات */}
            <div className="card cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[hsl(var(--accent))] bg-opacity-10 rounded-xl flex items-center justify-center text-[hsl(var(--accent))]">
                  <Users className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="text-xs text-muted mb-1">المسودات</div>
                  <div className="heading-3 my-1 text-[hsl(var(--accent))]">
                    {formatNumber(stats?.draft || 0)}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted">قيد التحرير</span>
                  </div>
                </div>
              </div>
            </div>

            {/* بطاقة المجدولة */}
            <div className="card cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[hsl(var(--accent))] bg-opacity-10 rounded-xl flex items-center justify-center text-[hsl(var(--accent))]">
                  <Clock className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="text-xs text-muted mb-1">المجدولة</div>
                  <div className="heading-3 my-1 text-[hsl(var(--accent))]">
                    {formatNumber(stats?.scheduled || 0)}
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs text-blue-500">
                      +2%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* بطاقة المؤرشفة */}
            <div className="card cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[hsl(var(--accent))] bg-opacity-10 rounded-xl flex items-center justify-center text-[hsl(var(--accent))]">
                  <XCircle className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="text-xs text-muted mb-1">المؤرشفة</div>
                  <div className="heading-3 my-1 text-[hsl(var(--accent))]">
                    {formatNumber(stats?.archived || 0)}
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-xs text-red-500">
                      -1.5%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* بطاقة الحرجة */}
            <div className="card cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[hsl(var(--accent))] bg-opacity-10 rounded-xl flex items-center justify-center text-[hsl(var(--accent))]">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="text-xs text-muted mb-1">الحرجة</div>
                  <div className="heading-3 my-1 text-[hsl(var(--accent))]">
                    {formatNumber(stats?.critical || 0)}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted">عالية الأولوية</span>
                  </div>
                </div>
              </div>
            </div>

            {/* بطاقة الإجمالي */}
            <div className="card cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[hsl(var(--accent))] bg-opacity-10 rounded-xl flex items-center justify-center text-[hsl(var(--accent))]">
                  <Bell className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="text-xs text-muted mb-1">الإجمالي</div>
                  <div className="heading-3 my-1 text-[hsl(var(--accent))]">
                    {formatNumber(stats?.total || 0)}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted">جميع الإعلانات</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* قائمة الإعلانات الرئيسية */}
        <AdminAnnouncementsList />
      </div>
    </div>
  );
}

import { AdminAnnouncementsBanner } from '@/components/admin/AdminAnnouncementsBanner';
import { AdminAnnouncementsList } from '@/components/admin/AdminAnnouncementsList';
import { AdminAnnouncementsTimeline } from '@/components/admin/AdminAnnouncementsTimeline';
import { PageContainer } from '@/components/admin/layout/PageContainer';
import { PageHeader } from '@/components/admin/layout/PageHeader';

/**
 * صفحة الإعلانات الإدارية
 * Admin Announcements Page
 */
export default function AnnouncementsPage() {
  return (
    <PageContainer size="wide">
      <PageHeader
        title="الإعلانات والتنبيهات"
        subtitle="إدارة الإعلانات والتنبيهات للفريق"
      />

      {/* شريط البانر للإعلانات العاجلة */}
      <AdminAnnouncementsBanner />
      
      {/* شبكة المحتوى الرئيسية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* القائمة الرئيسية - تأخذ 2/3 من العرض */}
        <div className="lg:col-span-2">
          <AdminAnnouncementsList />
        </div>
        
        {/* الخط الزمني - يأخذ 1/3 من العرض */}
        <div className="lg:col-span-1">
          <AdminAnnouncementsTimeline />
        </div>
      </div>
    </PageContainer>
  );
}

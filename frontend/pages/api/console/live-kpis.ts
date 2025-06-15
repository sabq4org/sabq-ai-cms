import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // التحقق من المصادقة (مؤقت - يجب تنفيذ نظام مصادقة حقيقي)
    // const user = await verifyAuth(req);
    // if (!user) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }

    // جلب المؤشرات من قاعدة البيانات
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // إحصائيات الزوار النشطين (محاكاة)
    const activeUsers = Math.floor(Math.random() * 5000) + 10000;
    const activeUsersChange = Math.floor(Math.random() * 30) - 10;

    // المقالات المنشورة اليوم (محاكاة)
    const articlesPublishedToday = Math.floor(Math.random() * 50) + 100;

    // إجمالي المشاهدات (محاكاة)
    const totalViews = Math.floor(Math.random() * 50000) + 50000;
    const viewsChange = Math.floor(Math.random() * 25) + 5;

    // معدل التفاعل (محاكاة)
    const engagementRate = (Math.random() * 30 + 50).toFixed(1);
    const engagementChange = (Math.random() * 10 - 5).toFixed(1);

    // الأخبار العاجلة (محاكاة)
    const breakingNews = Math.floor(Math.random() * 5) + 1;

    // متوسط وقت القراءة (محاكاة)
    const avgReadingTime = `${Math.floor(Math.random() * 2) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;

    // التعليقات الجديدة (محاكاة)
    const newComments = Math.floor(Math.random() * 300) + 100;
    const pendingComments = Math.floor(newComments * 0.1);

    // أداء الخادم (محاكاة)
    const serverUptime = (99.5 + Math.random() * 0.4).toFixed(1);

    const kpis = [
      {
        title: 'الزوار النشطون',
        value: activeUsers.toLocaleString('ar-SA'),
        change: `${activeUsersChange > 0 ? '+' : ''}${activeUsersChange}% من أمس`,
        changeType: activeUsersChange > 0 ? 'positive' : activeUsersChange < 0 ? 'negative' : 'neutral',
        icon: 'Users'
      },
      {
        title: 'المقالات المنشورة',
        value: articlesPublishedToday || 0,
        change: `+${Math.floor(Math.random() * 20)} مقال جديد`,
        changeType: 'positive',
        icon: 'FileText'
      },
      {
        title: 'إجمالي المشاهدات',
        value: `${(totalViews / 1000).toFixed(1)}K`,
        change: `+${viewsChange}% من المتوسط`,
        changeType: 'positive',
        icon: 'Eye'
      },
      {
        title: 'معدل التفاعل',
        value: `${engagementRate}%`,
        change: `${parseFloat(engagementChange) > 0 ? '+' : ''}${engagementChange}% ${parseFloat(engagementChange) < 0 ? 'انخفاض طفيف' : 'زيادة'}`,
        changeType: parseFloat(engagementChange) > 0 ? 'positive' : 'negative',
        icon: 'Activity'
      },
      {
        title: 'الأخبار العاجلة',
        value: breakingNews || 0,
        change: `آخر خبر قبل ${Math.floor(Math.random() * 60)} دقيقة`,
        changeType: 'neutral',
        icon: 'Zap'
      },
      {
        title: 'متوسط وقت القراءة',
        value: avgReadingTime,
        change: 'دقيقة:ثانية',
        changeType: 'neutral',
        icon: 'Clock'
      },
      {
        title: 'التعليقات الجديدة',
        value: newComments,
        change: `${pendingComments} بانتظار المراجعة`,
        changeType: 'neutral',
        icon: 'MessageSquare'
      },
      {
        title: 'أداء الخادم',
        value: `${serverUptime}%`,
        change: 'ممتاز',
        changeType: 'positive',
        icon: 'Globe'
      }
    ];

    // بيانات الرسم البياني (محاكاة لآخر 24 ساعة)
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      return {
        hour: hour.toISOString(),
        visitors: Math.floor(Math.random() * 2000) + 500,
        pageViews: Math.floor(Math.random() * 5000) + 2000,
        engagement: Math.random() * 30 + 40
      };
    });

    res.status(200).json({
      kpis,
      hourlyData,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 
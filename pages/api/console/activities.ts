import type { NextApiRequest, NextApiResponse } from 'next';

interface Activity {
  id: string;
  type: string;
  action: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  target: {
    type: string;
    id: string;
    title: string;
  };
  metadata?: any;
  timestamp: Date;
  ip?: string;
}

// أسماء المستخدمين العشوائية
const userNames = [
  'عبدالله العتيبي',
  'سارة المطيري',
  'محمد الشمري',
  'فاطمة القحطاني',
  'خالد العمري',
  'نورا السالم',
  'أحمد الراشد',
  'هند المالكي',
  'يوسف الحربي',
  'ريم الدوسري'
];

const roles = ['محرر', 'محرر رئيسي', 'مراسل', 'مدقق لغوي', 'محرر أقسام'];
const sections = ['سياسة', 'اقتصاد', 'رياضة', 'تقنية', 'ثقافة', 'محليات'];

const articleTitles = [
  'وزير الطاقة يعلن عن مشروع جديد للطاقة المتجددة',
  'الأخضر السعودي يستعد لمواجهة مصيرية',
  'إطلاق تطبيق حكومي جديد لتسهيل الخدمات',
  'افتتاح أكبر مركز ثقافي في المنطقة',
  'توقعات بنمو الاقتصاد المحلي بنسبة 5%',
  'تطورات جديدة في قطاع التقنية المالية'
];

const actionTypes = [
  { type: 'article', action: 'publish' },
  { type: 'article', action: 'edit' },
  { type: 'article', action: 'create' },
  { type: 'user', action: 'login' },
  { type: 'ai', action: 'generate_title' },
  { type: 'ai', action: 'generate_summary' },
  { type: 'system', action: 'alert' }
];

function generateActivities(count: number): Activity[] {
  const activities: Activity[] = [];
  
  for (let i = 0; i < count; i++) {
    const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
    const userName = userNames[Math.floor(Math.random() * userNames.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const title = articleTitles[Math.floor(Math.random() * articleTitles.length)];
    const section = sections[Math.floor(Math.random() * sections.length)];
    
    const activity: Activity = {
      id: `act-${Date.now()}-${i}`,
      type: actionType.type,
      action: actionType.action,
      user: {
        id: `user-${Math.floor(Math.random() * 100)}`,
        name: userName,
        role: role
      },
      target: {
        type: actionType.type === 'article' ? 'article' : 'system',
        id: `${Math.floor(Math.random() * 1000)}`,
        title: actionType.type === 'article' ? title : 'النظام'
      },
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)), // آخر ساعة
      metadata: {}
    };

    // إضافة metadata حسب نوع النشاط
    if (actionType.type === 'article' && actionType.action === 'publish') {
      activity.metadata.section = section;
      if (Math.random() > 0.8) {
        activity.metadata.breaking = true;
      }
    }

    if (actionType.type === 'ai') {
      activity.metadata.ai_accepted = Math.random() > 0.3;
      activity.metadata.processing_time = (Math.random() * 2).toFixed(1);
    }

    if (actionType.type === 'user' && actionType.action === 'login') {
      activity.metadata.ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      activity.metadata.device = ['MacBook Pro', 'Windows PC', 'iPad', 'iPhone'][Math.floor(Math.random() * 4)];
    }

    activities.push(activity);
  }

  // ترتيب حسب الوقت (الأحدث أولاً)
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = 50, offset = 0, search = '' } = req.query;
    
    // توليد نشاطات عشوائية
    let activities = generateActivities(100);
    
    // تطبيق البحث إذا وجد
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      activities = activities.filter(activity => 
        activity.user.name.toLowerCase().includes(searchLower) ||
        activity.target.title.toLowerCase().includes(searchLower) ||
        activity.action.toLowerCase().includes(searchLower)
      );
    }
    
    // تطبيق التصفح
    const startIndex = parseInt(offset as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedActivities = activities.slice(startIndex, endIndex);
    
    res.status(200).json({
      activities: paginatedActivities,
      total: activities.length,
      offset: startIndex,
      limit: parseInt(limit as string)
    });
    
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 
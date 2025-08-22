import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// إرسال إشعارات ذكية بناءً على الاهتمامات
export async function POST(request: NextRequest) {
  try {
    // التحقق من المصادقة (للمسؤولين فقط)
    const token = request.cookies.get('auth-token')?.value || 
                  request.cookies.get('access_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    let adminUser: any;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      adminUser = decoded;
      
      // التحقق من صلاحيات المسؤول
      if (!decoded.isAdmin && decoded.role !== 'admin') {
        return NextResponse.json({ error: 'صلاحيات مسؤول مطلوبة' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'توكن غير صالح' }, { status: 401 });
    }

    const payload = await request.json();
    let { 
      articleId, 
      articleTitle, 
      articleCategory,
      articleTags,
      isBreaking = false,
      customMessage 
    } = payload || {};
    const articleSlugInput: string | undefined = payload?.articleSlug || undefined;
    const articleUrlInput: string | undefined = payload?.articleUrl || undefined;

    // دعم الإدخال عبر slug أو URL إذا لم يتوفر articleId
    if (!articleId && (articleSlugInput || articleUrlInput)) {
      try {
        const extractedSlug = articleSlugInput || (articleUrlInput ? new URL(articleUrlInput).pathname.split('/').pop() : undefined);
        if (extractedSlug) {
          const art = await prisma.articles.findFirst({
            where: { slug: extractedSlug },
            include: { categories: { select: { id: true, name: true, slug: true } } }
          });
          if (art) {
            articleId = art.id;
            articleTitle = articleTitle || art.title;
            articleCategory = articleCategory || (art as any).categories?.name || 'news';
          }
        }
      } catch (e) {
        console.warn('⚠️ تعذر استخراج المقال من slug/URL:', (e as any)?.message);
      }
    }

    if (!articleId || !articleTitle || !articleCategory) {
      return NextResponse.json({ error: 'معلومات المقال مطلوبة' }, { status: 400 });
    }

    // جلب بيانات المقال للحصول على slug والفئة الدقيقة
    let articleSlug: string | null = articleSlugInput || null;
    let resolvedCategoryName: string = articleCategory;
    let resolvedCategorySlug: string | null = null;

    try {
      const articleRec = await prisma.articles.findUnique({
        where: { id: articleId },
        include: { categories: { select: { name: true, slug: true } } }
      });
      if (articleRec) {
        articleSlug = (articleRec as any).slug || null;
        resolvedCategoryName = (articleRec as any).categories?.name || articleCategory;
        resolvedCategorySlug = (articleRec as any).categories?.slug || null;
      }
    } catch (e) {
      console.warn('⚠️ تعذر جلب بيانات المقال للحصول على slug/الفئة:', (e as any)?.message);
    }

    // جلب المستخدمين المهتمين بهذه الفئة
    const interestedUsers = await getInterestedUsers(
      resolvedCategoryName,
      articleTags || [],
      isBreaking,
      resolvedCategorySlug || undefined
    );

    if (interestedUsers.length === 0) {
      // Fallback: أرسل للمشرفين لضمان التحقق
      const admins = await prisma.users.findMany({
        where: { is_active: true, role: { in: ['admin', 'editor', 'owner'] } },
        select: { id: true, email: true }
      });
      interestedUsers = admins;
    }

    // إنشاء الإشعارات
    const notifications = await createNotifications(
      interestedUsers,
      {
        articleId,
        articleTitle,
        articleCategory: resolvedCategoryName,
        articleSlug: articleSlug || undefined,
        isBreaking,
        customMessage
      }
    );

    // إرسال الإشعارات عبر القنوات المختلفة
    const results = await sendNotifications(notifications);

    return NextResponse.json({ 
      success: true,
      message: `تم إرسال ${results.sent} إشعار بنجاح`,
      details: {
        totalUsers: interestedUsers.length,
        sent: results.sent,
        failed: results.failed,
        channels: results.channels
      }
    });

  } catch (error) {
    console.error('Error sending smart notifications:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إرسال الإشعارات' },
      { status: 500 }
    );
  }
}

// جلب المستخدمين المهتمين
async function getInterestedUsers(
  category: string,
  tags: string[],
  isBreaking: boolean,
  categorySlug?: string
): Promise<any[]> {
  try {
    // إذا كان خبر عاجل، أرسل لجميع المستخدمين النشطين
    if (isBreaking) {
      return await prisma.users.findMany({
        where: {
          is_active: true,
          // تأكد من تفعيل الإشعارات
          notification_preferences: {
            path: '$.enabled',
            equals: true
          }
        },
        select: {
          id: true,
          email: true,
          name: true,
          interests: true,
          notification_preferences: true
        }
      });
    }

    // البحث عن المستخدمين المهتمين بالفئة أو العلامات
    const users = await prisma.users.findMany({
      where: {
        is_active: true,
        OR: (() => {
          const or: any[] = [];
          // مطابقة مرادفات الفئة
          const terms = new Set<string>();
          const lcCat = (category || '').toLowerCase();
          const lcSlug = (categorySlug || '').toLowerCase();
          if (lcCat) terms.add(lcCat);
          if (lcSlug) terms.add(lcSlug);
          if (/محليات|محلي/.test(category) || /local/.test(lcSlug)) {
            ['محليات','محلي','local','local-news','localnews','locals'].forEach(t=>terms.add(t));
          }
          if (/سياح|سفر/.test(category) || /(tourism|travel)/i.test(lcSlug)) {
            ['سياحة','السياحة','سفر','travel','tourism','trips'].forEach(t=>terms.add(t));
          }
          if (/اقتصاد|مالي/.test(category) || /(economy|business|finance)/i.test(lcSlug)) {
            ['اقتصاد','اقتصادى','مال','أعمال','business','economy','finance'].forEach(t=>terms.add(t));
          }
          if (/تقنية|تكنولوجيا/.test(category) || /(tech|technology)/i.test(lcSlug)) {
            ['تقنية','تكنولوجيا','tech','technology','ai'].forEach(t=>terms.add(t));
          }
          if (/رياضة/.test(category) || /(sport|sports)/i.test(lcSlug)) {
            ['رياضة','sports','sport'].forEach(t=>terms.add(t));
          }

          const interestTerms = Array.from(terms);
          if (interestTerms.length > 0) {
            or.push({ interests: { hasSome: interestTerms } });
            or.push({ user_preferences: { some: { key: 'favorite_categories', OR: interestTerms.map(term => ({ value: { contains: term } })) } } });
          } else {
            or.push({ interests: { has: category } });
          }
          if (tags && tags.length > 0) {
            or.push({ interests: { hasSome: tags } });
          }
          return or;
        })()
      },
      select: {
        id: true,
        email: true,
        name: true,
        interests: true,
        notification_preferences: true,
        user_preferences: true
      }
    });

    // تصفية بناءً على إعدادات الإشعارات المفصلة
    return users.filter(user => {
      const prefs = user.notification_preferences as any;
      if (!prefs) return true;
      
      // التحقق من تفعيل فئة الأخبار
      if (prefs.categories && prefs.categories.news === false) {
        return false;
      }
      
      // التحقق من ساعات الهدوء
      if (prefs.schedule?.quietHoursEnabled) {
        const now = new Date();
        const currentHour = now.getHours();
        const startHour = parseInt(prefs.schedule.quietHoursStart?.split(':')[0] || '22');
        const endHour = parseInt(prefs.schedule.quietHoursEnd?.split(':')[0] || '8');
        
        if (startHour > endHour) {
          // ساعات الهدوء تمتد لليوم التالي
          if (currentHour >= startHour || currentHour < endHour) {
            return false;
          }
        } else {
          // ساعات الهدوء في نفس اليوم
          if (currentHour >= startHour && currentHour < endHour) {
            return false;
          }
        }
      }
      
      return true;
    });
  } catch (error) {
    console.error('Error getting interested users:', error);
    return [];
  }
}

// إنشاء الإشعارات
async function createNotifications(
  users: any[],
  articleData: any
): Promise<any[]> {
  const notifications = [];

  for (const user of users) {
    const prefs = user.notification_preferences as any || {};
    
    // تخصيص الرسالة بناءً على اهتمامات المستخدم
    let title = articleData.isBreaking 
      ? `🚨 عاجل: ${articleData.articleTitle}`
      : `📰 جديد في ${getCategoryName(articleData.articleCategory)}`;
    
    let message = articleData.customMessage || articleData.articleTitle;
    
    // إضافة تخصيص إذا كان مفعلاً
    if (prefs.aiFeatures?.contentPersonalization) {
      const userInterests = user.interests as string[] || [];
      if (userInterests.includes(articleData.articleCategory)) {
        message = `${message} - محتوى يتوافق مع اهتماماتك في ${getCategoryName(articleData.articleCategory)}`;
      }
    }

    // تحديد الأولوية
    let priority = 'medium';
    if (articleData.isBreaking) {
      priority = 'high';
    } else if (prefs.aiFeatures?.priorityOptimization) {
      // حساب الأولوية بناءً على التفاعل السابق
      priority = calculatePriority(user, articleData);
    }

    // إنشاء الإشعار
    const notification = await prisma.smartNotifications.create({
      data: {
        user_id: user.id,
        title,
        message,
        type: articleData.isBreaking ? 'breaking' : 'news',
        priority: priority as any,
        category: 'news',
        data: {
          articleId: articleData.articleId,
          articleTitle: articleData.articleTitle,
          articleCategory: articleData.articleCategory,
          url: articleData.articleSlug ? `/news/${articleData.articleSlug}` : `/news/${articleData.articleId}`
        },
        delivery_channels: getActiveChannels(prefs),
        ai_optimized: !!(prefs.aiFeatures?.smartTiming || prefs.aiFeatures?.contentPersonalization),
        personalization_score: prefs.aiFeatures?.contentPersonalization ? 0.85 : null,
        status: 'pending'
      }
    });

    notifications.push({
      ...notification,
      user
    });
  }

  return notifications;
}

// إرسال الإشعارات
async function sendNotifications(notifications: any[]): Promise<any> {
  const results = {
    sent: 0,
    failed: 0,
    channels: {
      email: 0,
      push: 0,
      sms: 0,
      inApp: 0
    }
  };

  for (const notification of notifications) {
    try {
      const channels = notification.delivery_channels as string[];
      
      for (const channel of channels) {
        const sent = await sendToChannel(
          channel,
          notification.user,
          notification
        );
        
        if (sent) {
          results.channels[channel as keyof typeof results.channels]++;
        }
      }

      // تحديث حالة الإشعار
      await prisma.smartNotifications.update({
        where: { id: notification.id },
        data: {
          status: 'delivered',
          sent_at: new Date()
        }
      });

      results.sent++;
    } catch (error) {
      console.error('Error sending notification:', error);
      results.failed++;
      
      // تحديث حالة الإشعار للفشل
      await prisma.smartNotifications.update({
        where: { id: notification.id },
        data: {
          status: 'failed'
        }
      });
    }
  }

  return results;
}

// إرسال عبر قناة محددة
async function sendToChannel(
  channel: string,
  user: any,
  notification: any
): Promise<boolean> {
  try {
    switch (channel) {
      case 'email':
        // هنا يتم إرسال البريد الإلكتروني
        console.log(`Sending email to ${user.email}:`, notification.title);
        // TODO: تكامل مع خدمة البريد
        return true;

      case 'push':
        // هنا يتم إرسال الإشعار الفوري
        console.log(`Sending push notification to user ${user.id}`);
        // TODO: تكامل مع Web Push أو Firebase
        return true;

      case 'sms':
        // هنا يتم إرسال رسالة نصية
        console.log(`Sending SMS to user ${user.id}`);
        // TODO: تكامل مع خدمة SMS
        return false; // معطل حالياً

      case 'inApp':
        // الإشعار داخل التطبيق محفوظ بالفعل في قاعدة البيانات
        return true;

      default:
        return false;
    }
  } catch (error) {
    console.error(`Error sending ${channel} notification:`, error);
    return false;
  }
}

// دوال مساعدة
function getCategoryName(category: string): string {
  const categories: Record<string, string> = {
    'politics': 'السياسة',
    'economy': 'الاقتصاد',
    'sports': 'الرياضة',
    'technology': 'التقنية',
    'health': 'الصحة',
    'culture': 'الثقافة',
    'tourism': 'السياحة',
    'travel': 'السفر',
    'entertainment': 'الترفيه',
    'local': 'محليات',
    'international': 'دولية'
  };
  return categories[category] || category;
}

function getActiveChannels(prefs: any): string[] {
  const channels = [];
  const channelPrefs = prefs.channels || {};
  
  if (channelPrefs.email !== false) channels.push('email');
  if (channelPrefs.push !== false) channels.push('push');
  if (channelPrefs.sms === true) channels.push('sms'); // SMS معطل افتراضياً
  if (channelPrefs.inApp !== false) channels.push('inApp');
  
  return channels.length > 0 ? channels : ['inApp']; // على الأقل داخل التطبيق
}

function calculatePriority(user: any, articleData: any): string {
  // خوارزمية بسيطة لحساب الأولوية
  const interests = user.interests as string[] || [];
  const hasDirectInterest = interests.includes(articleData.articleCategory);
  
  if (hasDirectInterest) {
    return 'high';
  }
  
  // يمكن تطوير هذه الخوارزمية لتشمل:
  // - تاريخ التفاعل
  // - معدل فتح الإشعارات
  // - وقت آخر زيارة
  
  return 'medium';
}

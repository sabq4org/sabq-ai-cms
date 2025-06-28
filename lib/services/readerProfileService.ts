import { ReaderProfile, ReaderPersonality, ReaderTrait } from '@/types/reader-profile';
import { prisma } from '@/lib/prisma';

// تحديد الشخصية المعرفية بناءً على السلوك
function determinePersonality(
  categoryDistribution: Record<string, number>,
  readingSpeed: number,
  engagementRate: number
): ReaderPersonality {
  const topCategories = Object.entries(categoryDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat);

  // صياد الأخبار: يقرأ الأخبار العاجلة والسياسة بسرعة
  if (topCategories.includes('أخبار') || topCategories.includes('سياسة')) {
    if (readingSpeed > 10) return 'news-hunter';
  }

  // المحلل العميق: يقرأ ببطء ويتفاعل كثيراً
  if (readingSpeed < 5 && engagementRate > 30) {
    return 'deep-analyst';
  }

  // باحث عن الآراء: يفضل مقالات الرأي
  if (topCategories.includes('رأي') || topCategories.includes('مقالات')) {
    return 'opinion-seeker';
  }

  // مستكشف المعرفة: يقرأ في مجالات متنوعة
  if (Object.keys(categoryDistribution).length > 5) {
    return 'knowledge-explorer';
  }

  // متابع الترندات: يقرأ المواضيع الأكثر تفاعلاً
  if (engagementRate > 50) {
    return 'trend-follower';
  }

  return 'balanced-reader';
}

// تحديد السمات بناءً على السلوك
function determineTraits(profile: Partial<ReaderProfile>): ReaderTrait[] {
  const traits: ReaderTrait[] = [];

  // قارئ نشط
  if (profile.stats?.dailyReadingAverage && profile.stats.dailyReadingAverage > 5) {
    traits.push({
      id: 'active-reader',
      name: 'قارئ نشط',
      icon: '🔥',
      color: 'orange'
    });
  }

  // محب للتفاصيل
  if (profile.preferences?.contentDepth === 'full') {
    traits.push({
      id: 'detail-lover',
      name: 'محب للتفاصيل',
      icon: '🔍',
      color: 'blue'
    });
  }

  // متفاعل
  if (profile.engagement?.engagementRate && profile.engagement.engagementRate > 30) {
    traits.push({
      id: 'engaged',
      name: 'متفاعل',
      icon: '💬',
      color: 'purple'
    });
  }

  // قارئ الصباح
  const morningHours = profile.preferences?.activeHours?.filter(h => h >= 6 && h <= 12) || [];
  if (morningHours.length > 3) {
    traits.push({
      id: 'morning-reader',
      name: 'قارئ الصباح',
      icon: '🌅',
      color: 'yellow'
    });
  }

  // مثابر
  if (profile.stats?.streakDays && profile.stats.streakDays > 7) {
    traits.push({
      id: 'persistent',
      name: 'مثابر',
      icon: '🎯',
      color: 'green'
    });
  }

  return traits;
}

export async function buildReaderProfile(userId: string): Promise<ReaderProfile> {
  // جلب تفاعلات المستخدم
  const interactions = await prisma.interaction.findMany({
    where: { userId },
    include: {
      article: {
        include: {
          category: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // جلب نقاط الولاء
  const loyaltyPoints = await prisma.loyaltyPoint.aggregate({
    where: { userId },
    _sum: { points: true }
  });

  // حساب الإحصائيات
  const totalInteractions = interactions.length;
  const uniqueArticles = new Set(interactions.map(i => i.articleId)).size;
  
  // حساب التفاعلات حسب النوع
  const interactionsByType = interactions.reduce((acc, interaction) => {
    acc[interaction.type] = (acc[interaction.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // حساب التفضيلات حسب التصنيف
  const categoryPreferences = interactions
    .filter(i => i.article.category)
    .reduce((acc, interaction) => {
      const categoryName = interaction.article.category!.name;
      if (!acc[categoryName]) {
        acc[categoryName] = { count: 0, percentage: 0 };
      }
      acc[categoryName].count++;
      return acc;
    }, {} as Record<string, { count: number; percentage: number }>);

  // حساب النسب المئوية للتصنيفات
  const totalCategoryInteractions = Object.values(categoryPreferences).reduce((sum, cat) => sum + cat.count, 0);
  Object.keys(categoryPreferences).forEach(category => {
    categoryPreferences[category].percentage = Math.round((categoryPreferences[category].count / totalCategoryInteractions) * 100);
  });

  // حساب معدل القراءة اليومي
  const firstInteractionDate = interactions.length > 0 
    ? new Date(interactions[interactions.length - 1].createdAt)
    : new Date();
  const daysSinceFirstInteraction = Math.max(1, Math.ceil((Date.now() - firstInteractionDate.getTime()) / (1000 * 60 * 60 * 24)));
  const dailyReadingAverage = Math.round(uniqueArticles / daysSinceFirstInteraction * 10) / 10;

  // حساب سلسلة الأيام المتتالية
  const streakDays = calculateStreakDays(interactions);

  // تحديد الشخصية المعرفية
  const personality = determinePersonality(categoryPreferences, dailyReadingAverage, interactionsByType.share || 0);

  // تحديد السمات
  const traits = determineTraits({
    stats: {
      dailyReadingAverage,
      totalArticlesRead: uniqueArticles,
      totalInteractions,
      streakDays,
      loyaltyPoints: loyaltyPoints._sum.points || 0,
      favoriteCategories: Object.entries(categoryPreferences)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 3)
        .map(([name, data]) => ({
          name,
          percentage: data.percentage
        })),
      interactionBreakdown: {
        views: interactionsByType.view || 0,
        likes: interactionsByType.like || 0,
        saves: interactionsByType.save || 0,
        shares: interactionsByType.share || 0,
        comments: interactionsByType.comment || 0
      }
    },
    lastUpdated: new Date()
  });

  return {
    userId,
    personality,
    traits,
    stats: {
      totalArticlesRead: uniqueArticles,
      totalInteractions,
      dailyReadingAverage,
      streakDays,
      loyaltyPoints: loyaltyPoints._sum.points || 0,
      favoriteCategories: Object.entries(categoryPreferences)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 3)
        .map(([name, data]) => ({
          name,
          percentage: data.percentage
        })),
      interactionBreakdown: {
        views: interactionsByType.view || 0,
        likes: interactionsByType.like || 0,
        saves: interactionsByType.save || 0,
        shares: interactionsByType.share || 0,
        comments: interactionsByType.comment || 0
      }
    },
    lastUpdated: new Date()
  };
}

function calculateStreakDays(interactions: any[]): number {
  if (interactions.length === 0) return 0;

  const dates = interactions.map(i => new Date(i.createdAt).toDateString());
  const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 1;
  const today = new Date().toDateString();
  
  if (uniqueDates[0] !== today && uniqueDates[0] !== new Date(Date.now() - 86400000).toDateString()) {
    return 0; // الsترeak انقطع
  }

  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i - 1]);
    const previousDate = new Date(uniqueDates[i]);
    const diffDays = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// حفظ أو تحديث ملف القارئ في قاعدة البيانات
export async function saveReaderProfile(profile: ReaderProfile) {
  // يمكن إضافة جدول خاص لحفظ الملفات الشخصية
  // أو استخدام Redis للتخزين المؤقت
  return profile;
} 
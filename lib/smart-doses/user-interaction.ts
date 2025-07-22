// نظام التفاعل والمكافآت للجرعات الذكية
export interface UserDoseInteraction {
  userId: string;
  doseId: string;
  viewedAt: string;
  viewDuration: number; // بالثواني
  interactionType: 'viewed' | 'liked' | 'saved' | 'shared' | 'commented';
  shareMethod?: 'whatsapp' | 'twitter' | 'telegram' | 'copy_link';
  rating?: number; // من 1 إلى 5
  feedback?: string;
}

export interface DailyDoseChallenge {
  date: string;
  userId: string;
  dosesCompleted: number;
  totalDoses: number;
  completionRate: number;
  pointsEarned: number;
  badges: string[];
  streak: number; // أيام متتالية
}

export interface UserDosePreferences {
  userId: string;
  preferredTopics: string[];
  excludedTopics: string[];
  notificationTimes: {
    morning?: string;
    noon?: string; 
    evening?: string;
    night?: string;
  };
  preferredLength: 'short' | 'medium' | 'long';
  autoPlay: boolean;
  voiceSpeed: number;
}

// نظام النقاط والمكافآت
export const DOSE_REWARDS_SYSTEM = {
  // نقاط الأنشطة
  POINTS: {
    VIEW_DOSE: 5,
    COMPLETE_DOSE: 10, 
    SHARE_DOSE: 15,
    RATE_DOSE: 10,
    COMMENT_DOSE: 20,
    DAILY_COMPLETE: 50, // إكمال جميع جرعات اليوم
    WEEKLY_STREAK: 100,
    MONTHLY_STREAK: 500
  },

  // شارات الإنجاز
  BADGES: {
    EARLY_BIRD: {
      name: 'الطائر المبكر',
      description: 'شاهد 10 جرعات صباحية',
      icon: '🌅',
      requirement: 10
    },
    NEWS_ADDICT: {
      name: 'مدمن الأخبار', 
      description: 'أكمل 30 جرعة',
      icon: '📰',
      requirement: 30
    },
    SOCIAL_SHARER: {
      name: 'المشارك الاجتماعي',
      description: 'شارك 20 جرعة',
      icon: '🔗',
      requirement: 20
    },
    WEEK_WARRIOR: {
      name: 'محارب الأسبوع',
      description: 'أكمل جميع الجرعات لأسبوع كامل',
      icon: '🏆',
      requirement: 7
    },
    NIGHT_OWL: {
      name: 'بومة الليل',
      description: 'شاهد 15 جرعة ليلية',
      icon: '🦉',
      requirement: 15
    }
  }
};

// تحليل سلوك المستخدم
export function analyzeUserBehavior(interactions: UserDoseInteraction[]): UserInsights {
  const totalViews = interactions.filter(i => i.interactionType === 'viewed').length;
  const avgViewDuration = interactions.reduce((sum, i) => sum + i.viewDuration, 0) / totalViews;
  
  // أوقات التفاعل المفضلة
  const timePreferences = interactions.reduce((acc, interaction) => {
    const hour = new Date(interaction.viewedAt).getHours();
    let timeSlot = 'other';
    
    if (hour >= 5 && hour < 12) timeSlot = 'morning';
    else if (hour >= 12 && hour < 17) timeSlot = 'noon';
    else if (hour >= 17 && hour < 22) timeSlot = 'evening';
    else timeSlot = 'night';
    
    acc[timeSlot] = (acc[timeSlot] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const preferredTime = Object.entries(timePreferences)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'morning';

  return {
    totalInteractions: interactions.length,
    avgViewDuration,
    preferredTime,
    engagementRate: interactions.filter(i => i.interactionType !== 'viewed').length / totalViews,
    mostSharedMethod: findMostSharedMethod(interactions)
  };
}

interface UserInsights {
  totalInteractions: number;
  avgViewDuration: number;
  preferredTime: string;
  engagementRate: number;
  mostSharedMethod: string;
}

function findMostSharedMethod(interactions: UserDoseInteraction[]): string {
  const shares = interactions.filter(i => i.interactionType === 'shared');
  const methods = shares.reduce((acc, share) => {
    const method = share.shareMethod || 'unknown';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(methods)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'whatsapp';
}

// الاستطلاعات والأسئلة التفاعلية
export interface DailyPoll {
  id: string;
  question: string;
  options: string[];
  relatedDoseId?: string;
  expiresAt: string;
  results?: Record<string, number>;
}

export const INTERACTIVE_FEATURES = {
  // أسئلة يومية سريعة
  createDailyPoll: (doseContent: any): DailyPoll => {
    const polls = [
      {
        question: "ما رأيك في أهم خبر اليوم؟",
        options: ["ممتاز", "جيد", "عادي", "يحتاج تطوير"]
      },
      {
        question: "أي جرعة تفضل أكثر؟", 
        options: ["الصباحية", "الظهيرة", "المسائية", "الليلية"]
      },
      {
        question: "هل الجرعة غطت اهتماماتك؟",
        options: ["تماماً", "إلى حد كبير", "جزئياً", "لا"]
      }
    ];
    
    const randomPoll = polls[Math.floor(Math.random() * polls.length)];
    
    return {
      id: `poll_${Date.now()}`,
      question: randomPoll.question,
      options: randomPoll.options,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 ساعة
    };
  },

  // مشاركة ذكية
  generateShareText: (dose: any, platform: string): string => {
    const baseText = `🎯 جرعة سبق الذكية - ${dose.title}`;
    
    switch (platform) {
      case 'whatsapp':
        return `${baseText}\n\n${dose.summary}\n\n📱 اقرأ المزيد: [رابط]`;
      case 'twitter':
        return `${baseText} 🧠\n\n${dose.summary.substring(0, 100)}...\n\n#سبق_الذكية #أخبار`;
      default:
        return baseText;
    }
  }
};

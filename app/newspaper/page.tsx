'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Bell, User, Globe, Moon, Sun, Menu, ChevronRight, 
  Clock, TrendingUp, Heart, Share2, MessageSquare, Eye, 
  MapPin, Thermometer, Calendar, BarChart3, Star, Filter,
  ChevronUp, Facebook, Twitter, Instagram, Youtube, Mail,
  ExternalLink, BookOpen, Settings, Zap, Award, Play, Volume2,
  Sparkles, Brain, Bot, Headphones, Mic, Download, PauseCircle,
  PlayCircle, Users, Flame, AlertCircle, Lightbulb, Target,
  Compass, Globe2, Newspaper, Activity, ChevronDown, ArrowLeft,
  Crown, Leaf, Book, Tag
} from 'lucide-react';

import CategoryBadge, { CategoryNavigation } from '../components/CategoryBadge';
import Header from '../../components/Header';

// ===============================
// نظام ذكاء المستخدم والتخصيص
// ===============================

interface UserInteraction {
  user_id: string;
  article_id: string;
  interaction_type: 'view' | 'read' | 'like' | 'share' | 'comment' | 'save';
  category: string;
  read_duration_seconds?: number;
  scroll_percentage?: number;
  source?: string;
  device_type?: string;
  session_id?: string;
  timestamp: number;
}

interface UserPreferences {
  [category: string]: number;
}

// نظام تتبع ذكاء المستخدم
class UserIntelligenceTracker {
  private interactions: UserInteraction[] = [];
  private preferences: { [userId: string]: UserPreferences } = {};
  private sessionId: string;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    this.sessionId = this.generateSessionId();
    this.loadFromStorage();
  }

  // تسجيل تفاعل جديد
  trackInteraction(articleId: string, type: UserInteraction['interaction_type'], category: string, additionalData: any = {}) {
    const interaction: UserInteraction = {
      user_id: this.userId,
      article_id: articleId,
      interaction_type: type,
      category,
      session_id: this.sessionId,
      device_type: this.getDeviceType(),
      timestamp: Date.now(),
      ...additionalData
    };

    this.interactions.push(interaction);
    this.updatePreferences(interaction);
    this.saveToStorage();

    return this.calculatePoints(interaction);
  }

  // تحديث التفضيلات
  private updatePreferences(interaction: UserInteraction) {
    if (!this.preferences[this.userId]) {
      this.preferences[this.userId] = {};
    }

    const current = this.preferences[this.userId][interaction.category] || 0;
    const weights = {
      view: 0.1,
      read: 0.5,
      like: 0.3,
      share: 0.7,
      comment: 0.8,
      save: 0.6
    };

    const newWeight = Math.min(5, Math.max(0, current + weights[interaction.interaction_type]));
    this.preferences[this.userId][interaction.category] = Number(newWeight.toFixed(2));
  }

  // حساب النقاط
  private calculatePoints(interaction: UserInteraction): number {
    const pointRules = {
      view: 1,
      read: 10,
      like: 5,
      share: 15,
      comment: 20,
      save: 8
    };

    return pointRules[interaction.interaction_type] || 0;
  }

  // الحصول على التفضيلات
  getPreferences(): UserPreferences {
    return this.preferences[this.userId] || {};
  }

  // حساب نقاط الثقة للمقال
  calculateConfidence(category: string): number {
    const prefs = this.getPreferences();
    const categoryWeight = prefs[category] || 1;
    return Math.min(5, categoryWeight * 1.2);
  }

  private generateSessionId(): string {
    // استخدام معرف ثابت بدلاً من Math.random() لتجنب مشكلة Hydration
    const timestamp = Date.now();
    const uniqueId = timestamp.toString(36);
    return 'session_' + timestamp + '_' + uniqueId;
  }

  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'unknown';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`user_interactions_${this.userId}`, JSON.stringify(this.interactions));
    localStorage.setItem(`user_preferences_${this.userId}`, JSON.stringify(this.preferences));
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    const interactions = localStorage.getItem(`user_interactions_${this.userId}`);
    const preferences = localStorage.getItem(`user_preferences_${this.userId}`);
    
    if (interactions) this.interactions = JSON.parse(interactions);
    if (preferences) this.preferences = JSON.parse(preferences);
  }
}

export default function NewspaperHomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userTracker, setUserTracker] = useState<UserIntelligenceTracker | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [readingTime, setReadingTime] = useState<{ [key: string]: number }>({});
  const [blocksConfig, setBlocksConfig] = useState({
    briefing: { enabled: true, order: 1 },
    trending: { enabled: true, order: 2 },
    analysis: { enabled: true, order: 3 },
    recommendation: { enabled: true, order: 4 },
    categories: { enabled: true, order: 5 },
    audio: { enabled: true, order: 6 },
    todayEvent: { enabled: true, order: 7 },
    regions: { enabled: true, order: 8 }
  });

  useEffect(() => {
    // تعيين الوقت الحالي بعد التحميل لتجنب مشكلة Hydration
    setCurrentTime(new Date());
    
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
    
    // تهيئة متتبع ذكاء المستخدم
    if (isLoggedIn) {
      const tracker = new UserIntelligenceTracker('user_current'); // في التطبيق الحقيقي نستخدم معرف المستخدم الفعلي
      setUserTracker(tracker);
      
      // تحميل النقاط المحفوظة
      const savedPoints = localStorage.getItem('user_points');
      if (savedPoints) {
        setUserPoints(JSON.parse(savedPoints));
      }
    }
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, [isLoggedIn]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  // دالة تتبع التفاعلات الذكية
  const trackUserInteraction = useCallback((articleId: string, type: UserInteraction['interaction_type'], category: string, additionalData: any = {}) => {
    if (!userTracker || !isLoggedIn) return;
    
    const points = userTracker.trackInteraction(articleId, type, category, additionalData);
    
    // تحديث النقاط
    const newPoints = userPoints + points;
    setUserPoints(newPoints);
    localStorage.setItem('user_points', JSON.stringify(newPoints));
    
    // إظهار إشعار النقاط (اختياري)
    if (points > 0) {
      console.log(`🎉 حصلت على ${points} نقطة! (المجموع: ${newPoints})`);
    }
    
    return points;
  }, [userTracker, userPoints, isLoggedIn]);

  // Time-based content
  const getTimeContent = () => {
    // استخدام ساعة افتراضية إذا لم يتم تحميل الوقت بعد
    const hour = currentTime ? currentTime.getHours() : 10;
    
    if (hour >= 5 && hour < 12) {
      return {
        period: "صباح الخير",
        title: "مرحباً بك في يوم جديد",
        subtitle: "استمتع بأحدث الأخبار وأهم التطورات",
        cards: [
          { title: "قمة المناخ تستضيفها المملكة", desc: "تحضيرات واسعة لاستقبال قادة العالم", category: "دولي", image: "https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?auto=format&fit=crop&w=800&q=60" },
          { title: "نيوم تطلق مشروع المرآة الذكية", desc: "مدينة المستقبل تواصل ابتكاراتها", category: "تقنية", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=800&q=60" },
          { title: "انطلاق موسم الرياض 2025", desc: "فعاليات ومهرجانات استثنائية", category: "ترفيه", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=60" }
        ]
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        period: "مساء الخير",
        title: "نتابع معك تطورات اليوم",
        subtitle: "آخر الأخبار والتحديثات المهمة",
        cards: [
          { title: "الأمير محمد بن سلمان يلتقي قادة التقنية", desc: "رؤية 2030 وتطوير القطاع التقني", category: "أخبار", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=60" },
          { title: "بورصة الرياض تسجل أرقاماً قياسية", desc: "نمو متواصل في الأسواق المالية", category: "اقتصاد", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=60" },
          { title: "الهلال يتأهل لنهائي كؤوس آسيا", desc: "إنجاز رياضي جديد للكرة السعودية", category: "رياضة", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=60" }
        ]
      };
    } else {
      return {
        period: "مساء الخير",
        title: "نختتم معك يوماً حافلاً",
        subtitle: "ملخص أهم أحداث اليوم",
        cards: [
          { title: "خادم الحرمين يستقبل ضيوف الرحمن", desc: "حفاوة الاستقبال في موسم الحج", category: "محلي", image: "https://images.unsplash.com/photo-1564769662642-4ea21ff5e468?auto=format&fit=crop&w=800&q=60" },
          { title: "معرض الكتاب يختتم فعالياته", desc: "إقبال جماهيري كبير على المعرض", category: "ثقافة", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=60" },
          { title: "حملة تطوير الأحياء تتوسع", desc: "مشاريع تنموية في جميع المناطق", category: "تطوير", image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=60" }
        ]
      };
    }
  };

  const timeContent = getTimeContent();

  // بيانات التصنيفات المتاحة
  const availableCategories = [
    {
      id: 1,
      name_ar: 'السياسة',
      name_en: 'Politics',
      slug: 'politics',
      color_hex: '#E5F1FA',
      icon: '🏛️',
      description: 'أخبار سياسية محلية ودولية'
    },
    {
      id: 2,
      name_ar: 'الاقتصاد',
      name_en: 'Economy',
      slug: 'economy',
      color_hex: '#E3FCEF',
      icon: '💰',
      description: 'أخبار اقتصادية ومالية'
    },
    {
      id: 3,
      name_ar: 'التكنولوجيا',
      name_en: 'Technology',
      slug: 'technology',
      color_hex: '#F2F6FF',
      icon: '💻',
      description: 'أخبار التقنية والابتكار'
    },
    {
      id: 4,
      name_ar: 'الرياضة',
      name_en: 'Sports',
      slug: 'sports',
      color_hex: '#FFF5E5',
      icon: '⚽',
      description: 'أخبار رياضية محلية وعالمية'
    },
    {
      id: 5,
      name_ar: 'الثقافة',
      name_en: 'Culture',
      slug: 'culture',
      color_hex: '#FDE7F3',
      icon: '🎭',
      description: 'أخبار ثقافية وفنية'
    },
    {
      id: 6,
      name_ar: 'الصحة',
      name_en: 'Health',
      slug: 'health',
      color_hex: '#F0FDF4',
      icon: '🏥',
      description: 'أخبار طبية وصحية'
    }
  ];

  const newsData = [
    { 
      id: 'N001', 
      title: 'إطلاق مبادرة السعودية الخضراء الجديدة', 
      excerpt: 'خطة طموحة لزراعة مليارات الأشجار وتحويل المملكة لنموذج بيئي عالمي',
      category: 'بيئة',
      author: 'فريق التحرير',
      publishedAt: '2025-01-08T10:30:00Z',
      readTime: 5,
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=60',
      views: 15420,
      isBreaking: true,
      tags: ['رؤية 2030', 'البيئة', 'التشجير']
    },
    { 
      id: 'N002', 
      title: 'شركات التقنية العالمية تفتح مقارها في الرياض', 
      excerpt: 'عمالقة التكنولوجيا يختارون المملكة مركزاً إقليمياً لعملياتهم',
      category: 'تقنية',
      author: 'محمد العتيبي',
      publishedAt: '2025-01-08T09:15:00Z',
      readTime: 4,
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=60',
      views: 12890,
      isBreaking: false,
      tags: ['تقنية', 'استثمار', 'الرياض']
    },
    { 
      id: 'N003', 
      title: 'ولي العهد يفتتح مدينة الملك سلمان للطاقة', 
      excerpt: 'مشروع ضخم لتطوير قطاع الطاقة المتجددة والاستدامة',
      category: 'طاقة',
      author: 'سارة الزهراني',
      publishedAt: '2025-01-08T08:45:00Z',
      readTime: 6,
      image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=60',
      views: 18760,
      isBreaking: true,
      tags: ['طاقة', 'استدامة', 'مشاريع كبرى']
    },
    { 
      id: 'N004', 
      title: 'المنتخب السعودي يتأهل لنهائيات كأس العالم', 
      excerpt: 'إنجاز تاريخي للكرة السعودية بالتأهل المباشر لمونديال 2026',
      category: 'رياضة',
      author: 'خالد الدوسري',
      publishedAt: '2025-01-08T07:20:00Z',
      readTime: 3,
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=60',
      views: 22340,
      isBreaking: true,
      tags: ['كأس العالم', 'منتخب', 'إنجاز']
    },
    { 
      id: 'N005', 
      title: 'افتتاح جامعة الملك سلمان للذكاء الاصطناعي', 
      excerpt: 'أول جامعة متخصصة في الذكاء الاصطناعي وعلوم البيانات في المنطقة',
      category: 'تعليم',
      author: 'نورا القحطاني',
      publishedAt: '2025-01-08T06:45:00Z',
      readTime: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=60',
      views: 16780,
      isBreaking: false,
      tags: ['تعليم', 'ذكاء اصطناعي', 'جامعة']
    },
    { 
      id: 'N006', 
      title: 'إطلاق مشروع القدية الترفيهي العملاق', 
      excerpt: 'مدينة ترفيهية متكاملة تضم أكبر الألعاب والمرافق الترفيهية في العالم',
      category: 'ترفيه',
      author: 'عبدالله الشهري',
      publishedAt: '2025-01-08T06:15:00Z',
      readTime: 4,
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=60',
      views: 19650,
      isBreaking: false,
      tags: ['قدية', 'ترفيه', 'رؤية 2030']
    },
    { 
      id: 'N007', 
      title: 'المملكة تحقق المركز الأول عالمياً في الأمن السيبراني', 
      excerpt: 'تصدر المؤشر العالمي للأمن السيبراني بفضل الاستثمارات الضخمة في التقنية',
      category: 'أمن سيبراني',
      author: 'محمد آل سعود',
      publishedAt: '2025-01-08T05:30:00Z',
      readTime: 6,
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=60',
      views: 14320,
      isBreaking: true,
      tags: ['أمن سيبراني', 'تقنية', 'إنجاز عالمي']
    },
    { 
      id: 'N008', 
      title: 'انطلاق معرض الرياض الدولي للكتاب 2025', 
      excerpt: 'أكثر من مليون كتاب ومشاركة 50 دولة في النسخة الأكبر من المعرض',
      category: 'ثقافة',
      author: 'فاطمة العتيبي',
      publishedAt: '2025-01-08T05:00:00Z',
      readTime: 3,
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=60',
      views: 11890,
      isBreaking: false,
      tags: ['كتب', 'ثقافة', 'معرض']
    }
  ];

  // بيانات وهمية للبلوكات
  const briefingData = [
    { id: 1, title: "انطلاق مؤتمر الذكاء الاصطناعي في الرياض\nبمشاركة عالمية واسعة وحضور أكثر من 500 خبير", time: "منذ 15 دقيقة", isNew: true },
    { id: 2, title: "صندوق الاستثمارات يعلن عن شراكة جديدة\nمع عمالقة التقنية لتطوير الذكاء الاصطناعي", time: "منذ 30 دقيقة", isNew: true },
    { id: 3, title: "نجاح عملية إطلاق القمر الاصطناعي السعودي\nويدخل المدار المحدد بنجاح تام وفقاً للخطة", time: "منذ ساعة", isNew: false },
    { id: 4, title: "افتتاح مدينة نيوم الطبية الذكية\nأول مستشفى رقمي متكامل يعتمد على الذكاء الاصطناعي", time: "منذ ساعتين", isNew: false }
  ];

  const trendingData = [
    { id: 1, title: "اكتشاف أثري مهم في العلا يعود لحضارة نبطية\nيكشف أسرار جديدة عن طرق التجارة القديمة", views: 24580, category: "تراث" },
    { id: 2, title: "إطلاق برنامج سكني جديد يستهدف الشباب\nبخيارات تمويل ميسرة وأسعار تنافسية", views: 19230, category: "اقتصاد" },
    { id: 3, title: "فوز المنتخب السعودي بكأس آسيا للمرة الرابعة\nبعد مباراة نهائية مثيرة انتهت بركلات الترجيح", views: 45670, category: "رياضة" }
  ];

  const analysisData = {
    mainEvent: "المملكة تتقدم في مؤشر الابتكار العالمي للمرة الثالثة\nوتحتل المركز الـ15 عالمياً في الابتكار التقني",
    alert: "موجة حر شديدة متوقعة على المنطقة الشرقية\nمع درجات حرارة قد تصل إلى 48 مئوية",
    trend: "نمو استثنائي في قطاع التقنية المالية بنسبة 34%\nوتوقعات بمضاعفة الاستثمارات خلال العام القادم"
  };

  const userRecommendation = {
    title: "تطوير الذكاء الاصطناعي في التعليم السعودي يدخل مرحلة جديدة\nمع إطلاق منصات تعليمية ذكية في 500 مدرسة حكومية",
    category: "تقنية",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=60",
    time: "منذ 3 ساعات"
  };

  const categoriesData = [
    { name: "اقتصاد", articles: ["صعود البورصة السعودية إلى مستويات تاريخية\nبدعم من القطاعات الناشئة والاستثمارات الأجنبية", "انطلاق مشروع جديد لتطوير الاقتصاد الرقمي\nباستثمارات تصل إلى 50 مليار ريال", "تطوير القطاع المصرفي يشهد نقلة نوعية\nمع إطلاق خدمات مصرفية رقمية متطورة"], icon: "💼" },
    { name: "تقنية", articles: ["شراكة استراتيجية مع عمالقة التقنية العالمية\nلتطوير حلول الذكاء الاصطناعي في المملكة", "ابتكار سعودي في الذكاء الاصطناعي يحصد جوائز عالمية\nويفتح آفاق جديدة للتطوير التقني", "تطوير المدن الذكية يدخل مرحلة التنفيذ\nمع استخدام أحدث التقنيات في 15 مدينة"], icon: "💻" },
    { name: "رياضة", articles: ["استعدادات مكثفة لكأس العالم 2030\nومشاريع بنية تحتية رياضية ضخمة", "بطولة الدوري السعودي تشهد منافسة قوية\nبمشاركة نجوم عالميين وحضور جماهيري كبير", "إنجازات رياضية سعودية تتواصل على المستوى العالمي\nفي مختلف الألعاب الأولمبية"], icon: "⚽" }
  ];

  const audioData = {
    title: "نشرة أخبار سبق الصوتية - مساء اليوم\nأهم الأحداث والتطورات مع التحليل الاقتصادي اليومي",
    duration: "12:45",
    publishTime: "منذ 30 دقيقة",
    isPlaying: false
  };

  const todayEvent = {
    title: "اليوم الوطني السعودي - 94\nذكرى توحيد المملكة على يد الملك عبدالعزيز",
    description: "احتفالات شعبية ورسمية تشهدها جميع مناطق المملكة\nمع فعاليات متنوعة وعروض ثقافية استثنائية",
    date: "23 سبتمبر",
    isActive: false // محاكاة عدم وجود مناسبة اليوم
  };

  const regionsData = [
    { name: "الرياض", newsCount: 15, lastUpdate: "منذ ساعة" },
    { name: "جدة", newsCount: 8, lastUpdate: "منذ ساعتين" },
    { name: "الدمام", newsCount: 5, lastUpdate: "منذ 3 ساعات" },
    { name: "أبها", newsCount: 3, lastUpdate: "منذ 4 ساعات" }
  ];

  // NewsCard component with AI tracking
  const NewsCard = ({ news }: { news: any }) => {
    const confidenceScore = userTracker ? userTracker.calculateConfidence(news.category) : 1;
    const isPersonalized = confidenceScore > 2.5;
    
    return (
      <div 
        className={`group rounded-2xl overflow-hidden border-2 border-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
          darkMode ? 'bg-white/10' : 'bg-white/80'
        } ${isPersonalized ? 'ring-2 ring-blue-400/30' : ''}`}
        onMouseEnter={() => trackUserInteraction(news.id, 'view', news.category)}
      >
        <div className="relative overflow-hidden">
          <img 
            src={news.image} 
            alt={news.title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {news.isBreaking && (
            <span className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              عاجل
            </span>
          )}
          
          {/* شارة المحتوى المخصص */}
          {isPersonalized && (
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/90 text-white text-xs rounded-full">
                <Target className="w-3 h-3" />
                <span>مخصص لك</span>
              </div>
            </div>
          )}
          
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* شارة التصنيف الذكية */}
                {(() => {
                  const categoryData = availableCategories.find(cat => 
                    cat.name_ar === news.category || cat.name_en === news.category
                  );
                  
                  if (categoryData) {
                    return (
                      <CategoryBadge
                        category={categoryData}
                        size="sm"
                        variant="filled"
                        showIcon={true}
                        clickable={false}
                        className="text-xs"
                      />
                    );
                  }
                  
                  // إذا لم يُعثر على التصنيف، استخدم التصميم القديم
                  return (
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-md">
                      {news.category}
                    </span>
                  );
                })()}
                
                <div className="flex items-center gap-1 text-blue-400">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-xs">AI</span>
                </div>
              </div>
              
              {/* نقاط الثقة */}
              {userTracker && (
                <div className="flex items-center gap-1 px-2 py-1 bg-black/70 text-white text-xs rounded-full">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span>{confidenceScore.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      
      <div className="p-6">
        <h3 className={`text-lg font-bold mb-3 leading-tight transition-colors duration-300 ${
          darkMode ? 'text-white' : 'text-gray-800'
        }`}>
          {news.title}
        </h3>
        
        <p className={`text-sm mb-4 line-clamp-2 transition-colors duration-300 ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {news.excerpt}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`text-xs transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {news.author}
            </span>
            <span className={`text-xs transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {news.readTime} دقائق قراءة
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {news.views.toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {news.tags.slice(0, 2).map((tag: string) => (
              <span key={tag} className={`px-2 py-1 text-xs rounded-md ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                #{tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => trackUserInteraction(news.id, 'like', news.category)}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}>
              <Heart className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
            <button 
              onClick={() => trackUserInteraction(news.id, 'share', news.category)}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}>
              <Share2 className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
            <button 
              onClick={() => trackUserInteraction(news.id, 'read', news.category, { read_duration_seconds: 30 })}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}>
              <Headphones className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  };

  // ويدجت الذكاء الشخصي
  const UserIntelligenceWidget = () => {
    if (!userTracker) return null;
    
    const preferences = userTracker.getPreferences();
    const topCategories = Object.entries(preferences)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    return (
      <div className={`rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-purple-900/30' : 'bg-purple-50'
            }`}>
              <Crown className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>ملفك الذكي</h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>تحليل اهتماماتك</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            darkMode ? 'bg-purple-900/30' : 'bg-purple-50'
          }`}>
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span className="text-xs font-medium text-purple-600">AI</span>
          </div>
        </div>

        {/* النقاط */}
        <div className={`p-4 rounded-xl border mb-6 ${
          darkMode ? 'bg-yellow-900/20 border-yellow-700/30' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>نقاط الولاء</span>
            </div>
            <span className="text-2xl font-bold text-yellow-600">{userPoints.toLocaleString()}</span>
          </div>
          <div className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            +{Math.floor(userPoints * 0.1)} نقطة اليوم
          </div>
        </div>

        {/* اهتمامات المستخدم */}
        <div className="space-y-4">
          <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            اهتماماتك المفضلة
          </h4>
          {topCategories.length > 0 ? (
            topCategories.map(([category, weight]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {category}
                  </span>
                  <span className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {weight.toFixed(1)}/5
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${
                  darkMode ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${(weight / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">تفاعل مع المقالات لبناء ملفك الشخصي</p>
            </div>
          )}
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-2 mt-6">
          <button className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
            darkMode ? 'bg-purple-900/30 hover:bg-purple-800/30 text-purple-300' : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
          }`}>
            تخصيص الاهتمامات
          </button>
          <button className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
            darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}>
            عرض الإحصائيات
          </button>
        </div>
      </div>
    );
  };

  // مكونات البلوكات الذكية المحسنة
  const BriefingBlock = () => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            darkMode ? 'bg-blue-900/30' : 'bg-blue-50'
          }`}>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>موجز الآن</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>ابدأ من هنا</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'
        }`}>
          {briefingData.length} تحديث
        </span>
      </div>
      
      <div className="space-y-4">
        {briefingData.map((item) => (
          <div key={item.id} className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md cursor-pointer ${
            darkMode ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${item.isNew ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <div className="flex-1">
                <div className="mb-2">
                  <h4 className={`text-sm font-medium leading-relaxed whitespace-pre-line ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.title}</h4>
                  {item.isNew && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium mt-2 inline-block">جديد</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.time}</span>
                  <div className="flex items-center gap-1">
                    <Eye className={`w-3 h-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>2.3K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className={`w-full mt-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
      }`}>
        عرض جميع التحديثات
      </button>
    </div>
  );

  const TrendingBlock = () => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            darkMode ? 'bg-orange-900/30' : 'bg-orange-50'
          }`}>
            <Flame className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>يتم قراءته الآن</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>الأكثر شعبية في آخر ساعة</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
          darkMode ? 'bg-orange-900/30' : 'bg-orange-50'
        }`}>
          <TrendingUp className="w-3 h-3 text-orange-600" />
          <span className="text-xs font-medium text-orange-600">+24%</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {trendingData.map((item, index) => (
          <div key={item.id} className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md cursor-pointer ${
            darkMode ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700/50' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                index === 1 ? 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-medium mb-3 leading-relaxed whitespace-pre-line ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.title}</h4>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {item.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.views.toLocaleString()} قراءة
                    </span>
                    <div className="flex items-center gap-1">
                      <Heart className={`w-3 h-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>1.2K</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between text-xs">
          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>إجمالي القراءات اليوم</span>
          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>2.8M قراءة</span>
        </div>
      </div>
    </div>
  );

  const AnalysisBlock = () => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            darkMode ? 'bg-purple-900/30' : 'bg-purple-50'
          }`}>
            <Lightbulb className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>موجز اليوم الذكي</h2>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span className="text-xs font-medium text-purple-600">AI</span>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>محدث كل ساعتين</span>
            </div>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full animate-pulse ${
          darkMode ? 'bg-green-400' : 'bg-green-500'
        }`}></div>
      </div>
      
      <div className="space-y-5">
        <div className={`p-4 rounded-xl border ${
          darkMode ? 'bg-blue-900/20 border-blue-700/30' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>أبرز حدث اليوم</h4>
              <p className={`text-sm mb-3 leading-relaxed whitespace-pre-line ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{analysisData.mainEvent}</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-md text-xs ${
                  darkMode ? 'bg-blue-800/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                }`}>
                  تأثير عالي
                </span>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>منذ 3 ساعات</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          darkMode ? 'bg-orange-900/20 border-orange-700/30' : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>تنبيه مهم</h4>
              <p className={`text-sm mb-3 leading-relaxed whitespace-pre-line ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{analysisData.alert}</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-md text-xs ${
                  darkMode ? 'bg-orange-800/50 text-orange-300' : 'bg-orange-100 text-orange-700'
                }`}>
                  متوسط الأهمية
                </span>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>منذ ساعة</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-xl border ${
          darkMode ? 'bg-green-900/20 border-green-700/30' : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <div>
              <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>توجه إيجابي</h4>
              <p className={`text-sm mb-3 leading-relaxed whitespace-pre-line ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{analysisData.trend}</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-md text-xs ${
                  darkMode ? 'bg-green-800/50 text-green-300' : 'bg-green-100 text-green-700'
                }`}>
                  نمو +34%
                </span>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>هذا الأسبوع</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button className={`w-full mt-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        darkMode ? 'bg-purple-900/30 hover:bg-purple-800/30 text-purple-300' : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
      }`}>
        عرض التحليل الكامل
      </button>
    </div>
  );

  const RecommendationBlock = () => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            darkMode ? 'bg-green-900/30' : 'bg-green-50'
          }`}>
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>اقترحنا لك هذا</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>بناءً على اهتماماتك</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${
          darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'
        }`}>
          98% مطابقة
        </span>
      </div>
      
      <div className={`rounded-xl overflow-hidden border ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="relative">
          <img src={userRecommendation.image} alt={userRecommendation.title} className="w-full h-40 object-cover" />
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
              darkMode ? 'bg-gray-900/80 text-white' : 'bg-white/90 text-gray-800'
            }`}>
              {userRecommendation.category}
            </span>
          </div>
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-white" />
              <span className="text-xs text-white">{userRecommendation.time}</span>
            </div>
          </div>
        </div>
        
        <div className={`p-4 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
          <h4 className={`text-sm font-medium mb-3 leading-relaxed whitespace-pre-line ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {userRecommendation.title}
          </h4>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Eye className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>4.2K</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>156</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>4.8</span>
            </div>
          </div>
          
          <button className={`w-full py-2 text-sm font-medium rounded-lg transition-colors ${
            darkMode ? 'bg-green-900/30 hover:bg-green-800/30 text-green-300' : 'bg-green-50 hover:bg-green-100 text-green-700'
          }`}>
            اقرأ المقال كاملاً
          </button>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <button className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
          darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }`}>
          المزيد من هذا النوع
        </button>
        <button className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
          darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }`}>
          حفظ للاحقاً
        </button>
      </div>
    </div>
  );

  const CategoriesBlock = () => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            darkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'
          }`}>
            <Compass className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>استكشف بحسب اهتماماتك</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>أقسام مختارة لك</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {categoriesData.map((category, index) => (
          <div key={index} className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-md ${
            darkMode ? 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{category.icon}</span>
                <div>
                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{category.name}</h4>
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {category.articles.length} مقال متاح
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            
            <div className="space-y-2">
                             {category.articles.slice(0, 2).map((article, i) => (
                 <div key={i} className="flex items-start justify-between">
                   <p className={`text-sm hover:text-indigo-600 cursor-pointer transition-colors leading-relaxed whitespace-pre-line flex-1 ${
                     darkMode ? 'text-gray-300' : 'text-gray-600'
                   }`}>
                     • {article}
                   </p>
                  <div className="flex items-center gap-1">
                    <Eye className={`w-3 h-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {((i + 1) * 1.2).toFixed(1)}K
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <button className={`w-full mt-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        darkMode ? 'bg-indigo-900/30 hover:bg-indigo-800/30 text-indigo-300' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
      }`}>
        استكشف جميع الأقسام
      </button>
    </div>
  );

  const AudioBlock = () => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            darkMode ? 'bg-pink-900/30' : 'bg-pink-50'
          }`}>
            <Volume2 className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>استمع لأبرز الأخبار</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>النشرة الصوتية اليومية</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>مباشر</span>
        </div>
      </div>
      
      <div className={`rounded-xl p-5 border ${
        darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=400&q=60" 
              alt="صورة المذيع"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className={`font-medium mb-1 leading-relaxed whitespace-pre-line ${darkMode ? 'text-white' : 'text-gray-800'}`}>{audioData.title}</h4>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Clock className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{audioData.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className={`w-3 h-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>2.1K مستمع</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <button className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            darkMode ? 'bg-pink-900/50 hover:bg-pink-800/50 text-pink-300' : 'bg-pink-100 hover:bg-pink-200 text-pink-700'
          }`}>
            <PlayCircle className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <div className={`h-2 rounded-full overflow-hidden ${
              darkMode ? 'bg-gray-600' : 'bg-gray-200'
            }`}>
              <div className="w-1/3 h-full bg-pink-500 rounded-full"></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>4:20</span>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>12:45</span>
            </div>
          </div>
          <button className={`p-2 rounded-lg transition-colors ${
            darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
          }`}>
            <Download className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <button className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
            darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
          }`}>
            النشرة السابقة
          </button>
          <button className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
            darkMode ? 'bg-pink-900/50 hover:bg-pink-800/50 text-pink-300' : 'bg-pink-100 hover:bg-pink-200 text-pink-700'
          }`}>
            تشغيل تلقائي
          </button>
        </div>
      </div>
    </div>
  );

  const TodayEventBlock = () => (
    todayEvent.isActive ? (
      <div className={`rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            darkMode ? 'bg-red-900/30' : 'bg-red-50'
          }`}>
            <Calendar className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>حدث اليوم</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>مناسبة وطنية مهمة</p>
          </div>
        </div>
        
        <div className="text-center">
          <h3 className={`text-lg font-bold mb-3 leading-relaxed whitespace-pre-line ${darkMode ? 'text-white' : 'text-gray-800'}`}>{todayEvent.title}</h3>
          <p className={`text-sm mb-4 leading-relaxed whitespace-pre-line ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{todayEvent.description}</p>
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
            darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'
          }`}>
            {todayEvent.date}
          </span>
        </div>
      </div>
    ) : null
  );

  const RegionsBlock = () => (
    <div className={`rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            darkMode ? 'bg-teal-900/30' : 'bg-teal-50'
          }`}>
            <Globe2 className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>جغرافيا الأخبار</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>أخبار المناطق السعودية</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${
          darkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-600'
        }`}>
          4 مناطق
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {regionsData.map((region, index) => (
          <div key={index} className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-md ${
            darkMode ? 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{region.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                darkMode ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-700'
              }`}>
                {region.newsCount}
              </span>
            </div>
            <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              آخر تحديث: {region.lastUpdate}
            </p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                index < 2 ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {index < 2 ? 'نشط' : 'هادئ'}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <button className={`w-full mt-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        darkMode ? 'bg-teal-900/30 hover:bg-teal-800/30 text-teal-300' : 'bg-teal-50 hover:bg-teal-100 text-teal-700'
      }`}>
        خريطة الأخبار التفاعلية
      </button>
    </div>
  );

  // ترتيب البلوكات حسب الإعدادات
  const getOrderedBlocks = () => {
    const blocks = [
      { key: 'briefing' as keyof typeof blocksConfig, component: <BriefingBlock /> },
      { key: 'trending' as keyof typeof blocksConfig, component: <TrendingBlock /> },
      { key: 'analysis' as keyof typeof blocksConfig, component: <AnalysisBlock /> },
      { key: 'recommendation' as keyof typeof blocksConfig, component: <RecommendationBlock /> },
      { key: 'categories' as keyof typeof blocksConfig, component: <CategoriesBlock /> },
      { key: 'audio' as keyof typeof blocksConfig, component: <AudioBlock /> },
      { key: 'todayEvent' as keyof typeof blocksConfig, component: <TodayEventBlock /> },
      { key: 'regions' as keyof typeof blocksConfig, component: <RegionsBlock /> }
    ];

    return blocks
      .filter(block => blocksConfig[block.key]?.enabled)
      .sort((a, b) => blocksConfig[a.key].order - blocksConfig[b.key].order);
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}
      style={{
        fontFamily: 'Tajawal, system-ui, -apple-system, "Segoe UI", "Noto Sans Arabic", Arial, sans-serif',
        direction: 'rtl'
      }}
    >
      {/* Header */}
      <Header />

      {/* Welcome Section - Full Width */}
      <section className="w-full py-20 mb-12" style={{ 
        background: 'linear-gradient(135deg, #4F7CE8 0%, #6C91F7 50%, #8BA7FF 100%)' 
      }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center relative">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
              <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Main Title */}
            <div className="mb-16 relative z-10">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-1 h-1 bg-white/60 rounded-full animate-ping"></div>
                <Calendar className="w-5 h-5 text-white/80" />
                <span className="text-white/80 text-sm font-medium">
                  الثلاثاء، 16 ذو الحجة 1451 هـ
                </span>
                <div className="w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
                هل فاتك شيء اليوم؟
              </h1>
              <p className="text-2xl text-white/90 mb-4">
                إليك الخلاصة المسائية من سبق
              </p>
              <div className="flex items-center justify-center gap-2 text-white/70">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">مدعوم بالذكاء الاصطناعي</span>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            
            {/* Enhanced Three News Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 relative z-10">
              {/* Card 1 - Breaking News */}
              <div className="group bg-white/15 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <span className="px-4 py-2 bg-green-500/30 text-green-200 text-sm rounded-full font-bold backdrop-blur-sm">
                      # عاجل
                    </span>
                  </div>
                </div>
                <h3 className="text-right text-white font-bold mb-4 text-lg leading-relaxed group-hover:text-green-100 transition-colors">
                  إطلاق مشروع نيوم للهيدروجين الأخضر
                </h3>
                <div className="flex items-center justify-end gap-3 text-white/80 text-sm group-hover:text-white transition-colors">
                  <span className="font-medium">اقرأ المزيد</span>
                  <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 2 - Featured */}
              <div className="group bg-white/15 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <span className="px-4 py-2 bg-blue-500/30 text-blue-200 text-sm rounded-full font-bold backdrop-blur-sm">
                      # تقنية
                    </span>
                  </div>
                </div>
                <h3 className="text-right text-white font-bold mb-4 text-lg leading-relaxed group-hover:text-blue-100 transition-colors">
                  السعودية تستضيف قمة الذكاء الاصطناعي العالمية
                </h3>
                <div className="flex items-center justify-end gap-3 text-white/80 text-sm group-hover:text-white transition-colors">
                  <span className="font-medium">اقرأ المزيد</span>
                  <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 3 - Environment */}
              <div className="group bg-white/15 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <span className="px-4 py-2 bg-teal-500/30 text-teal-200 text-sm rounded-full font-bold backdrop-blur-sm">
                      # بيئة
                    </span>
                  </div>
                </div>
                <h3 className="text-right text-white font-bold mb-4 text-lg leading-relaxed group-hover:text-teal-100 transition-colors">
                  مشروع البحر الأحمر يحقق إنجازاً بيئياً عالمياً
                </h3>
                <div className="flex items-center justify-end gap-3 text-white/80 text-sm group-hover:text-white transition-colors">
                  <span className="font-medium">اقرأ المزيد</span>
                  <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Enhanced Read Full Button */}
            <div className="relative z-10">
              <button className="group bg-white/25 hover:bg-white/35 backdrop-blur-lg text-white px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 border border-white/40 hover:scale-105 hover:shadow-xl hover:shadow-white/20">
                <span className="flex items-center gap-3">
                  <Book className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  قراءة سبق الكاملة
                  <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant Separator */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex items-center justify-center">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <div className={`px-6 py-2 rounded-full ${
            darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">المحتوى الذكي</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>
      </div>

      {/* شريط التنقل بالتصنيفات */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <div className={`rounded-2xl p-8 transition-all duration-500 ${
          darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/70 border border-gray-200'
        }`} style={{ backdropFilter: 'blur(10px)' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              darkMode ? 'bg-blue-600' : 'bg-blue-500'
            }`}>
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                استكشف بحسب التصنيفات
              </h2>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                اختر التصنيف الذي يهمك لتصفح الأخبار المتخصصة
              </p>
            </div>
          </div>

          <CategoryNavigation
            categories={availableCategories}
            className="gap-3"
          />
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Enhanced News Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-6">
              <Brain className="w-5 h-5 text-blue-600" />
              <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                مدعوم بالذكاء الاصطناعي
              </span>
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className={`text-4xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              محتوى ذكي مخصص لك
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              مقالات وتحليلات مختارة بعناية تناسب اهتماماتك وتطلعاتك المعرفية
            </p>
          </div>

          {/* Enhanced Show All Link */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
              }`}>
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">12 مقال جديد اليوم</span>
              </div>
            </div>
            <button className={`group flex items-center gap-3 px-6 py-3 rounded-xl text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105`}>
              <span className="font-semibold">عرض الكل</span>
              <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Enhanced News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {newsData.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        </section>

        {/* Enhanced Smart Blocks Section */}
        <section className="mb-16">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-lg opacity-20"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="font-bold text-lg">البلوكات الذكية</span>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>
            </div>
            <h2 className={`text-4xl font-bold mb-6 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              تجربة مخصصة لك
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              استكشف المحتوى المنظم والمقسم بذكاء حسب اهتماماتك وتفضيلاتك الشخصية
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className={`text-center px-6 py-4 rounded-xl ${
                darkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <div className="text-2xl font-bold text-blue-600 mb-1">8</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>بلوك ذكي</div>
              </div>
              <div className={`text-center px-6 py-4 rounded-xl ${
                darkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <div className="text-2xl font-bold text-green-600 mb-1">24/7</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>تحديث مستمر</div>
              </div>
              <div className={`text-center px-6 py-4 rounded-xl ${
                darkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <div className="text-2xl font-bold text-purple-600 mb-1">AI</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ذكاء اصطناعي</div>
              </div>
            </div>
          </div>

          {/* Enhanced Smart Blocks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* ويدجت الذكاء الشخصي */}
            {userTracker && isLoggedIn && (
              <div className="transform hover:scale-105 transition-all duration-300">
                <UserIntelligenceWidget />
              </div>
            )}
            
            <div className="transform hover:scale-105 transition-all duration-300">
              <BriefingBlock />
            </div>
            <div className="transform hover:scale-105 transition-all duration-300">
              <TrendingBlock />
            </div>
            <div className="transform hover:scale-105 transition-all duration-300">
              <AnalysisBlock />
            </div>
            <div className="transform hover:scale-105 transition-all duration-300">
              <RecommendationBlock />
            </div>
            <div className="transform hover:scale-105 transition-all duration-300">
              <CategoriesBlock />
            </div>
            <div className="transform hover:scale-105 transition-all duration-300">
              <AudioBlock />
            </div>
            <div className="transform hover:scale-105 transition-all duration-300">
              <TodayEventBlock />
            </div>
            <div className="transform hover:scale-105 transition-all duration-300">
              <RegionsBlock />
            </div>
          </div>

          {/* Action Center */}
          <div className="text-center mt-16">
            <div className={`inline-flex flex-wrap items-center gap-4 p-6 rounded-2xl ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
            }`}>
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors">
                <Settings className="w-4 h-4" />
                تخصيص البلوكات
              </button>
              <button className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border'
              }`}>
                <Eye className="w-4 h-4" />
                عرض الإحصائيات
              </button>
              <button className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border'
              }`}>
                <Share2 className="w-4 h-4" />
                مشاركة التفضيلات
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className={`relative overflow-hidden mt-20 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full translate-x-48 translate-y-48"></div>
        </div>

        {/* Border */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            {/* Logo Section */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  darkMode ? 'bg-gradient-to-br from-blue-600 to-purple-700' : 'bg-gradient-to-br from-blue-500 to-purple-600'
                }`}>
                  <span className="text-white font-bold text-xl">س</span>
                </div>
                <div className="text-left">
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    سبق
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    صحيفة المستقبل الذكية
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className={`text-center px-4 py-3 rounded-xl ${
                darkMode ? 'bg-gray-800' : 'bg-gray-50'
              } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-2xl font-bold text-blue-600 mb-1">1.2M+</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>قارئ نشط</div>
              </div>
              <div className={`text-center px-4 py-3 rounded-xl ${
                darkMode ? 'bg-gray-800' : 'bg-gray-50'
              } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-2xl font-bold text-green-600 mb-1">50K+</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>مقال يومياً</div>
              </div>
              <div className={`text-center px-4 py-3 rounded-xl ${
                darkMode ? 'bg-gray-800' : 'bg-gray-50'
              } border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-2xl font-bold text-purple-600 mb-1">AI</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ذكاء اصطناعي</div>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <a href="#" className={`text-sm hover:text-blue-500 transition-colors ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                سياسة الخصوصية
              </a>
              <a href="#" className={`text-sm hover:text-blue-500 transition-colors ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                شروط الاستخدام
              </a>
              <a href="#" className={`text-sm hover:text-blue-500 transition-colors ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                تواصل معنا
              </a>
              <a href="#" className={`text-sm hover:text-blue-500 transition-colors ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                عن سبق
              </a>
            </div>

            {/* Copyright */}
            <div className="flex items-center justify-center gap-2">
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                © 2025 صحيفة سبق – جميع الحقوق محفوظة
              </p>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  صُنع بحب في المملكة العربية السعودية
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        
        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${darkMode ? '#1f2937' : '#f1f5f9'};
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#4f46e5' : '#3b82f6'};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#4338ca' : '#2563eb'};
        }
      `}</style>
    </div>
  );
} 
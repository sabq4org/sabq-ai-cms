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
  Crown, Leaf, Book, Tag, X, Bookmark
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';

import CategoryBadge, { CategoryNavigation } from './components/CategoryBadge';
import Header from '../components/Header';
import { SmartSlot } from '@/components/home/SmartSlot';
import DeepAnalysisWidget from '@/components/DeepAnalysisWidget';


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

  getDeviceType(): string {
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

function NewspaperHomePage() {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // إضافة حالة التحقق من المصادقة
  const [userTracker, setUserTracker] = useState<UserIntelligenceTracker | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [readingTime, setReadingTime] = useState<{ [key: string]: number }>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categoryArticles, setCategoryArticles] = useState<any[]>([]);
  const [categoryArticlesLoading, setCategoryArticlesLoading] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [personalizedArticles, setPersonalizedArticles] = useState<any[]>([]);
  const [personalizedLoading, setPersonalizedLoading] = useState(true);
  const [smartDosePhrase, setSmartDosePhrase] = useState<string>("جرعة سبق الذكية");
  const [smartDoseSubtitle, setSmartDoseSubtitle] = useState<string>("إليك أهم الأخبار");
  const [trendingData, setTrendingData] = useState<any[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<any>({
    mainEvent: null,
    alert: null,
    trend: null
  });
  const [analysisLoading, setAnalysisLoading] = useState(true);
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
  const [deepInsights, setDeepInsights] = useState<any[]>([]);
  const [deepInsightsLoading, setDeepInsightsLoading] = useState(true);

  useEffect(() => {
    // تعيين الوقت الحالي بعد التحميل لتجنب مشكلة Hydration
    setCurrentTime(new Date());
    
    // التحقق من تسجيل الدخول
    const userId = localStorage.getItem('user_id');
    const userData = localStorage.getItem('user');
    if (userId && userId !== 'anonymous' && userData) {
      setIsLoggedIn(true);
      
      // تهيئة متتبع ذكاء المستخدم
      const tracker = new UserIntelligenceTracker(userId);
      setUserTracker(tracker);
      
      // تحميل النقاط المحفوظة
      const savedPoints = localStorage.getItem('user_points');
      if (savedPoints) {
        setUserPoints(JSON.parse(savedPoints));
      }
      
      // جلب المحتوى المخصص
      fetchPersonalizedContent();
    } else {
      setIsLoggedIn(false);
    }
    
    // الانتهاء من التحقق من المصادقة
    setIsCheckingAuth(false);
    
    // جلب التصنيفات من API
    fetchCategories();
    
    // جلب المقالات من API
    fetchArticles();
    
    // جلب المقالات الأكثر تداولاً
    fetchTrendingArticles();
    
    // جلب بيانات التحليل الذكي
    fetchAnalysisData();
    
    // جلب التحليلات العميقة
    fetchDeepInsights();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // تحديث العبارات الذكية بعد تحميل الوقت
  useEffect(() => {
    if (currentTime) {
      // دالة محلية للحصول على العبارة الذكية
      const updateSmartDosePhrases = () => {
        const saudiTime = new Date();
        const offset = 3 * 60 * 60 * 1000;
        saudiTime.setTime(currentTime.getTime() + offset);
        
        const hour = saudiTime.getHours();
        const day = saudiTime.getDay();
        
        // تحديد العبارة حسب الوقت
        let phrase = "جرعة سبق الذكية";
        let subtitle = "إليك أهم الأخبار";
        
        if (hour >= 6 && hour < 12) {
          const morningPhrases = [
            "هل بدأت يومك بفهم المشهد؟",
            "صباحك مع سبق.. أكثر وعيًا",
            "ابدأ يومك بمعرفة تُشبِهك"
          ];
          phrase = morningPhrases[day % morningPhrases.length];
          subtitle = "إليك الجرعة الصباحية من سبق";
        } else if (hour >= 12 && hour < 18) {
          const afternoonPhrases = [
            "وقفة تحليلية لمنتصف اليوم",
            "الظهيرة.. ما الذي تصدر المشهد؟",
            "نصف اليوم، ونصف الصورة 📊"
          ];
          phrase = afternoonPhrases[day % afternoonPhrases.length];
          subtitle = "إليك جرعة الظهيرة من سبق";
        } else {
          const eveningPhrases = [
            "هل فاتك شيء اليوم؟",
            "موجز نهاية اليوم.. قبل أن تنام",
            "الذكاء يلخص لك المشهد"
          ];
          phrase = eveningPhrases[day % eveningPhrases.length];
          subtitle = "إليك الخلاصة المسائية من سبق";
        }
        
        setSmartDosePhrase(phrase);
        setSmartDoseSubtitle(subtitle);
      };
      
      updateSmartDosePhrases();
    }
  }, [currentTime]);

  // جلب المحتوى المخصص من API
  const fetchPersonalizedContent = async () => {
    try {
      const userId = localStorage.getItem('user_id') || 'anonymous';
      if (userId === 'anonymous') return;
      
      const response = await fetch(`/api/content/personalized?user_id=${userId}&limit=6`);
      if (response.ok) {
        const data = await response.json();
        if (data.articles) {
          setPersonalizedArticles(data.articles);
        }
      }
    } catch (error) {
      console.error('Error fetching personalized content:', error);
    }
  };

  // إعادة جلب المقالات عندما يتم تحميل التصنيفات
  useEffect(() => {
    if (categories.length > 0 && !categoriesLoading) {
      fetchArticles();
      fetchTrendingArticles();
      fetchAnalysisData();
    }
  }, [categories, categoriesLoading]);

  // جلب التصنيفات من API مع عدد المقالات
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      
      // جلب التصنيفات
      const categoriesResponse = await fetch('/api/categories');
      const categoriesResult = await categoriesResponse.json();
      const categoriesData = categoriesResult.data || [];
      
      // جلب جميع المقالات المنشورة
      const articlesResponse = await fetch('/api/articles?status=published&limit=1000');
      const articlesResult = await articlesResponse.json();
      const articlesData = articlesResult.data || articlesResult.articles || [];
      
      // حساب عدد المقالات لكل تصنيف
      const categoriesWithCount = categoriesData.map((category: any) => {
        const articleCount = articlesData.filter((article: any) => 
          article.category_id === category.id
        ).length;
        
        return {
          ...category,
          articles_count: articleCount
        };
      });
      
      // ترتيب التصنيفات حسب عدد المقالات (الأكثر مقالات أولاً)
      const sortedCategories = categoriesWithCount.sort((a: any, b: any) => 
        b.articles_count - a.articles_count
      );
      
      setCategories(sortedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // جلب المقالات حسب التصنيف
  const fetchCategoryArticles = async (categoryId: number) => {
    try {
      setCategoryArticlesLoading(true);
      const response = await fetch(`/api/articles?category_id=${categoryId}&status=published&limit=10`);
      const result = await response.json();
      setCategoryArticles(result.data || result.articles || []);
    } catch (error) {
      console.error('Error fetching category articles:', error);
      setCategoryArticles([]);
    } finally {
      setCategoryArticlesLoading(false);
    }
  };

  // جلب المقالات من API
  const fetchArticles = async () => {
    try {
      setArticlesLoading(true);
      
      // جلب المقالات المنشورة الحديثة
      const response = await fetch('/api/articles?status=published&limit=20&sort=created_at&order=desc');
      const result = await response.json();
      const articlesData = result.data || result.articles || [];
      
      // تحويل البيانات لتتوافق مع تصميم NewsCard
      const formattedArticles = articlesData.map((article: any) => {
        // البحث عن التصنيف المطابق
        const categoryInfo = categories.find(cat => cat.id === article.category_id);
        const categoryName = categoryInfo?.name_ar || categoryInfo?.name || 'عام';
        
        // استخراج الكلمات المفتاحية من seo_keywords
        let tags: string[] = [];
        if (article.seo_keywords) {
          if (typeof article.seo_keywords === 'string') {
            tags = article.seo_keywords.split(',').map((tag: string) => tag.trim()).filter(Boolean);
          } else if (Array.isArray(article.seo_keywords)) {
            tags = article.seo_keywords;
          }
        }
        
        // حساب وقت القراءة بناءً على طول المحتوى
        const wordsPerMinute = 200; // متوسط سرعة القراءة بالعربية
        const wordCount = article.content ? article.content.trim().split(/\s+/).length : 0;
        const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
        
        return {
          id: article.id,
          title: article.title,
          excerpt: article.summary || (article.content ? article.content.substring(0, 150) + '...' : ''),
          category: categoryName,
          categoryId: article.category_id,
          author: article.author_name || article.author_id || 'فريق التحرير',
          publishedAt: article.published_at || article.created_at,
          readTime: article.reading_time || readingTime,
          image: article.featured_image || generatePlaceholderImage(article.title),
          views: article.views_count || 0,
          isBreaking: article.is_breaking || false,
          tags: tags.slice(0, 3) // أخذ أول 3 كلمات مفتاحية فقط
        };
      });
      
      setArticles(formattedArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
    } finally {
      setArticlesLoading(false);
    }
  };

  // جلب المقالات الأكثر تداولاً
  const fetchTrendingArticles = async () => {
    try {
      setTrendingLoading(true);
      
      // جلب المقالات المنشورة مرتبة حسب عدد المشاهدات
      const response = await fetch('/api/articles?status=published&limit=5&sort=views&order=desc');
      const result = await response.json();
      const articlesData = result.data || result.articles || [];
      
      // تحويل البيانات لتتوافق مع تصميم TrendingBlock
      const formattedTrending = articlesData.slice(0, 3).map((article: any, index: number) => {
        // البحث عن التصنيف المطابق
        const categoryInfo = categories.find(cat => cat.id === article.category_id);
        const categoryName = categoryInfo?.name_ar || categoryInfo?.name || 'عام';
        
        return {
          id: article.id,
          title: article.title,
          views: article.views_count || (1000 * (3 - index)), // استخدام قيمة افتراضية إذا لم تكن موجودة
          category: categoryName
        };
      });
      
      setTrendingData(formattedTrending);
    } catch (error) {
      console.error('Error fetching trending articles:', error);
      setTrendingData([]);
    } finally {
      setTrendingLoading(false);
    }
  };

  // جلب بيانات التحليل الذكي
  const fetchAnalysisData = async () => {
    try {
      setAnalysisLoading(true);
      
      // جلب أحدث مقال مميز كحدث رئيسي
      const featuredResponse = await fetch('/api/articles?status=published&featured=true&limit=1&sort=published_at&order=desc');
      const featuredResult = await featuredResponse.json();
      const featuredArticle = (featuredResult.data || featuredResult.articles || [])[0];
      
      // جلب أحدث مقال عاجل كتنبيه
      const breakingResponse = await fetch('/api/articles?status=published&breaking=true&limit=1&sort=published_at&order=desc');
      const breakingResult = await breakingResponse.json();
      const breakingArticle = (breakingResult.data || breakingResult.articles || [])[0];
      
      // جلب مقال من فئة الاقتصاد أو التقنية كتوجه
      const trendResponse = await fetch('/api/articles?status=published&limit=20&sort=published_at&order=desc');
      const trendResult = await trendResponse.json();
      const trendArticles = (trendResult.data || trendResult.articles || []);
      const trendArticle = trendArticles.find((article: any) => {
        const categoryInfo = categories.find(cat => cat.id === article.category_id);
        const categoryName = categoryInfo?.name_ar || categoryInfo?.name || '';
        return categoryName.includes('اقتصاد') || categoryName.includes('تقنية');
      });
      
      setAnalysisData({
        mainEvent: featuredArticle ? featuredArticle.title : null,
        alert: breakingArticle ? breakingArticle.title : null,
        trend: trendArticle ? trendArticle.title : null
      });
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      setAnalysisData({
        mainEvent: null,
        alert: null,
        trend: null
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  // جلب التحليلات العميقة
  const fetchDeepInsights = async () => {
    try {
      setDeepInsightsLoading(true);
      const response = await fetch('/api/deep-insights?limit=3&sort=desc');
      if (response.ok) {
        const data = await response.json();
        setDeepInsights(data);
      }
    } catch (error) {
      console.error('Error fetching deep insights:', error);
      setDeepInsights([]);
    } finally {
      setDeepInsightsLoading(false);
    }
  };

  // دالة لتوليد صورة بديلة بناءً على العنوان
  const generatePlaceholderImage = (title: string) => {
    // قائمة بصور Unsplash ذات جودة عالية ومتنوعة
    const placeholderImages = [
              'https://images.unsplash.com/photo-1504711434969-e33886168f5c', // أخبار
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa', // تقنية
      'https://images.unsplash.com/photo-1495020689067-958852a7765e', // إعلام
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167', // أخبار 2
      'https://images.unsplash.com/photo-1478940020726-e9e191651f1a', // صحافة
      'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94', // أخبار 3
      'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1', // أخبار 4
      'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3', // أخبار 5
    ];
    
    // اختيار صورة بناءً على hash العنوان للحصول على نفس الصورة لنفس المقال
    const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageIndex = hash % placeholderImages.length;
    
    return `${placeholderImages[imageIndex]}?auto=format&fit=crop&w=800&q=80`;
  };

  // معالج النقر على التصنيف
  const handleCategoryClick = async (categoryId: number) => {
    if (selectedCategory === categoryId) {
      // إذا كان نفس التصنيف، أغلق القائمة
      setSelectedCategory(null);
      setCategoryArticles([]);
    } else {
      // اختر التصنيف الجديد واجلب مقالاته
      setSelectedCategory(categoryId);
      await fetchCategoryArticles(categoryId);
    }
  };

  // دالة تتبع التفاعلات الذكية
  const trackUserInteraction = useCallback((articleId: string, type: UserInteraction['interaction_type'], category: string, additionalData: any = {}) => {
    if (!userTracker) return;
    
    // التحقق من تسجيل الدخول
    if (!isLoggedIn) {
      // عرض رسالة للمستخدم
      alert('يرجى تسجيل الدخول لبدء رحلتك الذكية وكسب النقاط 🎯');
      return;
    }
    
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

  // دالة للحصول على العبارة الفرعية حسب الوقت
  const getSmartDoseSubtitle = () => {
    const saudiTime = new Date();
    if (currentTime) {
      const offset = 3 * 60 * 60 * 1000;
      saudiTime.setTime(currentTime.getTime() + offset);
    }
    
    const hour = saudiTime.getHours();
    
    if (hour >= 6 && hour < 12) {
      return "إليك الجرعة الصباحية من سبق";
    } else if (hour >= 12 && hour < 18) {
      return "إليك جرعة الظهيرة من سبق";
    } else {
      return "إليك الخلاصة المسائية من سبق";
    }
  };

  const timeContent = getTimeContent();

  // بيانات وهمية للبلوكات
  const briefingData = [
    { id: 1, title: "انطلاق مؤتمر الذكاء الاصطناعي في الرياض\nبمشاركة عالمية واسعة وحضور أكثر من 500 خبير", time: "منذ 15 دقيقة", isNew: true },
    { id: 2, title: "صندوق الاستثمارات يعلن عن شراكة جديدة\nمع عمالقة التقنية لتطوير الذكاء الاصطناعي", time: "منذ 30 دقيقة", isNew: true },
    { id: 3, title: "نجاح عملية إطلاق القمر الاصطناعي السعودي\nويدخل المدار المحدد بنجاح تام وفقاً للخطة", time: "منذ ساعة", isNew: false },
    { id: 4, title: "افتتاح مدينة نيوم الطبية الذكية\nأول مستشفى رقمي متكامل يعتمد على الذكاء الاصطناعي", time: "منذ ساعتين", isNew: false }
  ];

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
    
    // حالات التفاعل المحلية لردود الفعل البصرية الفورية
    const [isLiked, setIsLiked] = useState(false);
    const [isShared, setIsShared] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [interactionLoading, setInteractionLoading] = useState<string | null>(null);
    
    // دالة محسنة للتفاعل مع ردود فعل بصرية فورية
    const handleInteraction = async (interactionType: string) => {
      setInteractionLoading(interactionType);
      
      try {
        // تحديث الواجهة فوراً لتحسين تجربة المستخدم
        if (interactionType === 'like') {
          setIsLiked(!isLiked);
          // إشعار فوري
          toast.success(isLiked ? 'تم إلغاء الإعجاب' : 'تم الإعجاب! ❤️', {
            duration: 2000,
            position: 'bottom-center'
          });
        } else if (interactionType === 'share') {
          setIsShared(true);
          toast.success('تم تسجيل المشاركة! 📤', {
            duration: 2000,
            position: 'bottom-center'
          });
          // إعادة تعيين حالة المشاركة بعد ثانيتين
          setTimeout(() => setIsShared(false), 2000);
        } else if (interactionType === 'save') {
          setIsBookmarked(!isBookmarked);
          toast.success(isBookmarked ? 'تم إلغاء الحفظ' : 'تم حفظ المقال! 🔖', {
            duration: 2000,
            position: 'bottom-center'
          });
        }
        
        // إرسال التفاعل إلى الخادم
        await trackInteraction(news.id, interactionType, news.categoryId);
        
      } catch (error) {
        // في حالة الفشل، إعادة الحالة إلى ما كانت عليه
        if (interactionType === 'like') {
          setIsLiked(isLiked);
        } else if (interactionType === 'save') {
          setIsBookmarked(isBookmarked);
        }
        
        console.error('خطأ في التفاعل:', error);
        toast.error('حدث خطأ، يرجى المحاولة مرة أخرى');
      } finally {
        setInteractionLoading(null);
      }
    };
    
    return (
      <Link href={`/article/${news.id}`} className="block" prefetch={true}>
        <div 
        className={`group rounded-3xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] bg-white dark:bg-gray-800 ${isPersonalized ? 'ring-2 ring-blue-400/30' : ''} shadow-lg dark:shadow-gray-900/50 overflow-hidden`}
      >
          <div className="relative h-48 overflow-hidden">
            <img 
              src={news.image} 
              alt={news.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* تأثير التدرج على الصورة */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {news.isBreaking && (
              <span className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg dark:shadow-gray-900/50">
                عاجل
              </span>
            )}
            
            {/* شارة المحتوى المخصص */}
            {isPersonalized && (
              <div className="absolute top-3 left-3">
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/90 text-white text-xs rounded-full shadow-lg dark:shadow-gray-900/50 backdrop-blur-sm">
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
                    const categoryData = Array.isArray(categories) ? categories.find((cat: any) => 
                      cat.name_ar === news.category || cat.name_en === news.category
                    ) : null;
                    
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
            <h3 className="text-lg font-bold mb-3 leading-tight transition-colors duration-300 text-gray-800 dark:text-white">
              {news.title}
            </h3>
            
            <p className="text-sm mb-4 line-clamp-2 transition-colors duration-300 text-gray-600 dark:text-gray-400">
              {news.excerpt}
            </p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs transition-colors duration-300 text-gray-500 dark:text-gray-400">
                  {news.author}
                </span>
                <span className="text-xs transition-colors duration-300 text-gray-500 dark:text-gray-400">
                  {news.readTime} دقائق قراءة
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {news.views.toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {news.tags.slice(0, 2).map((tag: string) => (
                  <span key={tag} className="px-2 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                {/* زر الإعجاب المحسن */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleInteraction('like');
                  }}
                  disabled={interactionLoading === 'like'}
                  className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${ isLiked ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400' } ${interactionLoading === 'like' ? 'animate-pulse' : ''}`}
                  title={isLiked ? 'إلغاء الإعجاب' : 'إعجاب'}
                >
                  {interactionLoading === 'like' ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  )}
                </button>
                
                {/* زر المشاركة المحسن */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleInteraction('share');
                  }}
                  disabled={interactionLoading === 'share'}
                  className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${ isShared ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400' } ${interactionLoading === 'share' ? 'animate-pulse' : ''}`}
                  title="مشاركة"
                >
                  {interactionLoading === 'share' ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
                
                {/* زر الحفظ المحسن */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleInteraction('save');
                  }}
                  disabled={interactionLoading === 'save'}
                  className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${ isBookmarked ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400' } ${interactionLoading === 'save' ? 'animate-pulse' : ''}`}
                  title={isBookmarked ? 'إلغاء الحفظ' : 'حفظ'}
                >
                  {interactionLoading === 'save' ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  // تسجيل تفاعل المستخدم مع API
  const trackInteraction = async (articleId: string, interactionType: string, categoryId?: number) => {
    try {
      // فحص شامل لحالة تسجيل الدخول
      const userId = localStorage.getItem('user_id');
      const userData = localStorage.getItem('user');
      const currentUserData = localStorage.getItem('currentUser');
      
      console.log('🔍 فحص تفصيلي لحالة تسجيل الدخول:');
      console.log('- user_id من localStorage:', userId);
      console.log('- user من localStorage:', userData ? 'موجود' : 'غير موجود');
      console.log('- currentUser من localStorage:', currentUserData ? 'موجود' : 'غير موجود');
      console.log('- isLoggedIn state:', isLoggedIn);
      
      // شروط التحقق الصارمة
      const hasUserId = userId && userId.trim() !== '' && userId !== 'null' && userId !== 'undefined';
      const isNotAnonymous = userId !== 'anonymous';
      const hasUserData = userData && userData.trim() !== '' && userData !== 'null' && userData !== 'undefined';
      
      console.log('📋 نتائج الفحص:');
      console.log('- hasUserId:', hasUserId);
      console.log('- isNotAnonymous:', isNotAnonymous);
      console.log('- hasUserData:', hasUserData);
      
      // التحقق النهائي من تسجيل الدخول
      const isUserLoggedIn = hasUserId && isNotAnonymous && hasUserData;
      
      console.log('🎯 النتيجة النهائية:', isUserLoggedIn ? 'مسجل دخول' : 'غير مسجل دخول');
      
      if (!isUserLoggedIn) {
        console.log('❌ المستخدم غير مسجل دخول - عرض رسالة التنبيه');
        
        // تشخيص مفصل للمشكلة
        if (!hasUserId) {
          console.log('🔧 السبب: user_id غير صالح أو فارغ');
        } else if (!isNotAnonymous) {
          console.log('🔧 السبب: المستخدم مجهول (anonymous)');
        } else if (!hasUserData) {
          console.log('🔧 السبب: بيانات المستخدم غير موجودة أو غير صالحة');
        }
        
        // عرض رسالة تفاعلية بدلاً من alert
        toast('يرجى تسجيل الدخول لبدء رحلتك الذكية وكسب النقاط 🎯', {
          duration: 4000,
          position: 'top-center',
          icon: '⚠️'
        });
        
        // تحديث حالة تسجيل الدخول إذا كانت خاطئة
        if (isLoggedIn) {
          console.log('🔄 تصحيح حالة isLoggedIn إلى false');
          setIsLoggedIn(false);
        }
        return;
      }
      
      // تحديث حالة تسجيل الدخول إذا كانت خاطئة
      if (!isLoggedIn) {
        console.log('🔄 تصحيح حالة isLoggedIn إلى true');
        setIsLoggedIn(true);
      }
      
      console.log('✅ المستخدم مسجل دخول - إرسال التفاعل إلى API');
      
      // إرسال التفاعل إلى API
      const response = await fetch('/api/interactions/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          article_id: articleId,
          interaction_type: interactionType,
          category_id: categoryId,
          source: 'newspaper',
          device_type: userTracker?.getDeviceType() || 'unknown'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ تم إرسال التفاعل بنجاح:', result);
        
        // تحديث النقاط إذا تم منحها
        if (result.points_earned) {
          const newPoints = userPoints + result.points_earned;
          setUserPoints(newPoints);
          localStorage.setItem('user_points', JSON.stringify(newPoints));
          console.log(`🎉 تم كسب ${result.points_earned} نقطة! المجموع: ${newPoints}`);
        }
        
        // إعادة جلب المحتوى المخصص بعد التفاعل
        if (interactionType === 'like' || interactionType === 'share') {
          setTimeout(() => {
            console.log('🔄 إعادة جلب المحتوى المخصص...');
            fetchPersonalizedContent();
          }, 1000);
        }
        
        // إشعار نجاح التفاعل
        if (interactionType === 'like') {
          console.log('❤️ تم تسجيل الإعجاب');
        } else if (interactionType === 'share') {
          console.log('📤 تم تسجيل المشاركة');
        } else if (interactionType === 'read') {
          console.log('📖 تم تسجيل القراءة');
        }
        
      } else {
        const error = await response.json();
        console.error('❌ خطأ في API التفاعل:', error);
        
        if (response.status === 401) {
          console.log('🔐 خطأ في المصادقة - عرض رسالة تسجيل الدخول');
          alert(error.message || 'يرجى تسجيل الدخول لبدء رحلتك الذكية وكسب النقاط 🎯');
          
          // إعادة تعيين حالة تسجيل الدخول
          setIsLoggedIn(false);
        } else {
          console.log('⚠️ خطأ آخر في API:', response.status, error.message);
        }
      }
    } catch (error) {
      console.error('💥 خطأ في دالة trackInteraction:', error);
      console.log('🔧 تفاصيل الخطأ:', {
        message: error instanceof Error ? error.message : 'خطأ غير معروف',
        stack: error instanceof Error ? error.stack : undefined,
        articleId,
        interactionType,
        categoryId
      });
    }
  };

  // مكون ويدجت الذكاء الشخصي
  const UserIntelligenceWidget = () => {
    const preferences = userTracker?.getPreferences() || {};
    const topCategories = Object.entries(preferences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return (
      <div className={`rounded-3xl p-6 shadow-xl dark:shadow-gray-900/50 border transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>ملفك الذكي</h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>تحليل اهتماماتك</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-500" />
            <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
              {userPoints} نقطة
            </span>
          </div>
        </div>

        {/* الاهتمامات الرئيسية */}
        <div className="mb-6">
          <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
            اهتماماتك الرئيسية:
          </h3>
          <div className="space-y-2">
            {topCategories.length > 0 ? (
              topCategories.map(([category, score], index) => (
                <div key={category} className="flex items-center justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
                    {categories.find(c => c.id.toString() === category)?.name_ar || category}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-24 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${Math.min(100, score * 20)}%` }}
                      />
                    </div>
                    <span className={`text-xs ${darkMode ? 'text-gray-500 dark:text-gray-400 dark:text-gray-500' : 'text-gray-400 dark:text-gray-500'}`}>
                      {score.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-sm ${darkMode ? 'text-gray-500 dark:text-gray-400 dark:text-gray-500' : 'text-gray-400 dark:text-gray-500'}`}>
                ابدأ بقراءة المقالات لبناء ملفك الشخصي
              </p>
            )}
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className={`grid grid-cols-2 gap-3 p-4 rounded-xl ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50 dark:bg-gray-900'}`}>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
              {Object.keys(readingTime).length}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
              مقال مقروء
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
              {Math.round(Object.values(readingTime).reduce((a, b) => a + b, 0) / 60)}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
              دقيقة قراءة
            </div>
          </div>
        </div>

        <button className={`w-full mt-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:shadow-gray-900/50 ${darkMode ? 'bg-blue-900/30 hover:bg-blue-800/30 text-blue-300' : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 text-blue-700'}`}>
          عرض التقرير الكامل
        </button>
      </div>
    );
  };

  // مكونات البلوكات الذكية المحسنة
  const BriefingBlock = () => (
    <div className={`rounded-3xl p-6 shadow-xl dark:shadow-gray-900/50 border transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-600/30' : 'bg-blue-500'}`}>
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>موجز الآن</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>ابدأ من هنا</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-blue-600/30 text-blue-300' : 'bg-blue-500 text-white'}`}>
          {briefingData.length} تحديث
        </span>
      </div>
      
      <div className="space-y-4">
        {briefingData.map((item) => (
          <Link key={item.id} href={`/article/briefing-${item.id}`} className="block">
            <div className={`p-4 rounded-2xl border transition-all duration-300 hover:shadow-lg dark:shadow-gray-900/50 cursor-pointer ${darkMode ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${item.isNew ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div className="flex-1">
                  <div className="mb-2">
                    <h4 className={`text-sm font-medium leading-relaxed whitespace-pre-line ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>{item.title}</h4>
                    {item.isNew && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium mt-2 inline-block">جديد</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>{item.time}</span>
                    <div className="flex items-center gap-1">
                      <Eye className={`w-3 h-3 ${darkMode ? 'text-gray-500 dark:text-gray-400 dark:text-gray-500' : 'text-gray-400 dark:text-gray-500'}`} />
                      <span className={`text-xs ${darkMode ? 'text-gray-500 dark:text-gray-400 dark:text-gray-500' : 'text-gray-400 dark:text-gray-500'}`}>2.3K</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <button className={`w-full mt-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:shadow-gray-900/50 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
        عرض جميع التحديثات
      </button>
    </div>
  );

  const TrendingBlock = () => (
    <div className={`rounded-3xl p-6 shadow-xl dark:shadow-gray-900/50 border transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
            <Flame className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>يتم قراءته الآن</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>الأكثر شعبية في آخر ساعة</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${darkMode ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
          <TrendingUp className="w-3 h-3 text-orange-600" />
          <span className="text-xs font-medium text-orange-600">+24%</span>
        </div>
      </div>
      
      {trendingLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`p-4 rounded-2xl border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-4 animate-pulse">
                <div className={`w-8 h-8 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                <div className="flex-1">
                  <div className={`h-4 rounded mb-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                  <div className={`h-3 rounded w-1/3 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : trendingData.length > 0 ? (
        <div className="space-y-4">
          {trendingData.map((item, index) => (
          <Link key={item.id} href={`/article/trending-${item.id}`} className="block">
            <div className={`p-4 rounded-2xl border transition-all duration-300 hover:shadow-lg dark:shadow-gray-900/50 cursor-pointer ${darkMode ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700/50' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${ index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 dark:text-gray-500' }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-medium mb-3 leading-relaxed whitespace-pre-line ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>{item.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
                      {item.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                        {item.views.toLocaleString()} قراءة
                      </span>
                      <div className="flex items-center gap-1">
                        <Heart className={`w-3 h-3 ${darkMode ? 'text-gray-500 dark:text-gray-400 dark:text-gray-500' : 'text-gray-400 dark:text-gray-500'}`} />
                        <span className={`text-xs ${darkMode ? 'text-gray-500 dark:text-gray-400 dark:text-gray-500' : 'text-gray-400 dark:text-gray-500'}`}>1.2K</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      ) : (
        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          لا توجد مقالات متداولة حالياً
        </div>
      )}
      
      {!trendingLoading && trendingData.length > 0 && (
        <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50 dark:bg-gray-900'}`}>
          <div className="flex items-center justify-between text-xs">
            <span className={darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}>إجمالي القراءات اليوم</span>
            <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
              {trendingData.reduce((sum, item) => sum + item.views, 0).toLocaleString()} قراءة
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const AnalysisBlock = () => (
    <div className={`rounded-3xl p-6 shadow-xl dark:shadow-gray-900/50 border transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
            <Lightbulb className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>موجز اليوم الذكي</h2>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span className="text-xs font-medium text-purple-600">AI</span>
              <span className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>محدث كل ساعتين</span>
            </div>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full animate-pulse ${darkMode ? 'bg-green-400' : 'bg-green-500'}`}></div>
      </div>
      
      {analysisLoading ? (
        <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`p-4 rounded-2xl border ${darkMode ? 'bg-gray-700/50 border-gray-600/30' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'}`}>
              <div className="animate-pulse">
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                  <div className="flex-1">
                    <div className={`h-4 rounded mb-2 w-1/3 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                    <div className={`h-4 rounded mb-3 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                    <div className={`h-3 rounded w-1/4 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {analysisData.mainEvent && (
            <div className={`p-4 rounded-2xl border shadow-sm dark:shadow-gray-900/50 hover:shadow-lg dark:shadow-gray-900/50 transition-all duration-300 ${darkMode ? 'bg-blue-900/20 border-blue-700/30' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200'}`}>
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>أبرز حدث اليوم</h4>
                  <p className={`text-sm mb-3 leading-relaxed whitespace-pre-line ${darkMode ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>{analysisData.mainEvent}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-xs ${darkMode ? 'bg-blue-800/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                      تأثير عالي
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>منذ 3 ساعات</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {analysisData.alert && (
            <div className={`p-4 rounded-2xl border shadow-sm dark:shadow-gray-900/50 hover:shadow-lg dark:shadow-gray-900/50 transition-all duration-300 ${darkMode ? 'bg-orange-900/20 border-orange-700/30' : 'bg-orange-50 border-orange-200'}`}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>تنبيه مهم</h4>
                  <p className={`text-sm mb-3 leading-relaxed whitespace-pre-line ${darkMode ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>{analysisData.alert}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-xs ${darkMode ? 'bg-orange-800/50 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>
                      متوسط الأهمية
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>منذ ساعة</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {analysisData.trend && (
            <div className={`p-4 rounded-2xl border shadow-sm dark:shadow-gray-900/50 hover:shadow-lg dark:shadow-gray-900/50 transition-all duration-300 ${darkMode ? 'bg-green-900/20 border-green-700/30' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>توجه إيجابي</h4>
                  <p className={`text-sm mb-3 leading-relaxed whitespace-pre-line ${darkMode ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>{analysisData.trend}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-xs ${darkMode ? 'bg-green-800/50 text-green-300' : 'bg-green-100 text-green-700'}`}>
                      نمو +34%
                    </span>
                    <span className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>هذا الأسبوع</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {!analysisData.mainEvent && !analysisData.alert && !analysisData.trend && (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              لا توجد تحليلات متاحة حالياً
            </div>
          )}
        </div>
      )}
      
      <button className={`w-full mt-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:shadow-gray-900/50 ${darkMode ? 'bg-purple-900/30 hover:bg-purple-800/30 text-purple-300' : 'bg-purple-50 hover:bg-purple-100 text-purple-700'}`}>
        عرض التحليل الكامل
      </button>
    </div>
  );

  const RecommendationBlock = () => {
    // إذا لم يكن المستخدم مسجل دخول، لا نعرض هذا البلوك
    if (!isLoggedIn) return null;
    
    return (
      <div className={`rounded-3xl p-6 shadow-xl dark:shadow-gray-900/50 border transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>اقترحنا لك هذا</h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>بناءً على اهتماماتك</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'}`}>
            98% مطابقة
          </span>
        </div>
      
      <div className={`rounded-2xl overflow-hidden border shadow-lg dark:shadow-gray-900/50 hover:shadow-xl dark:shadow-gray-900/50 transition-all duration-300 ${darkMode ? 'border-gray-700' : 'border-gray-200 dark:border-gray-700'}`}>
        <div className="relative h-40 overflow-hidden group">
          <img src={userRecommendation.image} alt={userRecommendation.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${darkMode ? 'bg-gray-900/80 text-white' : 'bg-white dark:bg-gray-800/90 text-gray-800 dark:text-gray-100'}`}>
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
        
        <div className={`p-4 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50 dark:bg-gray-900'}`}>
          <h4 className={`text-sm font-medium mb-3 leading-relaxed whitespace-pre-line ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
            {userRecommendation.title}
          </h4>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Eye className={`w-3 h-3 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`} />
                <span className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>4.2K</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className={`w-3 h-3 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`} />
                <span className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>156</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>4.8</span>
            </div>
          </div>
          
          <Link href="/article/recommendation-1" className="block">
            <button className={`w-full py-2 text-sm font-medium rounded-xl transition-all duration-300 shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:shadow-gray-900/50 ${darkMode ? 'bg-green-900/30 hover:bg-green-800/30 text-green-300' : 'bg-green-50 hover:bg-green-100 text-green-700'}`}>
              اقرأ المقال كاملاً
            </button>
          </Link>
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <button className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all duration-300 shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:shadow-gray-900/50 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
          المزيد من هذا النوع
        </button>
        <button className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all duration-300 shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:shadow-gray-900/50 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
          حفظ للاحقاً
        </button>
      </div>
    </div>
    );
  };

  const CategoriesBlock = () => (
    <div className={`rounded-3xl p-6 shadow-xl dark:shadow-gray-900/50 border transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}>
            <Compass className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>استكشف بحسب اهتماماتك</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>أقسام مختارة لك</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {categoriesData.map((category, index) => (
          <div key={index} className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-lg dark:shadow-gray-900/50 hover:scale-[1.02] ${darkMode ? 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{category.icon}</span>
                <div>
                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>{category.name}</h4>
                  <span className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                    {category.articles.length} مقال متاح
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`} />
            </div>
            
            <div className="space-y-2">
                             {category.articles.slice(0, 2).map((article, i) => (
                 <div key={i} className="flex items-start justify-between">
                   <p className={`text-sm hover:text-indigo-600 cursor-pointer transition-colors leading-relaxed whitespace-pre-line flex-1 ${darkMode ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
                     • {article}
                   </p>
                  <div className="flex items-center gap-1">
                    <Eye className={`w-3 h-3 ${darkMode ? 'text-gray-500 dark:text-gray-400 dark:text-gray-500' : 'text-gray-400 dark:text-gray-500'}`} />
                    <span className={`text-xs ${darkMode ? 'text-gray-500 dark:text-gray-400 dark:text-gray-500' : 'text-gray-400 dark:text-gray-500'}`}>
                      {((i + 1) * 1.2).toFixed(1)}K
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <button className={`w-full mt-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:shadow-gray-900/50 ${darkMode ? 'bg-indigo-900/30 hover:bg-indigo-800/30 text-indigo-300' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'}`}>
        استكشف جميع الأقسام
      </button>
    </div>
  );

  const AudioBlock = () => (
    <div className={`rounded-3xl p-6 shadow-xl dark:shadow-gray-900/50 border transition-all duration-300 hover:shadow-2xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-pink-900/30' : 'bg-pink-50'}`}>
            <Volume2 className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>استمع لأبرز الأخبار</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>النشرة الصوتية اليومية</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>مباشر</span>
        </div>
      </div>
      
      <div className={`rounded-2xl p-5 border shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:shadow-gray-900/50 transition-all duration-300 ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative group">
            <img 
              src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=400&q=60" 
              alt="صورة المذيع"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div>
            <h4 className={`font-medium mb-1 leading-relaxed whitespace-pre-line ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>{audioData.title}</h4>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Clock className={`w-3 h-3 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`} />
                <span className={darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}>{audioData.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className={`w-3 h-3 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`} />
                <span className={darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}>2.1K مستمع</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <button className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${darkMode ? 'bg-pink-900/50 hover:bg-pink-800/50 text-pink-300' : 'bg-pink-100 hover:bg-pink-200 text-pink-700'}`}>
            <PlayCircle className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
              <div className="w-1/3 h-full bg-pink-500 rounded-full"></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>4:20</span>
              <span className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>12:45</span>
            </div>
          </div>
          <button className={`p-2 rounded-xl transition-all duration-300 shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:shadow-gray-900/50 ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
            <Download className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <button className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all duration-300 shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:shadow-gray-900/50 ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-300' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
            النشرة السابقة
          </button>
          <button className={`flex-1 py-2 text-xs font-medium rounded-xl transition-all duration-300 shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:shadow-gray-900/50 ${darkMode ? 'bg-pink-900/50 hover:bg-pink-800/50 text-pink-300' : 'bg-pink-100 hover:bg-pink-200 text-pink-700'}`}>
            تشغيل تلقائي
          </button>
        </div>
      </div>
    </div>
  );

  const TodayEventBlock = () => (
    todayEvent.isActive ? (
      <div className={`rounded-2xl p-6 shadow-sm dark:shadow-gray-900/50 border transition-all duration-300 hover:shadow-lg dark:shadow-gray-900/50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
            <Calendar className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>حدث اليوم</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>مناسبة وطنية مهمة</p>
          </div>
        </div>
        
        <div className="text-center">
          <h3 className={`text-lg font-bold mb-3 leading-relaxed whitespace-pre-line ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>{todayEvent.title}</h3>
          <p className={`text-sm mb-4 leading-relaxed whitespace-pre-line ${darkMode ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>{todayEvent.description}</p>
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}>
            {todayEvent.date}
          </span>
        </div>
      </div>
    ) : null
  );

  const RegionsBlock = () => (
    <div className={`rounded-2xl p-6 shadow-sm dark:shadow-gray-900/50 border transition-all duration-300 hover:shadow-lg dark:shadow-gray-900/50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${darkMode ? 'bg-teal-900/30' : 'bg-teal-50'}`}>
            <Globe2 className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>جغرافيا الأخبار</h2>
            <p className={`text-sm ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>أخبار المناطق السعودية</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-600'}`}>
          4 مناطق
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {regionsData.map((region, index) => (
          <div key={index} className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-lg dark:shadow-gray-900/50 hover:scale-[1.02] ${darkMode ? 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800'}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>{region.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-700'}`}>
                {region.newsCount}
              </span>
            </div>
            <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
              آخر تحديث: {region.lastUpdate}
            </p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${ index < 2 ? 'bg-green-500' : 'bg-yellow-500' }`}></div>
              <span className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                {index < 2 ? 'نشط' : 'هادئ'}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <button className={`w-full mt-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 shadow-sm dark:shadow-gray-900/50 hover:shadow-md dark:shadow-gray-900/50 ${darkMode ? 'bg-teal-900/30 hover:bg-teal-800/30 text-teal-300' : 'bg-teal-50 hover:bg-teal-100 text-teal-700'}`}>
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

  // مكون عرض نقاط الولاء
  const LoyaltyPointsDisplay = () => {
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      fetchLoyaltyPoints();
    }, []);
    
    const fetchLoyaltyPoints = async () => {
      try {
        const userId = localStorage.getItem('user_id') || 'anonymous';
        if (userId === 'anonymous') {
          setLoading(false);
          return;
        }
        
        const response = await fetch(`/api/user/loyalty-points/${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          setLoyaltyPoints(data.data?.total_points || 0);
          // حفظ في localStorage
          localStorage.setItem('user_loyalty_points', data.data?.total_points?.toString() || '0');
        }
      } catch (error) {
        console.error('Error fetching loyalty points:', error);
        // استخدام القيمة المحفوظة محلياً
        const savedPoints = localStorage.getItem('user_loyalty_points');
        if (savedPoints) {
          setLoyaltyPoints(parseInt(savedPoints));
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (!isLoggedIn) return null;
    
    return (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${darkMode ? 'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-700/50' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300'}`}>
        <Crown className={`w-5 h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
        <div className="flex flex-col">
          <span className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
            رصيد النقاط
          </span>
          <span className={`text-lg font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              <>
                {loyaltyPoints.toLocaleString('ar-SA')} نقطة
              </>
            )}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50 dark:bg-gray-900'}`}
      style={{
        direction: 'rtl'
      }}
    >
      {/* Header */}
      <Header />

      {/* Smart Blocks - Top Banner */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <SmartSlot position="topBanner" />
      </div>

      {/* Deep Analysis Widget - After Header */}
      {!deepInsightsLoading && deepInsights.length > 0 && (
        <div className="mt-4 mb-6">
          <DeepAnalysisWidget insights={deepInsights} />
        </div>
      )}

      {/* Welcome Section - Full Width */}
      <section className={`w-full py-20 mb-12 relative overflow-hidden transition-all duration-500 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-[#0f52ba] to-[#3783ff]'} shadow-2xl`}>
        <div className={`absolute inset-0 opacity-40 ${darkMode ? 'bg-gradient-to-br from-blue-900/20 via-transparent to-indigo-900/20' : 'bg-gradient-to-br from-[#1f3f75] via-transparent to-[#5fa9ff]'}`}></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center relative">
            {/* Main Title */}
            <div className="mb-16 relative z-10">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white leading-tight drop-shadow-lg dark:shadow-gray-900/50">
                {smartDosePhrase}
              </h1>
              <p className={`text-xl sm:text-2xl mb-4 drop-shadow ${darkMode ? 'text-gray-200' : 'text-white/95'}`}>
                {smartDoseSubtitle}
              </p>
            </div>
            
            {/* Enhanced Three News Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 relative z-10">
              {/* Card 1 - Breaking News */}
              <Link href="/article/article-1" className="block">
                <div className={`group backdrop-blur-md rounded-3xl shadow-xl dark:shadow-gray-900/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 min-h-[320px] flex flex-col overflow-hidden ${darkMode ? 'bg-gray-800/95 hover:bg-gray-800' : 'bg-white dark:bg-gray-800/95 hover:bg-white dark:bg-gray-800'}`}>
                  {/* Card Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80"
                      alt="مشروع نيوم للهيدروجين الأخضر"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-1.5 bg-red-600/90 text-white text-xs font-bold rounded-full backdrop-blur-sm shadow-lg dark:shadow-gray-900/50">
                      <Zap className="w-3 h-3" />
                      عاجل
                    </span>
                  </div>
                  
                  {/* Card Content */}
                  <div className="flex-1 p-5 flex flex-col">
                    <h3 className={`text-right font-bold mb-2 text-lg leading-relaxed line-clamp-2 transition-colors ${darkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-900 dark:text-white group-hover:text-blue-700'}`}>
                      إطلاق مشروع نيوم للهيدروجين الأخضر
                    </h3>
                    <p className={`text-right text-sm mb-4 leading-relaxed line-clamp-3 flex-1 ${darkMode ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
                      أكبر مشروع للطاقة النظيفة في المنطقة بقيمة 8.4 مليار دولار
                    </p>
                    <div className={`flex items-center justify-between mt-auto pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100 dark:border-gray-700'}`}>
                      <span className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>منذ 5 دقائق</span>
                      <span className={`flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        اقرأ المزيد
                        <ArrowLeft className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Card 2 - Featured - تحسين البلوك الثاني */}
              <Link href="/article/article-2" className="block">
                <div className={`group backdrop-blur-md rounded-3xl shadow-xl dark:shadow-gray-900/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 min-h-[320px] flex flex-col overflow-hidden ${darkMode ? 'bg-gray-800/95 hover:bg-gray-800' : 'bg-white dark:bg-gray-800/95 hover:bg-white dark:bg-gray-800'}`}>
                  {/* Card Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80"
                      alt="قمة الذكاء الاصطناعي"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/90 text-white text-xs font-bold rounded-full backdrop-blur-sm shadow-lg dark:shadow-gray-900/50">
                      <Crown className="w-3 h-3" />
                      تقنية
                    </span>
                  </div>
                  
                  {/* Card Content */}
                  <div className="flex-1 p-5 flex flex-col">
                    <h3 className={`text-right font-bold mb-2 text-lg leading-relaxed line-clamp-2 transition-colors ${darkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-900 dark:text-white group-hover:text-blue-700'}`}>
                      السعودية تستضيف قمة الذكاء الاصطناعي العالمية 2025
                    </h3>
                    <p className={`text-right text-sm mb-4 leading-relaxed line-clamp-3 flex-1 ${darkMode ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
                      حدث عالمي يجمع رواد التقنية والذكاء الاصطناعي من جميع أنحاء العالم
                    </p>
                    <div className={`flex items-center justify-between mt-auto pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100 dark:border-gray-700'}`}>
                      <span className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>منذ ساعة</span>
                      <span className={`flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        اقرأ المزيد
                        <ArrowLeft className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Card 3 - Environment */}
              <Link href="/article/article-3" className="block">
                <div className={`group backdrop-blur-md rounded-3xl shadow-xl dark:shadow-gray-900/50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 min-h-[320px] flex flex-col overflow-hidden ${darkMode ? 'bg-gray-800/95 hover:bg-gray-800' : 'bg-white dark:bg-gray-800/95 hover:bg-white dark:bg-gray-800'}`}>
                  {/* Card Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=800&q=80"
                      alt="مشروع البحر الأحمر"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600/90 text-white text-xs font-bold rounded-full backdrop-blur-sm shadow-lg dark:shadow-gray-900/50">
                      <Leaf className="w-3 h-3" />
                      بيئة
                    </span>
                  </div>
                  
                  {/* Card Content */}
                  <div className="flex-1 p-5 flex flex-col">
                    <h3 className={`text-right font-bold mb-2 text-lg leading-relaxed line-clamp-2 transition-colors ${darkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-900 dark:text-white group-hover:text-blue-700'}`}>
                      مشروع البحر الأحمر يحقق إنجازاً بيئياً عالمياً
                    </h3>
                    <p className={`text-right text-sm mb-4 leading-relaxed line-clamp-3 flex-1 ${darkMode ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
                      حماية 75% من الشعاب المرجانية وزراعة 50 مليون شجرة مانجروف
                    </p>
                    <div className={`flex items-center justify-between mt-auto pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100 dark:border-gray-700'}`}>
                      <span className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>منذ 3 ساعات</span>
                      <span className={`flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        اقرأ المزيد
                        <ArrowLeft className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* زر قراءة الجرعة الكاملة */}
            <div className="mt-8 text-center">
              <Link 
                href="/daily-dose" 
                className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-800/20 backdrop-blur-md hover:bg-white dark:bg-gray-800/30 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl dark:shadow-gray-900/50 hover:shadow-2xl"
              >
                <BookOpen className="w-5 h-5 animate-pulse" />
                <span>قراءة الجرعة الكاملة</span>
                <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Blocks - After Highlights */}
      <SmartSlot position="afterHighlights" />

      {/* Elegant Separator */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex items-center justify-center">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          <div className={`px-6 py-2 rounded-full ${darkMode ? 'bg-gray-800 text-gray-400 dark:text-gray-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
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
        <div className={`rounded-3xl p-8 transition-all duration-500 shadow-lg dark:shadow-gray-900/50 ${darkMode ? 'bg-blue-900/10 border border-blue-800/30' : 'bg-blue-50 dark:bg-blue-900/20/50 border border-blue-200/50'}`} style={{ 
          backdropFilter: 'blur(10px)',
          background: darkMode 
            ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)' 
            : 'linear-gradient(135deg, rgba(219, 234, 254, 0.5) 0%, rgba(191, 219, 254, 0.3) 100%)'
        }}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
                <Tag className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
              استكشف بحسب التصنيفات
            </h2>
            <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
              اختر التصنيف الذي يهمك لتصفح الأخبار المتخصصة
            </p>
            <p className={`text-xs mt-2 transition-colors duration-300 ${darkMode ? 'text-gray-500 dark:text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
              <span className="opacity-75">التصنيفات مرتبطة بنظام إدارة المحتوى</span>
            </p>
          </div>

          {categoriesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : categories.length > 0 ? (
            <>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {categories.map((category: any) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`group px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 ${ selectedCategory === category.id ? darkMode ? 'bg-blue-600 text-white border-2 border-blue-500 shadow-lg dark:shadow-gray-900/50' : 'bg-blue-500 text-white border-2 border-blue-400 shadow-lg dark:shadow-gray-900/50' : darkMode ? 'bg-blue-800/20 hover:bg-blue-700/30 text-blue-100 hover:text-blue-50 border border-blue-700/30 hover:border-blue-600/50' : 'bg-white dark:bg-gray-800/80 hover:bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-blue-600 border border-blue-200/50 hover:border-blue-300 shadow-sm dark:shadow-gray-900/50 hover:shadow-lg dark:shadow-gray-900/50 backdrop-blur-sm' }`}
                  >
                    <div className="flex items-center gap-2">
                      {category.icon && (
                        <span className="text-lg group-hover:scale-110 transition-transform duration-300">{category.icon}</span>
                      )}
                      <span>{category.name_ar || category.name}</span>
                      <span className={`text-xs ${ selectedCategory === category.id ? 'text-white/90' : darkMode ? 'text-blue-200 opacity-60' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500 opacity-60' }`}>
                        ({category.articles_count || 0})
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* عرض المقالات المرتبطة بالتصنيف المختار */}
              {selectedCategory && (
                <div className={`mt-8 p-6 rounded-3xl shadow-lg dark:shadow-gray-900/50 ${darkMode ? 'bg-gray-800/50' : 'bg-white dark:bg-gray-800/70'} backdrop-blur-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200 dark:border-gray-700'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
                      مقالات {categories.find(c => c.id === selectedCategory)?.name_ar}
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setCategoryArticles([]);
                      }}
                      className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800'}`}
                    >
                      <X className={`w-5 h-5 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`} />
                    </button>
                  </div>

                  {categoryArticlesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  ) : categoryArticles.length > 0 ? (
                    <>
                      {/* Grid Layout for Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryArticles.map((article: any) => (
                          <Link key={article.id} href={`/article/${article.id}`} className="group">
                            <article className={`h-full rounded-3xl overflow-hidden shadow-xl dark:shadow-gray-900/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'}`}>
                              {/* صورة المقال */}
                              <div className="relative h-48 overflow-hidden">
                                {article.featured_image ? (
                                  <img
                                    src={article.featured_image}
                                    alt={article.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className={`w-full h-full flex items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                    <BookOpen className={`w-16 h-16 ${darkMode ? 'text-gray-600 dark:text-gray-400 dark:text-gray-500' : 'text-gray-300'}`} />
                                  </div>
                                )}
                                
                                {/* تأثير التدرج على الصورة */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                
                                {/* Category Badge */}
                                <div className="absolute top-3 right-3">
                                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${darkMode ? 'bg-blue-900/80 text-blue-200 backdrop-blur-sm' : 'bg-blue-500/90 text-white backdrop-blur-sm'}`}>
                                    <Tag className="w-3 h-3" />
                                    {categories.find(c => c.id === selectedCategory)?.name_ar}
                                  </span>
                                </div>
                              </div>

                              {/* محتوى البطاقة */}
                              <div className="p-5">
                                {/* العنوان */}
                                <h4 className={`font-bold text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors ${darkMode ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                  {article.title}
                                </h4>

                                {/* الملخص */}
                                {article.summary && (
                                  <p className={`text-sm mb-4 line-clamp-3 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
                                    {article.summary}
                                  </p>
                                )}

                                {/* التفاصيل السفلية */}
                                <div className={`flex items-center justify-between pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100 dark:border-gray-700'}`}>
                                  {/* المعلومات */}
                                  <div className="flex flex-col gap-1">
                                    {/* التاريخ والوقت */}
                                    <div className="flex items-center gap-3 text-xs">
                                      <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                                        <Calendar className="w-3 h-3" />
                                        {new Date(article.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                      </span>
                                      {article.reading_time && (
                                        <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                                          <Clock className="w-3 h-3" />
                                          {article.reading_time} د
                                        </span>
                                      )}
                                    </div>
                                    
                                    {/* الكاتب والمشاهدات */}
                                    <div className="flex items-center gap-3 text-xs">
                                      {article.author_name && (
                                        <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                                          <User className="w-3 h-3" />
                                          {article.author_name}
                                        </span>
                                      )}
                                      <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                                        <Eye className="w-3 h-3" />
                                        {article.views_count || 0}
                                      </span>
                                    </div>
                                  </div>

                                  {/* زر القراءة */}
                                  <div className={`p-2 rounded-xl transition-all ${darkMode ? 'bg-blue-900/20 group-hover:bg-blue-800/30' : 'bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100'}`}>
                                    <ArrowLeft className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                                  </div>
                                </div>
                              </div>
                            </article>
                          </Link>
                        ))}
                      </div>
                      
                      {/* زر عرض جميع المقالات */}
                      <div className="text-center mt-8">
                        <Link 
                          href={`/categories/${categories.find(c => c.id === selectedCategory)?.slug || categories.find(c => c.id === selectedCategory)?.name_ar?.toLowerCase().replace(/\s+/g, '-')}`}
                          className={`group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 transform hover:scale-105 shadow-lg dark:shadow-gray-900/50 hover:shadow-xl dark:shadow-gray-900/50 ${darkMode ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'}`}>
                          <span>عرض جميع مقالات {categories.find(c => c.id === selectedCategory)?.name_ar}</span>
                          <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </>
                    
                  ) : (
                    <div className={`text-center py-8 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>لا توجد مقالات منشورة في هذا التصنيف حالياً</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
              <p className="text-sm">لا توجد تصنيفات متاحة حالياً</p>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Enhanced News Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            {isCheckingAuth ? (
              // عرض حالة تحميل أثناء التحقق من تسجيل الدخول
              <div className="animate-pulse">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gray-200 dark:bg-gray-700 mb-6">
                  <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
                <div className="w-96 h-10 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4"></div>
                <div className="w-full max-w-2xl h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-6">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    مدعوم بالذكاء الاصطناعي
                  </span>
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
                  محتوى ذكي مخصص لك
                </h2>
                <p className={`text-xl max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
                  مقالات وتحليلات مختارة بعناية تناسب اهتماماتك وتطلعاتك المعرفية
                </p>
              </>
            )}
          </div>

          {/* Enhanced Show All Link */}
          <div className="flex items-center justify-end mb-8">
            <Link 
              href="/for-you"
              className="group inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg dark:shadow-gray-900/50 hover:shadow-xl dark:shadow-gray-900/50 hover:scale-105">
              <span>عرض الكل</span>
              <ArrowLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Enhanced News Grid */}
          {articlesLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className={`text-sm ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>جاري تحميل المقالات...</p>
              </div>
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {articles.slice(0, 8).map((news) => (
                <NewsCard key={news.id} news={news} />
              ))}
            </div>
          ) : (
            <div className={`text-center py-20 ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
              <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">لا توجد مقالات منشورة حالياً</p>
              <p className="text-sm">تحقق لاحقاً للحصول على آخر الأخبار والمقالات</p>
            </div>
          )}
        </section>

        {/* Smart Blocks - After Highlights */}
        <SmartSlot position="afterHighlights" />

        {/* Smart Blocks - After Cards */}
        <SmartSlot position="afterCards" />

        {/* Smart Blocks - Before Personalization */}
        <SmartSlot position="beforePersonalization" />

        {/* Enhanced Smart Blocks Section */}
        <section className="mb-16">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-lg opacity-20"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-white dark:bg-gray-800 rounded-full animate-pulse"></div>
                  <span className="font-bold text-lg">البلوكات الذكية</span>
                  <div className="w-2 h-2 bg-white dark:bg-gray-800 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>
            </div>
            <h2 className={`text-4xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
              تجربة مخصصة لك
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
              استكشف المحتوى المنظم والمقسم بذكاء حسب اهتماماتك وتفضيلاتك الشخصية
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className={`text-center px-6 py-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
                <div className="text-2xl font-bold text-blue-600 mb-1">8</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>بلوك ذكي</div>
              </div>
              <div className={`text-center px-6 py-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
                <div className="text-2xl font-bold text-green-600 mb-1">24/7</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>تحديث مستمر</div>
              </div>
              <div className={`text-center px-6 py-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
                <div className="text-2xl font-bold text-purple-600 mb-1">AI</div>
                <div className={`text-sm ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>ذكاء اصطناعي</div>
              </div>
            </div>
          </div>

          {/* Enhanced Smart Blocks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* ويدجت الذكاء الشخصي */}
            {!isCheckingAuth && userTracker && isLoggedIn && (
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
            <div className={`inline-flex flex-wrap items-center gap-4 p-6 rounded-2xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'}`}>
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors">
                <Settings className="w-4 h-4" />
                تخصيص البلوكات
              </button>
              <button className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border'}`}>
                <Eye className="w-4 h-4" />
                عرض الإحصائيات
              </button>
              <button className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border'}`}>
                <Share2 className="w-4 h-4" />
                مشاركة التفضيلات
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Smart Blocks - Before Footer */}
      <SmartSlot position="beforeFooter" />

      {/* Enhanced Footer */}
      <footer className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50 dark:bg-gray-900'}`}>

        {/* Border */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            {/* Logo Section */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-blue-600 to-purple-700' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                  <span className="text-white font-bold text-xl">س</span>
                </div>
                <div className="text-left">
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
                    سبق
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
                    صحيفة المستقبل الذكية
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className={`text-center px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} border ${darkMode ? 'border-gray-700' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="text-2xl font-bold text-blue-600 mb-1">1.2M+</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>قارئ نشط</div>
              </div>
              <div className={`text-center px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} border ${darkMode ? 'border-gray-700' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="text-2xl font-bold text-green-600 mb-1">50K+</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>مقال يومياً</div>
              </div>
              <div className={`text-center px-4 py-3 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} border ${darkMode ? 'border-gray-700' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="text-2xl font-bold text-purple-600 mb-1">AI</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>ذكاء اصطناعي</div>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <a href="#" className={`text-sm hover:text-blue-500 transition-colors ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
                سياسة الخصوصية
              </a>
              <a href="#" className={`text-sm hover:text-blue-500 transition-colors ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
                شروط الاستخدام
              </a>
              <a href="#" className={`text-sm hover:text-blue-500 transition-colors ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
                تواصل معنا
              </a>
              <a href="#" className={`text-sm hover:text-blue-500 transition-colors ${darkMode ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
                عن سبق
              </a>
            </div>

            {/* Copyright */}
            <div className="flex items-center justify-center gap-2">
              <p className={`text-sm ${darkMode ? 'text-gray-500 dark:text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
                © 2025 صحيفة سبق – جميع الحقوق محفوظة
              </p>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span className={`text-xs ${darkMode ? 'text-gray-500 dark:text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400 dark:text-gray-500'}`}>
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

// Export with client-side wrapper to ensure ThemeProvider is available
export default function Page() {
  return <NewspaperHomePage />;
} 
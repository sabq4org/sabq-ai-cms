import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface UserInteraction {
  id: string;
  user_id: string;
  article_id: string;
  interaction_type: 'view' | 'read' | 'like' | 'unlike' | 'share' | 'comment' | 'save' | 'unsave';
  category_id?: number;
  duration?: number;
  scroll_percentage?: number;
  platform?: string;
  source?: string;
  device_type?: string;
  session_id?: string;
  timestamp: string;
}

interface InteractionData {
  user_id: string;
  article_id: string;
  action: 'read' | 'like' | 'share' | 'comment';
  duration?: number;
  timestamp: string;
}

interface UserPreference {
  user_id: string;
  preferences: Record<string, number>;
  last_updated: string;
}

interface Article {
  id: string;
  category_id: string;
  title: string;
}

interface LoyaltyPoints {
  user_id: string;
  points: number;
  history: Array<{
    action: string;
    points: number;
    timestamp: string;
    article_id?: string;
  }>;
}

// نقاط المكافآت لكل تفاعل
const POINTS_CONFIG = {
  read: 2,
  like: 3,
  share: 5,
  comment: 10
};

// الحد الأدنى لمدة القراءة (بالثواني)
const MIN_READ_DURATION = 10;

// نظام النقاط
const POINTS_SYSTEM = {
  view: 1,
  read: 5,
  like: 10,
  share: 15,
  comment: 20,
  save: 10
};

// دالة لتحميل التفاعلات
async function loadInteractions() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'user_article_interactions.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.interactions || [];
  } catch (error) {
    console.error('Error loading interactions:', error);
    return [];
  }
}

// دالة لحفظ التفاعلات
async function saveInteractions(interactions: any[]) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'user_article_interactions.json');
    const data = { interactions, updated_at: new Date().toISOString() };
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving interactions:', error);
    return false;
  }
}

// دالة لتحديث نقاط المستخدم
async function updateUserLoyaltyPoints(userId: string, points: number) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'user_loyalty_points.json');
    let loyaltyData: { users: any[] } = { users: [] };
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      loyaltyData = JSON.parse(fileContent);
    } catch (error) {
      // ملف غير موجود، سيتم إنشاؤه
    }
    
    // البحث عن المستخدم أو إنشاء سجل جديد
    let userRecord = loyaltyData.users.find((u: any) => u.user_id === userId);
    
    if (!userRecord) {
      userRecord = {
        user_id: userId,
        total_points: 0,
        earned_points: 0,
        redeemed_points: 0,
        tier: 'bronze',
        created_at: new Date().toISOString()
      };
      loyaltyData.users.push(userRecord);
    }
    
    // تحديث النقاط
    userRecord.total_points += points;
    userRecord.earned_points += points;
    userRecord.last_updated = new Date().toISOString();
    
    // تحديث المستوى بناءً على النقاط
    if (userRecord.total_points >= 10000) {
      userRecord.tier = 'platinum';
    } else if (userRecord.total_points >= 5000) {
      userRecord.tier = 'gold';
    } else if (userRecord.total_points >= 1000) {
      userRecord.tier = 'silver';
    }
    
    // حفظ البيانات
    await fs.writeFile(filePath, JSON.stringify(loyaltyData, null, 2));
    
    return userRecord;
  } catch (error) {
    console.error('Error updating loyalty points:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      user_id,
      article_id,
      category_id,
      source = 'unknown',
      device_type = 'unknown',
      duration,
      scroll_percentage,
      platform
    } = body;
    
    // التحقق من المدخلات
    if (!user_id || !article_id || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // التحقق من أن المستخدم مسجل وليس anonymous
    if (user_id === 'anonymous' || user_id === 'guest' || !user_id.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required',
          message: 'يرجى تسجيل الدخول لبدء رحلتك الذكية وكسب النقاط 🎯'
        },
        { status: 401 }
      );
    }
    
    // التحقق من نوع التفاعل
    if (!Object.keys(POINTS_SYSTEM).includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid interaction type' },
        { status: 400 }
      );
    }
    
    // منع منح النقاط لتفاعلات View العشوائية
    if (type === 'view' && (!duration || duration < 5)) {
      // لا نمنح نقاط للمشاهدات السريعة جداً
      return NextResponse.json({
        success: true,
        data: {
          interaction: { type: 'view', tracked: true },
          points_earned: 0,
          message: 'تم تسجيل المشاهدة'
        }
      });
    }
    
    // التحقق من القراءة الفعلية (يجب أن يكون هناك مدة كافية)
    if (type === 'read' && (!duration || duration < 30 || !scroll_percentage || scroll_percentage < 50)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid read interaction',
        message: 'يجب قراءة المقال لمدة كافية للحصول على النقاط'
      });
    }
    
    // تحميل التفاعلات الحالية
    const interactions = await loadInteractions();
    
    // التحقق من التفاعلات المكررة (منع التلاعب)
    const existingInteraction = interactions.find((i: any) => 
      i.user_id === user_id && 
      i.article_id === article_id && 
      i.interaction_type === type &&
      // السماح بتفاعل واحد من نفس النوع كل 24 ساعة
      new Date(i.timestamp).getTime() > Date.now() - (24 * 60 * 60 * 1000)
    );
    
    if (existingInteraction && type !== 'view') {
      return NextResponse.json({
        success: false,
        error: 'Duplicate interaction',
        message: 'لقد قمت بهذا التفاعل مسبقاً'
      });
    }
    
    // إنشاء سجل التفاعل الجديد
    const newInteraction = {
      id: `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id,
      article_id,
      interaction_type: type,
      category_id,
      source,
      device_type,
      duration,
      scroll_percentage,
      platform,
      timestamp: new Date().toISOString(),
      points_earned: POINTS_SYSTEM[type as keyof typeof POINTS_SYSTEM]
    };
    
    // إضافة التفاعل الجديد
    interactions.push(newInteraction);
    
    // حفظ التفاعلات
    const saved = await saveInteractions(interactions);
    
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to save interaction' },
        { status: 500 }
      );
    }
    
    // تحديث نقاط الولاء
    const loyaltyUpdate = await updateUserLoyaltyPoints(user_id, newInteraction.points_earned);
    
    // تحديث تفضيلات المستخدم إذا كان هناك category_id
    if (category_id) {
      await updateUserPreferences(user_id, category_id, type);
    }
    
    // تحديث عدد المشاهدات للمقال
    if (type === 'view') {
      await updateArticleViews(article_id);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        interaction: newInteraction,
        points_earned: newInteraction.points_earned,
        loyalty: loyaltyUpdate
      },
      message: `تم منحك ${newInteraction.points_earned} نقطة!`
    });
    
  } catch (error) {
    console.error('Error tracking interaction:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to track interaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// تحديث نقاط الولاء
async function updateLoyaltyPoints(userId: string, interactionType: string) {
  try {
    const pointsPath = path.join(process.cwd(), 'data', 'loyalty_points.json');
    let loyaltyData: any = {};
    
    try {
      const fileContent = await fs.readFile(pointsPath, 'utf-8');
      loyaltyData = JSON.parse(fileContent);
    } catch (error) {
      // ملف جديد
    }

    // نظام النقاط
    const pointRules: { [key: string]: number } = {
      view: 1,
      read: 10,
      like: 5,
      share: 15,
      comment: 20,
      save: 8,
      unlike: -5,
      unsave: -8
    };

    const points = pointRules[interactionType] || 0;
    
    if (!loyaltyData[userId]) {
      loyaltyData[userId] = {
        totalPoints: 0,
        history: []
      };
    }

    loyaltyData[userId].totalPoints += points;
    loyaltyData[userId].history.push({
      points,
      action: interactionType,
      timestamp: new Date().toISOString()
    });

    await fs.writeFile(pointsPath, JSON.stringify(loyaltyData, null, 2));
  } catch (error) {
    console.error('Error updating loyalty points:', error);
  }
}

// تحديث عدد المشاهدات للمقال
async function updateArticleViews(articleId: string) {
  try {
    const articlesPath = path.join(process.cwd(), 'data', 'articles.json');
    const fileContent = await fs.readFile(articlesPath, 'utf-8');
    const data = JSON.parse(fileContent);
    const articles = data.articles || data || [];
    
    const articleIndex = articles.findIndex((a: any) => a.id === articleId);
    if (articleIndex !== -1) {
      articles[articleIndex].views_count = (articles[articleIndex].views_count || 0) + 1;
      
      await fs.writeFile(
        articlesPath,
        JSON.stringify({ articles }, null, 2)
      );
    }
  } catch (error) {
    console.error('Error updating article views:', error);
  }
}

// تحديث تفضيلات المستخدم
async function updateUserPreferences(userId: string, categoryId: number, interactionType: string) {
  try {
    const prefsPath = path.join(process.cwd(), 'data', 'user_preferences.json');
    let preferences: any = {};
    
    try {
      const fileContent = await fs.readFile(prefsPath, 'utf-8');
      preferences = JSON.parse(fileContent);
    } catch (error) {
      // ملف جديد
    }

    if (!preferences[userId]) {
      preferences[userId] = {
        categories: {},
        lastUpdated: new Date().toISOString()
      };
    }

    // أوزان التفاعلات
    const weights: { [key: string]: number } = {
      view: 0.1,
      read: 0.5,
      like: 0.3,
      share: 0.7,
      comment: 0.8,
      save: 0.6,
      unlike: -0.3,
      unsave: -0.6
    };

    const weight = weights[interactionType] || 0;
    const currentScore = preferences[userId].categories[categoryId] || 0;
    preferences[userId].categories[categoryId] = Math.max(0, Math.min(5, currentScore + weight));
    preferences[userId].lastUpdated = new Date().toISOString();

    await fs.writeFile(prefsPath, JSON.stringify(preferences, null, 2));
  } catch (error) {
    console.error('Error updating user preferences:', error);
  }
} 
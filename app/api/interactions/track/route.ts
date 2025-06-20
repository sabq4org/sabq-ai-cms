import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { recordInteraction } from '@/lib/user-interactions';

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
    
    const { userId, articleId, interactionType, source, duration, completed } = body;
    
    if (!userId || !articleId || !interactionType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // تسجيل التفاعل
    await recordInteraction({
      user_id: userId,
      article_id: articleId,
      interaction_type: interactionType,
      timestamp: new Date().toISOString(),
      source: source || 'unknown',
      duration,
      completed,
      device: request.headers.get('user-agent') || undefined
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Interaction recorded successfully'
    });
    
  } catch (error) {
    console.error('Error tracking interaction:', error);
    return NextResponse.json(
      { error: 'Failed to track interaction' },
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
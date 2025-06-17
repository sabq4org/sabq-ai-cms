import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

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

export async function POST(request: Request) {
  try {
    const interaction: InteractionData = await request.json();
    
    // التحقق من صحة البيانات
    if (!interaction.user_id || !interaction.article_id || !interaction.action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // إذا كان التفاعل قراءة وأقل من 10 ثواني، لا نحتسبه
    if (interaction.action === 'read' && interaction.duration && interaction.duration < MIN_READ_DURATION) {
      return NextResponse.json(
        { message: 'Interaction too short to be counted' },
        { status: 200 }
      );
    }

    // جلب بيانات المقال
    const articlesPath = path.join(process.cwd(), 'data', 'articles.json');
    const articlesData = await fs.readFile(articlesPath, 'utf8');
    const articles: Article[] = JSON.parse(articlesData);
    const article = articles.find(a => a.id === interaction.article_id);
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // 1. حفظ التفاعل
    const interactionsPath = path.join(process.cwd(), 'data', 'user_article_interactions.json');
    let interactions = [];
    try {
      const data = await fs.readFile(interactionsPath, 'utf8');
      interactions = JSON.parse(data);
    } catch (error) {
      // إذا لم يكن الملف موجوداً، سننشئ مصفوفة جديدة
    }

    const newInteraction = {
      id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: interaction.user_id,
      article_id: interaction.article_id,
      category_id: article.category_id,
      action: interaction.action,
      duration: interaction.duration,
      timestamp: new Date().toISOString(),
      points_awarded: POINTS_CONFIG[interaction.action]
    };

    interactions.push(newInteraction);
    await fs.writeFile(interactionsPath, JSON.stringify(interactions, null, 2));

    // 2. تحديث تفضيلات المستخدم
    const preferencesPath = path.join(process.cwd(), 'data', 'user_preferences.json');
    let preferences: UserPreference[] = [];
    try {
      const data = await fs.readFile(preferencesPath, 'utf8');
      preferences = JSON.parse(data);
    } catch (error) {
      // إذا لم يكن الملف موجوداً
    }

    let userPref = preferences.find(p => p.user_id === interaction.user_id);
    if (!userPref) {
      userPref = {
        user_id: interaction.user_id,
        preferences: {},
        last_updated: new Date().toISOString()
      };
      preferences.push(userPref);
    }

    // زيادة وزن التصنيف
    const categoryId = article.category_id;
    if (!userPref.preferences[categoryId]) {
      userPref.preferences[categoryId] = 0;
    }

    // زيادة الوزن حسب نوع التفاعل
    const weightIncrease = {
      read: 1,
      like: 2,
      share: 3,
      comment: 4
    };

    userPref.preferences[categoryId] += weightIncrease[interaction.action];
    userPref.last_updated = new Date().toISOString();

    await fs.writeFile(preferencesPath, JSON.stringify(preferences, null, 2));

    // 3. تحديث نقاط الولاء
    const pointsPath = path.join(process.cwd(), 'data', 'loyalty_points.json');
    let loyaltyData: LoyaltyPoints[] = [];
    try {
      const data = await fs.readFile(pointsPath, 'utf8');
      loyaltyData = JSON.parse(data);
    } catch (error) {
      // إذا لم يكن الملف موجوداً
    }

    let userLoyalty = loyaltyData.find(l => l.user_id === interaction.user_id);
    if (!userLoyalty) {
      userLoyalty = {
        user_id: interaction.user_id,
        points: 0,
        history: []
      };
      loyaltyData.push(userLoyalty);
    }

    const pointsAwarded = POINTS_CONFIG[interaction.action];
    userLoyalty.points += pointsAwarded;
    userLoyalty.history.push({
      action: interaction.action,
      points: pointsAwarded,
      timestamp: new Date().toISOString(),
      article_id: interaction.article_id
    });

    // الاحتفاظ بآخر 100 سجل فقط
    if (userLoyalty.history.length > 100) {
      userLoyalty.history = userLoyalty.history.slice(-100);
    }

    await fs.writeFile(pointsPath, JSON.stringify(loyaltyData, null, 2));

    // 4. تحليل الاهتمامات المتكررة
    const recentInteractions = interactions
      .filter(i => i.user_id === interaction.user_id)
      .filter(i => new Date(i.timestamp) > new Date(Date.now() - 48 * 60 * 60 * 1000)) // آخر 48 ساعة
      .filter(i => i.category_id === categoryId);

    let bonusWeightApplied = false;
    if (recentInteractions.length >= 3) {
      // زيادة إضافية للوزن إذا تفاعل 3 مرات في 48 ساعة
      userPref.preferences[categoryId] += 2;
      bonusWeightApplied = true;
      
      // حفظ التحديث
      await fs.writeFile(preferencesPath, JSON.stringify(preferences, null, 2));
    }

    return NextResponse.json({
      success: true,
      interaction: newInteraction,
      points_awarded: pointsAwarded,
      total_points: userLoyalty.points,
      category_weight: userPref.preferences[categoryId],
      bonus_weight_applied: bonusWeightApplied
    });

  } catch (error) {
    console.error('Error tracking interaction:', error);
    return NextResponse.json(
      { error: 'Failed to track interaction' },
      { status: 500 }
    );
  }
} 
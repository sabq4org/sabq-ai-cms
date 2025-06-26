import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const interactionsFilePath = path.join(process.cwd(), 'data', 'user_article_interactions.json');
const loyaltyFilePath = path.join(process.cwd(), 'data', 'user_loyalty_points.json');
const activitiesFilePath = path.join(process.cwd(), 'data', 'user_activities.json');

interface InteractionRequest {
  userId: string;
  articleId: string;
  interactionType: 'read' | 'like' | 'share' | 'save' | 'view' | 'comment' | 'unlike' | 'unsave';
  metadata?: {
    duration?: number;
    source?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

interface UserInteraction {
  id: string;
  user_id: string;
  article_id: string;
  interaction_type: string;
  points_earned: number;
  duration?: number;
  metadata: any;
  timestamp: string;
}

interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  description: string;
  points_earned: number;
  article_id?: string;
  metadata?: any;
  timestamp: string;
}

interface LoyaltyPoints {
  user_id: string;
  total_points: number;
  earned_points: number;
  redeemed_points: number;
  tier: string;
  history: Array<{
    action: string;
    points: number;
    timestamp: string;
    article_id?: string;
    description?: string;
  }>;
  created_at: string;
  last_updated: string;
}

// نظام النقاط المحدث حسب الجدول المطلوب
const POINT_RULES: { [key: string]: { points: number; description: string; maxPerArticle?: number; maxPerDay?: number } } = {
  read: { points: 1, description: 'قراءة مقال', maxPerArticle: 1 },
  like: { points: 1, description: 'إعجاب بمقال', maxPerArticle: 1 },
  share: { points: 3, description: 'مشاركة مقال', maxPerArticle: 1 },
  save: { points: 1, description: 'حفظ مقال', maxPerArticle: 1 },
  comment: { points: 4, description: 'تعليق على مقال', maxPerArticle: 1 },
  view: { points: 0, description: 'مشاهدة مقال' }, // لا نقاط للمشاهدة العادية
  unlike: { points: -1, description: 'إلغاء إعجاب' },
  unsave: { points: -1, description: 'إلغاء حفظ' }
};

// دالة للتأكد من وجود الملفات
async function ensureDataFiles() {
  const files = [
    { path: interactionsFilePath, defaultData: { interactions: [] } },
    { path: loyaltyFilePath, defaultData: { users: [] } },
    { path: activitiesFilePath, defaultData: { activities: [] } }
  ];

  for (const file of files) {
    try {
      await fs.access(file.path);
    } catch {
      await fs.mkdir(path.dirname(file.path), { recursive: true });
      await fs.writeFile(file.path, JSON.stringify(file.defaultData, null, 2));
    }
  }
}

// دالة للتحقق من الحدود اليومية والمقال
async function checkLimits(userId: string, articleId: string, interactionType: string): Promise<boolean> {
  try {
    const fileContent = await fs.readFile(interactionsFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    const interactions = data.interactions || [];

    const rule = POINT_RULES[interactionType];
    if (!rule) return true;

    const today = new Date().toISOString().split('T')[0];

    // التحقق من الحد الأقصى لكل مقال
    if (rule.maxPerArticle) {
      const articleInteractions = interactions.filter((i: UserInteraction) => 
        i.user_id === userId && 
        i.article_id === articleId && 
        i.interaction_type === interactionType
      );
      if (articleInteractions.length >= rule.maxPerArticle) {
        return false;
      }
    }

    // التحقق من الحد الأقصى اليومي
    if (rule.maxPerDay) {
      const todayInteractions = interactions.filter((i: UserInteraction) => 
        i.user_id === userId && 
        i.interaction_type === interactionType &&
        i.timestamp.startsWith(today)
      );
      if (todayInteractions.length >= rule.maxPerDay) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('خطأ في التحقق من الحدود:', error);
    return true; // السماح في حالة الخطأ
  }
}

// دالة تحديث نقاط الولاء
async function updateLoyaltyPoints(userId: string, points: number, action: string, articleId?: string, description?: string): Promise<void> {
  try {
    const fileContent = await fs.readFile(loyaltyFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    if (!data.users) data.users = [];

    let userIndex = data.users.findIndex((user: LoyaltyPoints) => user.user_id === userId);
    
    if (userIndex === -1) {
      // إنشاء مستخدم جديد
      const newUser: LoyaltyPoints = {
        user_id: userId,
        total_points: Math.max(0, points),
        earned_points: points > 0 ? points : 0,
        redeemed_points: 0,
        tier: 'bronze',
        history: [],
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };
      
      if (points !== 0) {
        newUser.history.push({
          action,
          points,
          timestamp: new Date().toISOString(),
          article_id: articleId,
          description: description || ''
        });
      }
      
      data.users.push(newUser);
    } else {
      // تحديث المستخدم الموجود
      const user = data.users[userIndex];
      user.total_points = Math.max(0, user.total_points + points);
      
      if (points > 0) {
        user.earned_points += points;
      }
      
      user.last_updated = new Date().toISOString();
      
      // تحديث المستوى
      if (user.total_points >= 2000) {
        user.tier = 'platinum';
      } else if (user.total_points >= 500) {
        user.tier = 'gold';
      } else if (user.total_points >= 100) {
        user.tier = 'silver';
      } else {
        user.tier = 'bronze';
      }
      
      // إضافة للتاريخ
      if (points !== 0) {
        user.history.push({
          action,
          points,
          timestamp: new Date().toISOString(),
          article_id: articleId,
          description: description || ''
        });
      }
    }

    await fs.writeFile(loyaltyFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('خطأ في تحديث نقاط الولاء:', error);
  }
}

// دالة تسجيل النشاط
async function logActivity(userId: string, action: string, description: string, points: number, articleId?: string, metadata?: any): Promise<void> {
  try {
    const fileContent = await fs.readFile(activitiesFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    if (!data.activities) data.activities = [];

    const activity: UserActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      action,
      description,
      points_earned: points,
      article_id: articleId,
      metadata,
      timestamp: new Date().toISOString()
    };

    data.activities.push(activity);

    // الاحتفاظ بآخر 1000 نشاط فقط
    if (data.activities.length > 1000) {
      data.activities = data.activities.slice(-1000);
    }

    await fs.writeFile(activitiesFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('خطأ في تسجيل النشاط:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // في بيئة الإنتاج، نرجع نجاح وهمي لأن التخزين يتم محلياً
    if (process.env.NODE_ENV === 'production') {
      const body: InteractionRequest = await request.json();
      const { userId, articleId, interactionType, metadata = {} } = body;

      if (!userId || !articleId || !interactionType) {
        return NextResponse.json(
          { success: false, error: 'بيانات غير كاملة' },
          { status: 400 }
        );
      }

      // محاكاة النقاط بناءً على نوع التفاعل
      const pointsMap: { [key: string]: number } = {
        like: 1,
        unlike: -1,
        save: 1,
        unsave: -1,
        share: 3,
        comment: 4,
        read: 1,
        view: 0
      };

      const points = pointsMap[interactionType] || 0;

      return NextResponse.json({
        success: true,
        interaction_id: `interaction-${Date.now()}`,
        points_earned: points,
        message: points > 0 
          ? `تم ${interactionType} وحصلت على ${points} نقطة!` 
          : `تم ${interactionType}`,
        loyalty_points: {
          success: true,
          points: points
        }
      });
    }

    await ensureDataFiles();
    
    const body: InteractionRequest = await request.json();
    const { userId, articleId, interactionType, metadata = {} } = body;

    if (!userId || !articleId || !interactionType) {
      return NextResponse.json(
        { success: false, error: 'بيانات غير كاملة' },
        { status: 400 }
      );
    }

    // التحقق من صحة نوع التفاعل
    if (!POINT_RULES[interactionType]) {
      return NextResponse.json(
        { success: false, error: 'نوع تفاعل غير صحيح' },
        { status: 400 }
      );
    }

    // التحقق من الحدود
    const canInteract = await checkLimits(userId, articleId, interactionType);
    if (!canInteract) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'تم تجاوز الحد المسموح لهذا التفاعل',
          points_earned: 0
        },
        { status: 429 }
      );
    }

    const rule = POINT_RULES[interactionType];
    const pointsEarned = rule.points;

    // تسجيل التفاعل
    const fileContent = await fs.readFile(interactionsFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    if (!data.interactions) data.interactions = [];

    const interaction: UserInteraction = {
      id: `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      article_id: articleId,
      interaction_type: interactionType,
      points_earned: pointsEarned,
      duration: metadata.duration,
      metadata,
      timestamp: new Date().toISOString()
    };

    data.interactions.push(interaction);
    await fs.writeFile(interactionsFilePath, JSON.stringify(data, null, 2));

    // تحديث نقاط الولاء
    if (pointsEarned !== 0) {
      await updateLoyaltyPoints(
        userId, 
        pointsEarned, 
        interactionType, 
        articleId, 
        rule.description
      );
    }

    // تسجيل النشاط
    await logActivity(
      userId,
      interactionType,
      `${rule.description} - ${articleId}`,
      pointsEarned,
      articleId,
      metadata
    );

    return NextResponse.json({
      success: true,
      interaction_id: interaction.id,
      points_earned: pointsEarned,
      message: pointsEarned > 0 
        ? `تم ${rule.description} وحصلت على ${pointsEarned} نقطة!` 
        : pointsEarned < 0 
        ? `تم ${rule.description}` 
        : 'تم تسجيل التفاعل',
      loyalty_points: {
        success: true,
        points: pointsEarned
      }
    });

  } catch (error) {
    console.error('خطأ في تسجيل التفاعل:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تسجيل التفاعل' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDataFiles();
    
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const articleId = url.searchParams.get('articleId');
    const type = url.searchParams.get('type');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    const fileContent = await fs.readFile(interactionsFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    const interactions = data.interactions || [];

    let filteredInteractions = interactions.filter((i: UserInteraction) => i.user_id === userId);

    if (articleId) {
      filteredInteractions = filteredInteractions.filter((i: UserInteraction) => i.article_id === articleId);
    }

    if (type) {
      filteredInteractions = filteredInteractions.filter((i: UserInteraction) => i.interaction_type === type);
    }

    // ترتيب حسب التاريخ (الأحدث أولاً)
    filteredInteractions.sort((a: UserInteraction, b: UserInteraction) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      interactions: filteredInteractions,
      total: filteredInteractions.length
    });

  } catch (error) {
    console.error('خطأ في جلب التفاعلات:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب التفاعلات' },
      { status: 500 }
    );
  }
} 
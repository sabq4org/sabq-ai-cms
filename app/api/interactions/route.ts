import { NextRequest, NextResponse } from 'next/server';
import { 
  recordInteraction, 
  analyzeUserBehavior,
  calculateBehaviorRewards 
} from '@/lib/user-interactions';

interface InteractionRequest {
  userId: number;
  articleId: number;
  interactionType: 'read' | 'like' | 'share' | 'comment' | 'bookmark';
  metadata?: {
    duration?: number; // مدة القراءة بالثواني
    shareTarget?: 'twitter' | 'whatsapp' | 'facebook' | 'copy';
    commentText?: string;
    readingProgress?: number; // نسبة القراءة (0-100)
    scrollDepth?: number;
    timeOnPage?: number;
    referrer?: string;
    device?: string;
    sessionId?: string;
  };
  ipAddress?: string;
  userAgent?: string;
}

// TODO: استبدال بقاعدة البيانات الحقيقية
// يجب إزالة هذا التخزين المؤقت واستخدام قاعدة البيانات (Prisma/MySQL/MongoDB)
// محاكاة قاعدة البيانات للتفاعلات (مؤقت - يجب إزالته)
const INTERACTIONS_STORAGE: { [key: string]: any[] } = {};

// TODO: استبدال بدوال قاعدة البيانات الحقيقية
const saveInteraction = (interaction: any) => {
  // يجب استبدال هذا بحفظ في قاعدة البيانات الحقيقية
  // مثال: return await prisma.interactions.create({ data: interaction });
  const key = `interactions_${interaction.userId}`;
  if (!INTERACTIONS_STORAGE[key]) {
    INTERACTIONS_STORAGE[key] = [];
  }
  INTERACTIONS_STORAGE[key].push(interaction);
  return interaction;
};

// TODO: استبدال بجلب من قاعدة البيانات الحقيقية
const getInteractions = (userId: number, articleId?: number) => {
  // يجب استبدال هذا بجلب من قاعدة البيانات الحقيقية
  // مثال: return await prisma.interactions.findMany({ where: { userId, articleId } });
  const key = `interactions_${userId}`;
  const interactions = INTERACTIONS_STORAGE[key] || [];
  
  if (articleId) {
    return interactions.filter(i => i.articleId === articleId);
  }
  
  return interactions;
};

// استدعاء API النقاط تلقائياً
const triggerLoyaltyPoints = async (userId: number, interactionType: string, articleId: number, metadata: any = {}) => {
  try {
    const loyaltyData = {
      userId,
      action: interactionType.toUpperCase(),
      sourceType: 'article',
      sourceId: articleId,
      metadata,
      duration: metadata.duration,
      sessionId: metadata.sessionId
    };

    // استدعاء endpoint النقاط
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/loyalty/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loyaltyData)
    });

    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (error) {
    console.error('خطأ في تفعيل نقاط الولاء:', error);
  }
  
  return null;
};

// POST: تسجيل تفاعل جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // التحقق من البيانات المطلوبة
    if (!body.user_id || !body.article_id || !body.interaction_type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields' 
        },
        { status: 400 }
      );
    }

    // تسجيل التفاعل
    await recordInteraction({
      user_id: body.user_id,
      article_id: body.article_id,
      interaction_type: body.interaction_type,
      timestamp: new Date().toISOString(),
      duration: body.duration,
      completed: body.completed,
      device: body.device,
      source: body.source
    });

    return NextResponse.json({
      success: true,
      message: 'Interaction recorded successfully'
    });

  } catch (error) {
    console.error('Error recording interaction:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to record interaction' 
      },
      { status: 500 }
    );
  }
}

// GET: الحصول على تحليل سلوك المستخدم
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const action = searchParams.get('action');

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User ID is required' 
        },
        { status: 400 }
      );
    }

    // حساب المكافآت
    if (action === 'calculate_rewards') {
      const rewards = await calculateBehaviorRewards(userId);
      return NextResponse.json({
        success: true,
        data: { bonus_points: rewards }
      });
    }

    // تحليل السلوك
    const behavior = await analyzeUserBehavior(userId);
    
    return NextResponse.json({
      success: true,
      data: behavior
    });

  } catch (error) {
    console.error('Error analyzing behavior:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze behavior' 
      },
      { status: 500 }
    );
  }
} 
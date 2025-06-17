import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const body: InteractionRequest = await request.json();
    
    const { 
      userId, 
      articleId, 
      interactionType, 
      metadata = {}, 
      ipAddress, 
      userAgent 
    } = body;
    
    if (!userId || !articleId || !interactionType) {
      return NextResponse.json(
        { error: 'بيانات مطلوبة مفقودة' },
        { status: 400 }
      );
    }

    // التحقق من صحة نوع التفاعل
    const validTypes = ['read', 'like', 'share', 'comment', 'bookmark'];
    if (!validTypes.includes(interactionType)) {
      return NextResponse.json(
        { error: 'نوع تفاعل غير صحيح' },
        { status: 400 }
      );
    }

    // إنشاء التفاعل الجديد
    const interaction = {
      id: Date.now(),
      userId,
      articleId,
      interactionType,
      metadata,
      ipAddress: ipAddress || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: userAgent || request.headers.get('user-agent'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // حفظ التفاعل
    saveInteraction(interaction);

    // تفعيل نقاط الولاء تلقائياً
    let loyaltyResult = null;
    try {
      loyaltyResult = await triggerLoyaltyPoints(userId, interactionType, articleId, metadata);
    } catch (error) {
      console.error('خطأ في تفعيل النقاط:', error);
    }

    // إحصائيات إضافية للاستجابة
    const userInteractions = getInteractions(userId);
    const articleInteractions = getInteractions(userId, articleId);
    
    const stats = {
      total_interactions: userInteractions.length,
      article_interactions: articleInteractions.length,
      today_interactions: userInteractions.filter(i => 
        i.created_at.startsWith(new Date().toISOString().split('T')[0])
      ).length
    };

    return NextResponse.json({
      success: true,
      interaction: {
        id: interaction.id,
        type: interactionType,
        article_id: articleId,
        created_at: interaction.created_at
      },
      loyalty_points: loyaltyResult,
      user_stats: stats,
      message: loyaltyResult?.success 
        ? `تم تسجيل التفاعل وحصلت على ${loyaltyResult.points_awarded} نقطة!`
        : 'تم تسجيل التفاعل بنجاح'
    });

  } catch (error) {
    console.error('خطأ في تسجيل التفاعل:', error);
    return NextResponse.json(
      { error: 'خطأ داخلي في الخادم' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId') || '0');
    const articleId = searchParams.get('articleId') ? parseInt(searchParams.get('articleId')!) : undefined;
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'معرف المستخدم مطلوب' },
        { status: 400 }
      );
    }

    let interactions = getInteractions(userId, articleId);
    
    // تصفية حسب النوع
    if (type) {
      interactions = interactions.filter(i => i.interactionType === type);
    }
    
    // ترتيب حسب التاريخ (الأحدث أولاً)
    interactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    // تحديد العدد
    interactions = interactions.slice(0, limit);
    
    // إحصائيات شاملة
    const allInteractions = getInteractions(userId);
    const stats = {
      total_interactions: allInteractions.length,
      by_type: {
        read: allInteractions.filter(i => i.interactionType === 'read').length,
        like: allInteractions.filter(i => i.interactionType === 'like').length,
        share: allInteractions.filter(i => i.interactionType === 'share').length,
        comment: allInteractions.filter(i => i.interactionType === 'comment').length,
        bookmark: allInteractions.filter(i => i.interactionType === 'bookmark').length,
      },
      today: allInteractions.filter(i => 
        i.created_at.startsWith(new Date().toISOString().split('T')[0])
      ).length,
      this_week: allInteractions.filter(i => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(i.created_at) >= weekAgo;
      }).length
    };

    return NextResponse.json({
      success: true,
      interactions: interactions.map(i => ({
        id: i.id,
        article_id: i.articleId,
        type: i.interactionType,
        metadata: i.metadata,
        created_at: i.created_at
      })),
      stats,
      pagination: {
        limit,
        total: articleId ? getInteractions(userId, articleId).length : allInteractions.length
      }
    });

  } catch (error) {
    console.error('خطأ في جلب التفاعلات:', error);
    return NextResponse.json(
      { error: 'خطأ داخلي في الخادم' },
      { status: 500 }
    );
  }
} 
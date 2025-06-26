import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const articleId = searchParams.get('articleId');

    if (!userId || !articleId) {
      return NextResponse.json(
        { error: 'Missing userId or articleId' },
        { status: 400 }
      );
    }
    
    // في بيئة الإنتاج، نرجع قيم افتراضية لأن التخزين يتم محلياً
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        success: true,
        data: {
          liked: false,
          saved: false,
          shared: false
        },
        totalInteractions: 0,
        message: 'Using local storage in production'
      });
    }

    // قراءة ملف التفاعلات
    const interactionsPath = path.join(process.cwd(), 'data', 'user_article_interactions.json');
    const interactionsData = await fs.readFile(interactionsPath, 'utf-8');
    const data = JSON.parse(interactionsData);
    
    // التأكد من أن التفاعلات مصفوفة
    const interactions = Array.isArray(data.interactions) ? data.interactions : [];
    
    // البحث عن تفاعلات المستخدم مع هذا المقال
    const userArticleInteractions = interactions.filter((interaction: any) => 
      interaction.user_id === userId && 
      interaction.article_id === articleId
    );

    // ترتيب التفاعلات حسب التوقيت (الأحدث أولاً)
    const sortedInteractions = userArticleInteractions.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // تحديد آخر حالة لكل نوع من التفاعلات
    let liked = false;
    let saved = false;
    let shared = false;

    // البحث عن آخر تفاعل من نوع like/unlike
    const lastLikeInteraction = sortedInteractions.find((i: any) => 
      i.interaction_type === 'like' || i.interaction_type === 'unlike'
    );
    if (lastLikeInteraction) {
      liked = lastLikeInteraction.interaction_type === 'like';
    }

    // البحث عن آخر تفاعل من نوع save/unsave
    const lastSaveInteraction = sortedInteractions.find((i: any) => 
      i.interaction_type === 'save' || i.interaction_type === 'unsave'
    );
    if (lastSaveInteraction) {
      saved = lastSaveInteraction.interaction_type === 'save';
    }

    // المشاركة لا يمكن إلغاؤها، لذا نبحث فقط عن وجودها
    shared = sortedInteractions.some((i: any) => 
      i.interaction_type === 'share'
    );

    // الحالة النهائية
    const interactionState = {
      liked,
      saved,
      shared
    };

    return NextResponse.json({
      success: true,
      data: interactionState,
      totalInteractions: userArticleInteractions.length
    });
  } catch (error) {
    console.error('Error fetching user-article interactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateSmartDose, getCurrentPeriod, type DosePeriod, type DBDosePeriod } from '@/lib/ai/doseGenerator';

const prisma = new PrismaClient();

/**
 * GET /api/doses - جلب الجرعة الحالية أو لفترة معينة
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') as DosePeriod) || getCurrentPeriod();
    const userId = searchParams.get('userId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // البحث عن جرعة موجودة
    let existingDose = await prisma.daily_doses.findFirst({
      where: {
        period: period as DBDosePeriod,
        date: {
          gte: new Date(date + 'T00:00:00'),
          lt: new Date(date + 'T23:59:59')
        },
        ...(userId ? { user_id: userId } : { is_global: true }),
        status: 'published'
      },
      include: {
        feedback: userId ? {
          where: { user_id: userId },
          take: 1
        } : false
      }
    });

    // إذا لم توجد جرعة، أنشئ واحدة جديدة
    if (!existingDose) {
      const newDose = await createDailyDose(period, userId);
      existingDose = newDose;
    }

    // تحديث عدد المشاهدات
    await prisma.daily_doses.update({
      where: { id: existingDose.id },
      data: { views: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      dose: {
        id: existingDose.id,
        period: existingDose.period,
        main_text: existingDose.title,
        sub_text: existingDose.subtitle,
        topics: existingDose.topics || [],
        view_count: existingDose.views + 1,
        interaction_count: existingDose.interaction_count || 0,
        user_feedback: existingDose.feedback?.[0] || null,
        created_at: existingDose.createdAt
      }
    });

  } catch (error) {
    console.error('خطأ في جلب الجرعة:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي', details: error instanceof Error ? error.message : 'خطأ غير معروف' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * POST /api/doses - إنشاء جرعة جديدة أو تقديم ردود الأفعال
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'feedback':
        return await handleFeedback(data);
      case 'generate':
        return await handleGeneration(data);
      default:
        return NextResponse.json(
          { error: 'نوع العملية غير مدعوم' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('خطأ في معالجة طلب الجرعة:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * إنشاء جرعة يومية جديدة
 */
async function createDailyDose(period: DosePeriod, userId?: string) {
  // جلب المقالات الحديثة للسياق
  const recentArticles = await prisma.articles.findMany({
    where: {
      is_published: true,
      published_at: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // آخر 24 ساعة
      }
    },
    orderBy: { published_at: 'desc' },
    take: 10,
    select: {
      id: true,
      title: true,
      category_name: true,
      views_count: true
    }
  });

  // جلب تفضيلات المستخدم إن وجدت
  let userPreferences: string[] = [];
  if (userId) {
    // يمكن إضافة جلب تفضيلات المستخدم هنا لاحقاً
    userPreferences = [];
  }

  // توليد الجرعة بالذكاء الاصطناعي
  const generatedDose = await generateSmartDose({
    period,
    recentArticles,
    userPreferences
  });

  // حفظ الجرعة في قاعدة البيانات
  const dose = await prisma.daily_doses.create({
    data: {
      id: `dose_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      period: generatedDose.period as DBDosePeriod,
      date: new Date(),
      title: generatedDose.content.main_text,
      subtitle: generatedDose.content.sub_text,
      topics: generatedDose.content.topics,
      source_articles: generatedDose.content.source_articles,
      generated_by_ai: true,
      ai_prompt_used: generatedDose.ai_prompt_used,
      status: 'published', // نشر مباشر مؤقتاً
      user_id: userId,
      is_global: !userId,
      views: 0,
      interaction_count: 0,
      share_count: 0,
      metadata: {
        ai_generated: true,
        generation_timestamp: new Date().toISOString()
      },
      updatedAt: new Date()
    }
  });

  return dose;
}

/**
 * معالجة ردود الأفعال على الجرعات
 */
async function handleFeedback(data: {
  doseId: string;
  userId: string;
  reaction?: 'like' | 'dislike' | 'neutral';
  shared?: boolean;
  saved?: boolean;
  timeSpent?: number;
  comment?: string;
}) {
  const { doseId, userId, reaction, shared, saved, timeSpent, comment } = data;

  // التحقق من وجود تفاعل سابق
  const existingFeedback = await prisma.smart_dose_feedback.findUnique({
    where: {
      user_id_dose_id: {
        user_id: userId,
        dose_id: doseId
      }
    }
  });

  let feedback;
  if (existingFeedback) {
    // تحديث التفاعل الموجود
    feedback = await prisma.smart_dose_feedback.update({
      where: { id: existingFeedback.id },
      data: {
        reaction: reaction || existingFeedback.reaction,
        shared: shared !== undefined ? shared : existingFeedback.shared,
        saved: saved !== undefined ? saved : existingFeedback.saved,
        time_spent: timeSpent || existingFeedback.time_spent,
        comment: comment || existingFeedback.comment,
        updated_at: new Date()
      }
    });
  } else {
    // إنشاء تفاعل جديد
    feedback = await prisma.smart_dose_feedback.create({
      data: {
        user_id: userId,
        dose_id: doseId,
        reaction: reaction || 'neutral',
        shared: shared || false,
        saved: saved || false,
        time_spent: timeSpent,
        comment
      }
    });
  }

  // تحديث إحصائيات الجرعة
  await prisma.daily_doses.update({
    where: { id: doseId },
    data: {
      interaction_count: { increment: 1 },
      ...(shared && { share_count: { increment: 1 } })
    }
  });

  return NextResponse.json({
    success: true,
    feedback: feedback,
    message: 'تم حفظ ردك بنجاح'
  });
}

/**
 * معالجة توليد جرعة جديدة (للمحررين)
 */
async function handleGeneration(data: {
  period: DosePeriod;
  userId?: string;
  forceRegenerate?: boolean;
}) {
  const { period, userId, forceRegenerate } = data;

  // التحقق من وجود جرعة لنفس اليوم
  const today = new Date().toISOString().split('T')[0];
  const existingDose = await prisma.daily_doses.findFirst({
    where: {
      period: period as DBDosePeriod,
      date: {
        gte: new Date(today + 'T00:00:00'),
        lt: new Date(today + 'T23:59:59')
      },
      ...(userId ? { user_id: userId } : { is_global: true })
    }
  });

  if (existingDose && !forceRegenerate) {
    return NextResponse.json({
      success: false,
      message: 'توجد جرعة لهذه الفترة مسبقاً',
      existing_dose: existingDose
    });
  }

  // توليد جرعة جديدة
  const newDose = await createDailyDose(period, userId);

  return NextResponse.json({
    success: true,
    dose: newDose,
    message: 'تم توليد جرعة جديدة بنجاح'
  });
}
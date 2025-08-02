import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateSmartDose, getCurrentPeriod, type DosePeriod, type DBDosePeriod } from '@/lib/ai/doseGenerator';

const prisma = new PrismaClient();

/**
 * GET /api/doses - جلب الجرعة الحالية أو لفترة معينة
 */
export async function GET(request: NextRequest) {
  try {
    // التحقق من وجود OpenAI API Key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'خدمة الجرعات الذكية غير متاحة حالياً',
        fallback: true
      }, { status: 503 });
    }

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
      // إزالة include للـ feedback مؤقتاً حتى يتم إصلاح قاعدة البيانات
      // include: {
      //   feedback: userId ? {
      //     where: { user_id: userId },
      //     take: 1
      //   } : false
      // }
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
        user_feedback: null, // مؤقتاً حتى يتم إصلاح جدول feedback
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
  // استخدام بيانات ثابتة مؤقتاً حتى يتم إصلاح قاعدة البيانات
  const recentArticles = [
    { id: '1', title: 'خبر تجريبي 1', views: 100 },
    { id: '2', title: 'خبر تجريبي 2', views: 200 },
    { id: '3', title: 'خبر تجريبي 3', views: 300 }
  ];

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
      createdAt: new Date(),
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
  const { doseId, userId, reaction, shared } = data;

  // تحديث إحصائيات الجرعة فقط (بدون جدول feedback مؤقتاً)
  await prisma.daily_doses.update({
    where: { id: doseId },
    data: {
      interaction_count: { increment: 1 },
      ...(shared && { share_count: { increment: 1 } })
    }
  });

  return NextResponse.json({
    success: true,
    feedback: { reaction, shared, saved: false },
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
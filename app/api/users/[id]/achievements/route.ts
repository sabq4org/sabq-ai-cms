import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// جلب إنجازات المستخدم
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // إنجازات افتراضية للبداية
    const defaultAchievements = [
      {
        id: 'first_comment',
        title: 'أول تعليق',
        description: 'قم بكتابة أول تعليق لك',
        icon: '💬',
        type: 'engagement',
        threshold: 1,
        currentProgress: 0,
        completed: false,
        reward: 5
      },
      {
        id: 'comment_master',
        title: 'خبير التعليقات',
        description: 'اكتب 10 تعليقات',
        icon: '🗣️',
        type: 'engagement',
        threshold: 10,
        currentProgress: 0,
        completed: false,
        reward: 25
      },
      {
        id: 'week_warrior',
        title: 'محارب الأسبوع',
        description: 'سجل دخولك 7 أيام متتالية',
        icon: '🔥',
        type: 'streak',
        threshold: 7,
        currentProgress: 0,
        completed: false,
        reward: 20
      },
      {
        id: 'popular_voice',
        title: 'صوت شعبي',
        description: 'احصل على 50 إعجاب على تعليقاتك',
        icon: '❤️',
        type: 'quality',
        threshold: 50,
        currentProgress: 0,
        completed: false,
        reward: 50
      }
    ];

    // محاولة جلب التقدم الفعلي من قاعدة البيانات
    try {
      const commentsCount = await prisma.comments.count({
        where: { user_id: userId }
      });

      const likesCount = await prisma.comments.aggregate({
        where: { user_id: userId },
        _sum: { likes: true }
      });

      // تحديث التقدم الفعلي
      defaultAchievements.forEach(achievement => {
        switch (achievement.id) {
          case 'first_comment':
          case 'comment_master':
            achievement.currentProgress = commentsCount;
            achievement.completed = commentsCount >= achievement.threshold;
            break;
          case 'popular_voice':
            achievement.currentProgress = likesCount._sum.likes || 0;
            achievement.completed = (likesCount._sum.likes || 0) >= achievement.threshold;
            break;
        }
      });
    } catch (dbError) {
      console.log('تعذر جلب البيانات من قاعدة البيانات، استخدام القيم الافتراضية');
    }

    return NextResponse.json({
      success: true,
      achievements: defaultAchievements
    });

  } catch (error) {
    console.error('خطأ في جلب الإنجازات:', error);
    return NextResponse.json(
      { success: false, error: 'فشل في جلب الإنجازات' },
      { status: 500 }
    );
  }
}

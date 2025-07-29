import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // للاختبار نعيد بيانات وهمية - سيتم استبدالها بجلسة حقيقية لاحقاً
    const testUser = {
      id: 'test-user-id',
      name: 'مستخدم تجريبي',
      email: 'test@example.com',
      avatar: null,
      role: 'USER',
      isVerified: true,
      createdAt: new Date(),
      stats: {
        articles: 0,
        likes: 0,
        savedArticles: 0,
        comments: 0
      }
    };

    console.log('✅ تم استرجاع بيانات المستخدم التجريبي');

    return NextResponse.json(testUser);

  } catch (error) {
    console.error('❌ خطأ في استرجاع بيانات المستخدم:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم الداخلي' }, 
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// API لإنشاء مقال تجريبي للمعرف mm17z5pf
export async function POST() {
  try {
    // التحقق من وجود المقال أولاً
    const existingArticle = await prisma.articles.findFirst({
      where: {
        OR: [
          { id: 'mm17z5pf' },
          { slug: 'mm17z5pf' }
        ]
      }
    });

    if (existingArticle) {
      return NextResponse.json({
        success: true,
        message: 'المقال موجود بالفعل',
        article: existingArticle
      });
    }

    // إنشاء مقال جديد بالمعرف المطلوب
    const newArticle = await prisma.articles.create({
      data: {
        id: 'mm17z5pf',
        slug: 'mm17z5pf',
        title: 'مقال تجريبي - تم إنشاؤه لحل مشكلة 404',
        content: `<p>هذا مقال تجريبي تم إنشاؤه تلقائياً لحل مشكلة المقال المفقود.</p>
        <p>المعرف: mm17z5pf</p>
        <p>تاريخ الإنشاء: ${new Date().toLocaleString('ar-SA')}</p>`,
        excerpt: 'مقال تجريبي تم إنشاؤه لحل مشكلة 404',
        status: 'published',
        content_type: 'NEWS',
        article_type: 'news',
        featured_image: null,
        author_id: '1', // افتراضي
        published_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        views: 0,
        likes: 0,
        shares: 0,
        saves: 0,
        featured: false,
        breaking: false,
        trending: false,
        priority: 1,
        tags: ['تجريبي', 'إصلاح'],
        seo_title: 'مقال تجريبي - تم إنشاؤه لحل مشكلة 404',
        seo_description: 'مقال تجريبي تم إنشاؤه تلقائياً لحل مشكلة المقال المفقود',
        seo_keywords: 'تجريبي,إصلاح,404'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء المقال بنجاح',
      article: newArticle
    });

  } catch (error: any) {
    console.error('خطأ في إنشاء المقال:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل في إنشاء المقال',
      details: error.message
    }, { status: 500 });
  }
}

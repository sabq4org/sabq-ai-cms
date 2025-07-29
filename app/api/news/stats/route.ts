import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    
    // إنشاء شرط الفلترة
    const where: any = { status: 'published' };
    if (categoryId) {
      // دعم category_id كرقم أو نص
      if (!isNaN(Number(categoryId))) {
        where.category_id = parseInt(categoryId);
      } else {
        where.category_id = categoryId;
      }
    }
    
    // جلب معرفات المقالات أولاً
    const articleIds = await prisma.articles.findMany({
      where,
      select: { id: true }
    }).then(articles => articles.map(a => a.id));
    
    // جلب الإحصائيات الأساسية
    const [
      totalArticles,
      totalViews,
      interactions
    ] = await Promise.all([
      // عدد الأخبار
      prisma.articles.count({ where }),
      
      // إجمالي المشاهدات من حقل views في المقالات
      prisma.articles.aggregate({
        _sum: { views: true },
        where
      }),
      
      // جلب جميع التفاعلات دفعة واحدة
      articleIds.length > 0 
        ? prisma.interactions.groupBy({
            by: ['type'],
            _count: true,
            where: {
              article_id: { in: articleIds }
            }
          })
        : []
    ]);
    
    // تحويل النتائج إلى كائن سهل الاستخدام
    const interactionCounts = interactions.reduce((acc: any, curr) => {
      acc[curr.type] = curr._count;
      return acc;
    }, {});
    
    // جلب الأخبار الأكثر تفاعلاً (اختياري)
    const topArticles = articleIds.length > 0 
      ? await prisma.articles.findMany({
          where,
          orderBy: { views: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            slug: true,
            views: true
          }
        })
      : [];
    
    // إضافة بعض السجلات للتشخيص في بيئة التطوير
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 إحصائيات الأخبار:');
      console.log(`- التصنيف: ${categoryId || 'الكل'}`);
      console.log(`- عدد المقالات: ${totalArticles}`);
      console.log(`- عدد معرفات المقالات: ${articleIds.length}`);
      console.log(`- التفاعلات:`, interactionCounts);
    }
    
    return NextResponse.json({
      success: true,
      stats: {
        totalArticles,
        totalLikes: interactionCounts.like || 0,
        totalViews: totalViews._sum.views || 0,
        totalSaves: interactionCounts.save || 0,
        totalShares: interactionCounts.share || 0,
        totalComments: interactionCounts.comment || 0
      },
      topArticles,
      // معلومات إضافية للتشخيص
      debug: process.env.NODE_ENV === 'development' ? {
        categoryId,
        whereClause: where,
        articleCount: articleIds.length
      } : undefined
    });
    
  } catch (error) {
    console.error('Error fetching news stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'فشل في جلب إحصائيات الأخبار',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: 500 }
    );
  }
} 
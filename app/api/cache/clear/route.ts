import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/redis-improved';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, categoryId, articleId } = body;

    let clearedKeys = [];

    switch (type) {
      case 'all':
        // مسح جميع الكاش المتعلق بالمقالات
        await cache.clearPattern('articles:*');
        await cache.clearPattern('article:*');
        clearedKeys.push('جميع كاش المقالات');
        break;

      case 'category':
        // مسح كاش تصنيف معين
        if (categoryId) {
          await cache.clearPattern(`articles:*category_id*${categoryId}*`);
          await cache.del(`category:${categoryId}`);
          clearedKeys.push(`كاش التصنيف ${categoryId}`);
        }
        break;

      case 'article':
        // مسح كاش مقال معين
        if (articleId) {
          await cache.del(`article:${articleId}`);
          // مسح أيضا أي كاش يحتوي على هذا المقال
          await cache.clearPattern('articles:*');
          clearedKeys.push(`كاش المقال ${articleId} وجميع القوائم`);
        }
        break;

      default:
        // مسح الكاش الافتراضي
        await cache.clearPattern('articles:*');
        clearedKeys.push('كاش المقالات الافتراضي');
    }

    console.log('✅ تم مسح الكاش:', clearedKeys);

    return NextResponse.json({
      success: true,
      message: 'تم مسح الكاش بنجاح',
      cleared: clearedKeys
    });

  } catch (error) {
    console.error('❌ خطأ في مسح الكاش:', error);
    return NextResponse.json({
      success: false,
      error: 'فشل مسح الكاش'
    }, { status: 500 });
  }
}

export async function GET() {
  // عرض حالة الكاش
  try {
    const isReady = cache.isReady();
    
    return NextResponse.json({
      success: true,
      cacheReady: isReady,
      message: isReady ? 'Redis متصل وجاهز' : 'Redis غير متصل'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'خطأ في التحقق من حالة الكاش'
    }, { status: 500 });
  }
} 
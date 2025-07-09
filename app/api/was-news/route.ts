import { NextRequest, NextResponse } from "next/server";
import { getSpaBaskets, getSpaNextNews, formatSpaNews } from "@/lib/spa-news-api";
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

// GET - جلب الأخبار من واس
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    
    // عرض الأخبار المحفوظة من قاعدة البيانات
    if (action === 'saved') {
      const savedNews = await prisma.was_news.findMany({
        orderBy: { news_DT: 'desc' },
        take: 50,
      });
      return NextResponse.json({ 
        success: true,
        data: savedNews,
        count: savedNews.length 
      });
    }

    // جلب السلال المتاحة
    if (action === 'baskets') {
      const basketsRes = await getSpaBaskets();
      return NextResponse.json({
        success: true,
        baskets: basketsRes?.baskets || []
      });
    }

    // جلب أخبار جديدة من واس
    const basketId = searchParams.get('basket_id');
    const basketCD = basketId ? parseInt(basketId) : null;

    if (!basketCD) {
      // إذا لم يتم تحديد سلة، جلب السلال أولاً
      const basketsRes = await getSpaBaskets();
      const baskets = basketsRes?.baskets || [];
      
      if (baskets.length === 0) {
        return NextResponse.json({ 
          error: "لا توجد سلال متاحة",
          errorCode: "NO_BASKETS" 
        }, { status: 404 });
      }

      // استخدام أول سلة كافتراضي
      const defaultBasket = baskets[0];
      const basket_CD = defaultBasket.news_basket_CD;

      // جلب آخر رقم خبر محفوظ
      const lastSaved = await prisma.was_news.findFirst({
        where: { news_basket_CD: basket_CD },
        orderBy: { news_NUM: "desc" },
      });
      const last_news_CD = lastSaved?.news_NUM || 0;

      // جلب الخبر التالي
      const newsRes = await getSpaNextNews({ 
        basket_CD, 
        last_news_CD,
        IS_load_media: true 
      });

      // حفظ الخبر إذا كان جديداً
      if (newsRes?.news_NUM && newsRes.news_NUM !== last_news_CD) {
        const formattedNews = formatSpaNews(newsRes);
        
        await prisma.was_news.create({
          data: {
            news_NUM: newsRes.news_NUM,
            news_DT: formattedNews.date,
            news_basket_CD: newsRes.news_basket_CD,
            news_class_CD: newsRes.news_class_CD,
            news_priority_CD: newsRes.news_priority_CD,
            is_Report: newsRes.iS_Report || false,
            title_TXT: newsRes.title_TXT,
            story_TXT: newsRes.story_TXT,
            media: newsRes.media_FL || null,
            royalType: newsRes.royalType,
            keywords: newsRes.keywords || null,
            related_news_CD: newsRes.related_news_CD,
          },
        });

        return NextResponse.json({
          success: true,
          message: "تم جلب وحفظ خبر جديد",
          data: formattedNews,
          basket: defaultBasket
        });
      }

      return NextResponse.json({
        success: true,
        message: "لا توجد أخبار جديدة",
        lastNewsId: last_news_CD,
        basket: defaultBasket
      });
    }

    // جلب أخبار من سلة محددة
    const lastSaved = await prisma.was_news.findFirst({
      where: { news_basket_CD: basketCD },
      orderBy: { news_NUM: "desc" },
    });
    const last_news_CD = lastSaved?.news_NUM || 0;

    const newsRes = await getSpaNextNews({ 
      basket_CD: basketCD, 
      last_news_CD,
      IS_load_media: true 
    });

    if (newsRes?.news_NUM && newsRes.news_NUM !== last_news_CD) {
      const formattedNews = formatSpaNews(newsRes);
      
      await prisma.was_news.create({
        data: {
          news_NUM: newsRes.news_NUM,
          news_DT: formattedNews.date,
          news_basket_CD: newsRes.news_basket_CD,
          news_class_CD: newsRes.news_class_CD,
          news_priority_CD: newsRes.news_priority_CD,
          is_Report: newsRes.iS_Report || false,
          title_TXT: newsRes.title_TXT,
          story_TXT: newsRes.story_TXT,
          media: newsRes.media_FL || null,
          royalType: newsRes.royalType,
          keywords: newsRes.keywords || null,
          related_news_CD: newsRes.related_news_CD,
        },
      });

      return NextResponse.json({
        success: true,
        message: "تم جلب وحفظ خبر جديد",
        data: formattedNews
      });
    }

    return NextResponse.json({
      success: true,
      message: "لا توجد أخبار جديدة",
      lastNewsId: last_news_CD
    });

  } catch (error: any) {
    console.error("WAS API Error:", error);
    
    // معالجة أخطاء محددة
    if (error.response?.status === 401) {
      return NextResponse.json({ 
        error: "خطأ في المصادقة - تحقق من مفاتيح API",
        errorCode: "AUTH_ERROR",
        details: error.response?.data 
      }, { status: 401 });
    }
    
    if (error.response?.status === 400) {
      return NextResponse.json({ 
        error: "خطأ في صيغة الطلب",
        errorCode: "BAD_REQUEST",
        details: error.response?.data 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: error.message || "حدث خطأ غير متوقع",
      errorCode: "UNKNOWN_ERROR"
    }, { status: 500 });
  }
}

// POST - استيراد خبر واس إلى المقالات
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { newsId, categoryId } = body;

    if (!newsId) {
      return NextResponse.json({ 
        error: "معرف الخبر مطلوب" 
      }, { status: 400 });
    }

    // جلب الخبر من قاعدة البيانات
    const wasNews = await prisma.was_news.findUnique({
      where: { id: newsId }
    });

    if (!wasNews) {
      return NextResponse.json({ 
        error: "الخبر غير موجود" 
      }, { status: 404 });
    }

    if (wasNews.is_imported) {
      return NextResponse.json({ 
        error: "تم استيراد هذا الخبر مسبقاً",
        articleId: wasNews.imported_to_id 
      }, { status: 400 });
    }

    // إنشاء مقال جديد من خبر واس
    const articleId = crypto.randomUUID();
    const slug = wasNews.title_TXT
      .toLowerCase()
      .replace(/[^\u0621-\u064A\u0660-\u0669a-z0-9\s-]/g, '') // إزالة الأحرف الخاصة
      .replace(/\s+/g, '-') // استبدال المسافات بـ -
      .replace(/-+/g, '-') // إزالة الـ - المتكررة
      .trim();
    
    const article = await prisma.articles.create({
      data: {
        id: articleId,
        title: wasNews.title_TXT,
        slug: `${slug}-${wasNews.news_NUM}`, // إضافة رقم الخبر لضمان التفرد
        content: wasNews.story_TXT || "",
        excerpt: wasNews.story_TXT?.substring(0, 200) || "",
        category_id: categoryId || "news", // افتراضي: أخبار
        author_id: "system", // يمكن تغييره حسب المستخدم الحالي
        status: "draft",
        breaking: wasNews.news_priority_CD === 1,
        updated_at: new Date(),
        metadata: {
          source: "واس",
          source_url: `https://www.spa.gov.sa/news${wasNews.news_NUM}`,
          was_news_id: wasNews.id,
          was_news_num: wasNews.news_NUM,
          was_basket_cd: wasNews.news_basket_CD,
          was_class_cd: wasNews.news_class_CD,
          was_media: wasNews.media,
          was_keywords: wasNews.keywords,
          was_royal_type: wasNews.royalType,
          imported_at: new Date().toISOString()
        }
      }
    });

    // تحديث حالة الخبر كمستورد
    await prisma.was_news.update({
      where: { id: newsId },
      data: {
        is_imported: true,
        imported_to_id: article.id
      }
    });

    return NextResponse.json({
      success: true,
      message: "تم استيراد الخبر بنجاح",
      articleId: article.id,
      articleTitle: article.title
    });

  } catch (error: any) {
    console.error("Import error:", error);
    return NextResponse.json({ 
      error: error.message || "فشل استيراد الخبر" 
    }, { status: 500 });
  }
} 
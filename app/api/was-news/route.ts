import { NextRequest, NextResponse } from "next/server";
import { getBaskets, getNextNews, getStatus } from "@/lib/spaClient";

/**
 * هذه الواجهة تتعامل مع وكالة الأنباء السعودية (واس) وتُستخدم من لوحة التحكم.
 * تدعم الأفعال التالية عبر POST:
 *  - action:"status"   => التحقق من حالة العقد
 *  - action:"baskets"  => جلب جميع السِّلال
 *  - action:"news"     => جلب أحدث خبر لسلة محدَّدة (تُرسل { basket_CD:number })
 * لاحقاً يمكن إضافة أفعال أخرى (saved، import …) حسب قاعدة البيانات.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action as string | undefined;

    if (!action) {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }

    // التحقق من حالة العقد أولاً
    if (action === "status") {
      try {
        const data = await getStatus();
        return NextResponse.json({ 
          success: true, 
          isActive: data.iS_active_client || false,
          message: data.message_TXT || "Status checked"
        });
      } catch (error: any) {
        return NextResponse.json({ 
          success: false, 
          isActive: false,
          message: error.message 
        });
      }
    }

    if (action === "baskets") {
      const data = await getBaskets();
      // معالجة الاستجابة حسب الوثائق
      const baskets = data.baskets || data || [];
      return NextResponse.json({ success: true, baskets });
    }

    if (action === "news") {
      const basket_CD = Number(body.basket_CD);
      const last_news_CD = Number(body.last_news_CD) || 0;
      const IS_load_media = body.IS_load_media !== false; // افتراضياً true
      
      if (!basket_CD) {
        return NextResponse.json({ error: "basket_CD is required" }, { status: 400 });
      }
      
      const data = await getNextNews(last_news_CD, basket_CD, IS_load_media);
      
      // معالجة الاستجابة حسب الوثائق
      const newsData = {
        news_NUM: data.news_NUM || 0,
        news_DT: data.news_DT,
        news_basket_CD: data.news_basket_CD,
        news_class_CD: data.news_class_CD,
        news_priority_CD: data.news_priority_CD,
        iS_Report: data.iS_Report || false,
        title_TXT: data.title_TXT || "",
        story_TXT: data.story_TXT || "",
        media_FL: data.media_FL || [],
        royalType: data.royalType,
        keywords: data.keywords || [],
        related_news_CD: data.related_news_CD
      };
      
      return NextResponse.json({ success: true, data: newsData });
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error: any) {
    console.error("WAS API Error:", error?.response?.data ?? error);
    
    // معالجة أخطاء محددة حسب الوثائق
    if (error?.response?.status === 401) {
      return NextResponse.json(
        { error: "Unauthorized - Check your credentials" },
        { status: 401 }
      );
    }
    
    if (error?.response?.status === 404) {
      return NextResponse.json(
        { error: error?.response?.data?.message || "Client key is not active!" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // التأكد من وجود URL صحيح
    if (!request.url) {
      return NextResponse.json(
        { error: 'Invalid request URL' },
        { status: 400 }
      );
    }
    
    const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'saved') {
    // TODO: استرجاع الأخبار المحفوظة من قاعدة البيانات
    // حالياً نعيد بيانات وهمية للاختبار
    return NextResponse.json({
      success: true,
      news: []
    });
  }

  if (action === 'baskets') {
    try {
      const data = await getBaskets();
      const baskets = Array.isArray(data.baskets) ? data.baskets : data;
      return NextResponse.json({ success: true, baskets });
    } catch (error: any) {
      console.error("WAS API Error:", error?.response?.data ?? error);
      // إعادة بيانات وهمية للاختبار في حالة الخطأ
      return NextResponse.json({
        success: true,
        baskets: [
          { news_basket_CD: 1, news_basket_TXT: "General", news_basket_TXT_AR: "عام" },
          { news_basket_CD: 2, news_basket_TXT: "Sports", news_basket_TXT_AR: "رياضة" },
          { news_basket_CD: 3, news_basket_TXT: "Economy", news_basket_TXT_AR: "اقتصاد" }
        ]
      });
    }
  }

  // التحقق من حالة العقد
  if (action === 'status') {
    try {
      const data = await getStatus();
      return NextResponse.json({ 
        success: true, 
        isActive: data.iS_active_client || false,
        message: data.message_TXT || "Status checked"
      });
    } catch (error: any) {
      return NextResponse.json({ 
        success: false, 
        isActive: false,
        message: "Unable to check status"
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: "was-news API route is live. Use POST with actions: status, baskets, news",
  });
}

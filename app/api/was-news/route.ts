import { NextRequest, NextResponse } from "next/server";

// بيانات وهمية مؤقتة للسلال
const mockBaskets = [
  {
    news_basket_CD: 1,
    news_basket_DESC_AR: "واس عام",
    news_basket_DESC_EN: "SPA General",
    is_save_story: true,
    is_save_media: true,
  },
  {
    news_basket_CD: 2,
    news_basket_DESC_AR: "واس اقتصاد",
    news_basket_DESC_EN: "SPA Economy",
    is_save_story: true,
    is_save_media: false,
  },
  {
    news_basket_CD: 3,
    news_basket_DESC_AR: "واس رياضة",
    news_basket_DESC_EN: "SPA Sports",
    is_save_story: true,
    is_save_media: true,
  },
  {
    news_basket_CD: 4,
    news_basket_DESC_AR: "واس محلي",
    news_basket_DESC_EN: "SPA Local",
    is_save_story: true,
    is_save_media: false,
  },
  {
    news_basket_CD: 5,
    news_basket_DESC_AR: "واس دولي",
    news_basket_DESC_EN: "SPA International",
    is_save_story: true,
    is_save_media: true,
  },
];

// بيانات وهمية مؤقتة للأخبار
const mockNews = [
  {
    news_CD: 1001,
    title_TXT: "المملكة تحتفل باليوم الوطني الـ94",
    story_TXT: "احتفلت المملكة العربية السعودية اليوم باليوم الوطني الـ94 تحت شعار 'نحلم ونحقق' وسط مشاركة شعبية واسعة في جميع أنحاء المملكة. وشهدت الاحتفالات عروضاً جوية مذهلة وفعاليات ثقافية متنوعة.",
    news_DT: "2024-09-23T10:00:00Z",
    media_FL: [],
  },
  {
    news_CD: 1002,
    title_TXT: "إطلاق مشروع نيوم الجديد للطاقة المتجددة",
    story_TXT: "أعلنت شركة نيوم عن إطلاق مشروع جديد للطاقة المتجددة بقدرة 2000 ميجاوات، والذي يهدف إلى تعزيز الاستدامة البيئية وتحقيق أهداف رؤية 2030. المشروع سيوفر طاقة نظيفة لآلاف المنازل.",
    news_DT: "2024-09-23T08:30:00Z",
    media_FL: [],
  },
  {
    news_CD: 1003,
    title_TXT: "السعودية تستضيف قمة الذكاء الاصطناعي 2024",
    story_TXT: "تستضيف المملكة العربية السعودية قمة الذكاء الاصطناعي العالمية 2024 في الرياض، بمشاركة أكثر من 500 خبير من حول العالم. القمة تهدف إلى مناقشة أحدث التطورات في مجال الذكاء الاصطناعي وتطبيقاته.",
    news_DT: "2024-09-23T06:15:00Z",
    media_FL: [],
  },
];

export async function GET(request: NextRequest) {
  console.log("=== SPA API Route Invoked (GET) ===");
  
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "test";
  
  if (action === "test") {
    return NextResponse.json({
      success: true,
      message: "API route is working!",
      timestamp: new Date().toISOString(),
      note: "استخدم POST method للحصول على البيانات"
    });
  }
  
  return NextResponse.json({
    error: "Use POST method for data requests",
    hint: "GET is only for test action"
  }, { status: 405 });
}

export async function POST(request: NextRequest) {
  console.log("=== SPA API Route Invoked (POST) ===");
  
  try {
    const body = await request.json();
    const action = body.action;
    
    console.log("Action from body:", action);
    console.log("Request body:", body);
    
    if (action === "test") {
      return NextResponse.json({
        success: true,
        message: "API route is working!",
        timestamp: new Date().toISOString(),
        note: "البيانات الحالية وهمية - يحتاج الحصول على API الصحيح من واس"
      });
    }

    if (action === "baskets") {
      console.log("🔄 Returning mock baskets data...");
      
      // محاكاة تأخير API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return NextResponse.json({ 
        success: true, 
        baskets: mockBaskets,
        note: "هذه بيانات وهمية مؤقتة - يحتاج الحصول على API الصحيح من واس"
      });
    }
    
    if (action === "news") {
      const basket_CD = body.basket_CD;
      if (!basket_CD) {
        return NextResponse.json({ error: "basket_CD is required" }, { status: 400 });
      }

      console.log(`🔄 Returning mock news for BasketId: ${basket_CD}`);
      
      // محاكاة تأخير API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // إرجاع أخبار وهمية مع تنويع حسب السلة
      const basketSpecificNews = mockNews.map(news => ({
        ...news,
        news_CD: news.news_CD + (basket_CD * 1000), // تنويع ID حسب السلة
        title_TXT: `[${mockBaskets.find(b => b.news_basket_CD === basket_CD)?.news_basket_DESC_AR || 'واس'}] ${news.title_TXT}`,
      }));
      
      return NextResponse.json({ 
        success: true, 
        news: basketSpecificNews,
        basket_CD: basket_CD,
        note: "هذه بيانات وهمية مؤقتة - يحتاج الحصول على API الصحيح من واس"
      });
    }
    
    return NextResponse.json({
      error: "Invalid action. Use 'baskets' or 'news'",
      availableActions: ["baskets", "news"],
      receivedAction: action
    }, { status: 400 });
    
  } catch (error: any) {
    console.error("WAS API Error:", error.message);
    
    return NextResponse.json({
      error: error.message || "حدث خطأ غير متوقع",
      errorCode: error.code || "UNKNOWN_ERROR",
    }, { status: 500 });
  }
}

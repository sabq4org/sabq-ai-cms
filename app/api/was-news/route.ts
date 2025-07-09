import { NextRequest, NextResponse } from "next/server";
import { getSpaBaskets, getSpaNextNews, formatSpaNews } from "@/lib/spa-news-api";

export async function GET(request: NextRequest) {
  console.log("Testing SPA API directly...");
  
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action") || "baskets";
    
    if (action === "baskets") {
      // جلب السلال المتاحة
      const baskets = await getSpaBaskets();
      console.log("SPA API Response:", baskets);
      
      return NextResponse.json({
        success: true,
        baskets: baskets,
      });
    }
    
    if (action === "news") {
      // جلب الأخبار باستخدام التنسيق الصحيح
      console.log("=== getSpaNextNews API Call ===");
      console.log("Testing news fetch from baskets...");
      
      // تجربة السلال المختلفة
      const testBaskets = [3, 17]; // واس عام، واس صور
      const errors = []; // جمع الأخطاء
      
      for (const basketId of testBaskets) {
        try {
          console.log(`\n🔄 Testing BasketId: ${basketId}`);
          
          const news = await getSpaNextNews({
            basket_CD: basketId,
            last_news_CD: 0,
            IS_recived: false,
            IS_load_media: true,
          });
          
          console.log("✅ News API Call succeeded!");
          console.log("Raw news response:", JSON.stringify(news, null, 2));
          
          // تنسيق الأخبار للعرض
          const formattedNews = Array.isArray(news) ? news.map(formatSpaNews) : [formatSpaNews(news)];
          
          return NextResponse.json({
            success: true,
            news: formattedNews,
            rawResponse: news,
            basketId: basketId
          });
          
        } catch (error: any) {
          console.log(`❌ Failed with BasketId: ${basketId}`);
          console.log("Error:", error.message);
          console.log("Error details:", error.response?.data);
          console.log("Error status:", error.response?.status);
          
          // إضافة تفاصيل الخطأ للمصفوفة
          errors.push({
            basketId: basketId,
            error: error.message,
            status: error.response?.status,
            details: error.response?.data
          });
          // استمر للتجربة التالية
        }
      }
      
      // إذا فشلت جميع التجارب
      return NextResponse.json({
        error: "فشل جلب الأخبار من جميع السلال",
        testedBaskets: testBaskets,
        errors: errors
      }, { status: 500 });
    }
    
    return NextResponse.json({
      error: "Invalid action. Use 'baskets' or 'news'",
      availableActions: ["baskets", "news"]
    }, { status: 400 });
    
  } catch (error: any) {
    console.error("WAS API Error:", error);
    
    const errorResponse = {
      error: error.message || "حدث خطأ غير متوقع",
      errorCode: "UNKNOWN_ERROR",
      details: error.response?.data || error.response?.status || "No additional details"
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
} 
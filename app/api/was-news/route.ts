import { NextRequest, NextResponse } from "next/server";
import { getSpaBaskets, getSpaNextNews } from "@/lib/spa-news-api";

export async function GET(request: NextRequest) {
  console.log("=== SPA API Route Invoked (GET) ===");
  
  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "test";
  
  if (action === "test") {
    return NextResponse.json({
      success: true,
      message: "API route is working!",
      timestamp: new Date().toISOString(),
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
      });
    }

    if (action === "baskets") {
      console.log("🔄 Fetching SPA baskets...");
      const baskets = await getSpaBaskets();
      console.log("✅ GetBaskets API Call succeeded!");
      
      return NextResponse.json({ 
        success: true, 
        baskets: baskets 
      });
    }
    
    if (action === "news") {
      const basket_CD = body.basket_CD;
      if (!basket_CD) {
        return NextResponse.json({ error: "basket_CD is required" }, { status: 400 });
      }

      console.log(`🔄 Fetching news for BasketId: ${basket_CD}`);
      
      const news = await getSpaNextNews({
        basket_CD: basket_CD,
        last_news_CD: body.last_news_CD || 0,
        IS_recived: body.IS_recived || false,
        IS_load_media: body.IS_load_media !== false,
      });
      
      console.log("✅ GetNextNews API Call succeeded!");
      
      return NextResponse.json({ 
        success: true, 
        news: news 
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

/**
 * نظام مراقبة التزامن التلقائي
 * يتحقق دورياً من التزامن بين النسختين ويُبلغ عن أي تفاوت
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface SyncTestResult {
  timestamp: string;
  synchronized: boolean;
  fullVersion: string[];
  liteVersion: string[];
  details: {
    fullAPI: any;
    liteAPI: any;
    unifiedAPI: any;
  };
  errors: string[];
}

async function testAPIEndpoint(url: string, timeout: number = 5000): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'X-Sync-Test': 'true',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const startTime = new Date();
  const errors: string[] = [];
  
  try {
    console.log('🔍 [SyncMonitor] Starting synchronization test...');
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '3', 10);
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    
    // اختبار جميع الـ APIs
    let fullAPI, liteAPI, unifiedAPI;
    
    try {
      fullAPI = await testAPIEndpoint(`${baseUrl}/api/featured-news-carousel?limit=${limit}`);
    } catch (error) {
      errors.push(`Full API error: ${error}`);
      fullAPI = { articles: [] };
    }
    
    try {
      liteAPI = await testAPIEndpoint(`${baseUrl}/api/unified-featured?limit=${limit}&format=lite`);
    } catch (error) {
      errors.push(`Lite API error: ${error}`);
      liteAPI = { data: [] };
    }
    
    try {
      unifiedAPI = await testAPIEndpoint(`${baseUrl}/api/unified-featured?limit=${limit}&format=full`);
    } catch (error) {
      errors.push(`Unified API error: ${error}`);
      unifiedAPI = { articles: [] };
    }
    
    // استخراج IDs للمقارنة
    const fullArticleIds = (fullAPI.articles || []).map((a: any) => a.id);
    const liteArticleIds = (liteAPI.data || []).map((a: any) => a.id);
    const unifiedArticleIds = (unifiedAPI.articles || []).map((a: any) => a.id);
    
    // فحص التزامن
    const fullLiteSync = JSON.stringify(fullArticleIds) === JSON.stringify(liteArticleIds);
    const fullUnifiedSync = JSON.stringify(fullArticleIds) === JSON.stringify(unifiedArticleIds);
    const liteUnifiedSync = JSON.stringify(liteArticleIds) === JSON.stringify(unifiedArticleIds);
    
    const synchronized = fullLiteSync && fullUnifiedSync && liteUnifiedSync;
    
    if (!synchronized) {
      if (!fullLiteSync) errors.push('Full/Lite versions not synchronized');
      if (!fullUnifiedSync) errors.push('Full/Unified versions not synchronized');  
      if (!liteUnifiedSync) errors.push('Lite/Unified versions not synchronized');
    }
    
    const result: SyncTestResult = {
      timestamp: startTime.toISOString(),
      synchronized,
      fullVersion: fullArticleIds,
      liteVersion: liteArticleIds,
      details: {
        fullAPI: {
          count: fullAPI.articles?.length || 0,
          cached: fullAPI.cached,
          source: fullAPI.source,
        },
        liteAPI: {
          count: liteAPI.data?.length || 0,
          cached: liteAPI.cached,
          source: liteAPI.source,
        },
        unifiedAPI: {
          count: unifiedAPI.articles?.length || 0,
          cached: unifiedAPI.cached,
          source: unifiedAPI.source,
        },
      },
      errors,
    };
    
    const duration = Date.now() - startTime.getTime();
    
    console.log(`${synchronized ? '✅' : '❌'} [SyncMonitor] Test completed in ${duration}ms, synchronized: ${synchronized}`);
    
    if (!synchronized) {
      console.error('❌ [SyncMonitor] Synchronization issues detected:', errors);
    }
    
    return NextResponse.json({
      success: true,
      result,
      testDuration: duration,
      recommendation: synchronized 
        ? "النظام متزامن بشكل مثالي"
        : "يوجد خلل في التزامن - يجب المراجعة فوراً",
    }, {
      status: synchronized ? 200 : 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Sync-Status': synchronized ? 'SYNCHRONIZED' : 'OUT_OF_SYNC',
        'X-Test-Duration': duration.toString(),
      },
    });
    
  } catch (error: any) {
    console.error('❌ [SyncMonitor] Critical error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'حدث خطأ في نظام مراقبة التزامن',
      details: error.message,
      timestamp: startTime.toISOString(),
    }, { 
      status: 500,
      headers: {
        'X-Sync-Status': 'ERROR',
      },
    });
  }
}

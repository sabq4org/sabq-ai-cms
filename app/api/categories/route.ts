import { NextResponse } from 'next/server'
import { getCachedCategories, getCacheInfo } from '@/lib/services/categoriesCache'

export async function GET(request: Request) {
  console.log('📋 بدء جلب التصنيفات...')
  
  // التحقق من معامل forceRefresh
  const { searchParams } = new URL(request.url)
  const forceRefresh = searchParams.get('refresh') === 'true'
  
  try {
    const result = await getCachedCategories(forceRefresh)
    const cacheInfo = getCacheInfo()
    
    console.log(`✅ تم جلب ${result.categories.length} تصنيف ${result.fromCache ? 'من الـ cache' : 'من قاعدة البيانات'}`)
    
    return NextResponse.json({
      success: true,
      categories: result.categories,
      count: result.categories.length,
      cache: {
        fromCache: result.fromCache,
        ageInSeconds: result.cacheAge || cacheInfo.ageInSeconds,
        isStale: result.isStale || cacheInfo.isStale,
        lastUpdated: cacheInfo.lastUpdated,
        isExpired: cacheInfo.isExpired,
        isInGracePeriod: cacheInfo.isInGracePeriod
      }
    })
  } catch (error: any) {
    console.error('❌ خطأ في جلب التصنيفات:', error)
    
    return NextResponse.json({
      success: false,
      categories: [],
      error: 'خطأ في جلب البيانات',
      details: error.message || 'خطأ غير معروف',
      hint: 'يمكنك المحاولة مرة أخرى أو استخدام ?refresh=true لتحديث البيانات'
    }, { status: 503 })
  }
}

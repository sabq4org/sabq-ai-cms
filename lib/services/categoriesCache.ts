import prisma from '@/lib/prisma';

interface CategoriesCache {
  data: any[]
  lastUpdated: Date
  isStale: boolean
}

// Cache في الذاكرة للتصنيفات
let categoriesCache: CategoriesCache = {
  data: [],
  lastUpdated: new Date(0),
  isStale: true
}

// مدة صلاحية الـ cache (5 دقائق)
const CACHE_TTL_MS = 5 * 60 * 1000

// مدة الـ grace period للسماح بإستخدام البيانات القديمة (ساعة واحدة)
const STALE_GRACE_PERIOD_MS = 60 * 60 * 1000

/**
 * جلب التصنيفات مع cache ذكي
 */
export async function getCachedCategories(forceRefresh = false) {
  const now = new Date()
  const cacheAge = now.getTime() - categoriesCache.lastUpdated.getTime()
  
  // التحقق من صلاحية الـ cache
  if (!forceRefresh && categoriesCache.data.length > 0 && cacheAge < CACHE_TTL_MS) {
    console.log('✅ إرجاع التصنيفات من الـ cache')
    return {
      success: true,
      categories: categoriesCache.data,
      fromCache: true,
      cacheAge: Math.round(cacheAge / 1000) // بالثواني
    }
  }
  
  // محاولة تحديث الـ cache
  try {
    console.log('🔄 جلب التصنيفات من قاعدة البيانات...')
    
    // جلب التصنيفات مع عدد المقالات
    const categories = await prisma.categories.findMany({
      orderBy: {
        display_order: 'asc'
      },
      include: {
        _count: {
          select: {
            articles: {
              where: {
                status: 'published'
              }
            }
          }
        }
      }
    })
    
    // إضافة articles_count لكل تصنيف
    const categoriesWithCount = categories.map(category => ({
      ...category,
      articles_count: category._count.articles
    }))
    
    // تحديث الـ cache
    categoriesCache = {
      data: categoriesWithCount,
      lastUpdated: now,
      isStale: false
    }
    
    console.log(`✅ تم جلب ${categoriesWithCount.length} تصنيف مع عدد المقالات وتحديث الـ cache`)
    
    return {
      success: true,
      categories: categoriesWithCount,
      fromCache: false,
      cacheAge: 0
    }
  } catch (error) {
    console.error('❌ خطأ في جلب التصنيفات:', error)
    
    // إذا فشل الجلب، استخدم الـ cache القديم إذا كان متاحاً
    if (categoriesCache.data.length > 0 && cacheAge < STALE_GRACE_PERIOD_MS) {
      console.warn('⚠️ استخدام cache قديم بسبب فشل الاتصال')
      
      return {
        success: true,
        categories: categoriesCache.data,
        fromCache: true,
        cacheAge: Math.round(cacheAge / 1000),
        isStale: true,
        error: 'تم استخدام بيانات مخزنة مؤقتاً'
      }
    }
    
    // إذا لم يكن هناك cache، إرجاع خطأ
    throw error
  }
}

/**
 * تحديث cache التصنيفات يدوياً
 */
export async function updateCategoriesCache() {
  return getCachedCategories(true)
}

/**
 * مسح cache التصنيفات
 */
export function clearCategoriesCache() {
  categoriesCache = {
    data: [],
    lastUpdated: new Date(0),
    isStale: true
  }
  console.log('🗑️ تم مسح cache التصنيفات')
}

/**
 * جلب معلومات الـ cache
 */
export function getCacheInfo() {
  const now = new Date()
  const cacheAge = now.getTime() - categoriesCache.lastUpdated.getTime()
  
  return {
    count: categoriesCache.data.length,
    lastUpdated: categoriesCache.lastUpdated,
    ageInSeconds: Math.round(cacheAge / 1000),
    isStale: categoriesCache.isStale || cacheAge > CACHE_TTL_MS,
    isExpired: cacheAge > CACHE_TTL_MS,
    isInGracePeriod: cacheAge > CACHE_TTL_MS && cacheAge < STALE_GRACE_PERIOD_MS
  }
}

// تحديث تلقائي للـ cache كل 5 دقائق
let autoUpdateInterval: NodeJS.Timeout | null = null

export function startAutoUpdate() {
  if (autoUpdateInterval) return
  
  autoUpdateInterval = setInterval(async () => {
    try {
      await updateCategoriesCache()
      console.log('✅ تم تحديث cache التصنيفات تلقائياً')
    } catch (error) {
      console.error('❌ فشل التحديث التلقائي للـ cache:', error)
    }
  }, CACHE_TTL_MS)
  
  console.log('🔄 بدء التحديث التلقائي لـ cache التصنيفات')
}

export function stopAutoUpdate() {
  if (autoUpdateInterval) {
    clearInterval(autoUpdateInterval)
    autoUpdateInterval = null
    console.log('⏹️ تم إيقاف التحديث التلقائي')
  }
}

// بدء التحديث التلقائي في الإنتاج
if (process.env.NODE_ENV === 'production') {
  startAutoUpdate()
}

// تنظيف عند إيقاف التطبيق
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    stopAutoUpdate()
  })
} 
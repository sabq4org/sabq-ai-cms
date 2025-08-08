import prisma from '@/lib/prisma'
import dbConnectionManager from '@/lib/db-connection-manager'

/**
 * تنفيذ عملية قاعدة البيانات مع إعادة المحاولة
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // تأكد من الاتصال قبل العملية (مع مدير الاتصال)
      try { await prisma.$connect() } catch {}
      
      // تنفيذ العملية
      const result = await dbConnectionManager.executeWithConnection(operation)
      
      return result
    } catch (error) {
      lastError = error as Error
      
      console.error(`❌ المحاولة ${attempt}/${maxRetries} فشلت:`, error)
      
      if (attempt < maxRetries) {
        // انتظار قبل المحاولة التالية
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
        
        // إعادة الاتصال
        try {
          await prisma.$disconnect()
          await prisma.$connect()
        } catch (reconnectError) {
          console.error('❌ فشل في إعادة الاتصال:', reconnectError)
        }
      }
    }
  }
  
  throw lastError || new Error('فشل في العملية بعد المحاولات المتعددة')
}

/**
 * تنفيذ استعلام آمن مع معالجة الأخطاء
 */
export async function safeQuery<T>(
  queryFn: () => Promise<T>,
  fallback?: T
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await withRetry(queryFn)
    return { success: true, data }
  } catch (error) {
    console.error('❌ خطأ في الاستعلام:', error)
    
    return {
      success: false,
      error: 'خطأ في جلب البيانات',
      data: fallback
    }
  }
}

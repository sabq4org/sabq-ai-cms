import prisma, { executeWithRetry } from '@/lib/prisma'

interface ConnectionStats {
  lastCheck: Date
  lastSuccess: Date | null
  lastError: Date | null
  successCount: number
  errorCount: number
  currentStatus: 'connected' | 'disconnected' | 'reconnecting'
  errorDetails: string | null
}

class DatabaseConnectionManager {
  private stats: ConnectionStats = {
    lastCheck: new Date(),
    lastSuccess: null,
    lastError: null,
    successCount: 0,
    errorCount: 0,
    currentStatus: 'disconnected',
    errorDetails: null
  }
  
  private healthCheckInterval: NodeJS.Timeout | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  
  /**
   * بدء مراقبة الاتصال
   */
  startMonitoring(intervalMs = 30000) { // كل 30 ثانية
    if (this.healthCheckInterval) return
    
    console.log('🔍 بدء مراقبة اتصال قاعدة البيانات...')
    
    // فحص أولي
    this.checkConnection()
    
    // فحص دوري
    this.healthCheckInterval = setInterval(() => {
      this.checkConnection()
    }, intervalMs)
  }
  
  /**
   * إيقاف مراقبة الاتصال
   */
  stopMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    
    console.log('⏹️ تم إيقاف مراقبة الاتصال')
  }
  
  /**
   * فحص حالة الاتصال
   */
  async checkConnection(): Promise<boolean> {
    this.stats.lastCheck = new Date()
    
    try {
      // استعلام بسيط للتحقق من الاتصال
      await prisma.$queryRaw`SELECT 1 as health_check`
      
      this.stats.lastSuccess = new Date()
      this.stats.successCount++
      this.stats.currentStatus = 'connected'
      this.stats.errorDetails = null
      
      return true
    } catch (error: any) {
      this.stats.lastError = new Date()
      this.stats.errorCount++
      this.stats.currentStatus = 'disconnected'
      this.stats.errorDetails = error?.message || 'Unknown error'
      
      console.error('❌ فشل فحص الاتصال:', this.stats.errorDetails)
      
      // محاولة إعادة الاتصال
      this.scheduleReconnect()
      
      return false
    }
  }
  
  /**
   * جدولة إعادة الاتصال
   */
  private scheduleReconnect() {
    if (this.reconnectTimeout) return
    
    this.stats.currentStatus = 'reconnecting'
    console.log('🔄 جدولة محاولة إعادة الاتصال...')
    
    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectTimeout = null
      
      try {
        await prisma.$disconnect()
        await prisma.$connect()
        
        const success = await this.checkConnection()
        if (success) {
          console.log('✅ تم إعادة الاتصال بنجاح')
        } else {
          console.error('❌ فشلت إعادة الاتصال')
        }
      } catch (error) {
        console.error('❌ خطأ في إعادة الاتصال:', error)
        // جدولة محاولة أخرى
        this.scheduleReconnect()
      }
    }, 5000) // بعد 5 ثواني
  }
  
  /**
   * جلب إحصائيات الاتصال
   */
  getStats(): ConnectionStats & { uptimePercent: number } {
    const totalChecks = this.stats.successCount + this.stats.errorCount
    const uptimePercent = totalChecks > 0 
      ? Math.round((this.stats.successCount / totalChecks) * 100) 
      : 0
    
    return {
      ...this.stats,
      uptimePercent
    }
  }
  
  /**
   * إعادة تعيين الإحصائيات
   */
  resetStats() {
    this.stats = {
      lastCheck: new Date(),
      lastSuccess: null,
      lastError: null,
      successCount: 0,
      errorCount: 0,
      currentStatus: 'disconnected',
      errorDetails: null
    }
    console.log('🔄 تم إعادة تعيين إحصائيات الاتصال')
  }
  
  /**
   * تنفيذ استعلام مع ضمان الاتصال
   */
  async executeWithConnection<T>(operation: () => Promise<T>): Promise<T> {
    // التحقق من الاتصال أولاً
    const isConnected = await this.checkConnection()
    
    if (!isConnected) {
      // محاولة إعادة الاتصال
      console.log('⚠️ الاتصال مقطوع، محاولة إعادة الاتصال...')
      
      try {
        await prisma.$disconnect()
        await prisma.$connect()
        await this.checkConnection()
      } catch (error) {
        console.error('❌ فشلت إعادة الاتصال:', error)
        throw new Error('Database connection lost')
      }
    }
    
    // تنفيذ العملية مع retry
    return executeWithRetry(operation)
  }
}

// إنشاء instance واحد
export const dbConnectionManager = new DatabaseConnectionManager()

// بدء المراقبة في الإنتاج
if (process.env.NODE_ENV === 'production') {
  dbConnectionManager.startMonitoring()
}

// تنظيف عند إيقاف التطبيق
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    dbConnectionManager.stopMonitoring()
  })
} 
/**
 * Debounce utility لمنع الاستدعاءات المتكررة
 */

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle utility لتحديد معدل الاستدعاءات
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Rate Limiter class لمنع التكرار المفرط
 */
export class RateLimiter {
  private attempts: number = 0;
  private lastAttempt: number = 0;
  private readonly resetInterval: number;
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // دقيقة واحدة
  ) {
    this.resetInterval = windowMs;
  }
  
  canProceed(): boolean {
    const now = Date.now();
    
    // إعادة تعيين العداد إذا انتهت النافزة الزمنية
    if (now - this.lastAttempt > this.resetInterval) {
      this.attempts = 0;
    }
    
    if (this.attempts >= this.maxAttempts) {
      console.log(`🚫 Rate limit exceeded: ${this.attempts}/${this.maxAttempts}`);
      return false;
    }
    
    this.attempts++;
    this.lastAttempt = now;
    return true;
  }
  
  reset(): void {
    this.attempts = 0;
    this.lastAttempt = 0;
  }
  
  getStatus() {
    return {
      attempts: this.attempts,
      maxAttempts: this.maxAttempts,
      canProceed: this.canProceed(),
      timeToReset: Math.max(0, this.resetInterval - (Date.now() - this.lastAttempt))
    };
  }
}

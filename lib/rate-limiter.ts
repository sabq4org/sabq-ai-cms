import { NextRequest, NextResponse } from 'next/server';

// تخزين محاولات الوصول في الذاكرة
const attempts = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // نافذة زمنية بالميلي ثانية
  max: number; // عدد الطلبات المسموح بها
  message?: string; // رسالة الخطأ
  keyGenerator?: (req: NextRequest) => string; // دالة لتوليد مفتاح التعريف
}

export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs = 60 * 1000, // دقيقة واحدة افتراضياً
    max = 60, // 60 طلب في الدقيقة افتراضياً
    message = 'تم تجاوز عدد الطلبات المسموح به. حاول مرة أخرى لاحقاً.',
    keyGenerator = (req) => {
      // استخدام IP Address كمفتاح افتراضي
      return req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
    }
  } = options;

  return async function rateLimitMiddleware(
    req: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    const key = keyGenerator(req);
    const now = Date.now();
    
    // الحصول على بيانات المحاولات السابقة
    let attemptData = attempts.get(key);
    
    // إذا لم توجد بيانات أو انتهت النافذة الزمنية
    if (!attemptData || now > attemptData.resetTime) {
      attemptData = {
        count: 0,
        resetTime: now + windowMs
      };
    }
    
    // زيادة عدد المحاولات
    attemptData.count++;
    attempts.set(key, attemptData);
    
    // التنظيف الدوري للذاكرة
    if (attempts.size > 10000) {
      const cutoff = now;
      for (const [k, v] of attempts.entries()) {
        if (v.resetTime < cutoff) {
          attempts.delete(k);
        }
      }
    }
    
    // التحقق من تجاوز الحد المسموح
    if (attemptData.count > max) {
      const retryAfter = Math.ceil((attemptData.resetTime - now) / 1000);
      
      return NextResponse.json(
        { 
          error: message,
          retryAfter: retryAfter
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(attemptData.resetTime).toISOString()
          }
        }
      );
    }
    
    // تنفيذ الطلب وإضافة headers
    const response = await handler();
    
    response.headers.set('X-RateLimit-Limit', max.toString());
    response.headers.set('X-RateLimit-Remaining', (max - attemptData.count).toString());
    response.headers.set('X-RateLimit-Reset', new Date(attemptData.resetTime).toISOString());
    
    return response;
  };
}

// Rate limiters جاهزة للاستخدام
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 دقيقة
  max: 60, // 60 طلب في الدقيقة
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 محاولات تسجيل دخول
  message: 'تم تجاوز عدد محاولات تسجيل الدخول. حاول مرة أخرى بعد 15 دقيقة.'
});

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 20, // 20 رفع في الساعة
  message: 'تم تجاوز عدد الملفات المسموح برفعها. حاول مرة أخرى لاحقاً.'
});

import { rateLimit } from './rate-limiter';

// Rate limiter خاص بـ AI APIs
export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 دقيقة
  max: 10, // 10 طلبات في الدقيقة
  message: 'تم تجاوز عدد الطلبات المسموح به لخدمات الذكاء الاصطناعي. حاول مرة أخرى بعد دقيقة.'
});

// Rate limiter أقوى للخدمات المكلفة
export const aiEditorRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 20, // 20 طلب في الساعة
  message: 'تم تجاوز عدد الطلبات المسموح به للمحرر الذكي. حاول مرة أخرى لاحقاً.'
});

// Rate limiter للتحليل
export const aiAnalysisRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 دقائق
  max: 30, // 30 طلب كل 5 دقائق
  message: 'تم تجاوز عدد الطلبات المسموح به لخدمات التحليل. حاول مرة أخرى لاحقاً.'
});

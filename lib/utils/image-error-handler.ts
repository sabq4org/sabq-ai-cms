import fs from 'fs';
import path from 'path';

// مسار ملف السجل
const LOG_FILE = path.join(process.cwd(), 'logs', 'image-errors.log');

// تأكد من وجود مجلد logs
if (!fs.existsSync(path.dirname(LOG_FILE))) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

export function logImageError(url: string, error: any) {
  // لا تسجل في الإنتاج إلا إذا كان ضرورياً
  if (process.env.NODE_ENV === 'production' && !process.env.LOG_IMAGE_ERRORS) {
    return;
  }

  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} | ${url} | ${error?.message || error}\n`;

  try {
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (e) {
    // تجاهل أخطاء الكتابة
  }
}

// تنظيف السجلات القديمة (احتفظ بآخر 1000 سطر)
export function cleanupImageErrorLogs() {
  try {
    if (!fs.existsSync(LOG_FILE)) return;

    const content = fs.readFileSync(LOG_FILE, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length > 1000) {
      const recentLines = lines.slice(-1000);
      fs.writeFileSync(LOG_FILE, recentLines.join('\n') + '\n');
    }
  } catch (e) {
    // تجاهل الأخطاء
  }
}

// قائمة بالصور المعروفة بالفشل لتجنب محاولة تحميلها
const FAILED_IMAGES_CACHE = new Set<string>();
const MAX_CACHE_SIZE = 500;

export function isKnownFailedImage(url: string): boolean {
  return FAILED_IMAGES_CACHE.has(url);
}

export function markImageAsFailed(url: string) {
  // تنظيف الكاش إذا كان كبيراً
  if (FAILED_IMAGES_CACHE.size >= MAX_CACHE_SIZE) {
    const firstKey = FAILED_IMAGES_CACHE.values().next().value;
    if (firstKey) {
      FAILED_IMAGES_CACHE.delete(firstKey);
    }
  }
  
  FAILED_IMAGES_CACHE.add(url);
  logImageError(url, 'Marked as failed');
}

// دالة للتحقق من صحة URL الصورة قبل محاولة تحميلها
export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // تحقق من البروتوكول
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    return false;
  }
  
  // تحقق من الامتدادات المدعومة
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];
  const hasValidExtension = validExtensions.some(ext => 
    url.toLowerCase().includes(ext)
  );
  
  // السماح بـ URLs بدون امتداد (مثل Cloudinary)
  return hasValidExtension || url.includes('cloudinary') || url.includes('unsplash');
}

// دالة لإنشاء URL بديل للصور الفاشلة
export function getImageFallbackUrl(originalUrl: string, type?: string): string {
  // إذا كانت صورة avatar
  if (originalUrl.includes('avatar') || type === 'avatar') {
    return '/default-avatar.png';
  }
  
  // إذا كانت صورة مقال
  if (originalUrl.includes('article') || originalUrl.includes('featured') || type === 'article') {
    return '/images/placeholder-featured.jpg';
  }
  
  // افتراضي
  return '/images/placeholder.jpg';
} 
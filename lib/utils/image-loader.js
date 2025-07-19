// Custom Image Loader for Next.js
// يعالج أخطاء الصور بصمت ويستخدم fallbacks

const FAILED_IMAGES = new Set();
const MAX_RETRIES = 2;

export default function customImageLoader({ src, width, quality }) {
  // إذا كانت الصورة معروفة بالفشل، استخدم placeholder
  if (FAILED_IMAGES.has(src)) {
    return getPlaceholderUrl(src, width);
  }

  // صور محلية
  if (src.startsWith('/')) {
    return src;
  }

  // Cloudinary URLs
  if (src.includes('cloudinary.com')) {
    // تحقق من صحة URL
    if (src.includes('v1730000000')) {
      // هذا timestamp قديم، استخدم placeholder
      FAILED_IMAGES.add(src);
      return getPlaceholderUrl(src, width);
    }
    
    const params = [
      `w_${width}`,
      `q_${quality || 75}`,
      'f_auto',
      'c_limit',
    ].join(',');
    
    // أضف المعاملات لـ Cloudinary URL
    const parts = src.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/${params}/${parts[1]}`;
    }
  }

  // Unsplash URLs
  if (src.includes('unsplash.com')) {
    const url = new URL(src);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('q', (quality || 75).toString());
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'crop');
    return url.toString();
  }

  // URLs أخرى
  return src;
}

function getPlaceholderUrl(originalSrc, width) {
  // حدد نوع placeholder بناءً على السياق
  if (originalSrc.includes('avatar')) {
    return '/default-avatar.png';
  }
  if (originalSrc.includes('article') || originalSrc.includes('featured')) {
    return '/images/placeholder-featured.jpg';
  }
  return '/images/placeholder.jpg';
}

// وظيفة للتحقق من توفر الصورة (يمكن استخدامها في middleware)
export async function checkImageAvailability(url) {
  if (FAILED_IMAGES.has(url)) {
    return false;
  }

  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) {
      FAILED_IMAGES.add(url);
      return false;
    }
    return true;
  } catch (error) {
    FAILED_IMAGES.add(url);
    return false;
  }
} 
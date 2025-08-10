import { useState, useEffect, useCallback } from 'react';
import { isKnownFailedImage, markImageAsFailed, getImageFallbackUrl } from '@/lib/utils/image-error-handler';

interface UseSmartImageOptions {
  fallbackType?: 'avatar' | 'article' | 'general';
  retryCount?: number;
  checkAvailability?: boolean;
}

export function useSmartImage(
  src: string | undefined | null,
  options: UseSmartImageOptions = {}
) {
  const { fallbackType = 'general', retryCount = 1, checkAvailability = false } = options;
  
  const [imageSrc, setImageSrc] = useState<string>(() => {
    if (!src) return getImageFallbackUrl('', fallbackType);
    if (isKnownFailedImage(src)) return getImageFallbackUrl(src, fallbackType);
    return src;
  });
  
  const [isLoading, setIsLoading] = useState(checkAvailability);
  const [hasError, setHasError] = useState(false);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    if (!src) {
      setImageSrc(getImageFallbackUrl('', fallbackType));
      return;
    }

    if (isKnownFailedImage(src)) {
      setImageSrc(getImageFallbackUrl(src, fallbackType));
      return;
    }

    // تحقق من توفر الصورة إذا طُلب ذلك
    if (checkAvailability && src !== imageSrc) {
      setIsLoading(true);
      // حماية من التنفيذ في بيئة السيرفر حيث Image غير معرف
      if (typeof window === 'undefined') {
        // في SSR نتخطى الفحص ونُرجع المصدر كما هو لتجنب كسر البناء
        setImageSrc(src);
        setIsLoading(false);
        return;
      }
      const img = new window.Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoading(false);
        setHasError(false);
      };
      
      img.onerror = () => {
        markImageAsFailed(src);
        setImageSrc(getImageFallbackUrl(src, fallbackType));
        setIsLoading(false);
        setHasError(true);
      };
      
      img.src = src;
    } else {
      setImageSrc(src);
    }
  }, [src, fallbackType, checkAvailability]);

  const handleError = useCallback(() => {
    if (!src) return;

    // محاولة إعادة التحميل
    if (retries < retryCount) {
      setRetries(prev => prev + 1);
      const separator = src.includes('?') ? '&' : '?';
      setImageSrc(`${src}${separator}retry=${Date.now()}`);
      return;
    }

    // وضع علامة على الصورة كفاشلة واستخدام fallback
    markImageAsFailed(src);
    setImageSrc(getImageFallbackUrl(src, fallbackType));
    setHasError(true);
  }, [src, retries, retryCount, fallbackType]);

  const reset = useCallback(() => {
    if (src) {
      setRetries(0);
      setHasError(false);
      setImageSrc(src);
    }
  }, [src]);

  return {
    src: imageSrc,
    isLoading,
    hasError,
    onError: handleError,
    reset,
  };
} 
/**
 * معالج أخطاء المقالات
 * يوفر رسائل خطأ واضحة ومعلومات تشخيصية
 */

export interface ArticleError {
  code: string;
  message: string;
  details?: string;
  articleId?: string;
}

export const ARTICLE_ERROR_CODES = {
  NOT_FOUND: 'ARTICLE_NOT_FOUND',
  NOT_PUBLISHED: 'ARTICLE_NOT_PUBLISHED',
  FETCH_TIMEOUT: 'FETCH_TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  INVALID_DATA: 'INVALID_DATA',
  UNKNOWN: 'UNKNOWN_ERROR'
} as const;

export const ARTICLE_ERROR_MESSAGES: Record<string, string> = {
  [ARTICLE_ERROR_CODES.NOT_FOUND]: 'المقال غير موجود',
  [ARTICLE_ERROR_CODES.NOT_PUBLISHED]: 'المقال غير منشور',
  [ARTICLE_ERROR_CODES.FETCH_TIMEOUT]: 'انتهت مهلة الانتظار',
  [ARTICLE_ERROR_CODES.NETWORK_ERROR]: 'خطأ في الاتصال بالخادم',
  [ARTICLE_ERROR_CODES.SERVER_ERROR]: 'خطأ في الخادم',
  [ARTICLE_ERROR_CODES.INVALID_DATA]: 'البيانات المستلمة غير صالحة',
  [ARTICLE_ERROR_CODES.UNKNOWN]: 'حدث خطأ غير متوقع'
};

export function getArticleError(
  status: number | null,
  data?: any,
  error?: any,
  articleId?: string
): ArticleError {
  // حالات الخطأ المختلفة
  if (error?.name === 'AbortError') {
    return {
      code: ARTICLE_ERROR_CODES.FETCH_TIMEOUT,
      message: ARTICLE_ERROR_MESSAGES[ARTICLE_ERROR_CODES.FETCH_TIMEOUT],
      details: 'يرجى إعادة تحميل الصفحة',
      articleId
    };
  }

  if (!status) {
    return {
      code: ARTICLE_ERROR_CODES.NETWORK_ERROR,
      message: ARTICLE_ERROR_MESSAGES[ARTICLE_ERROR_CODES.NETWORK_ERROR],
      details: 'تحقق من اتصالك بالإنترنت',
      articleId
    };
  }

  if (status === 404) {
    return {
      code: ARTICLE_ERROR_CODES.NOT_FOUND,
      message: ARTICLE_ERROR_MESSAGES[ARTICLE_ERROR_CODES.NOT_FOUND],
      details: 'تأكد من صحة الرابط',
      articleId
    };
  }

  if (status === 403 || (data && data.error === 'غير منشور')) {
    return {
      code: ARTICLE_ERROR_CODES.NOT_PUBLISHED,
      message: ARTICLE_ERROR_MESSAGES[ARTICLE_ERROR_CODES.NOT_PUBLISHED],
      details: 'المقال قيد المراجعة أو تم إلغاء نشره',
      articleId
    };
  }

  if (status >= 500) {
    return {
      code: ARTICLE_ERROR_CODES.SERVER_ERROR,
      message: ARTICLE_ERROR_MESSAGES[ARTICLE_ERROR_CODES.SERVER_ERROR],
      details: 'يرجى المحاولة لاحقاً',
      articleId
    };
  }

  if (data && (data.success === false || !data.id)) {
    return {
      code: ARTICLE_ERROR_CODES.INVALID_DATA,
      message: ARTICLE_ERROR_MESSAGES[ARTICLE_ERROR_CODES.INVALID_DATA],
      details: 'البيانات المستلمة من الخادم غير مكتملة',
      articleId
    };
  }

  return {
    code: ARTICLE_ERROR_CODES.UNKNOWN,
    message: ARTICLE_ERROR_MESSAGES[ARTICLE_ERROR_CODES.UNKNOWN],
    details: error?.message || 'يرجى المحاولة لاحقاً',
    articleId
  };
}

/**
 * تسجيل خطأ المقال للتشخيص
 */
export function logArticleError(error: ArticleError): void {
  console.error('❌ خطأ في المقال:', {
    ...error,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'N/A'
  });
}

/**
 * تحقق من صلاحية معرف المقال
 */
export function isValidArticleId(id: string): boolean {
  // التحقق من معرف قديم (UUID أو رقمي)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const numericPattern = /^\d+$/;
  
  // التحقق من معرف جديد بصيغة article_timestamp_random
  const newIdPattern = /^article_\d+_[a-z0-9]+$/;
  
  // التحقق من slug
  const slugPattern = /^[a-z0-9-]+$/;
  
  return uuidPattern.test(id) || 
         numericPattern.test(id) || 
         newIdPattern.test(id) || 
         slugPattern.test(id);
}
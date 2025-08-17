/**
 * دالة مساعدة للحصول على Authorization headers للطلبات
 */
export function getAuthHeaders(): HeadersInit {
  // محاولة الحصول على التوكن من الكوكيز
  const cookies = document.cookie.split('; ');
  
  // البحث عن التوكن في مختلف أسماء الكوكيز المحتملة
  const tokenNames = ['sabq_at', 'auth-token', 'access_token', 'token', 'jwt'];
  let token = '';
  
  for (const name of tokenNames) {
    const cookie = cookies.find(row => row.startsWith(`${name}=`));
    if (cookie) {
      token = cookie.split('=')[1];
      break;
    }
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * دالة مساعدة للحصول على خيارات الطلب مع المصادقة
 */
export function getAuthFetchOptions(options: RequestInit = {}): RequestInit {
  return {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    },
    credentials: 'include' as RequestCredentials
  };
}

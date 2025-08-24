/**
 * دالة مساعدة للحصول على Authorization headers للطلبات
 */
export function getAuthHeaders(): HeadersInit {
  if (typeof document === 'undefined') {
    // في Server-side rendering، لا يمكن قراءة الكوكيز من document
    return {
      'Content-Type': 'application/json',
    };
  }

  // محاولة الحصول على التوكن من الكوكيز
  const cookies = document.cookie.split('; ');
  
  // البحث عن التوكن في مختلف أسماء الكوكيز المحتملة (تطابق cookieAuth.ts)
  const tokenNames = [
    '__Host-sabq-access-token',  // النظام الجديد - الإنتاج
    'sabq-access-token',         // النظام الجديد - التطوير
    'auth-token',                // النظام الحالي المستخدم
    'sabq_at',                   // النظام الموحد القديم
    'access_token',              // Fallback عام
    'token',                     // Fallback عام
    'jwt'                        // Fallback عام
  ];
  let token = '';
  let tokenSource = '';
  
  for (const name of tokenNames) {
    const cookie = cookies.find(row => row.startsWith(`${name}=`));
    if (cookie) {
      token = cookie.split('=')[1];
      tokenSource = name;
      break;
    }
  }

  // Fallback: محاولة من localStorage (واجهات الإدارة فقط)
  try {
    if (!token && typeof window !== 'undefined') {
      const lsToken = localStorage.getItem('auth-token');
      if (lsToken) {
        token = lsToken;
        tokenSource = 'localStorage';
      }
    }
  } catch {}
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log(`🔑 [auth-headers] تم العثور على التوكن في: ${tokenSource}`);
  } else {
    console.log('❌ [auth-headers] لم يتم العثور على التوكن في الكوكيز أو localStorage');
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

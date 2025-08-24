'use client';

/**
 * صفحة اختبار إصلاح المصادقة
 * تساعد في تشخيص مشكلة عدم تحديث حالة المصادقة من الكوكيز
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserFromCookies, hasAuthCookie, getTokenFromCookies } from '@/lib/cookieAuth';
import { getAccessToken } from '@/lib/authClient';
import { getAuthHeaders } from '@/lib/utils/auth-headers';

export default function AuthTestPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const [cookieInfo, setCookieInfo] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const checkAuth = () => {
      // فحص الكوكيز مباشرة
      const cookieResult = getUserFromCookies();
      setCookieInfo(cookieResult);

      // جمع معلومات التشخيص
      const debug = {
        hasAuthCookie: hasAuthCookie(),
        tokenFromCookies: getTokenFromCookies() ? 'موجود' : 'غير موجود',
        tokenInMemory: getAccessToken() ? 'موجود' : 'غير موجود',
        documentCookies: typeof document !== 'undefined' ? document.cookie : 'N/A',
        authHeaders: getAuthHeaders(),
        timestamp: new Date().toISOString()
      };

      setDebugInfo(debug);
      console.log('🔍 [AuthTest] معلومات التشخيص:', debug);
    };

    checkAuth();

    // إعادة فحص كل 5 ثواني
    const interval = setInterval(checkAuth, 5000);

    return () => clearInterval(interval);
  }, []);

  const testAuthFlow = () => {
    console.log('🧪 [AuthTest] اختبار تدفق المصادقة...');
    
    // إعادة فحص الحالة
    const cookieResult = getUserFromCookies();
    console.log('🍪 نتيجة قراءة الكوكيز:', cookieResult);
    
    // فحص حالة useAuth
    console.log('👤 حالة useAuth:', { user, isLoggedIn, loading });
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      direction: 'rtl',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>🔧 صفحة اختبار إصلاح المصادقة</h1>
      
      <button 
        onClick={testAuthFlow}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        🧪 اختبار تدفق المصادقة
      </button>

      <div style={{ display: 'grid', gap: '20px' }}>
        <section style={{ 
          border: '1px solid #ddd', 
          padding: '15px', 
          borderRadius: '8px',
          backgroundColor: isLoggedIn ? '#d4edda' : '#f8d7da'
        }}>
          <h2>📊 حالة useAuth</h2>
          <ul>
            <li><strong>مسجل الدخول:</strong> {isLoggedIn ? '✅ نعم' : '❌ لا'}</li>
            <li><strong>جاري التحميل:</strong> {loading ? '⏳ نعم' : '✅ لا'}</li>
            <li><strong>المستخدم:</strong> {user ? `${user.email} (${user.id})` : 'غير محدد'}</li>
          </ul>
        </section>

        <section style={{ 
          border: '1px solid #ddd', 
          padding: '15px', 
          borderRadius: '8px',
          backgroundColor: cookieInfo?.user ? '#d4edda' : '#f8d7da'
        }}>
          <h2>🍪 معلومات الكوكيز</h2>
          {cookieInfo ? (
            <ul>
              <li><strong>المستخدم من الكوكيز:</strong> {cookieInfo.user ? `${cookieInfo.user.email} (${cookieInfo.user.id})` : 'غير موجود'}</li>
              <li><strong>التوكن:</strong> {cookieInfo.token ? '✅ موجود' : '❌ غير موجود'}</li>
            </ul>
          ) : (
            <p>⏳ جاري تحميل معلومات الكوكيز...</p>
          )}
        </section>

        <section style={{ 
          border: '1px solid #ddd', 
          padding: '15px', 
          borderRadius: '8px' 
        }}>
          <h2>🔍 معلومات التشخيص</h2>
          <ul>
            <li><strong>يوجد كوكي مصادقة:</strong> {debugInfo.hasAuthCookie ? '✅ نعم' : '❌ لا'}</li>
            <li><strong>توكن من الكوكيز:</strong> {debugInfo.tokenFromCookies}</li>
            <li><strong>توكن في الذاكرة:</strong> {debugInfo.tokenInMemory}</li>
            <li><strong>Authorization Header:</strong> {debugInfo.authHeaders?.Authorization ? '✅ موجود' : '❌ غير موجود'}</li>
          </ul>
        </section>

        <section style={{ 
          border: '1px solid #ddd', 
          padding: '15px', 
          borderRadius: '8px' 
        }}>
          <h2>🔧 الكوكيز الخام</h2>
          <pre style={{ 
            background: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '4px',
            whiteSpace: 'pre-wrap',
            fontSize: '12px'
          }}>
            {debugInfo.documentCookies || 'لا توجد كوكيز'}
          </pre>
        </section>
      </div>

      <footer style={{ 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#6c757d'
      }}>
        آخر تحديث: {debugInfo.timestamp}<br />
        هذه الصفحة للاختبار فقط - احذفها بعد إصلاح المشكلة
      </footer>
    </div>
  );
}
'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { getAccessToken } from '@/lib/authClient';

export default function AuthMonitor() {
  // تأكد من وجود AuthContext قبل استخدام hook
  let user, loading, error, isLoggedIn;
  
  try {
    const auth = useAuth();
    user = auth.user;
    loading = auth.loading;
    error = auth.error;
    isLoggedIn = auth.isLoggedIn;
  } catch (e) {
    // إذا لم يكن هناك AuthProvider، تجاهل
    console.log('🔍 [AuthMonitor] AuthProvider غير متاح في هذا المكون');
    return null;
  }
  
  const previousStateRef = useRef<any>({});
  const changeCountRef = useRef(0);

  useEffect(() => {
    const currentState = {
      user: user ? { id: user.id, email: user.email, name: user.name } : null,
      loading,
      error,
      isLoggedIn,
      memoryToken: getAccessToken() ? 'present' : 'missing',
      timestamp: new Date().toISOString()
    };

    // فقط إذا تغيرت الحالة
    const hasChanged = JSON.stringify(currentState) !== JSON.stringify(previousStateRef.current);
    
    if (hasChanged) {
      changeCountRef.current++;
      
      console.log(`🔍 [AuthMonitor] تغيير في حالة المصادقة #${changeCountRef.current}:`, {
        previous: previousStateRef.current,
        current: currentState,
        changes: Object.keys(currentState).filter(key => 
          JSON.stringify(currentState[key as keyof typeof currentState]) !== 
          JSON.stringify(previousStateRef.current[key])
        )
      });

      // فحص خاص: إذا المستخدم اختفى فجأة
      if (previousStateRef.current.user && !currentState.user && !loading) {
        console.warn('🚨 [AuthMonitor] تحذير: المستخدم اختفى من الحالة!', {
          previousUser: previousStateRef.current.user,
          currentLoading: loading,
          currentError: error,
          memoryToken: currentState.memoryToken
        });

        // فحص الكوكيز
        if (typeof document !== 'undefined') {
          const cookies = document.cookie;
          const hasAuthCookies = [
            'sabq-access-token',
            '__Host-sabq-access-token', 
            'sabq_rft',
            'sabq-user-session'
          ].some(name => cookies.includes(name + '='));

          console.log('🍪 [AuthMonitor] حالة الكوكيز عند اختفاء المستخدم:', {
            hasAuthCookies,
            allCookies: cookies.split(';').map(c => c.split('=')[0].trim()).filter(name => name.includes('sabq') || name.includes('auth'))
          });
        }
      }

      // فحص خاص: إذا ظهر زر تسجيل الدخول
      if (!currentState.isLoggedIn && previousStateRef.current.isLoggedIn) {
        console.warn('🚨 [AuthMonitor] تحذير: حالة تسجيل الدخول تغيرت إلى false!', {
          previousState: previousStateRef.current,
          currentState
        });
      }

      previousStateRef.current = currentState;
    }
  }, [user, loading, error, isLoggedIn]);

  // مراقبة الأحداث العامة
  useEffect(() => {
    const handleAuthEvent = (event: Event) => {
      console.log('🎯 [AuthMonitor] حدث مصادقة:', event.type, (event as CustomEvent).detail);
    };

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key?.includes('auth') || event.key?.includes('user')) {
        console.log('💾 [AuthMonitor] تغيير localStorage:', event.key, event.newValue ? 'set' : 'removed');
      }
    };

    const events = ['auth-change', 'token-refreshed', 'session-expired', 'session-cleared'];
    events.forEach(eventName => {
      window.addEventListener(eventName, handleAuthEvent);
    });

    window.addEventListener('storage', handleStorageEvent);

    return () => {
      events.forEach(eventName => {
        window.removeEventListener(eventName, handleAuthEvent);
      });
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  return null; // مكون غير مرئي
}

'use client';

import { useAuth } from "@/contexts/EnhancedAuthContextWithSSR";
import { getAccessToken } from "@/lib/authClient";
import { useEffect, useState } from "react";

interface AuthDebugState {
  contextUser: any;
  contextLoading: boolean;
  contextError: any;
  memoryToken: string | null;
  cookieUser: any;
  renderCount: number;
  lastUpdate: string;
}

export default function AuthStateDebugger({ enabled = false }: { enabled?: boolean }) {
  const { user, loading, error } = useAuth();
  const [debugState, setDebugState] = useState<AuthDebugState>({
    contextUser: null,
    contextLoading: true,
    contextError: null,
    memoryToken: null,
    cookieUser: null,
    renderCount: 0,
    lastUpdate: new Date().toISOString()
  });

  useEffect(() => {
    if (!enabled) return;

    const updateDebugState = () => {
      // قراءة التوكن من الذاكرة
      const memoryToken = getAccessToken();
      
      // قراءة المستخدم من الكوكيز
      let cookieUser = null;
      try {
        const userCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('sabq-user-session=') || row.startsWith('user='));
        
        if (userCookie) {
          const value = userCookie.split('=')[1];
          cookieUser = JSON.parse(decodeURIComponent(value));
        }
      } catch (e) {
        // تجاهل أخطاء parsing
      }

      setDebugState(prev => ({
        contextUser: user,
        contextLoading: loading,
        contextError: error,
        memoryToken: memoryToken ? memoryToken.substring(0, 20) + '...' : null,
        cookieUser,
        renderCount: prev.renderCount + 1,
        lastUpdate: new Date().toISOString()
      }));

      console.log('🔍 [AuthDebugger] حالة المصادقة:', {
        contextUser: user ? { id: user.id, email: user.email } : null,
        contextLoading: loading,
        contextError: error,
        memoryToken: memoryToken ? 'موجود' : 'مفقود',
        cookieUser: cookieUser ? { id: cookieUser.id, email: cookieUser.email } : null,
        timestamp: new Date().toISOString()
      });
    };

    updateDebugState();

    // راقب تغيرات DOM للكوكيز
    const observer = new MutationObserver(updateDebugState);
    observer.observe(document, { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ['data-user'] 
    });

    // راقب أحداث المصادقة
    const handleAuthChange = () => {
      setTimeout(updateDebugState, 100);
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('token-refreshed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('token-refreshed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [user, loading, error, enabled]);

  if (!enabled) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 z-[9999] bg-gray-900 text-white p-4 rounded-lg shadow-lg text-xs max-w-sm"
      style={{ fontFamily: 'monospace' }}
    >
      <div className="mb-2 font-bold text-green-400">
        🔍 Auth Debug (Render #{debugState.renderCount})
      </div>
      
      <div className="space-y-1">
        <div>
          <span className="text-yellow-400">Context User:</span>{' '}
          {debugState.contextUser ? (
            <span className="text-green-400">
              {debugState.contextUser.email} ({debugState.contextUser.id})
            </span>
          ) : (
            <span className="text-red-400">null</span>
          )}
        </div>
        
        <div>
          <span className="text-yellow-400">Loading:</span>{' '}
          <span className={debugState.contextLoading ? 'text-orange-400' : 'text-green-400'}>
            {debugState.contextLoading ? 'true' : 'false'}
          </span>
        </div>
        
        {debugState.contextError && (
          <div>
            <span className="text-yellow-400">Error:</span>{' '}
            <span className="text-red-400">{debugState.contextError}</span>
          </div>
        )}
        
        <div>
          <span className="text-yellow-400">Memory Token:</span>{' '}
          <span className={debugState.memoryToken ? 'text-green-400' : 'text-red-400'}>
            {debugState.memoryToken || 'null'}
          </span>
        </div>
        
        <div>
          <span className="text-yellow-400">Cookie User:</span>{' '}
          {debugState.cookieUser ? (
            <span className="text-green-400">
              {debugState.cookieUser.email}
            </span>
          ) : (
            <span className="text-red-400">null</span>
          )}
        </div>
        
        <div className="text-gray-400 text-[10px] mt-2">
          Last: {new Date(debugState.lastUpdate).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

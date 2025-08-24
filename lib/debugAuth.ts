/**
 * Debug helpers for authentication system
 * Safe for production - provides debugging tools for auth issues
 */

// Helper to get cookie value
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  
  return null;
}

// Helper to mask tokens for logging (show first 6 and last 4 chars)
function maskToken(token: string | null): string {
  if (!token) return 'null';
  if (token.length <= 10) return '***masked***';
  
  return token.substring(0, 6) + '...' + token.substring(token.length - 4);
}

// Helper to get memory token (accessing global if available)
function getMemoryToken(): string | null {
  // Try to access from authClient if available
  try {
    // @ts-ignore - accessing global auth client state
    if (typeof window !== 'undefined' && (window as any)._sabq_auth_state) {
      return (window as any)._sabq_auth_state.accessToken || null;
    }
  } catch (e) {
    // Silent fail
  }
  return null;
}

/**
 * Debug helper: Triggers a manual token refresh with full logging
 */
export async function debugRefresh(): Promise<{success: boolean; details: any}> {
  console.log('🔍 [DEBUG] Starting manual token refresh...');
  
  try {
    // Check available cookies before refresh
    const beforeCookies = {
      'sabq_rft': getCookieValue('sabq_rft'),
      '__Host-sabq-refresh': getCookieValue('__Host-sabq-refresh'),
      '__Host-sabq-access-token': getCookieValue('__Host-sabq-access-token'),
      'sabq-csrf-token': getCookieValue('sabq-csrf-token')
    };
    
    console.log('🍪 [DEBUG] Cookies before refresh:', {
      'sabq_rft': maskToken(beforeCookies['sabq_rft']),
      '__Host-sabq-refresh': maskToken(beforeCookies['__Host-sabq-refresh']),
      '__Host-sabq-access-token': maskToken(beforeCookies['__Host-sabq-access-token']),
      'sabq-csrf-token': beforeCookies['sabq-csrf-token'] ? '✓ present' : '✗ missing'
    });

    // Prepare headers
    const headers: any = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };

    // Add CSRF token if available
    const csrfToken = beforeCookies['sabq-csrf-token'];
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    console.log('📤 [DEBUG] Sending refresh request with credentials: include');

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Ensure cookies are sent
      headers
    });

    console.log('📥 [DEBUG] Refresh response status:', response.status);
    console.log('📥 [DEBUG] Refresh response headers:');
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${key.toLowerCase().includes('cookie') ? maskToken(value) : value}`);
    });

    const responseText = await response.text();
    let responseData: any;

    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { rawText: responseText };
    }

    console.log('📥 [DEBUG] Refresh response body:', {
      ...responseData,
      accessToken: responseData.accessToken ? maskToken(responseData.accessToken) : undefined
    });

    if (!response.ok) {
      console.error('❌ [DEBUG] Refresh failed with status:', response.status);
      return {
        success: false,
        details: {
          status: response.status,
          statusText: response.statusText,
          response: responseData,
          beforeCookies: {
            'sabq_rft': maskToken(beforeCookies['sabq_rft']),
            '__Host-sabq-refresh': maskToken(beforeCookies['__Host-sabq-refresh']),
            '__Host-sabq-access-token': maskToken(beforeCookies['__Host-sabq-access-token']),
            'sabq-csrf-token': beforeCookies['sabq-csrf-token'] ? '✓ present' : '✗ missing'
          }
        }
      };
    }

    console.log('✅ [DEBUG] Refresh successful');

    return {
      success: true,
      details: {
        status: response.status,
        response: {
          ...responseData,
          accessToken: responseData.accessToken ? maskToken(responseData.accessToken) : undefined
        }
      }
    };

  } catch (error) {
    console.error('❌ [DEBUG] Refresh error:', error);
    return {
      success: false,
      details: {
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

/**
 * Debug helper: Shows current auth state (memory vs cookies)
 */
export function debugAuthState(): void {
  console.log('🔍 [DEBUG] Current auth state analysis:');

  // Memory token
  const memoryToken = getMemoryToken();
  console.log('🧠 Memory token:', maskToken(memoryToken));

  // Cookie tokens
  const cookieTokens = {
    '__Host-sabq-access-token': getCookieValue('__Host-sabq-access-token'),
    'sabq_at': getCookieValue('sabq_at'),
    '__Host-sabq-refresh': getCookieValue('__Host-sabq-refresh'),
    'sabq_rft': getCookieValue('sabq_rft'),
    'sabq-csrf-token': getCookieValue('sabq-csrf-token')
  };

  console.log('🍪 Cookie tokens:');
  Object.entries(cookieTokens).forEach(([name, value]) => {
    console.log(`  ${name}: ${name.includes('csrf') ? (value ? '✓ present' : '✗ missing') : maskToken(value)}`);
  });

  // Document cookie raw (for debugging)
  if (typeof document !== 'undefined') {
    const allCookies = document.cookie;
    console.log('📋 All cookies available:', allCookies ? 'Yes' : 'None');
    const cookieNames = allCookies.split(';').map(c => c.split('=')[0].trim()).filter(Boolean);
    console.log('📋 Cookie names:', cookieNames);
  }

  // Last auth event (if available)
  try {
    if (typeof window !== 'undefined' && (window as any)._sabq_last_auth_event) {
      console.log('📅 Last auth event:', (window as any)._sabq_last_auth_event);
    }
  } catch (e) {
    // Silent fail
  }
}

/**
 * Debug helper: Compares memory token vs cookie token
 */
export function compareTokens(): void {
  console.log('🔍 [DEBUG] Token comparison:');

  const memoryToken = getMemoryToken();
  const hostCookieToken = getCookieValue('__Host-sabq-access-token');
  const legacyCookieToken = getCookieValue('sabq_at');

  console.log('Tokens found:');
  console.log('  Memory:', maskToken(memoryToken));
  console.log('  __Host-sabq-access-token:', maskToken(hostCookieToken));
  console.log('  sabq_at (legacy):', maskToken(legacyCookieToken));

  // Basic comparison (first 10 chars)
  if (memoryToken && hostCookieToken) {
    const memoryPrefix = memoryToken.substring(0, 10);
    const cookiePrefix = hostCookieToken.substring(0, 10);
    console.log('Memory vs __Host- cookie match:', memoryPrefix === cookiePrefix ? '✅ Match' : '❌ Different');
  }

  if (memoryToken && legacyCookieToken) {
    const memoryPrefix = memoryToken.substring(0, 10);
    const legacyPrefix = legacyCookieToken.substring(0, 10);
    console.log('Memory vs legacy cookie match:', memoryPrefix === legacyPrefix ? '✅ Match' : '❌ Different');
  }

  if (hostCookieToken && legacyCookieToken) {
    const hostPrefix = hostCookieToken.substring(0, 10);
    const legacyPrefix = legacyCookieToken.substring(0, 10);
    console.log('__Host- vs legacy cookie match:', hostPrefix === legacyPrefix ? '✅ Match' : '❌ Different');
  }

  // Token expiration check (if possible)
  [memoryToken, hostCookieToken, legacyCookieToken].forEach((token, index) => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000;
        const now = Date.now();
        const timeLeft = exp - now;
        const location = ['Memory', '__Host-cookie', 'Legacy cookie'][index];
        
        if (timeLeft > 0) {
          console.log(`⏰ ${location} expires in: ${Math.round(timeLeft / 1000 / 60)} minutes`);
        } else {
          console.log(`⏰ ${location}: ❌ EXPIRED (${Math.round(Math.abs(timeLeft) / 1000 / 60)} minutes ago)`);
        }
      } catch (e) {
        // Silent fail for malformed tokens
      }
    }
  });
}

// Attach to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).debugAuth = {
    debugRefresh,
    debugAuthState,
    compareTokens
  };

  // Log availability
  console.log('🔧 Debug helpers available at window.debugAuth');
}

// Export for programmatic use
export default {
  debugRefresh,
  debugAuthState,
  compareTokens
};
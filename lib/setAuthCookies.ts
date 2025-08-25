/**
 * نظام setAuthCookies المحسّن - ديناميكي وآمن
 * يحل مشكلة hardcoded domains ويطبق قواعد __Host- بشكل صحيح
 */

import { serialize } from 'cookie'
import type { NextRequest } from 'next/server'
import { isFirefox, debugCookieIssues } from './firefox-cookie-helper'

const MAX_AGE = 60 * 60 * 24 * 7 // أسبوع واحد

/**
 * استخراج الدومين الجذر من Host header - مبسط لـ sabq.io فقط
 */
function rootDomainFromHost(host?: string | null): string | undefined {
  if (!host) return undefined
  
  // تنظيف Host من port إذا وُجد
  const cleanHost = host.split(':')[0].toLowerCase()
  
  // للـ localhost - لا نحتاج domain
  if (cleanHost === 'localhost' || cleanHost === '127.0.0.1') {
    return undefined
  }
  
  // للدومين الوحيد المستخدم - sabq.io
  if (cleanHost.endsWith('.sabq.io') || cleanHost === 'sabq.io') {
    return '.sabq.io' // يدعم جميع subdomains لـ sabq.io
  }
  
  // fallback للتطوير أو دومينات غير معروفة - بدون domain (host-only)
  return undefined
}

/**
 * تحديد ما إذا كانت البيئة تدعم __Host- cookies
 */
function supportsHostCookies(req?: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'production') return false
  
  // __Host- cookies تحتاج HTTPS
  const protocol = req?.headers.get('x-forwarded-proto') || 
                   req?.url?.startsWith('https:') ? 'https' : 'http'
  
  if (protocol !== 'https') return false
  
  // تجنب __Host- في Firefox لتفادي مشاكل التوافق
  const userAgent = req?.headers.get('user-agent') || ''
  if (isFirefox(userAgent)) {
    console.log('🦊 Firefox detected - avoiding __Host- prefix for better compatibility')
    return false
  }
  
  return true
}

/**
 * تعيين كوكيز المصادقة بشكل ديناميكي وآمن
 */
export function setAuthCookies(
  req: NextRequest,
  tokens: {
    accessToken: string
    refreshToken: string
    csrfToken?: string
  },
  options: {
    rememberMe?: boolean
    maxAge?: number
  } = {}
): string[] {
  const host = req.headers.get('host')
  const rootDomain = rootDomainFromHost(host)
  const useHostCookies = supportsHostCookies(req)
  const maxAge = options.maxAge || (options.rememberMe ? MAX_AGE * 8 : MAX_AGE)
  
  console.log('🍪 تعيين كوكيز المصادقة الديناميكية...')
  console.log(`  - Host: ${host}`)
  console.log(`  - Root Domain: ${rootDomain || 'undefined (host-only)'}`)
  console.log(`  - __Host- Support: ${useHostCookies}`)
  console.log(`  - Max Age: ${maxAge} seconds`)
  
  // تشخيص مشاكل Firefox
  if (req) {
    const cookieDebug = debugCookieIssues(req)
    if (cookieDebug.browser === 'Firefox' && cookieDebug.possibleIssues.length > 0) {
      console.log('🦊 تحذيرات Firefox:', cookieDebug.possibleIssues)
    }
  }
  
  const cookies: string[] = []
  
  // 1. Access Token
  const accessTokenName = useHostCookies ? '__Host-sabq-access-token' : 'sabq-access-token'
  const accessTokenConfig = {
    httpOnly: true,
    secure: useHostCookies,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24, // 24 ساعة للـ access token
    ...(rootDomain && !useHostCookies && { domain: rootDomain }) // ❌ لا domain مع __Host-
  }
  
  cookies.push(serialize(accessTokenName, tokens.accessToken, accessTokenConfig))
  console.log(`  ✅ ${accessTokenName} - ${useHostCookies ? 'بدون Domain (آمن)' : `Domain: ${rootDomain}`}`)
  
  // 2. Refresh Token (كوكي عادي دائماً لمرونة أكبر)
  const refreshTokenConfig = {
    httpOnly: true,
    secure: useHostCookies,
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
    ...(rootDomain && { domain: rootDomain }) // ✅ مسموح للكوكيز العادية
  }
  
  cookies.push(serialize('sabq-refresh-token', tokens.refreshToken, refreshTokenConfig))
  console.log(`  ✅ sabq-refresh-token - Domain: ${rootDomain || 'host-only'}`)
  
  // 3. CSRF Token (يحتاج JavaScript access)
  if (tokens.csrfToken) {
    const csrfConfig = {
      httpOnly: false, // يحتاج للقراءة من JavaScript
      secure: useHostCookies,
      sameSite: 'lax' as const,
      path: '/',
      maxAge,
      ...(rootDomain && { domain: rootDomain })
    }
    
    cookies.push(serialize('sabq-csrf-token', tokens.csrfToken, csrfConfig))
    console.log(`  ✅ sabq-csrf-token - Domain: ${rootDomain || 'host-only'}`)
  }
  
  return cookies
}

/**
 * مسح كوكيز المصادقة
 */
export function clearAuthCookies(req: NextRequest): string[] {
  const host = req.headers.get('host')
  const rootDomain = rootDomainFromHost(host)
  const useHostCookies = supportsHostCookies(req)
  
  console.log('🧹 مسح كوكيز المصادقة...')
  
  const cookies: string[] = []
  const cookiesToClear = [
    useHostCookies ? '__Host-sabq-access-token' : 'sabq-access-token',
    'sabq-refresh-token',
    'sabq-csrf-token',
    // Legacy cookies للتنظيف
    'sabq_at', 'sabq_rt', 'access_token', 'refresh_token'
  ]
  
  cookiesToClear.forEach(name => {
    // مسح بدون domain
    cookies.push(serialize(name, '', {
      httpOnly: !name.includes('csrf'), // CSRF يحتاج JavaScript access
      secure: useHostCookies,
      sameSite: 'lax' as const,
      path: '/',
      expires: new Date(0),
      maxAge: 0
    }))
    
    // مسح مع domain إذا وُجد (للكوكيز غير __Host-)
    if (rootDomain && !name.startsWith('__Host-')) {
      cookies.push(serialize(name, '', {
        httpOnly: !name.includes('csrf'),
        secure: useHostCookies,
        sameSite: 'lax' as const,
        path: '/',
        domain: rootDomain,
        expires: new Date(0),
        maxAge: 0
      }))
    }
  })
  
  console.log(`  🧹 تم مسح ${cookiesToClear.length} كوكي`)
  return cookies
}

/**
 * توليد CSRF Token آمن
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback للبيئات القديمة
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * قراءة كوكي معين من الطلب
 */
export function getCookieFromRequest(req: NextRequest, name: string): string | null {
  return req.cookies.get(name)?.value || null
}

/**
 * قراءة Access Token مع أولوية ذكية
 */
export function getAccessTokenFromRequest(req: NextRequest): string | null {
  const host = req.headers.get('host')
  const useHostCookies = supportsHostCookies(req)
  
  // أولوية حسب البيئة
  const priorities = [
    useHostCookies ? '__Host-sabq-access-token' : 'sabq-access-token',
    '__Host-sabq-access-token', // fallback للإنتاج
    'sabq-access-token',        // fallback للتطوير
    'sabq_at',                  // legacy
    'access_token'              // legacy
  ]
  
  for (const cookieName of priorities) {
    const token = getCookieFromRequest(req, cookieName)
    if (token) {
      console.log(`🔑 Access Token found: ${cookieName}`)
      return token
    }
  }
  
  console.log('⚠️ لا يوجد Access Token')
  return null
}

/**
 * اختبار __Host- cookie compliance
 */
export function validateHostCookieCompliance(cookieString: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // فحص أن __Host- cookies لا تحتوي على Domain attribute
  if (cookieString.includes('__Host-') && /Domain\s*=/i.test(cookieString)) {
    errors.push('__Host- cookies cannot have Domain attribute')
  }
  
  // فحص أن __Host- cookies تحتوي على Secure
  if (cookieString.includes('__Host-') && !cookieString.includes('Secure')) {
    errors.push('__Host- cookies must have Secure attribute')
  }
  
  // فحص أن __Host- cookies تحتوي على Path=/
  if (cookieString.includes('__Host-') && !cookieString.includes('Path=/')) {
    errors.push('__Host- cookies must have Path=/ attribute')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

const authCookieHelpers = {
  setAuthCookies,
  clearAuthCookies,
  generateCSRFToken,
  getCookieFromRequest,
  getAccessTokenFromRequest,
  validateHostCookieCompliance,
  rootDomainFromHost
}

export default authCookieHelpers

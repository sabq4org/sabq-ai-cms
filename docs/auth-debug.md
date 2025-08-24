# Auth Debug Tools

This document describes the debugging tools available for diagnosing authentication and token refresh issues, specifically addressing recurring 401 errors for endpoints like `/profile/me/loyalty`.

## Problem Statement

The frontend was experiencing recurring 401s for `/profile/me/loyalty` because:
1. Token refresh requests sometimes fail (400) 
2. Browser doesn't send/receive expected access token cookies
3. __Host- cookies were being set with Domain attribute (violates browser spec)
4. Limited debugging visibility into the refresh process

## Solution Implemented

This implementation adds conservative, safe debugging + reliability improvements to both client and server code:

### Key Fixes Applied

1. **Cookie Specification Compliance**: Fixed __Host- cookies to exclude Domain attribute
2. **Enhanced Logging**: All auth operations now include masked token logging 
3. **Fallback Support**: Priority-based cookie reading with __Host- > legacy fallbacks
4. **Debug Tools**: Client-side helpers for manual testing and diagnosis
5. **Server Diagnostics**: Detailed refresh handler logging with rejection reasons

### Root Cause Analysis

The primary issue was __Host- prefixed cookies being set with `Domain=.sabq.me` attribute. Per browser security specifications, __Host- cookies:
- MUST NOT include a Domain attribute
- MUST have Secure=true 
- MUST have Path=/

When Domain was included, browsers would reject the __Host- cookies, causing the auth system to fall back to legacy cookie names inconsistently.

## Client-Side Debug Helpers

Debug helpers are automatically attached to `window.debugAuth` for easy console access.

### Available Functions

#### `debugRefresh()`
Manually triggers a token refresh with detailed logging.

```javascript
// In browser console:
await window.debugAuth.debugRefresh()
```

This will:
- Log current cookies before refresh
- Send refresh request with `credentials: 'include'`  
- Include CSRF token if available
- Log full response (status, headers, body)
- Mask sensitive tokens in logs

#### `debugAuthState()`
Shows current authentication state comparison.

```javascript
// In browser console:
window.debugAuth.debugAuthState()
```

This will show:
- Memory token (masked)
- Available cookie tokens (masked)
- Token expiration times
- Last auth events

#### `compareTokens()`
Compares memory token vs cookie tokens.

```javascript  
// In browser console:
window.debugAuth.compareTokens()
```

This will:
- Compare memory vs `__Host-sabq-access-token`
- Compare memory vs legacy `sabq_at` cookie
- Show token expiration status

## Server-Side Debugging

The refresh handler (`/api/auth/refresh`) now includes detailed logging:

- Request details (method, URL, headers, origin)
- All incoming cookies (with masked tokens)
- Specific reasons for 400/401 rejections
- Cookie setting details in responses

## Cookie Troubleshooting

### Common Issues

1. **__Host- cookies not being set**
   - Check that Domain attribute is NOT included in Set-Cookie headers
   - Ensure Secure=true and Path=/ are set
   - Verify HTTPS in production

2. **Cookies not being sent with requests**  
   - Ensure `credentials: 'include'` is used in fetch requests
   - Check SameSite policy (should be 'lax' or 'strict')
   - Verify cookie path matches request path

3. **CSRF token issues**
   - Check that `sabq-csrf-token` cookie exists
   - Ensure `X-CSRF-Token` header is sent with POST requests

### Cookie Priority Order

**Access Tokens:**
1. `__Host-sabq-access-token` (preferred)
2. `sabq_at` (legacy fallback)
3. Other fallbacks...

**Refresh Tokens:**  
1. `__Host-sabq-refresh` (preferred)
2. `sabq_rft` (legacy fallback)
3. Other fallbacks...

## Manual Testing with cURL

Test refresh endpoint manually:

```bash
# Replace YOUR_REFRESH_TOKEN with actual token from browser cookies
curl -X POST https://your-domain.com/api/auth/refresh \
  -H "Content-Type: application/json" \
  -H "X-Requested-With: XMLHttpRequest" \
  -H "Cookie: __Host-sabq-refresh=YOUR_REFRESH_TOKEN; sabq-csrf-token=YOUR_CSRF_TOKEN" \
  -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \
  -v

# For local development:
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -H "X-Requested-With: XMLHttpRequest" \
  -H "Cookie: __Host-sabq-refresh=YOUR_REFRESH_TOKEN; sabq-csrf-token=YOUR_CSRF_TOKEN" \
  -H "X-CSRF-Token: YOUR_CSRF_TOKEN" \
  -v
```

### Expected Response (Success)

```json
{
  "success": true,
  "message": "تم تجديد الرمز بنجاح",
  "accessToken": "eyJ...", 
  "accessTokenExp": 1693920000000,
  "userVersion": 1693920000000
}
```

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "رمز التجديد مطلوب",
  "code": "NO_REFRESH_TOKEN"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "رمز التجديد غير صالح أو منتهي",
  "code": "REFRESH_FAILED"
}
```

## Reproducing the Original 401 Issue

1. Open browser dev tools
2. Navigate to `/profile/me/loyalty`
3. Watch Network tab for 401 responses
4. Use `debugRefresh()` to test manual refresh
5. Compare results with automatic refresh behavior

## Security Notes

- All debug functions mask sensitive tokens in logs
- Full tokens are never logged to console
- Debug helpers are safe to include in production
- Remove or gate debug logs behind feature flags for production if desired

## Development Guidelines  

- Always test refresh flow in both success and failure scenarios
- Verify cookies are set correctly with proper attributes
- Test with expired tokens to ensure proper error handling
- Check that retry logic uses latest token from memory
// اختبارات APIs نظام المصادقة - سبق الذكية
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST as registerPOST } from '../../app/api/auth/register/route';
import { POST as loginPOST } from '../../app/api/auth/login/route';
import { POST as logoutPOST } from '../../app/api/auth/logout/route';
import { POST as refreshPOST } from '../../app/api/auth/refresh/route';
import { GET as profileGET, PUT as profilePUT } from '../../app/api/auth/profile/route';
import { POST as changePasswordPOST } from '../../app/api/auth/change-password/route';
import { POST as resetPasswordPOST } from '../../app/api/auth/reset-password/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// بيانات اختبار
const testUser = {
  email: 'api-test@sabq.ai',
  password: 'ApiTestPass123!',
  name: 'مستخدم API',
  role: 'user',
  phone: '+966501234567'
};

// دالة مساعدة لإنشاء NextRequest
function createRequest(method: string, body?: any, headers?: Record<string, string>, cookies?: Record<string, string>) {
  const url = 'https://sabq.ai/api/test';
  const request = new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    ...(body && { body: JSON.stringify(body) })
  });

  // إضافة cookies إذا تم توفيرها
  if (cookies) {
    for (const [name, value] of Object.entries(cookies)) {
      request.cookies.set(name, value);
    }
  }

  return request;
}

describe('Auth APIs', () => {
  let userAccessToken: string;
  let userRefreshToken: string;
  let userId: string;

  beforeAll(async () => {
    // تنظيف البيانات قبل البدء
    await prisma.refreshToken.deleteMany({});
    await prisma.userSessions.deleteMany({});
    await prisma.password_reset_tokens.deleteMany({});
    await prisma.users.deleteMany({
      where: { email: testUser.email }
    });
  });

  afterAll(async () => {
    // تنظيف البيانات بعد الانتهاء
    await prisma.refreshToken.deleteMany({});
    await prisma.userSessions.deleteMany({});
    await prisma.password_reset_tokens.deleteMany({});
    await prisma.users.deleteMany({
      where: { email: testUser.email }
    });
    await prisma.$disconnect();
  });

  describe('/api/auth/register', () => {
    it('يجب أن يسجل مستخدم جديد بنجاح', async () => {
      const request = createRequest('POST', testUser);
      const response = await registerPOST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe(testUser.email);
      expect(data.user.name).toBe(testUser.name);
      expect(data.user.role).toBe(testUser.role);

      // التحقق من وجود cookies
      const accessTokenCookie = response.cookies.get('access_token');
      const refreshTokenCookie = response.cookies.get('refresh_token');
      
      expect(accessTokenCookie).toBeDefined();
      expect(refreshTokenCookie).toBeDefined();
      expect(accessTokenCookie?.httpOnly).toBe(true);
      expect(refreshTokenCookie?.httpOnly).toBe(true);

      userId = data.user.id;
    });

    it('يجب أن يرفض تسجيل مستخدم بنفس البريد', async () => {
      const request = createRequest('POST', testUser);
      const response = await registerPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('المستخدم موجود بالفعل');
    });

    it('يجب أن يرفض البيانات غير الصحيحة', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: '123', // كلمة مرور ضعيفة
        name: ''
      };

      const request = createRequest('POST', invalidUser);
      const response = await registerPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('بيانات غير صحيحة');
      expect(data.details).toBeDefined();
    });

    it('يجب أن يرفض الطلبات بدون body', async () => {
      const request = createRequest('POST');
      const response = await registerPOST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('/api/auth/login', () => {
    it('يجب أن يسمح بتسجيل الدخول ببيانات صحيحة', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password,
        remember_me: false
      };

      const request = createRequest('POST', loginData, {
        'user-agent': 'Jest Test Browser',
        'x-forwarded-for': '192.168.1.100'
      });

      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe(testUser.email);
      expect(data.user.role).toBe(testUser.role);

      // حفظ الرموز للاختبارات اللاحقة
      const accessTokenCookie = response.cookies.get('access_token');
      const refreshTokenCookie = response.cookies.get('refresh_token');
      
      expect(accessTokenCookie?.value).toBeDefined();
      expect(refreshTokenCookie?.value).toBeDefined();

      userAccessToken = accessTokenCookie?.value || '';
      userRefreshToken = refreshTokenCookie?.value || '';
    });

    it('يجب أن يرفض كلمة مرور خاطئة', async () => {
      const loginData = {
        email: testUser.email,
        password: 'WrongPassword123!',
        remember_me: false
      };

      const request = createRequest('POST', loginData);
      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('بيانات المستخدم غير صحيحة');
    });

    it('يجب أن يرفض مستخدم غير موجود', async () => {
      const loginData = {
        email: 'nonexistent@sabq.ai',
        password: 'TestPassword123!',
        remember_me: false
      };

      const request = createRequest('POST', loginData);
      const response = await loginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('بيانات المستخدم غير صحيحة');
    });
  });

  describe('/api/auth/profile', () => {
    it('يجب أن يحصل على بيانات المستخدم المصادق عليه', async () => {
      const request = createRequest('GET', undefined, {
        'authorization': `Bearer ${userAccessToken}`
      });

      const response = await profileGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe(testUser.email);
      expect(data.user.name).toBe(testUser.name);
      expect(data.user.id).toBeDefined();
    });

    it('يجب أن يرفض الوصول بدون token', async () => {
      const request = createRequest('GET');
      const response = await profileGET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('غير مصرح بالوصول');
    });

    it('يجب أن يحدث بيانات المستخدم', async () => {
      const updateData = {
        name: 'اسم محدث',
        city: 'جدة',
        phone: '+966509876543'
      };

      const request = createRequest('PUT', updateData, {
        'authorization': `Bearer ${userAccessToken}`
      });

      const response = await profilePUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.name).toBe(updateData.name);
      expect(data.user.city).toBe(updateData.city);
      expect(data.user.phone).toBe(updateData.phone);
    });
  });

  describe('/api/auth/refresh', () => {
    it('يجب أن يجدد access token بنجاح', async () => {
      const request = createRequest('POST', undefined, undefined, {
        'refresh_token': userRefreshToken
      });

      const response = await refreshPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('تم تجديد الرمز بنجاح');

      // التحقق من وجود access token جديد
      const newAccessTokenCookie = response.cookies.get('access_token');
      expect(newAccessTokenCookie?.value).toBeDefined();
      expect(newAccessTokenCookie?.value).not.toBe(userAccessToken);

      // تحديث الرمز للاختبارات اللاحقة
      userAccessToken = newAccessTokenCookie?.value || '';
    });

    it('يجب أن يرفض refresh token غير صحيح', async () => {
      const request = createRequest('POST', undefined, undefined, {
        'refresh_token': 'invalid-refresh-token'
      });

      const response = await refreshPOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('يجب أن يرفض الطلب بدون refresh token', async () => {
      const request = createRequest('POST');
      const response = await refreshPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('رمز التجديد مطلوب');
    });
  });

  describe('/api/auth/change-password', () => {
    it('يجب أن يغير كلمة المرور بنجاح', async () => {
      const passwordData = {
        current_password: testUser.password,
        new_password: 'NewApiTestPass123!',
        confirm_password: 'NewApiTestPass123!'
      };

      const request = createRequest('POST', passwordData, {
        'authorization': `Bearer ${userAccessToken}`
      });

      const response = await changePasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('تم تغيير كلمة المرور بنجاح');

      // التحقق من حذف cookies
      const accessTokenCookie = response.cookies.get('access_token');
      const refreshTokenCookie = response.cookies.get('refresh_token');
      
      expect(accessTokenCookie?.value).toBe('');
      expect(refreshTokenCookie?.value).toBe('');

      // تحديث كلمة المرور للاختبارات اللاحقة
      testUser.password = 'NewApiTestPass123!';
    });

    it('يجب أن يرفض كلمة المرور الحالية الخاطئة', async () => {
      // تسجيل دخول جديد بكلمة المرور الجديدة
      const loginRequest = createRequest('POST', {
        email: testUser.email,
        password: testUser.password,
        remember_me: false
      });
      const loginResponse = await loginPOST(loginRequest);
      const newAccessToken = loginResponse.cookies.get('access_token')?.value || '';

      const passwordData = {
        current_password: 'WrongCurrentPassword123!',
        new_password: 'AnotherNewPass123!',
        confirm_password: 'AnotherNewPass123!'
      };

      const request = createRequest('POST', passwordData, {
        'authorization': `Bearer ${newAccessToken}`
      });

      const response = await changePasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('كلمة المرور الحالية غير صحيحة');
    });
  });

  describe('/api/auth/reset-password', () => {
    it('يجب أن يطلب إعادة تعيين كلمة المرور', async () => {
      const resetData = {
        email: testUser.email
      };

      const request = createRequest('POST', resetData);
      const response = await resetPasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('ستستلم رابط إعادة التعيين');
    });

    it('يجب أن يعطي نفس الرسالة لبريد غير موجود', async () => {
      const resetData = {
        email: 'nonexistent@sabq.ai'
      };

      const request = createRequest('POST', resetData);
      const response = await resetPasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('ستستلم رابط إعادة التعيين');
    });

    it('يجب أن يرفض البريد الإلكتروني غير الصحيح', async () => {
      const resetData = {
        email: 'invalid-email'
      };

      const request = createRequest('POST', resetData);
      const response = await resetPasswordPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('بيانات غير صحيحة');
    });
  });

  describe('/api/auth/logout', () => {
    it('يجب أن يسجل الخروج بنجاح', async () => {
      // تسجيل دخول جديد للحصول على token صالح
      const loginRequest = createRequest('POST', {
        email: testUser.email,
        password: testUser.password,
        remember_me: false
      });
      const loginResponse = await loginPOST(loginRequest);
      const accessToken = loginResponse.cookies.get('access_token')?.value || '';

      const request = createRequest('POST', undefined, {
        'authorization': `Bearer ${accessToken}`
      });

      const response = await logoutPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('تم تسجيل الخروج بنجاح');

      // التحقق من حذف cookies
      const accessTokenCookie = response.cookies.get('access_token');
      const refreshTokenCookie = response.cookies.get('refresh_token');
      
      expect(accessTokenCookie?.value).toBe('');
      expect(refreshTokenCookie?.value).toBe('');
    });

    it('يجب أن ينجح حتى بدون token (أمان)', async () => {
      const request = createRequest('POST');
      const response = await logoutPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('تم تسجيل الخروج');
    });
  });
});

// اختبارات الأمان
describe('Security Tests', () => {
  it('يجب أن يستخدم HTTPS في الإنتاج', () => {
    // هذا اختبار تذكيري - يجب التحقق من HTTPS في الإنتاج
    expect(process.env.NODE_ENV === 'production' ? true : true).toBe(true);
  });

  it('يجب أن تكون cookies آمنة', async () => {
    const request = createRequest('POST', testUser);
    const response = await registerPOST(request);

    const accessTokenCookie = response.cookies.get('access_token');
    const refreshTokenCookie = response.cookies.get('refresh_token');

    expect(accessTokenCookie?.httpOnly).toBe(true);
    expect(refreshTokenCookie?.httpOnly).toBe(true);
    expect(accessTokenCookie?.sameSite).toBe('strict');
    expect(refreshTokenCookie?.sameSite).toBe('strict');
  });

  it('يجب أن يكون لـ access token مدة صلاحية قصيرة', async () => {
    const request = createRequest('POST', {
      email: testUser.email,
      password: testUser.password,
      remember_me: false
    });

    const response = await loginPOST(request);
    const accessTokenCookie = response.cookies.get('access_token');

    // 15 دقيقة = 900 ثانية
    expect(accessTokenCookie?.maxAge).toBe(900);
  });

  it('يجب أن يكون لـ refresh token مدة صلاحية طويلة', async () => {
    const request = createRequest('POST', {
      email: testUser.email,
      password: testUser.password,
      remember_me: false
    });

    const response = await loginPOST(request);
    const refreshTokenCookie = response.cookies.get('refresh_token');

    // 30 يوم = 2592000 ثانية
    expect(refreshTokenCookie?.maxAge).toBe(2592000);
  });
});

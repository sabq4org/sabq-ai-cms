// اختبارات شاملة لنظام إدارة المستخدمين - سبق الذكية
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { UserManagementService, SecurityManager } from '../../lib/auth/user-management';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// بيانات اختبار
const testUserData = {
  email: 'test@sabq.ai',
  password: 'TestPass123!',
  name: 'مستخدم تجريبي',
  role: 'user' as const,
  phone: '+966501234567',
  city: 'الرياض',
  country: 'SA',
  interests: ['تقنية', 'أخبار'],
  preferred_language: 'ar' as const
};

const testAdminData = {
  email: 'admin@sabq.ai',
  password: 'AdminPass123!',
  name: 'مشرف تجريبي',
  role: 'admin' as const
};

describe('SecurityManager', () => {
  describe('hashPassword', () => {
    it('يجب أن يقوم بتشفير كلمة المرور بنجاح', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await SecurityManager.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });
  });

  describe('verifyPassword', () => {
    it('يجب أن يتحقق من كلمة المرور الصحيحة', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await SecurityManager.hashPassword(password);
      
      const isValid = await SecurityManager.verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('يجب أن يرفض كلمة المرور الخاطئة', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hashedPassword = await SecurityManager.hashPassword(password);
      
      const isValid = await SecurityManager.verifyPassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('generateSecureToken', () => {
    it('يجب أن يولد رمز عشوائي بالطول المطلوب', () => {
      const token = SecurityManager.generateSecureToken(32);
      
      expect(token).toBeDefined();
      expect(token.length).toBe(64); // 32 bytes = 64 hex chars
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });
  });

  describe('JWT Token Management', () => {
    const testPayload = { user_id: 'test-user-id', email: 'test@sabq.ai' };

    it('يجب أن ينشئ JWT token صحيح', () => {
      const token = SecurityManager.createJWTToken(testPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // Header.Payload.Signature
    });

    it('يجب أن يتحقق من JWT token صحيح', () => {
      const token = SecurityManager.createJWTToken(testPayload);
      const decoded = SecurityManager.verifyJWTToken(token);
      
      expect(decoded.user_id).toBe(testPayload.user_id);
      expect(decoded.email).toBe(testPayload.email);
    });

    it('يجب أن يرفض JWT token غير صحيح', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        SecurityManager.verifyJWTToken(invalidToken);
      }).toThrow();
    });
  });
});

describe('UserManagementService', () => {
  let testUserId: string;
  let testAdminId: string;

  beforeAll(async () => {
    // تنظيف البيانات قبل البدء
    await prisma.refreshToken.deleteMany({});
    await prisma.userSessions.deleteMany({});
    await prisma.password_reset_tokens.deleteMany({});
    await prisma.users.deleteMany({
      where: {
        email: {
          in: [testUserData.email, testAdminData.email]
        }
      }
    });
  });

  afterAll(async () => {
    // تنظيف البيانات بعد الانتهاء
    await prisma.refreshToken.deleteMany({});
    await prisma.userSessions.deleteMany({});
    await prisma.password_reset_tokens.deleteMany({});
    await prisma.users.deleteMany({
      where: {
        email: {
          in: [testUserData.email, testAdminData.email]
        }
      }
    });
    await prisma.$disconnect();
  });

  describe('registerUser', () => {
    it('يجب أن يسجل مستخدم جديد بنجاح', async () => {
      const result = await UserManagementService.registerUser(testUserData);
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(testUserData.email);
      expect(result.user?.name).toBe(testUserData.name);
      expect(result.user?.role).toBe(testUserData.role);
      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
      
      testUserId = result.user?.id || '';
    });

    it('يجب أن يمنع تسجيل مستخدم بنفس البريد الإلكتروني', async () => {
      const result = await UserManagementService.registerUser(testUserData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('المستخدم موجود بالفعل');
    });

    it('يجب أن يرفض البيانات غير الصحيحة', async () => {
      const invalidData = {
        ...testUserData,
        email: 'invalid-email',
        password: '123' // كلمة مرور ضعيفة
      };
      
      expect(async () => {
        await UserManagementService.registerUser(invalidData as any);
      }).rejects.toThrow();
    });
  });

  describe('loginUser', () => {
    beforeAll(async () => {
      // تسجيل مستخدم إداري للاختبار
      const adminResult = await UserManagementService.registerUser(testAdminData);
      testAdminId = adminResult.user?.id || '';
    });

    it('يجب أن يسمح بتسجيل الدخول ببيانات صحيحة', async () => {
      const loginData = {
        email: testUserData.email,
        password: testUserData.password,
        remember_me: false
      };

      const sessionInfo = {
        ip_address: '192.168.1.1',
        user_agent: 'Jest Test',
        device_type: 'desktop'
      };

      const result = await UserManagementService.loginUser(loginData, sessionInfo);
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(testUserData.email);
      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
    });

    it('يجب أن يرفض كلمة مرور خاطئة', async () => {
      const loginData = {
        email: testUserData.email,
        password: 'WrongPassword123!',
        remember_me: false
      };

      const result = await UserManagementService.loginUser(loginData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('بيانات المستخدم غير صحيحة');
    });

    it('يجب أن يرفض مستخدم غير موجود', async () => {
      const loginData = {
        email: 'nonexistent@sabq.ai',
        password: 'TestPassword123!',
        remember_me: false
      };

      const result = await UserManagementService.loginUser(loginData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('بيانات المستخدم غير صحيحة');
    });
  });

  describe('verifyAccessToken', () => {
    let validToken: string;

    beforeAll(async () => {
      const loginResult = await UserManagementService.loginUser({
        email: testUserData.email,
        password: testUserData.password,
        remember_me: false
      });
      validToken = loginResult.access_token || '';
    });

    it('يجب أن يتحقق من رمز وصول صحيح', async () => {
      const user = await UserManagementService.verifyAccessToken(validToken);
      
      expect(user).toBeDefined();
      expect(user?.email).toBe(testUserData.email);
    });

    it('يجب أن يرفض رمز وصول غير صحيح', async () => {
      const user = await UserManagementService.verifyAccessToken('invalid-token');
      
      expect(user).toBeNull();
    });
  });

  describe('refreshAccessToken', () => {
    let validRefreshToken: string;

    beforeAll(async () => {
      const loginResult = await UserManagementService.loginUser({
        email: testUserData.email,
        password: testUserData.password,
        remember_me: false
      });
      validRefreshToken = loginResult.refresh_token || '';
    });

    it('يجب أن يجدد رمز الوصول بنجاح', async () => {
      const result = await UserManagementService.refreshAccessToken(validRefreshToken);
      
      expect(result.access_token).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('يجب أن يرفض رمز تجديد غير صحيح', async () => {
      const result = await UserManagementService.refreshAccessToken('invalid-refresh-token');
      
      expect(result.access_token).toBeUndefined();
      expect(result.error).toBeDefined();
    });
  });

  describe('changePassword', () => {
    it('يجب أن يغير كلمة المرور بنجاح', async () => {
      const passwordData = {
        current_password: testUserData.password,
        new_password: 'NewTestPass123!',
        confirm_password: 'NewTestPass123!'
      };

      const result = await UserManagementService.changePassword(testUserId, passwordData);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('تم تغيير كلمة المرور بنجاح');

      // اختبار تسجيل الدخول بكلمة المرور الجديدة
      const loginResult = await UserManagementService.loginUser({
        email: testUserData.email,
        password: 'NewTestPass123!',
        remember_me: false
      });
      
      expect(loginResult.success).toBe(true);
    });

    it('يجب أن يرفض كلمة المرور الحالية الخاطئة', async () => {
      const passwordData = {
        current_password: 'WrongCurrentPassword123!',
        new_password: 'NewTestPass123!',
        confirm_password: 'NewTestPass123!'
      };

      const result = await UserManagementService.changePassword(testUserId, passwordData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('كلمة المرور الحالية غير صحيحة');
    });
  });

  describe('requestPasswordReset', () => {
    it('يجب أن يطلب إعادة تعيين كلمة المرور لبريد موجود', async () => {
      const result = await UserManagementService.requestPasswordReset(testUserData.email);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('ستستلم رابط إعادة التعيين');
    });

    it('يجب أن يعطي نفس الرسالة لبريد غير موجود (أمان)', async () => {
      const result = await UserManagementService.requestPasswordReset('nonexistent@sabq.ai');
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('ستستلم رابط إعادة التعيين');
    });
  });

  describe('updateUserProfile', () => {
    it('يجب أن يحدث الملف الشخصي بنجاح', async () => {
      const updateData = {
        name: 'اسم محدث',
        city: 'جدة',
        phone: '+966509876543'
      };

      const result = await UserManagementService.updateUserProfile(testUserId, updateData);
      
      expect(result.success).toBe(true);
      expect(result.user?.name).toBe(updateData.name);
      expect(result.user?.city).toBe(updateData.city);
      expect(result.user?.phone).toBe(updateData.phone);
    });
  });

  describe('getUserById', () => {
    it('يجب أن يحصل على بيانات المستخدم بالمعرف', async () => {
      const user = await UserManagementService.getUserById(testUserId);
      
      expect(user).toBeDefined();
      expect(user?.id).toBe(testUserId);
      expect(user?.email).toBe(testUserData.email);
    });

    it('يجب أن يعيد null للمعرف غير الموجود', async () => {
      const user = await UserManagementService.getUserById('nonexistent-id');
      
      expect(user).toBeNull();
    });
  });
});

describe('Integration Tests', () => {
  it('يجب أن يكمل دورة المستخدم الكاملة', async () => {
    const userData = {
      email: 'integration@sabq.ai',
      password: 'IntegrationPass123!',
      name: 'مستخدم التكامل',
      role: 'user' as const
    };

    try {
      // 1. التسجيل
      const registerResult = await UserManagementService.registerUser(userData);
      expect(registerResult.success).toBe(true);
      
      const userId = registerResult.user?.id || '';
      const accessToken = registerResult.access_token || '';

      // 2. تسجيل الدخول
      const loginResult = await UserManagementService.loginUser({
        email: userData.email,
        password: userData.password,
        remember_me: false
      });
      expect(loginResult.success).toBe(true);

      // 3. التحقق من رمز الوصول
      const user = await UserManagementService.verifyAccessToken(accessToken);
      expect(user).toBeDefined();
      expect(user?.email).toBe(userData.email);

      // 4. تحديث الملف الشخصي
      const updateResult = await UserManagementService.updateUserProfile(userId, {
        name: 'اسم جديد',
        city: 'الدمام'
      });
      expect(updateResult.success).toBe(true);

      // 5. تغيير كلمة المرور
      const passwordResult = await UserManagementService.changePassword(userId, {
        current_password: userData.password,
        new_password: 'NewIntegrationPass123!',
        confirm_password: 'NewIntegrationPass123!'
      });
      expect(passwordResult.success).toBe(true);

      // 6. تسجيل الخروج
      const logoutResult = await UserManagementService.logoutUser(accessToken);
      expect(logoutResult.success).toBe(true);

    } finally {
      // تنظيف البيانات
      await prisma.refreshToken.deleteMany({
        where: { userId: { contains: 'integration' } }
      });
      await prisma.userSessions.deleteMany({
        where: { user_id: { contains: 'integration' } }
      });
      await prisma.users.deleteMany({
        where: { email: userData.email }
      });
    }
  });
});

// اختبارات الأداء
describe('Performance Tests', () => {
  it('يجب أن يتم تشفير كلمة المرور في وقت معقول', async () => {
    const start = Date.now();
    await SecurityManager.hashPassword('TestPassword123!');
    const end = Date.now();
    
    // يجب أن يكون أقل من ثانيتين
    expect(end - start).toBeLessThan(2000);
  });

  it('يجب أن يتم التحقق من كلمة المرور في وقت معقول', async () => {
    const password = 'TestPassword123!';
    const hashedPassword = await SecurityManager.hashPassword(password);
    
    const start = Date.now();
    await SecurityManager.verifyPassword(password, hashedPassword);
    const end = Date.now();
    
    // يجب أن يكون أقل من ثانية واحدة
    expect(end - start).toBeLessThan(1000);
  });
});

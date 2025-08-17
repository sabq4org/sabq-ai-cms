// نظام إدارة المستخدمين المتقدم - مبني على schema الموجود
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { z } from 'zod';

const prisma = new PrismaClient();

// JWT إعدادات - توحيد السر مع بقية النظام
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

// Zod schemas للتحقق من البيانات
export const UserCreateSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم ورمز خاص'),
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').optional(),
  role: z.enum(['admin', 'editor', 'author', 'user']).default('user'),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().default('SA'),
  interests: z.array(z.string()).default([]),
  preferred_language: z.enum(['ar', 'en']).default('ar'),
});

export const UserLoginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
  remember_me: z.boolean().default(false),
});

export const PasswordChangeSchema = z.object({
  current_password: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  new_password: z.string()
    .min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم ورمز خاص'),
  confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirm_password"],
});

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  is_admin: boolean;
  is_verified: boolean;
  avatar?: string;
  phone?: string;
  city?: string;
  country: string;
  interests: any[];
  preferred_language: string;
  profile_completed: boolean;
  status: string;
  loyalty_points: number;
  notification_preferences: any;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  access_token?: string;
  refresh_token?: string;
  message?: string;
  error?: string;
}

export interface SessionData {
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  location?: any;
  expires_at: Date;
}

// Security utilities
export class SecurityManager {
  /**
   * تشفير كلمة المرور باستخدام bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * التحقق من كلمة المرور
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * توليد رمز عشوائي آمن
   */
  static generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * إنشاء JWT token
   */
  static createJWTToken(payload: any, expiresIn: string = JWT_EXPIRES_IN): string {
    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn,
      issuer: 'sabq-smart-cms',
      audience: 'sabq-users'
    });
  }

  /**
   * التحقق من JWT token
   */
  static verifyJWTToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('رمز غير صحيح أو منتهي الصلاحية');
    }
  }

  /**
   * تنظيف IP address من proxies
   */
  static cleanIpAddress(req: any): string {
    const forwarded = req.headers['x-forwarded-for'];
    const real_ip = req.headers['x-real-ip'];
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (real_ip) {
      return real_ip;
    }
    
    return req.connection?.remoteAddress || 'unknown';
  }
}

// User Management Service
export class UserManagementService {
  /**
   * تسجيل مستخدم جديد
   */
  static async registerUser(userData: z.infer<typeof UserCreateSchema>): Promise<AuthResult> {
    try {
      // التحقق من صحة البيانات
      const validatedData = UserCreateSchema.parse(userData);

      // التحقق من عدم وجود المستخدم
      const existingUser = await prisma.users.findUnique({
        where: { email: validatedData.email }
      });

      if (existingUser) {
        return {
          success: false,
          error: 'المستخدم موجود بالفعل'
        };
      }

      // تشفير كلمة المرور
      const hashedPassword = await SecurityManager.hashPassword(validatedData.password);

      // إنشاء المستخدم
      const user = await prisma.users.create({
        data: {
          id: SecurityManager.generateSecureToken(16),
          email: validatedData.email,
          password_hash: hashedPassword,
          name: validatedData.name,
          role: validatedData.role,
          is_admin: validatedData.role === 'admin',
          phone: validatedData.phone,
          city: validatedData.city,
          country: validatedData.country,
          interests: validatedData.interests,
          preferred_language: validatedData.preferred_language,
          status: 'pending_verification',
          verification_token: SecurityManager.generateSecureToken(),
          notification_preferences: {
            email: true,
            push: true,
            sms: false
          },
          updated_at: new Date()
        }
      });

      // إنشاء access و refresh tokens
      const accessToken = SecurityManager.createJWTToken({
        user_id: user.id,
        email: user.email,
        role: user.role
      });

      const refreshToken = SecurityManager.createJWTToken({
        user_id: user.id,
        type: 'refresh'
      }, REFRESH_TOKEN_EXPIRES_IN);

      // حفظ refresh token في قاعدة البيانات
      await prisma.refreshToken.create({
        data: {
          id: SecurityManager.generateSecureToken(16),
          userId: user.id,
          tokenHash: await SecurityManager.hashPassword(refreshToken),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
        }
      });

      return {
        success: true,
        user: user as User,
        access_token: accessToken,
        refresh_token: refreshToken,
        message: 'تم إنشاء الحساب بنجاح'
      };

    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'خطأ في التسجيل'
      };
    }
  }

  /**
   * تسجيل الدخول
   */
  static async loginUser(
    loginData: z.infer<typeof UserLoginSchema>,
    sessionInfo?: { ip_address?: string; user_agent?: string; device_type?: string }
  ): Promise<AuthResult> {
    try {
      // التحقق من صحة البيانات
      const validatedData = UserLoginSchema.parse(loginData);

      // البحث عن المستخدم
      const user = await prisma.users.findUnique({
        where: { email: validatedData.email }
      });

      if (!user || !user.password_hash) {
        return {
          success: false,
          error: 'بيانات المستخدم غير صحيحة'
        };
      }

      // فحص حالة الحساب
      if (user.status === 'suspended') {
        return {
          success: false,
          error: 'الحساب موقوف'
        };
      }

      // التحقق من كلمة المرور
      const isPasswordValid = await SecurityManager.verifyPassword(
        validatedData.password,
        user.password_hash
      );

      if (!isPasswordValid) {
        return {
          success: false,
          error: 'بيانات المستخدم غير صحيحة'
        };
      }

      // تحديث آخر تسجيل دخول
      await prisma.users.update({
        where: { id: user.id },
        data: { 
          last_login_at: new Date(),
          updated_at: new Date()
        }
      });

      // إنشاء الرموز
      const accessToken = SecurityManager.createJWTToken({
        user_id: user.id,
        email: user.email,
        role: user.role
      });

      const refreshToken = SecurityManager.createJWTToken({
        user_id: user.id,
        type: 'refresh'
      }, REFRESH_TOKEN_EXPIRES_IN);

      // حفظ refresh token
      await prisma.refreshToken.create({
        data: {
          id: SecurityManager.generateSecureToken(16),
          userId: user.id,
          tokenHash: await SecurityManager.hashPassword(refreshToken),
          userAgent: sessionInfo?.user_agent,
          ipAddress: sessionInfo?.ip_address,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
        }
      });

      // إنشاء جلسة المستخدم
      await prisma.userSessions.create({
        data: {
          id: SecurityManager.generateSecureToken(16),
          user_id: user.id,
          session_token: await SecurityManager.hashPassword(accessToken),
          ip_address: sessionInfo?.ip_address || 'unknown',
          user_agent: sessionInfo?.user_agent,
          device_type: sessionInfo?.device_type || 'desktop',
          location: {},
          last_activity_at: new Date(),
          is_active: true
        }
      });

      return {
        success: true,
        user: user as User,
        access_token: accessToken,
        refresh_token: refreshToken,
        message: 'تم تسجيل الدخول بنجاح'
      };

    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'خطأ في تسجيل الدخول'
      };
    }
  }

  /**
   * التحقق من صحة access token
   */
  static async verifyAccessToken(token: string): Promise<User | null> {
    try {
      const decoded = SecurityManager.verifyJWTToken(token);
      
      const user = await prisma.users.findUnique({
        where: { 
          id: decoded.user_id,
          status: 'active'
        }
      });

      return user as User;
    } catch (error) {
      return null;
    }
  }

  /**
   * تجديد access token
   */
  static async refreshAccessToken(refreshToken: string): Promise<{ access_token?: string; error?: string }> {
    try {
      const decoded = SecurityManager.verifyJWTToken(refreshToken);
      
      if (decoded.type !== 'refresh') {
        return { error: 'رمز التجديد غير صحيح' };
      }

      // البحث عن refresh token في قاعدة البيانات
      const tokenRecord = await prisma.refreshToken.findFirst({
        where: {
          userId: decoded.user_id,
          expiresAt: { gt: new Date() },
          revokedAt: null
        }
      });

      if (!tokenRecord) {
        return { error: 'رمز التجديد منتهي الصلاحية' };
      }

      // التحقق من hash
      const isValidHash = await SecurityManager.verifyPassword(refreshToken, tokenRecord.tokenHash);
      if (!isValidHash) {
        return { error: 'رمز التجديد غير صحيح' };
      }

      // الحصول على المستخدم
      const user = await prisma.users.findUnique({
        where: { id: decoded.user_id }
      });

      if (!user) {
        return { error: 'المستخدم غير موجود' };
      }

      // إنشاء access token جديد
      const newAccessToken = SecurityManager.createJWTToken({
        user_id: user.id,
        email: user.email,
        role: user.role
      });

      return { access_token: newAccessToken };

    } catch (error) {
      return { error: 'خطأ في تجديد الرمز' };
    }
  }

  /**
   * تغيير كلمة المرور
   */
  static async changePassword(
    userId: string, 
    passwordData: z.infer<typeof PasswordChangeSchema>
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // التحقق من صحة البيانات
      const validatedData = PasswordChangeSchema.parse(passwordData);

      // الحصول على المستخدم
      const user = await prisma.users.findUnique({
        where: { id: userId }
      });

      if (!user || !user.password_hash) {
        return { success: false, error: 'المستخدم غير موجود' };
      }

      // التحقق من كلمة المرور الحالية
      const isCurrentPasswordValid = await SecurityManager.verifyPassword(
        validatedData.current_password,
        user.password_hash
      );

      if (!isCurrentPasswordValid) {
        return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
      }

      // تشفير كلمة المرور الجديدة
      const newHashedPassword = await SecurityManager.hashPassword(validatedData.new_password);

      // تحديث كلمة المرور
      await prisma.users.update({
        where: { id: userId },
        data: {
          password_hash: newHashedPassword,
          updated_at: new Date()
        }
      });

      // إلغاء جميع refresh tokens
      await prisma.refreshToken.updateMany({
        where: { userId: userId },
        data: { revokedAt: new Date() }
      });

      // إلغاء جميع الجلسات النشطة
      await prisma.userSessions.updateMany({
        where: { user_id: userId },
        data: { 
          is_active: false,
          ended_at: new Date()
        }
      });

      return {
        success: true,
        message: 'تم تغيير كلمة المرور بنجاح'
      };

    } catch (error: any) {
      console.error('Password change error:', error);
      return {
        success: false,
        error: error.message || 'خطأ في تغيير كلمة المرور'
      };
    }
  }

  /**
   * تسجيل الخروج
   */
  static async logoutUser(accessToken: string): Promise<{ success: boolean; message?: string }> {
    try {
      const decoded = SecurityManager.verifyJWTToken(accessToken);
      
      // إنهاء الجلسة
      const hashedToken = await SecurityManager.hashPassword(accessToken);
      await prisma.userSessions.updateMany({
        where: { 
          user_id: decoded.user_id,
          session_token: hashedToken
        },
        data: { 
          is_active: false,
          ended_at: new Date()
        }
      });

      return {
        success: true,
        message: 'تم تسجيل الخروج بنجاح'
      };

    } catch (error) {
      return {
        success: true, // نجح حتى لو فشل التحقق
        message: 'تم تسجيل الخروج'
      };
    }
  }

  /**
   * إعادة تعيين كلمة المرور
   */
  static async requestPasswordReset(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const user = await prisma.users.findUnique({
        where: { email }
      });

      if (!user) {
        // لأغراض الأمان، نعطي نفس الرسالة
        return {
          success: true,
          message: 'إذا كان البريد الإلكتروني موجود، ستستلم رابط إعادة التعيين'
        };
      }

      // توليد رمز إعادة التعيين
      const resetToken = SecurityManager.generateSecureToken();
      const hashedToken = await SecurityManager.hashPassword(resetToken);

      // حفظ رمز إعادة التعيين
      await prisma.password_reset_tokens.create({
        data: {
          id: SecurityManager.generateSecureToken(16),
          user_id: user.id,
          token: hashedToken,
          expires_at: new Date(Date.now() + 60 * 60 * 1000), // ساعة واحدة
        }
      });

      // هنا يمكن إرسال البريد الإلكتروني
      // await sendPasswordResetEmail(user.email, resetToken);

      return {
        success: true,
        message: 'إذا كان البريد الإلكتروني موجود، ستستلم رابط إعادة التعيين'
      };

    } catch (error: any) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        error: 'خطأ في طلب إعادة التعيين'
      };
    }
  }

  /**
   * تأكيد إعادة تعيين كلمة المرور
   */
  static async confirmPasswordReset(
    token: string, 
    newPassword: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // البحث عن رمز صالح
      const tokenRecords = await prisma.password_reset_tokens.findMany({
        where: {
          expires_at: { gt: new Date() },
          used_at: null
        }
      });

      let validTokenRecord = null;
      for (const record of tokenRecords) {
        const isValidToken = await SecurityManager.verifyPassword(token, record.token);
        if (isValidToken) {
          validTokenRecord = record;
          break;
        }
      }

      if (!validTokenRecord) {
        return {
          success: false,
          error: 'رمز إعادة التعيين غير صحيح أو منتهي الصلاحية'
        };
      }

      // تشفير كلمة المرور الجديدة
      const hashedPassword = await SecurityManager.hashPassword(newPassword);

      // تحديث كلمة المرور
      await prisma.users.update({
        where: { id: validTokenRecord.user_id },
        data: {
          password_hash: hashedPassword,
          updated_at: new Date()
        }
      });

      // تمييز الرمز كمستخدم
      await prisma.password_reset_tokens.update({
        where: { id: validTokenRecord.id },
        data: { used_at: new Date() }
      });

      // إلغاء جميع الجلسات والرموز
      await prisma.refreshToken.updateMany({
        where: { userId: validTokenRecord.user_id },
        data: { revokedAt: new Date() }
      });

      await prisma.userSessions.updateMany({
        where: { user_id: validTokenRecord.user_id },
        data: { 
          is_active: false,
          ended_at: new Date()
        }
      });

      return {
        success: true,
        message: 'تم إعادة تعيين كلمة المرور بنجاح'
      };

    } catch (error: any) {
      console.error('Password reset confirmation error:', error);
      return {
        success: false,
        error: 'خطأ في إعادة تعيين كلمة المرور'
      };
    }
  }

  /**
   * التحقق من البريد الإلكتروني
   */
  static async verifyEmail(token: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const user = await prisma.users.findFirst({
        where: {
          verification_token: token,
          is_verified: false
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'رمز التحقق غير صحيح'
        };
      }

      // تفعيل الحساب
      await prisma.users.update({
        where: { id: user.id },
        data: {
          is_verified: true,
          verification_token: null,
          status: 'active',
          updated_at: new Date()
        }
      });

      return {
        success: true,
        message: 'تم التحقق من البريد الإلكتروني بنجاح'
      };

    } catch (error: any) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: 'خطأ في التحقق من البريد الإلكتروني'
      };
    }
  }

  /**
   * الحصول على بيانات المستخدم
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId }
      });

      return user as User;
    } catch (error) {
      return null;
    }
  }

  /**
   * تحديث ملف المستخدم
   */
  static async updateUserProfile(
    userId: string,
    updateData: Partial<User>
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const user = await prisma.users.update({
        where: { id: userId },
        data: {
          ...updateData,
          updated_at: new Date()
        }
      });

      return {
        success: true,
        user: user as User
      };

    } catch (error: any) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: 'خطأ في تحديث الملف الشخصي'
      };
    }
  }
}

export default UserManagementService;

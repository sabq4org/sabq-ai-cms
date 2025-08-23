import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import prisma from '@/lib/prisma';

export interface TwoFactorSecret {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export class TwoFactorAuthService {
  /**
   * إنشاء سر 2FA جديد للمستخدم
   */
  static async generateSecret(userId: string, userEmail: string): Promise<TwoFactorSecret> {
    // إنشاء السر
    const secret = speakeasy.generateSecret({
      name: `سبق الذكية (${userEmail})`,
      issuer: 'سبق الذكية',
      length: 32
    });
    
    // إنشاء رمز QR
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    
    // إنشاء رموز احتياطية
    const backupCodes = this.generateBackupCodes();
    
    // حفظ في قاعدة البيانات (مؤقتاً حتى يتم التحقق)
    await prisma.two_factor_temp.upsert({
      where: { user_id: userId },
      update: {
        secret: secret.base32,
        backup_codes: backupCodes,
        created_at: new Date()
      },
      create: {
        user_id: userId,
        secret: secret.base32,
        backup_codes: backupCodes,
        created_at: new Date()
      }
    });
    
    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes
    };
  }
  
  /**
   * التحقق من رمز 2FA
   */
  static verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // السماح بفارق 2 × 30 ثانية
    });
  }
  
  /**
   * تفعيل 2FA للمستخدم
   */
  static async enableTwoFactor(userId: string, token: string): Promise<boolean> {
    try {
      // الحصول على السر المؤقت
      const tempSecret = await prisma.two_factor_temp.findUnique({
        where: { user_id: userId }
      });
      
      if (!tempSecret) {
        throw new Error('لم يتم إنشاء سر 2FA');
      }
      
      // التحقق من الرمز
      if (!this.verifyToken(tempSecret.secret, token)) {
        return false;
      }
      
      // نقل إلى الجدول الدائم
      await prisma.$transaction([
        // حفظ في الجدول الدائم
        prisma.two_factor_auth.upsert({
          where: { user_id: userId },
          update: {
            secret: tempSecret.secret,
            backup_codes: tempSecret.backup_codes,
            is_enabled: true,
            verified_at: new Date(),
            updated_at: new Date()
          },
          create: {
            user_id: userId,
            secret: tempSecret.secret,
            backup_codes: tempSecret.backup_codes,
            is_enabled: true,
            verified_at: new Date(),
            created_at: new Date()
          }
        }),
        // حذف من الجدول المؤقت
        prisma.two_factor_temp.delete({
          where: { user_id: userId }
        }),
        // تحديث حالة المستخدم
        prisma.users.update({
          where: { id: userId },
          data: {
            two_factor_enabled: true,
            updated_at: new Date()
          }
        })
      ]);
      
      return true;
    } catch (error) {
      console.error('خطأ في تفعيل 2FA:', error);
      return false;
    }
  }
  
  /**
   * تعطيل 2FA
   */
  static async disableTwoFactor(userId: string): Promise<boolean> {
    try {
      await prisma.$transaction([
        // حذف بيانات 2FA
        prisma.two_factor_auth.deleteMany({
          where: { user_id: userId }
        }),
        // تحديث حالة المستخدم
        prisma.users.update({
          where: { id: userId },
          data: {
            two_factor_enabled: false,
            updated_at: new Date()
          }
        })
      ]);
      
      return true;
    } catch (error) {
      console.error('خطأ في تعطيل 2FA:', error);
      return false;
    }
  }
  
  /**
   * التحقق من 2FA للمستخدم
   */
  static async verifyUserToken(userId: string, token: string): Promise<boolean> {
    try {
      const twoFactorAuth = await prisma.two_factor_auth.findUnique({
        where: { user_id: userId }
      });
      
      if (!twoFactorAuth || !twoFactorAuth.is_enabled) {
        return false;
      }
      
      // التحقق من الرمز العادي
      if (this.verifyToken(twoFactorAuth.secret, token)) {
        return true;
      }
      
      // التحقق من الرموز الاحتياطية
      const backupCodes = twoFactorAuth.backup_codes as string[];
      const codeIndex = backupCodes.indexOf(token);
      
      if (codeIndex !== -1) {
        // إزالة الرمز المستخدم
        backupCodes.splice(codeIndex, 1);
        await prisma.two_factor_auth.update({
          where: { user_id: userId },
          data: {
            backup_codes: backupCodes,
            last_used_at: new Date()
          }
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('خطأ في التحقق من 2FA:', error);
      return false;
    }
  }
  
  /**
   * التحقق من حالة 2FA للمستخدم
   */
  static async isEnabled(userId: string): Promise<boolean> {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { two_factor_enabled: true }
      });
      
      return user?.two_factor_enabled || false;
    } catch (error) {
      console.error('خطأ في التحقق من حالة 2FA:', error);
      return false;
    }
  }
  
  /**
   * إنشاء رموز احتياطية
   */
  private static generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const code = speakeasy.generateSecret({ length: 8 }).base32
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 8);
      codes.push(code);
    }
    
    return codes;
  }
}

/**
 * نظام التشفير للقيم الحساسة
 * Encryption System for Sensitive Values
 */

import crypto from 'crypto';

// مفتاح التشفير من متغيرات البيئة
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || 'default-key-change-in-production';
const ALGORITHM = 'aes-256-gcm';

/**
 * تشفير القيمة الحساسة
 * Encrypt sensitive value
 */
export function encryptSensitiveValue(value: any): string {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    // توليد IV عشوائي
    const iv = crypto.randomBytes(16);
    
    // إنشاء cipher
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY).subarray(0, 32), iv);
    
    let encrypted = cipher.update(stringValue, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // دمج IV و authTag مع النص المشفر
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('فشل في تشفير القيمة');
  }
}

/**
 * فك تشفير القيمة الحساسة
 * Decrypt sensitive value
 */
export function decryptSensitiveValue(encryptedValue: string): any {
  try {
    const parts = encryptedValue.split(':');
    if (parts.length !== 3) {
      throw new Error('تنسيق القيمة المشفرة غير صحيح');
    }
    
    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    // إنشاء decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY).subarray(0, 32), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    // محاولة تحويل إلى JSON إذا كان ممكناً
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
    
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('فشل في فك تشفير القيمة');
  }
}

/**
 * توليد مفتاح تشفير جديد
 * Generate new encryption key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * التحقق من صحة مفتاح التشفير
 * Validate encryption key
 */
export function validateEncryptionKey(key: string): boolean {
  try {
    // التحقق من الطول المناسب
    if (key.length < 32) return false;
    
    // اختبار التشفير وفك التشفير
    const testValue = 'test-encryption';
    const encrypted = encryptSensitiveValue(testValue);
    const decrypted = decryptSensitiveValue(encrypted);
    
    return decrypted === testValue;
  } catch {
    return false;
  }
}

/**
 * تشفير كلمة المرور
 * Hash password
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * التحقق من كلمة المرور
 * Verify password
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
    return hash === verifyHash;
  } catch {
    return false;
  }
}

/**
 * توليد رمز عشوائي
 * Generate random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * تشفير البيانات الحساسة للنقل
 * Encrypt data for transmission
 */
export function encryptForTransmission(data: any, publicKey: string): string {
  try {
    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(stringData));
    return encrypted.toString('base64');
  } catch (error) {
    console.error('Transmission encryption error:', error);
    throw new Error('فشل في تشفير البيانات للنقل');
  }
}

/**
 * فك تشفير البيانات المستقبلة
 * Decrypt received data
 */
export function decryptFromTransmission(encryptedData: string, privateKey: string): any {
  try {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(privateKey, buffer);
    const stringData = decrypted.toString();
    
    try {
      return JSON.parse(stringData);
    } catch {
      return stringData;
    }
  } catch (error) {
    console.error('Transmission decryption error:', error);
    throw new Error('فشل في فك تشفير البيانات المستقبلة');
  }
}

/**
 * إنشاء توقيع رقمي
 * Create digital signature
 */
export function createSignature(data: string, privateKey: string): string {
  try {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    return sign.sign(privateKey, 'base64');
  } catch (error) {
    console.error('Signature creation error:', error);
    throw new Error('فشل في إنشاء التوقيع الرقمي');
  }
}

/**
 * التحقق من التوقيع الرقمي
 * Verify digital signature
 */
export function verifySignature(data: string, signature: string, publicKey: string): boolean {
  try {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    return verify.verify(publicKey, signature, 'base64');
  } catch {
    return false;
  }
}

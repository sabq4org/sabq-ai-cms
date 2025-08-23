// نظام التخزين الآمن - ينقل البيانات الحساسة من localStorage إلى HttpOnly cookies
import { NextRequest, NextResponse } from 'next/server';

interface SecureData {
  userId?: string;
  user?: any;
  authToken?: string;
}

export class SecureStorage {
  // قائمة المفاتيح الحساسة التي يجب نقلها
  private static sensitiveKeys = [
    'user',
    'user_id',
    'userId',
    'auth-token',
    'auth_token',
    'access_token',
    'sabq_at',
    'token',
    'jwt',
    'session',
    'user_preferences'
  ];
  
  /**
   * ترحيل البيانات من localStorage إلى الذاكرة المؤقتة
   * يجب استدعاء هذه الدالة عند تحميل التطبيق
   */
  static migrateFromLocalStorage(): SecureData {
    if (typeof window === 'undefined') {
      return {};
    }
    
    const data: SecureData = {};
    
    // نقل البيانات الحساسة
    this.sensitiveKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        console.warn(`⚠️ تحذير أمني: تم العثور على ${key} في localStorage - سيتم نقله إلى تخزين آمن`);
        
        // حفظ البيانات مؤقتاً
        if (key.includes('user_id') || key === 'userId') {
          data.userId = value;
        } else if (key === 'user') {
          try {
            data.user = JSON.parse(value);
          } catch {
            data.user = value;
          }
        } else if (key.includes('token') || key.includes('auth') || key === 'jwt' || key === 'sabq_at') {
          data.authToken = value;
        }
        
        // حذف من localStorage
        localStorage.removeItem(key);
      }
    });
    
    return data;
  }
  
  /**
   * الحصول على قيمة آمنة (من الذاكرة أو cookies)
   */
  static getSecureValue(key: string): string | null {
    // في المتصفح، نستخدم fetch API للحصول على القيمة من الخادم
    if (typeof window !== 'undefined') {
      // محاولة من sessionStorage أولاً (للجلسة الحالية)
      const sessionValue = sessionStorage.getItem(`secure_${key}`);
      if (sessionValue) {
        return sessionValue;
      }
      
      // إذا لم نجد، نحتاج لطلب من الخادم
      console.warn(`محاولة الوصول إلى ${key} - يجب استخدام API آمن بدلاً من localStorage`);
      return null;
    }
    
    return null;
  }
  
  /**
   * حفظ قيمة بشكل آمن
   */
  static async setSecureValue(key: string, value: string): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }
    
    try {
      // حفظ مؤقت في sessionStorage للجلسة الحالية
      sessionStorage.setItem(`secure_${key}`, value);
      
      // إرسال للخادم لحفظ في HttpOnly cookie
      const response = await fetch('/api/secure-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ key, value })
      });
      
      return response.ok;
    } catch (error) {
      console.error('خطأ في حفظ البيانات الآمنة:', error);
      return false;
    }
  }
  
  /**
   * مسح البيانات الآمنة
   */
  static async clearSecureData(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }
    
    // مسح من sessionStorage
    this.sensitiveKeys.forEach(key => {
      sessionStorage.removeItem(`secure_${key}`);
    });
    
    // طلب مسح من الخادم
    try {
      await fetch('/api/secure-storage', {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch (error) {
      console.error('خطأ في مسح البيانات الآمنة:', error);
    }
  }
}

// دالة مساعدة لترحيل البيانات عند تحميل التطبيق
export function initializeSecureStorage() {
  if (typeof window !== 'undefined') {
    // ترحيل البيانات من localStorage
    const migratedData = SecureStorage.migrateFromLocalStorage();
    
    // حفظ البيانات المُرحلة بشكل آمن
    if (migratedData.authToken) {
      SecureStorage.setSecureValue('authToken', migratedData.authToken);
    }
    if (migratedData.userId) {
      SecureStorage.setSecureValue('userId', migratedData.userId);
    }
    if (migratedData.user) {
      SecureStorage.setSecureValue('user', JSON.stringify(migratedData.user));
    }
    
    console.log('✅ تم ترحيل البيانات الحساسة من localStorage إلى تخزين آمن');
  }
}

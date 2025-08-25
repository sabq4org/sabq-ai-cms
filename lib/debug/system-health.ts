import { httpAPI } from '@/lib/http';

/**
 * فحص صحة النظام والمصادقة
 */
export async function checkSystemHealth() {
  const results = {
    prisma: { status: 'unknown', error: null as string | null },
    auth: { status: 'unknown', error: null as string | null, user: null as any },
    overall: 'unknown' as 'healthy' | 'degraded' | 'unhealthy'
  };

  try {
    // فحص Prisma
    console.log('🔍 فحص اتصال Prisma...');
    const prismaResponse = await fetch('/api/_health/prisma', {
      credentials: 'include'
    });
    
    if (prismaResponse.ok) {
      results.prisma.status = 'healthy';
      console.log('✅ Prisma صحي');
    } else {
      results.prisma.status = 'unhealthy';
      results.prisma.error = `HTTP ${prismaResponse.status}`;
      console.log('❌ Prisma غير صحي:', prismaResponse.status);
    }
  } catch (error: any) {
    results.prisma.status = 'unhealthy';
    results.prisma.error = error.message;
    console.error('❌ خطأ في فحص Prisma:', error);
  }

  try {
    // فحص المصادقة
    console.log('🔍 فحص المصادقة...');
    const authResponse = await fetch('/api/auth/me', {
      credentials: 'include'
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      if (authData.success && authData.user) {
        results.auth.status = 'authenticated';
        results.auth.user = authData.user;
        console.log('✅ مصادق كـ:', authData.user.email);
        
        if (authData.partial) {
          results.auth.status = 'partial';
          results.auth.error = 'يعمل بوضع fallback';
          console.warn('⚠️ مصادقة جزئية');
        }
      } else {
        results.auth.status = 'guest';
        console.log('ℹ️ مستخدم ضيف');
      }
    } else if (authResponse.status === 401) {
      results.auth.status = 'guest';
      console.log('ℹ️ غير مصادق');
    } else {
      results.auth.status = 'error';
      results.auth.error = `HTTP ${authResponse.status}`;
      console.warn('⚠️ خطأ في المصادقة:', authResponse.status);
    }
  } catch (error: any) {
    results.auth.status = 'error';
    results.auth.error = error.message;
    console.error('❌ خطأ في فحص المصادقة:', error);
  }

  // تحديد الحالة العامة
  if (results.prisma.status === 'healthy' && 
      ['authenticated', 'partial', 'guest'].includes(results.auth.status)) {
    results.overall = results.auth.status === 'partial' ? 'degraded' : 'healthy';
  } else if (results.prisma.status === 'unhealthy' && results.auth.status === 'partial') {
    results.overall = 'degraded'; // يعمل بـ fallback
  } else {
    results.overall = 'unhealthy';
  }

  console.log('📊 نتائج فحص النظام:', results);
  return results;
}

/**
 * عرض نتائج فحص النظام في وحدة التحكم
 */
export async function debugSystemHealth() {
  console.log('🔍 بدء فحص شامل للنظام...');
  console.log('=================================');
  
  const health = await checkSystemHealth();
  
  console.log('📊 ملخص الحالة:');
  console.log(`   النظام: ${health.overall}`);
  console.log(`   Prisma: ${health.prisma.status}`);
  console.log(`   المصادقة: ${health.auth.status}`);
  
  if (health.auth.user) {
    console.log(`   المستخدم: ${health.auth.user.name} (${health.auth.user.email})`);
  }
  
  if (health.prisma.error) {
    console.warn(`   خطأ Prisma: ${health.prisma.error}`);
  }
  
  if (health.auth.error) {
    console.warn(`   خطأ المصادقة: ${health.auth.error}`);
  }
  
  console.log('=================================');
  
  return health;
}

// للاستخدام في DevTools
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugSystemHealth;
}

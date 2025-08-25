import { prisma } from './prisma';

// دالة للتأكد من الاتصال بقاعدة البيانات
export async function ensureDbConnected(): Promise<boolean> {
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error);
    return false;
  }
}

// دالة للتحقق من أخطاء عدم الاتصال بـ Prisma
export function isPrismaNotConnectedError(e: unknown): boolean {
  const error = e as any;
  return error?.code === 'P1001' || 
         error?.code === 'P1008' || 
         error?.code === 'P1017' ||
         error?.message?.includes('database connection') ||
         error?.message?.includes('connection refused') ||
         error?.message?.includes('ECONNREFUSED');
}

// دالة إعادة المحاولة مع التحقق من الاتصال  
export async function retryWithConnection<T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // التأكد من الاتصال قبل كل محاولة
      const connected = await ensureDbConnected();
      if (!connected && attempt < maxRetries) {
        console.warn(`⚠️ فشل الاتصال - محاولة ${attempt}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      return await operation();
      
    } catch (error: any) {
      lastError = error;
      
      if (isPrismaNotConnectedError(error) && attempt < maxRetries) {
        console.warn(`⚠️ خطأ اتصال Prisma - محاولة ${attempt}/${maxRetries}:`, error.message);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      // إذا لم تكن مشكلة اتصال، ألقي الخطأ فوراً
      throw error;
    }
  }
  
  throw lastError;
}

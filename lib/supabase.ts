import { createClient } from '@supabase/supabase-js';

// جلب متغيرات البيئة مع قيم افتراضية للتطوير
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// التحقق من وجود المتغيرات
if (!supabaseUrl && process.env.NODE_ENV === 'production') {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseServiceKey && process.env.NODE_ENV === 'production') {
  console.error('Missing SUPABASE_SERVICE_KEY environment variable');
}

// إنشاء عميل Supabase مع معالجة الأخطاء
let supabase: any = null;

try {
  if (supabaseUrl && supabaseServiceKey) {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
} catch (error) {
  console.error('Error creating Supabase client:', error);
}

// دالة للحصول على عميل Supabase
export function getSupabaseClient() {
  if (!supabase) {
    // في حالة عدم وجود Supabase، نرجع كائن وهمي للتطوير
    const createMockQueryBuilder = (): any => {
      const mockData: any[] = [];
      
      const builder: any = {
        select: () => builder,
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        eq: () => builder,
        neq: () => builder,
        gt: () => builder,
        gte: () => builder,
        lt: () => builder,
        lte: () => builder,
        like: () => builder,
        ilike: () => builder,
        is: () => builder,
        in: () => builder,
        contains: () => builder,
        containedBy: () => builder,
        range: () => builder,
        order: () => builder,
        limit: () => builder,
        single: () => Promise.resolve({ data: null, error: null }),
      };
      
      // إضافة دعم للـ Promise
      builder.then = (resolve: any) => {
        resolve({ data: mockData, error: null });
        return Promise.resolve({ data: mockData, error: null });
      };
      
      return builder;
    };

    return {
      from: () => createMockQueryBuilder(),
      rpc: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    };
  }
  return supabase;
}

export default supabase; 
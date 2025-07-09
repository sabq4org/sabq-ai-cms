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
    return {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        eq: () => ({
          select: () => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        }),
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      }),
      rpc: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    };
  }
  return supabase;
}

export default supabase; 
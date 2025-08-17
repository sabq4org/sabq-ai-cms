// 🚨 تشخيص مشكلة عدم ظهور الأخبار - حل شامل

/**
 * المشاكل المكتشفة بناءً على البرومبت:
 * 
 * 1. ✅ API الرئيسي /api/articles يطلب status='published' افتراضياً
 * 2. ✅ لوحة التحكم تستخدم نفس API بدون تخصيص الحالة
 * 3. ❌ لا يتم عرض المقالات بحالة 'draft' أو 'pending' 
 * 4. ❌ قد تكون المقالات محفوظة بحالة غير 'published'
 */

// 🛠️ الحلول المقترحة:

export const ARTICLE_STATUS_DEBUG = {
  // فحص جميع الحالات المتاحة
  getAllStatuses: async () => {
    const response = await fetch('/api/articles?status=all&limit=100');
    return response.json();
  },

  // فحص المقالات حسب الحالة
  getByStatus: async (status: string) => {
    const response = await fetch(`/api/articles?status=${status}&limit=100`);
    return response.json();
  },

  // فحص المقالات بدون فلترة
  getAllRaw: async () => {
    const response = await fetch('/api/debug/articles-raw');
    return response.json();
  }
};

// 🎯 تحديث API للتعامل مع جميع الحالات
export const API_FIXES = {
  // السماح بعرض جميع الحالات في لوحة التحكم
  dashboardQuery: {
    // بدلاً من: status: 'published'
    // استخدم: status في ['published', 'draft', 'pending', 'scheduled']
    where: {
      status: {
        in: ['published', 'draft', 'pending', 'scheduled']
      },
      // إضافة شرط عدم الحذف
      deleted_at: null
    }
  },

  // استعلام آمن للواجهة العامة
  publicQuery: {
    where: {
      status: 'published',
      published_at: {
        lte: new Date() // المنشور فقط
      },
      deleted_at: null
    }
  }
};

// 🔧 اقتراحات إصلاح فوري
export const QUICK_FIXES = {
  // تحديث معاملات API في لوحة التحكم
  dashboardApiCall: '/api/articles?status=all&limit=100&includeUnpublished=true',
  
  // إضافة عامل توضيح في API
  statusMapping: {
    'all': ['published', 'draft', 'pending', 'scheduled'],
    'published': ['published'],
    'drafts': ['draft'],
    'pending': ['pending'],
    'scheduled': ['scheduled']
  }
};

// 📊 تشخيص قاعدة البيانات
export const DATABASE_DIAGNOSTIC = {
  // استعلامات تشخيص
  queries: {
    totalArticles: 'SELECT COUNT(*) FROM articles',
    byStatus: 'SELECT status, COUNT(*) FROM articles GROUP BY status',
    withoutStatus: 'SELECT COUNT(*) FROM articles WHERE status IS NULL',
    withoutCategory: 'SELECT COUNT(*) FROM articles WHERE category_id IS NULL',
    withoutAuthor: 'SELECT COUNT(*) FROM articles WHERE author_id IS NULL AND created_by_id IS NULL'
  }
};

// 🎨 واجهة تشخيص للمطورين
export const DEBUG_INTERFACE = {
  showStatusBreakdown: true,
  showApiCalls: true,
  showQueryResults: true,
  enableQuickFix: true
};

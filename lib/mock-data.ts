/**
 * بيانات وهمية للاستخدام عند فشل الاتصال بقاعدة البيانات
 * تضمن عمل نماذج إنشاء الأخبار بشكل طبيعي
 */

export interface MockCategory {
  id: string;
  name: string;
  name_ar?: string;
  slug: string;
  color?: string;
  is_active: boolean;
}

export interface MockAuthor {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  is_active: boolean;
}

// تصنيفات وهمية
export const MOCK_CATEGORIES: MockCategory[] = [
  {
    id: 'cat-1',
    name: 'أخبار محلية',
    name_ar: 'أخبار محلية',
    slug: 'local-news',
    color: '#3b82f6',
    is_active: true
  },
  {
    id: 'cat-2', 
    name: 'أخبار عالمية',
    name_ar: 'أخبار عالمية',
    slug: 'world-news',
    color: '#ef4444',
    is_active: true
  },
  {
    id: 'cat-3',
    name: 'رياضة',
    name_ar: 'رياضة',
    slug: 'sports',
    color: '#10b981',
    is_active: true
  },
  {
    id: 'cat-4',
    name: 'اقتصاد',
    name_ar: 'اقتصاد',
    slug: 'economy',
    color: '#f59e0b',
    is_active: true
  },
  {
    id: 'cat-5',
    name: 'تقنية',
    name_ar: 'تقنية',
    slug: 'technology',
    color: '#8b5cf6',
    is_active: true
  },
  {
    id: 'cat-6',
    name: 'صحة',
    name_ar: 'صحة',
    slug: 'health',
    color: '#06b6d4',
    is_active: true
  },
  {
    id: 'cat-7',
    name: 'ثقافة',
    name_ar: 'ثقافة',
    slug: 'culture',
    color: '#ec4899',
    is_active: true
  },
  {
    id: 'cat-8',
    name: 'سياسة',
    name_ar: 'سياسة',
    slug: 'politics',
    color: '#dc2626',
    is_active: true
  }
];

// مراسلين وهميين
export const MOCK_AUTHORS: MockAuthor[] = [
  {
    id: 'author-1',
    name: 'أحمد محمد',
    email: 'ahmed@sabq.com',
    role: 'reporter',
    avatar: 'https://res.cloudinary.com/dybhezmvb/image/upload/v1730000000/avatars/ahmed.jpg',
    is_active: true
  },
  {
    id: 'author-2',
    name: 'فاطمة علي',
    email: 'fatima@sabq.com',
    role: 'reporter',
    avatar: 'https://res.cloudinary.com/dybhezmvb/image/upload/v1730000000/avatars/fatima.jpg',
    is_active: true
  },
  {
    id: 'author-3',
    name: 'محمد عبدالله',
    email: 'mohammed@sabq.com',
    role: 'editor',
    avatar: 'https://res.cloudinary.com/dybhezmvb/image/upload/v1730000000/avatars/mohammed.jpg',
    is_active: true
  },
  {
    id: 'author-4',
    name: 'نورا أحمد',
    email: 'nora@sabq.com',
    role: 'reporter',
    avatar: 'https://res.cloudinary.com/dybhezmvb/image/upload/v1730000000/avatars/nora.jpg',
    is_active: true
  },
  {
    id: 'author-5',
    name: 'خالد الشمري',
    email: 'khalid@sabq.com',
    role: 'chief_editor',
    avatar: 'https://res.cloudinary.com/dybhezmvb/image/upload/v1730000000/avatars/khalid.jpg',
    is_active: true
  },
  {
    id: 'author-6',
    name: 'سارة العتيبي',
    email: 'sarah@sabq.com',
    role: 'reporter',
    avatar: 'https://res.cloudinary.com/dybhezmvb/image/upload/v1730000000/avatars/sarah.jpg',
    is_active: true
  },
  {
    id: 'author-7',
    name: 'عمر النجار',
    email: 'omar@sabq.com',
    role: 'reporter',
    avatar: 'https://res.cloudinary.com/dybhezmvb/image/upload/v1730000000/avatars/omar.jpg',
    is_active: true
  },
  {
    id: 'author-8',
    name: 'ريم المطيري',
    email: 'reem@sabq.com',
    role: 'editor',
    avatar: 'https://res.cloudinary.com/dybhezmvb/image/upload/v1730000000/avatars/reem.jpg',
    is_active: true
  }
];

/**
 * دالة للحصول على البيانات مع fallback للبيانات الوهمية
 */
export function getMockDataIfNeeded<T>(realData: T[] | null | undefined, mockData: T[]): T[] {
  if (!realData || realData.length === 0) {
    console.warn('🔄 استخدام البيانات الوهمية بدلاً من قاعدة البيانات');
    return mockData;
  }
  return realData;
}

/**
 * تحويل البيانات الوهمية لتتوافق مع تنسيق API
 */
export function formatMockCategoriesForAPI() {
  return {
    success: true,
    categories: MOCK_CATEGORIES,
    data: MOCK_CATEGORIES,
    count: MOCK_CATEGORIES.length
  };
}

export function formatMockAuthorsForAPI() {
  return {
    success: true,
    members: MOCK_AUTHORS,
    data: MOCK_AUTHORS,
    count: MOCK_AUTHORS.length
  };
} 
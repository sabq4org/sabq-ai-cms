import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

// تخزين مؤقت للمقالات
export const getCachedArticles = unstable_cache(
  async (where: any, orderBy: any, skip: number, take: number) => {
    return await prisma.articles.findMany({
      where,
      orderBy,
      skip,
      take
    });
  },
  ['articles'],
  {
    revalidate: 60, // إعادة التحقق كل دقيقة
    tags: ['articles']
  }
);

// تخزين مؤقت للتصنيفات
export const getCachedCategories = unstable_cache(
  async () => {
    return await prisma.categories.findMany({
      where: { is_active: true },
      orderBy: [
        { display_order: 'asc' },
        { name: 'asc' }
      ]
    });
  },
  ['categories'],
  {
    revalidate: 300, // إعادة التحقق كل 5 دقائق
    tags: ['categories']
  }
);

// تخزين مؤقت للمستخدمين
export const getCachedUsers = unstable_cache(
  async (userIds: string[]) => {
    return await prisma.users.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    });
  },
  ['users'],
  {
    revalidate: 300, // إعادة التحقق كل 5 دقائق
    tags: ['users']
  }
);

// تخزين مؤقت لعدد المقالات
export const getCachedArticleCount = unstable_cache(
  async (where: any) => {
    return await prisma.articles.count({ where });
  },
  ['article-count'],
  {
    revalidate: 60, // إعادة التحقق كل دقيقة
    tags: ['article-count']
  }
);

// دالة لإلغاء التخزين المؤقت عند التحديث
export async function revalidateArticleCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('articles');
  revalidateTag('article-count');
}

export async function revalidateCategoryCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('categories');
}

export async function revalidateUserCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('users');
} 